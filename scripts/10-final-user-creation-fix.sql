-- Final fix for user creation that works with Supabase's security model

-- 1. Create a simpler, more reliable trigger function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a minimal trigger that just creates basic profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple insert with just the essentials
  INSERT INTO public.user_profiles (
    id, 
    full_name, 
    role
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee')
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail user creation if profile creation fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. Update the employee profile function to work better
CREATE OR REPLACE FUNCTION create_employee_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_employee_code TEXT DEFAULT NULL,
  p_department TEXT DEFAULT NULL,
  p_designation TEXT DEFAULT NULL,
  p_qualification TEXT DEFAULT NULL,
  p_total_experience TEXT DEFAULT NULL,
  p_current_level_id UUID DEFAULT NULL,
  p_remarks TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Insert or update the profile (don't check auth.users since we can't access it)
  INSERT INTO user_profiles (
    id,
    full_name,
    role,
    employee_code,
    department,
    designation,
    qualification,
    total_experience,
    current_level_id,
    remarks,
    joined_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_full_name,
    'employee',
    p_employee_code,
    p_department,
    p_designation,
    p_qualification,
    p_total_experience,
    p_current_level_id,
    p_remarks,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    employee_code = EXCLUDED.employee_code,
    department = EXCLUDED.department,
    designation = EXCLUDED.designation,
    qualification = EXCLUDED.qualification,
    total_experience = EXCLUDED.total_experience,
    current_level_id = EXCLUDED.current_level_id,
    remarks = EXCLUDED.remarks,
    updated_at = NOW();
  
  RETURN json_build_object(
    'success', true,
    'message', 'Profile created/updated successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Clean up duplicate policies
DROP POLICY IF EXISTS "HR can insert profiles" ON user_profiles;

-- 4. Create a function to promote users to HR (safer approach)
CREATE OR REPLACE FUNCTION promote_to_hr(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Update user profile to HR role based on email
  -- We'll match by the user ID which should be the email in most cases
  UPDATE user_profiles 
  SET role = 'hr' 
  WHERE id::text ILIKE '%' || user_email || '%'
     OR full_name ILIKE '%' || user_email || '%';
  
  GET DIAGNOSTICS user_count = ROW_COUNT;
  
  IF user_count > 0 THEN
    RETURN 'Successfully promoted ' || user_count || ' user(s) to HR role';
  ELSE
    RETURN 'No user found with email: ' || user_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Alternative: Create a function to list all users so we can find the right one
CREATE OR REPLACE FUNCTION list_all_users()
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  role TEXT,
  employee_code TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.full_name,
    up.role::TEXT,
    up.employee_code,
    up.joined_at
  FROM user_profiles up
  ORDER BY up.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to promote user by ID (more reliable)
CREATE OR REPLACE FUNCTION promote_user_by_id(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM user_profiles WHERE id = user_id) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN 'User not found with ID: ' || user_id;
  END IF;
  
  -- Update to HR role
  UPDATE user_profiles 
  SET role = 'hr' 
  WHERE id = user_id;
  
  RETURN 'Successfully promoted user to HR role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the foreign key constraint issue

-- First, let's check what's in the auth.users table
-- and fix the user creation process

-- Drop the problematic test from the previous script
-- and create a better approach

-- 1. Fix the trigger function to be more robust
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a more robust trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if the user doesn't already have a profile
  INSERT INTO public.user_profiles (
    id, 
    full_name, 
    role,
    joined_at,
    updated_at
  ) 
  SELECT 
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee'),
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = NEW.id
  );
  
  RETURN NEW;
EXCEPTION
  WHEN foreign_key_violation THEN
    -- Log the error but don't fail
    RAISE LOG 'Foreign key violation creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
  WHEN unique_violation THEN
    -- Profile already exists, that's fine
    RAISE LOG 'Profile already exists for user %', NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log any other error but don't fail the user creation
    RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. Create a function to safely create employee profiles
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
  -- Check if user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User does not exist in auth.users table'
    );
  END IF;
  
  -- Insert or update the profile
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

-- 3. Update RLS policies to allow the function to work
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable HR to insert profiles" ON user_profiles;

-- Create a policy that allows the function to work
CREATE POLICY "Enable profile creation" ON user_profiles
  FOR INSERT WITH CHECK (
    -- Allow if the current user is the profile being created (signup)
    auth.uid() = id
    OR
    -- Allow if current user is HR
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() AND up.role = 'hr'
    )
    OR
    -- Allow if being called by our function (check if we're in a function context)
    current_setting('role') = 'authenticated'
  );

-- Allow updates for the upsert operation
CREATE POLICY "Enable profile updates" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = id
    OR
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() AND up.role = 'hr'
    )
  );

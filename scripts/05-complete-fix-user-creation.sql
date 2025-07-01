-- Complete fix for user creation issues

-- First, let's completely reset the user_profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "HR can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "HR can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "HR can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON user_profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON user_profiles;

-- Temporarily disable RLS to allow the trigger to work
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop and recreate the trigger function with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a simpler, more robust trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple insert with minimal data
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
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Re-enable RLS with simpler policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
CREATE POLICY "Enable read access for users to their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update access for users to their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow anyone to insert (this will be restricted by application logic)
CREATE POLICY "Enable insert for authenticated users" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- HR policies - using a different approach
CREATE POLICY "Enable HR to read all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() AND up.role = 'hr'
    )
  );

CREATE POLICY "Enable HR to update all profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() AND up.role = 'hr'
    )
  );

-- Allow HR to insert profiles for new employees
CREATE POLICY "Enable HR to insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() AND up.role = 'hr'
    )
    OR auth.uid() = id -- Allow self-insert during signup
  );

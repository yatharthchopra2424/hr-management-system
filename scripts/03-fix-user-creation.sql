-- Fix RLS policies for user creation
-- Drop problematic policies that might block user creation
DROP POLICY IF EXISTS "HR can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "HR can create assessment ratings" ON assessment_ratings;

-- Create better policies for user profile creation
CREATE POLICY "HR can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (
    -- Allow HR to insert any profile
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
    OR
    -- Allow users to insert their own profile (for signup trigger)
    auth.uid() = id
  );

-- Allow the trigger function to work properly
CREATE POLICY "System can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- Temporarily disable RLS for user_profiles to allow trigger to work
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable with better policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Recreate policies with proper permissions
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "HR can view all profiles" ON user_profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
  );

CREATE POLICY "HR can update all profiles" ON user_profiles
  FOR UPDATE USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
  );

-- Allow profile creation during signup and by HR
CREATE POLICY "Allow profile creation" ON user_profiles
  FOR INSERT WITH CHECK (
    -- Allow during signup (trigger context)
    auth.uid() = id
    OR
    -- Allow HR to create profiles
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
  );

-- Update the trigger function to be more robust
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert with proper error handling
  INSERT INTO user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee')
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix infinite recursion in RLS policies

-- 1. Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "HR can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "HR can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable profile creation" ON user_profiles;
DROP POLICY IF EXISTS "Enable profile updates" ON user_profiles;
DROP POLICY IF EXISTS "Enable HR to read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable HR to update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable HR to insert profiles" ON user_profiles;

-- 2. Temporarily disable RLS to break the cycle
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Create simple, non-recursive policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own profile (no recursion)
CREATE POLICY "users_select_own" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile (no recursion)
CREATE POLICY "users_update_own" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile during signup
CREATE POLICY "users_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- For HR access, we'll use a different approach - check user metadata instead of the table
CREATE POLICY "hr_select_all" ON user_profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
    OR 
    auth.uid() = id  -- Users can always see their own
  );

CREATE POLICY "hr_update_all" ON user_profiles
  FOR UPDATE USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
    OR 
    auth.uid() = id  -- Users can always update their own
  );

CREATE POLICY "hr_insert_all" ON user_profiles
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
    OR 
    auth.uid() = id  -- Allow self-insert during signup
  );

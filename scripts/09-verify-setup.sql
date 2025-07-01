-- Verification script to check if everything is set up correctly

-- 1. Check if the function exists
SELECT EXISTS (
  SELECT 1 FROM pg_proc 
  WHERE proname = 'create_employee_profile'
) AS function_exists;

-- 2. Check RLS policies
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 3. Check if trigger exists
SELECT EXISTS (
  SELECT 1 FROM pg_trigger 
  WHERE tgname = 'on_auth_user_created'
) AS trigger_exists;

-- 4. Test the function (this should work)
SELECT create_employee_profile(
  gen_random_uuid(),  -- This will fail because user doesn't exist, but tests the function
  'Test User',
  'TEST001'
);

-- 5. Check current user and role
SELECT 
  current_user,
  current_setting('role'),
  auth.uid() as current_auth_user;

-- Test script to verify user creation works
-- Run this to test the trigger function

DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
BEGIN
  -- Test the trigger function directly
  RAISE NOTICE 'Testing user profile creation...';
  
  -- Simulate what happens when a user signs up
  INSERT INTO user_profiles (id, full_name, role) 
  VALUES (test_user_id, 'Test User', 'employee');
  
  -- Check if it was created
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = test_user_id) THEN
    RAISE NOTICE 'SUCCESS: User profile created successfully';
    -- Clean up
    DELETE FROM user_profiles WHERE id = test_user_id;
  ELSE
    RAISE NOTICE 'FAILED: User profile was not created';
  END IF;
END $$;

-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

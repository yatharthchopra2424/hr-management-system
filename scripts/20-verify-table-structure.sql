-- Verify the actual table structure and fix any issues

-- 1. Check the actual columns in user_profiles
SELECT 'user_profiles table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 2. Check if there are any users
SELECT 'Sample user_profiles data:' as info;
SELECT id, full_name, role, employee_code, department, joined_at 
FROM user_profiles 
LIMIT 5;

-- 3. Count users by role
SELECT 'User count by role:' as info;
SELECT 
  role, 
  COUNT(*) as count 
FROM user_profiles 
GROUP BY role;

-- 4. Check if RLS is causing issues - temporarily disable to test
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 5. Try the query that the app is running
SELECT 'Test query (RLS disabled):' as info;
SELECT 
  up.*,
  l.name as level_name
FROM user_profiles up
LEFT JOIN levels l ON up.current_level_id = l.id
ORDER BY up.joined_at DESC;

-- 6. Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 7. Test with RLS enabled
SELECT 'Test query (RLS enabled):' as info;
SELECT 
  up.*,
  l.name as level_name
FROM user_profiles up
LEFT JOIN levels l ON up.current_level_id = l.id
ORDER BY up.joined_at DESC;

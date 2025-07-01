-- Debug script to see what's happening with employees

-- 1. Check all users in user_profiles
SELECT 'All users in user_profiles:' as info;
SELECT id, full_name, role, employee_code, department, joined_at 
FROM user_profiles 
ORDER BY joined_at DESC;

-- 2. Check specifically for employees
SELECT 'Users with employee role:' as info;
SELECT id, full_name, role, employee_code, department, joined_at 
FROM user_profiles 
WHERE role = 'employee'
ORDER BY joined_at DESC;

-- 3. Check auth.users table (if accessible)
SELECT 'Auth users count:' as info;
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- 4. Fix any users that might have NULL or incorrect roles
UPDATE user_profiles 
SET role = 'employee' 
WHERE role IS NULL OR role NOT IN ('hr', 'employee');

-- 5. Check RLS policies
SELECT 'Current RLS policies:' as info;
SELECT policyname, cmd, permissive, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles' AND cmd = 'SELECT';

-- 6. After fixes, check employees again
SELECT 'Employees after fixes:' as info;
SELECT id, full_name, role, employee_code, department, joined_at 
FROM user_profiles 
WHERE role = 'employee'
ORDER BY joined_at DESC;

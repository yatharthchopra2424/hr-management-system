-- Fix employee roles and ensure they're visible

-- 1. Check current state
SELECT 'Current user roles:' as info;
SELECT id, full_name, role, employee_code, joined_at 
FROM user_profiles 
ORDER BY joined_at DESC;

-- 2. Fix any users that should be employees but aren't
-- Set all non-HR users to employee role
UPDATE user_profiles 
SET role = 'employee' 
WHERE role != 'hr' OR role IS NULL;

-- 3. Ensure at least one HR user exists (the most recent one)
UPDATE user_profiles 
SET role = 'hr' 
WHERE id = (
  SELECT id FROM user_profiles 
  ORDER BY joined_at DESC 
  LIMIT 1
);

-- 4. Update auth metadata to match
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', up.role::text)
FROM user_profiles up 
WHERE auth.users.id = up.id;

-- 5. Check the results
SELECT 'After role fixes:' as info;
SELECT 
  id, 
  full_name, 
  role, 
  employee_code, 
  department,
  joined_at 
FROM user_profiles 
ORDER BY role DESC, joined_at DESC;

-- 6. Count by role
SELECT 'Role counts:' as info;
SELECT role, COUNT(*) as count 
FROM user_profiles 
GROUP BY role;

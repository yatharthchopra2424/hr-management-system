-- Simple bootstrap script that works

-- Method 1: View all users using the view
SELECT 'All users in the system:' as info;
SELECT * FROM user_list;

-- Method 2: Show users as text (if the view doesn't work)
-- SELECT show_all_users();

-- Method 3: Direct query (simplest)
SELECT 
  'Direct user list:' as info,
  id as user_id, 
  full_name, 
  role, 
  employee_code,
  joined_at
FROM user_profiles 
ORDER BY joined_at DESC;

-- After you see your user above, promote yourself to HR:
-- Replace 'your-actual-user-id' with your ID from the results above
-- SELECT promote_user_by_id('your-actual-user-id');

-- Or try promoting by partial email match:
-- SELECT promote_to_hr('yatharthchopra2424');

-- Verify HR users:
SELECT 'Current HR users:' as info;
SELECT id, full_name, role, employee_code 
FROM user_profiles 
WHERE role = 'hr';

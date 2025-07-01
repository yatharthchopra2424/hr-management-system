-- Script to help you become an HR user

-- First, let's see all users in the system
SELECT 'Current users in the system:' as info;
SELECT * FROM list_all_users();

-- If you see your user in the list above, copy the user_id and run:
-- SELECT promote_user_by_id('your-user-id-here');

-- Alternative: If you know part of your email or name, try:
-- SELECT promote_to_hr('part-of-your-email');

-- Example (replace with your actual details):
-- SELECT promote_to_hr('yatharthchopra2424@gmail.com');

-- After running the promotion, verify it worked:
SELECT 'Checking HR users:' as info;
SELECT * FROM user_profiles WHERE role = 'hr';

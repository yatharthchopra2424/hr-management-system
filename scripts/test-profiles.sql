-- Simple test to check user profile creation
-- Run this after trying to register a new user

-- Check if any user profiles exist
SELECT COUNT(*) as total_profiles FROM user_profiles;

-- Check the latest users and their profiles
SELECT 
    u.id,
    u.email,
    u.created_at as user_created,
    u.raw_user_meta_data,
    p.full_name,
    p.role,
    p.joined_at as profile_created
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;

-- Check if the trigger function exists
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- Manual profile creation template (use if trigger doesn't work)
-- INSERT INTO user_profiles (id, full_name, role, contact_info)
-- VALUES ('USER_ID_HERE', 'Full Name', 'employee', '{"email": "user@example.com"}');

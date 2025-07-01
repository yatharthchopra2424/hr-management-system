-- Emergency fix to make sure you can access HR features

-- 1. First, let's see what users exist
SELECT 'Current users:' as info;
SELECT id, full_name, role, joined_at FROM user_profiles ORDER BY joined_at DESC;

-- 2. Update the most recent user to HR (assuming it's you)
UPDATE user_profiles 
SET role = 'hr' 
WHERE id = (
  SELECT id FROM user_profiles 
  ORDER BY joined_at DESC 
  LIMIT 1
);

-- 3. Also update their auth metadata
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "hr"}'::jsonb
WHERE id = (
  SELECT id FROM user_profiles 
  ORDER BY joined_at DESC 
  LIMIT 1
);

-- 4. Verify the update worked
SELECT 'After update:' as info;
SELECT id, full_name, role FROM user_profiles WHERE role = 'hr';

-- 5. Check auth metadata
SELECT 'Auth metadata:' as info;
SELECT id, email, raw_user_meta_data->'role' as role_in_auth 
FROM auth.users 
WHERE raw_user_meta_data->'role' = '"hr"';

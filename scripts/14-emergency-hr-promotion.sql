-- Emergency HR promotion - if you know your email

-- Method 1: Find and promote by email pattern
UPDATE user_profiles 
SET role = 'hr' 
WHERE id IN (
  SELECT id FROM user_profiles 
  WHERE full_name ILIKE '%yatharth%' 
     OR full_name ILIKE '%chopra%'
     OR id::text ILIKE '%yatharthchopra2424%'
);

-- Method 2: Promote the most recent user (if it's you)
UPDATE user_profiles 
SET role = 'hr' 
WHERE id = (
  SELECT id FROM user_profiles 
  ORDER BY joined_at DESC 
  LIMIT 1
);

-- Method 3: Promote ALL users to HR (emergency only!)
-- Uncomment the line below ONLY if you're the only user
-- UPDATE user_profiles SET role = 'hr';

-- Check results
SELECT 'Updated users:' as result;
SELECT id, full_name, role, joined_at 
FROM user_profiles 
ORDER BY joined_at DESC;

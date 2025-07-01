-- Fix the bootstrap functions to work properly

-- 1. Fix the list_all_users function
DROP FUNCTION IF EXISTS list_all_users();

CREATE OR REPLACE FUNCTION list_all_users()
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  user_role TEXT,
  employee_code TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id as user_id,
    up.full_name,
    up.role::TEXT as user_role,
    up.employee_code,
    up.joined_at as created_at
  FROM user_profiles up
  ORDER BY up.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a simpler way to see users
CREATE OR REPLACE VIEW user_list AS
SELECT 
  id as user_id,
  full_name,
  role as user_role,
  employee_code,
  department,
  joined_at as created_at
FROM user_profiles
ORDER BY joined_at DESC;

-- 3. Create a simple function to show users as text
CREATE OR REPLACE FUNCTION show_all_users()
RETURNS TEXT AS $$
DECLARE
  user_record RECORD;
  result_text TEXT := 'Users in the system:' || E'\n';
BEGIN
  FOR user_record IN 
    SELECT id, full_name, role, employee_code, joined_at 
    FROM user_profiles 
    ORDER BY joined_at DESC
  LOOP
    result_text := result_text || 
      'ID: ' || user_record.id || 
      ' | Name: ' || COALESCE(user_record.full_name, 'No name') ||
      ' | Role: ' || user_record.role ||
      ' | Code: ' || COALESCE(user_record.employee_code, 'None') ||
      ' | Joined: ' || user_record.joined_at::DATE ||
      E'\n';
  END LOOP;
  
  RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to help create admin users
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT
)
RETURNS TEXT AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- This function should be called by a superuser or in a secure context
  -- For now, we'll create a simple way to bootstrap an HR user
  
  -- Insert directly into user_profiles (assuming user exists in auth.users)
  -- This is a helper for manual admin creation
  
  RETURN 'Please create HR user through the application signup with role=hr';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simple way to promote a user to HR
CREATE OR REPLACE FUNCTION promote_user_to_hr(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find user by email in user_profiles
  SELECT * INTO user_record FROM user_profiles 
  WHERE id IN (
    SELECT id FROM auth.users WHERE email = user_email
  );
  
  IF user_record IS NULL THEN
    RETURN 'User not found';
  END IF;
  
  -- Update role to HR
  UPDATE user_profiles 
  SET role = 'hr' 
  WHERE id = user_record.id;
  
  RETURN 'User promoted to HR successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

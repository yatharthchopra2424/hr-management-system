-- Create a way to bootstrap the first HR user
-- This should be run after creating your first user through the signup process

-- Function to promote the first user to HR (run this manually)
CREATE OR REPLACE FUNCTION bootstrap_first_hr_user(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Find the user ID by email
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;
  
  -- Update the user profile to HR role
  UPDATE user_profiles 
  SET role = 'hr' 
  WHERE id = user_id;
  
  -- Also update the auth metadata
  UPDATE auth.users 
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "hr"}'::jsonb
  WHERE id = user_id;
  
  RETURN 'Successfully promoted user to HR: ' || user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage (uncomment and modify with your email):
-- SELECT bootstrap_first_hr_user('your-email@example.com');

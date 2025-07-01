-- Update auth metadata to match user_profiles role
-- This ensures the JWT contains the correct role information

-- Function to sync role from user_profiles to auth metadata
CREATE OR REPLACE FUNCTION sync_user_role_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the auth.users metadata when user_profiles role changes
  UPDATE auth.users 
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', NEW.role::text)
  WHERE id = NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the update if auth update fails
    RAISE WARNING 'Failed to sync role to auth metadata: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync role changes
DROP TRIGGER IF EXISTS sync_role_to_auth ON user_profiles;
CREATE TRIGGER sync_role_to_auth
  AFTER UPDATE OF role ON user_profiles
  FOR EACH ROW 
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION sync_user_role_to_auth();

-- Sync existing roles to auth metadata
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', up.role::text)
FROM user_profiles up 
WHERE auth.users.id = up.id;

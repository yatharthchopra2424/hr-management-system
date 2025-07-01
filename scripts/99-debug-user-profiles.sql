-- Debug and fix user profile creation

-- First, let's check if the trigger function exists
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- Check if the trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check current structure of user_profiles table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Drop and recreate the trigger function to ensure it works
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_val user_role;
BEGIN
    -- Get the role from metadata, default to 'employee'
    user_role_val := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee');
    
    -- Insert into user_profiles
    INSERT INTO user_profiles (
        id, 
        full_name, 
        role,
        contact_info
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        user_role_val,
        jsonb_build_object('email', NEW.email)
    );
    
    -- Log the insertion for debugging
    RAISE NOTICE 'Created user profile for user: % with role: %', NEW.id, user_role_val;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    RAISE NOTICE 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW; -- Don't fail the auth process even if profile creation fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Test query to check existing profiles
SELECT id, full_name, role, contact_info, joined_at 
FROM user_profiles 
ORDER BY joined_at DESC 
LIMIT 10;

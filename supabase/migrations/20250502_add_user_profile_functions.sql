
-- Function to get user profile by ID
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'display_name', display_name,
    'avatar_url', avatar_url
  )
  FROM user_profiles
  WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to update language preference
CREATE OR REPLACE FUNCTION update_language_preference(user_id UUID, language TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET preferred_language = language
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

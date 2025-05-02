
-- Function to get user profile data
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.id,
    up.display_name,
    up.avatar_url,
    up.preferred_language,
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  WHERE up.id = user_id_param;
END;
$$;

-- Function to update user language preference
CREATE OR REPLACE FUNCTION public.update_user_language(user_id_param UUID, language_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_profiles
  SET 
    preferred_language = language_param,
    updated_at = now()
  WHERE id = user_id_param;
END;
$$;

-- Function to get user language preference
CREATE OR REPLACE FUNCTION public.get_user_language(user_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lang_preference TEXT;
BEGIN
  SELECT preferred_language INTO lang_preference
  FROM public.user_profiles
  WHERE id = user_id_param;
  
  RETURN lang_preference;
END;
$$;

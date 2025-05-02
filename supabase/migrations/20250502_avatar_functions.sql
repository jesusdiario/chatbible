
-- Function to update user avatar
CREATE OR REPLACE FUNCTION public.update_user_avatar(user_id_param UUID, avatar_url_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_profiles
  SET 
    avatar_url = avatar_url_param,
    updated_at = now()
  WHERE id = user_id_param;
END;
$$;

-- Make sure we have the avatars bucket
INSERT INTO storage.buckets (id, name, public)
SELECT 'avatars', 'avatars', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
);

-- Storage policies for avatars bucket
DO $$
BEGIN
    -- Create policy to allow public read access to avatars
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE name = 'Avatar images are publicly accessible'
    ) THEN
        CREATE POLICY "Avatar images are publicly accessible"
        ON storage.objects
        FOR SELECT
        USING (bucket_id = 'avatars');
    END IF;

    -- Create policy to allow authenticated users to upload their own avatars
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE name = 'Users can upload their own avatars'
    ) THEN
        CREATE POLICY "Users can upload their own avatars"
        ON storage.objects
        FOR INSERT
        WITH CHECK (
            bucket_id = 'avatars' 
            AND auth.uid()::text = SUBSTRING(name FROM 'profile-([^.]+)')
        );
    END IF;

    -- Create policy to allow users to update their own avatars
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE name = 'Users can update their own avatars'
    ) THEN
        CREATE POLICY "Users can update their own avatars"
        ON storage.objects
        FOR UPDATE
        WITH CHECK (
            bucket_id = 'avatars' 
            AND auth.uid()::text = SUBSTRING(name FROM 'profile-([^.]+)')
        );
    END IF;

    -- Create policy to allow users to delete their own avatars
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE name = 'Users can delete their own avatars'
    ) THEN
        CREATE POLICY "Users can delete their own avatars"
        ON storage.objects
        FOR DELETE
        USING (
            bucket_id = 'avatars' 
            AND auth.uid()::text = SUBSTRING(name FROM 'profile-([^.]+)')
        );
    END IF;
END$$;

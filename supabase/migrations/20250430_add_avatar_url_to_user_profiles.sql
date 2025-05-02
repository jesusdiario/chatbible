
-- Check if the avatars bucket exists and create if not
INSERT INTO storage.buckets (id, name, public)
SELECT 'avatars', 'avatars', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
);

-- Create RLS policy to allow anyone to read avatar images
CREATE POLICY "Anyone can read avatar images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Create RLS policy to allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid() = SUBSTRING(name FROM 'profile-([^-]+)')::uuid
);

-- Add avatar_url column to user_profiles if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN avatar_url TEXT;
    END IF;
END$$;

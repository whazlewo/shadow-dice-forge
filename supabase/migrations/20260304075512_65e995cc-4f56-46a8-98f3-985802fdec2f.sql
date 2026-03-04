
-- Add portrait_url column to characters
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS portrait_url text DEFAULT NULL;

-- Create character-portraits storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('character-portraits', 'character-portraits', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: Anyone can view (public bucket)
CREATE POLICY "Anyone can view portraits"
ON storage.objects FOR SELECT
USING (bucket_id = 'character-portraits');

-- RLS: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload own portraits"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'character-portraits'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Users can update their own portraits
CREATE POLICY "Users can update own portraits"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'character-portraits'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Users can delete their own portraits
CREATE POLICY "Users can delete own portraits"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'character-portraits'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

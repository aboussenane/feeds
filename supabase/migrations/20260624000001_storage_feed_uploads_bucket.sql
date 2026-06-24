-- Public bucket for feed image/video uploads (used by /api/upload)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'feed-uploads',
  'feed-uploads',
  true,
  52428800,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload to their own folder ({userId}/...)
CREATE POLICY feed_uploads_insert_own
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'feed-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read access for published feed media
CREATE POLICY feed_uploads_select_public
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'feed-uploads');

-- Users can update/delete their own uploads
CREATE POLICY feed_uploads_update_own
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'feed-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY feed_uploads_delete_own
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'feed-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

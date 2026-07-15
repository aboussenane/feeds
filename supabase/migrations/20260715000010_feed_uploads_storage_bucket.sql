-- Public bucket for feed image/video uploads (API uses getPublicUrl).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'feed-uploads',
  'feed-uploads',
  true,
  52428800,
  NULL
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "feed_uploads_public_read" ON storage.objects;
CREATE POLICY "feed_uploads_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'feed-uploads');

DROP POLICY IF EXISTS "feed_uploads_authenticated_insert" ON storage.objects;
CREATE POLICY "feed_uploads_authenticated_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'feed-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "feed_uploads_authenticated_update" ON storage.objects;
CREATE POLICY "feed_uploads_authenticated_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'feed-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'feed-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "feed_uploads_authenticated_delete" ON storage.objects;
CREATE POLICY "feed_uploads_authenticated_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'feed-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

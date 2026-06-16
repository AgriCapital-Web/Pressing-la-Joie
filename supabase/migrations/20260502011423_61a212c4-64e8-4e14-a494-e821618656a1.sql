
-- Drop overly permissive public SELECT policies if they exist, then recreate scoped ones
-- For testimonial-photos bucket
DO $$
BEGIN
  -- Drop existing public select policies on storage.objects for testimonial-photos
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Avatar images are publicly accessible' AND tablename = 'objects') THEN
    DROP POLICY "Avatar images are publicly accessible" ON storage.objects;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view testimonial photos' AND tablename = 'objects') THEN
    DROP POLICY "Public can view testimonial photos" ON storage.objects;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Testimonial photos are publicly accessible' AND tablename = 'objects') THEN
    DROP POLICY "Testimonial photos are publicly accessible" ON storage.objects;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view media files' AND tablename = 'objects') THEN
    DROP POLICY "Anyone can view media files" ON storage.objects;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view media' AND tablename = 'objects') THEN
    DROP POLICY "Public can view media" ON storage.objects;
  END IF;
END $$;

-- Scoped SELECT: only allow reading specific files by full path, not listing
CREATE POLICY "Public can read specific testimonial photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'testimonial-photos' AND name IS NOT NULL AND name != '' AND position('/' IN name) > 0);

CREATE POLICY "Public can read specific media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'media' AND name IS NOT NULL AND name != '');


-- 1. Fix testimonials email exposure: create a secure view without email
CREATE OR REPLACE VIEW public.testimonials_public AS
SELECT id, first_name, last_name, testimonial, photo_url, is_agricapital_subscriber, status, created_at
FROM public.testimonials
WHERE approved = true AND status = 'approved';

-- 2. Remove admin_notifications from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.admin_notifications;

-- 3. Restrict media storage policies to admin only
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;

CREATE POLICY "Only admins can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only admins can update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only admins can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  public.has_role(auth.uid(), 'admin')
);

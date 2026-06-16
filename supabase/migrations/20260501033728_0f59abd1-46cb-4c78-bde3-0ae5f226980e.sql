
-- Force SECURITY INVOKER on the public views (Postgres 15+)
ALTER VIEW public.testimonials_public SET (security_invoker = true);
ALTER VIEW public.partnerships_public SET (security_invoker = true);

-- Restrict testimonial-photos uploads to image extensions
DROP POLICY IF EXISTS "Anyone can upload testimonial photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload only image files to testimonial-photos" ON storage.objects;

CREATE POLICY "Public can upload only image files to testimonial-photos"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'testimonial-photos'
  AND lower(storage.extension(name)) = ANY (ARRAY['jpg','jpeg','png','webp','gif'])
);

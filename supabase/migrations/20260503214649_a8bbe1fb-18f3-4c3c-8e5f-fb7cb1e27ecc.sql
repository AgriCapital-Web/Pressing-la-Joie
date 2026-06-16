-- Remove the overly permissive SELECT policy that allows bucket listing
DROP POLICY IF EXISTS "Anyone can view testimonial photos" ON storage.objects;
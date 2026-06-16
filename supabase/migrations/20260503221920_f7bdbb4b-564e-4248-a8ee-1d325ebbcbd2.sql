
-- Drop existing view first
DROP VIEW IF EXISTS public.testimonials_public;

-- Create view excluding email
CREATE VIEW public.testimonials_public AS
SELECT id, first_name, last_name, testimonial, photo_url, created_at, status, is_agricapital_subscriber
FROM public.testimonials
WHERE approved = true;

-- Grant access to the view
GRANT SELECT ON public.testimonials_public TO anon, authenticated;

-- Ensure the base table policy still exists for admin access and public approved reads
-- (policy was dropped in failed migration, re-add it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'testimonials' AND policyname = 'Only approved testimonials are viewable by everyone'
  ) THEN
    EXECUTE 'CREATE POLICY "Only approved testimonials are viewable by everyone" ON public.testimonials FOR SELECT TO public USING (approved = true)';
  END IF;
END$$;

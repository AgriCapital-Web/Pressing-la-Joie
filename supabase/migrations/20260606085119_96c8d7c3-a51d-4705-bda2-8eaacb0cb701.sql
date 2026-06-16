DROP POLICY IF EXISTS "Only approved testimonials are viewable by everyone" ON public.testimonials;
GRANT SELECT ON public.testimonials_public TO anon, authenticated;
REVOKE SELECT ON public.testimonials FROM anon;
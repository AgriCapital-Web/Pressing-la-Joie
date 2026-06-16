
DROP VIEW IF EXISTS public.testimonials_public CASCADE;
DROP VIEW IF EXISTS public.partnerships_public CASCADE;

CREATE VIEW public.testimonials_public AS
SELECT id, first_name, last_name, testimonial, photo_url, status, is_agricapital_subscriber, created_at
FROM public.testimonials
WHERE approved = true;

GRANT SELECT ON public.testimonials_public TO anon, authenticated;

CREATE VIEW public.partnerships_public AS
SELECT id, name, type, description, benefits, logo_url, partner_count, status, created_at, updated_at
FROM public.partnerships
WHERE status = 'active';

GRANT SELECT ON public.partnerships_public TO anon, authenticated;

COMMENT ON VIEW public.testimonials_public IS 'Public-safe view of approved testimonials. Excludes the email column.';
COMMENT ON VIEW public.partnerships_public IS 'Public-safe view of active partnerships. Excludes contact_email and contact_phone.';


-- 1. Fix testimonials_public view: recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.testimonials_public;
CREATE VIEW public.testimonials_public
WITH (security_invoker = on) AS
SELECT id, first_name, last_name, testimonial, photo_url, status, is_agricapital_subscriber, approved, created_at
FROM public.testimonials
WHERE approved = true;

-- 2. Revoke anon EXECUTE on internal trigger functions (not meant to be called via API)
REVOKE EXECUTE ON FUNCTION public.log_admin_action() FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_admin_action() FROM public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM public;

-- 3. Revoke anon EXECUTE on has_role (only used in RLS, not called directly)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public;
-- Grant to authenticated only (needed for RLS evaluation)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- 4. Convert increment_news_view and increment_news_share to SECURITY INVOKER
-- But they need UPDATE on news table, so we keep SECURITY DEFINER but restrict access
REVOKE EXECUTE ON FUNCTION public.increment_news_view(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.increment_news_view(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.increment_news_view(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_news_view(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.increment_news_share(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.increment_news_share(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.increment_news_share(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_news_share(uuid) TO authenticated;

-- 5. Restrict get_public_visitor_count - keep callable by anon (public counter) but revoke from public role
REVOKE EXECUTE ON FUNCTION public.get_public_visitor_count() FROM public;
GRANT EXECUTE ON FUNCTION public.get_public_visitor_count() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_visitor_count() TO authenticated;


-- Fix: grant EXECUTE on has_role to anon so RLS policies referencing it work for public/anon reads (news, etc.)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;

-- Create a public aggregated visitor_counters view for anonymous read
CREATE OR REPLACE VIEW public.visitor_counters AS
SELECT
  'public'::text AS id,
  COUNT(DISTINCT visitor_id)::bigint AS total_visitors,
  COUNT(DISTINCT visitor_id) FILTER (WHERE created_at > (now() - interval '7 days'))::bigint AS weekly_visitors
FROM public.page_visits;

GRANT SELECT ON public.visitor_counters TO anon, authenticated;

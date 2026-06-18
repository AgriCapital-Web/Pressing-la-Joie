CREATE TABLE IF NOT EXISTS public.visitor_counters (
  id text PRIMARY KEY,
  total_visitors bigint NOT NULL DEFAULT 3262,
  weekly_visitors bigint NOT NULL DEFAULT 135,
  week_started_at timestamptz NOT NULL DEFAULT date_trunc('week', now()),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.visitor_counters TO anon, authenticated;
GRANT ALL ON public.visitor_counters TO service_role;

ALTER TABLE public.visitor_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read visitor counters" ON public.visitor_counters;
CREATE POLICY "Public can read visitor counters"
ON public.visitor_counters
FOR SELECT
TO anon, authenticated
USING (id = 'public');

INSERT INTO public.visitor_counters (id, total_visitors, weekly_visitors, week_started_at)
VALUES (
  'public',
  3234 + (SELECT COUNT(DISTINCT visitor_id) FROM public.page_visits),
  107 + (SELECT COUNT(DISTINCT visitor_id) FROM public.page_visits WHERE created_at >= now() - interval '7 days'),
  date_trunc('week', now())
)
ON CONFLICT (id) DO UPDATE
SET total_visitors = GREATEST(public.visitor_counters.total_visitors, EXCLUDED.total_visitors),
    weekly_visitors = GREATEST(public.visitor_counters.weekly_visitors, EXCLUDED.weekly_visitors),
    updated_at = now();

CREATE OR REPLACE FUNCTION public.increment_public_visitor_counter()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_week timestamptz := date_trunc('week', now());
BEGIN
  INSERT INTO public.visitor_counters (id, total_visitors, weekly_visitors, week_started_at, updated_at)
  VALUES ('public', 3263, 136, current_week, now())
  ON CONFLICT (id) DO UPDATE
  SET total_visitors = public.visitor_counters.total_visitors + 1,
      weekly_visitors = CASE
        WHEN public.visitor_counters.week_started_at < current_week THEN 108
        ELSE public.visitor_counters.weekly_visitors + 1
      END,
      week_started_at = CASE
        WHEN public.visitor_counters.week_started_at < current_week THEN current_week
        ELSE public.visitor_counters.week_started_at
      END,
      updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_public_visitor_counter() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_public_visitor_counter() TO service_role;

DROP TRIGGER IF EXISTS trg_increment_public_visitor_counter ON public.page_visits;
CREATE TRIGGER trg_increment_public_visitor_counter
AFTER INSERT ON public.page_visits
FOR EACH ROW
EXECUTE FUNCTION public.increment_public_visitor_counter();

REVOKE EXECUTE ON FUNCTION public.get_public_visitor_count() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_visitor_stats() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_visitor_count() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_public_visitor_stats() TO service_role;
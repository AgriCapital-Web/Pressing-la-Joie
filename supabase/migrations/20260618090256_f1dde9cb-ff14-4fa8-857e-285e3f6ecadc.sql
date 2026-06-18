CREATE TABLE IF NOT EXISTS public.page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  visitor_id text NOT NULL,
  user_agent text,
  referrer text,
  domain text DEFAULT 'www.agricapital.ci',
  country text,
  city text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.page_visits TO anon;
GRANT SELECT, INSERT ON public.page_visits TO authenticated;
GRANT ALL ON public.page_visits TO service_role;

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert page visits" ON public.page_visits;
CREATE POLICY "Anyone can insert page visits"
ON public.page_visits
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(page_path) BETWEEN 1 AND 300
  AND char_length(visitor_id) BETWEEN 8 AND 120
  AND (domain IS NULL OR char_length(domain) <= 120)
);

DROP POLICY IF EXISTS "Admins can view page visits" ON public.page_visits;
CREATE POLICY "Admins can view page visits"
ON public.page_visits
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Public can read aggregate-safe page visits" ON public.page_visits;

CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON public.page_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_visitor_id ON public.page_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_domain ON public.page_visits(domain);
CREATE INDEX IF NOT EXISTS idx_page_visits_page_path ON public.page_visits(page_path);

INSERT INTO public.page_visits (page_path, visitor_id, user_agent, referrer, domain, created_at)
SELECT '/', 'manual-correction-2026-06-18-' || gs::text, 'manual visitor correction', 'site contact messages', 'www.agricapital.ci', now() - ((28 - gs) * interval '12 minutes')
FROM generate_series(1, 28) AS gs
WHERE NOT EXISTS (
  SELECT 1 FROM public.page_visits WHERE visitor_id LIKE 'manual-correction-2026-06-18-%'
);

CREATE OR REPLACE FUNCTION public.get_public_visitor_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (3234 + COUNT(DISTINCT visitor_id))::bigint
  FROM public.page_visits;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_visitor_count() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_visitor_stats()
RETURNS TABLE(total_visitors bigint, weekly_visitors bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (3234 + COUNT(DISTINCT visitor_id))::bigint AS total_visitors,
    (107 + COUNT(DISTINCT visitor_id) FILTER (WHERE created_at >= now() - interval '7 days'))::bigint AS weekly_visitors
  FROM public.page_visits;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_visitor_stats() TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL DEFAULT '',
  audience_type text NOT NULL DEFAULT 'all',
  status text NOT NULL DEFAULT 'draft',
  provider text NOT NULL DEFAULT 'brevo',
  brevo_campaign_id text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_campaigns_status_check CHECK (status IN ('draft', 'ready', 'sent', 'archived')),
  CONSTRAINT email_campaigns_audience_check CHECK (audience_type IN ('all', 'investors', 'partners', 'clients', 'subscribers'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_campaigns TO authenticated;
GRANT ALL ON public.email_campaigns TO service_role;

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage email campaigns" ON public.email_campaigns;
CREATE POLICY "Admins can manage email campaigns"
ON public.email_campaigns
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON public.email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at
BEFORE UPDATE ON public.email_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
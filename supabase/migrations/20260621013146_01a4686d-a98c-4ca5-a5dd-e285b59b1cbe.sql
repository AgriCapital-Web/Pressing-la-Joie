DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'manager');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS first_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS subscribed_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(email)) BETWEEN 5 AND 255
  AND position('@' in email) > 1
  AND length(trim(first_name)) BETWEEN 1 AND 80
  AND length(trim(last_name)) BETWEEN 1 AND 80
);

DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view newsletter subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can update newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can update newsletter subscribers"
ON public.newsletter_subscribers
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can delete newsletter subscribers"
ON public.newsletter_subscribers
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  preheader text NOT NULL DEFAULT '',
  html_content text NOT NULL DEFAULT '',
  plain_text text NOT NULL DEFAULT '',
  source_prompt text NOT NULL DEFAULT '',
  audience_type text NOT NULL DEFAULT 'all',
  status text NOT NULL DEFAULT 'draft',
  provider text NOT NULL DEFAULT 'brevo',
  brevo_campaign_id text,
  include_image boolean NOT NULL DEFAULT false,
  include_video boolean NOT NULL DEFAULT false,
  image_url text,
  video_url text,
  scheduled_at timestamptz,
  last_sent_at timestamptz,
  batches_total integer NOT NULL DEFAULT 1,
  open_count integer NOT NULL DEFAULT 0,
  click_count integer NOT NULL DEFAULT 0,
  error_summary text,
  media_preview jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_campaigns TO authenticated;
GRANT ALL ON public.email_campaigns TO service_role;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS preheader text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS plain_text text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS source_prompt text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS include_image boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS include_video boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS batches_total integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS open_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS click_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error_summary text,
  ADD COLUMN IF NOT EXISTS media_preview jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.email_campaigns DROP CONSTRAINT IF EXISTS email_campaigns_status_check;
ALTER TABLE public.email_campaigns ADD CONSTRAINT email_campaigns_status_check CHECK (status IN ('draft', 'ready', 'scheduled', 'sending', 'sent', 'failed', 'archived'));
ALTER TABLE public.email_campaigns DROP CONSTRAINT IF EXISTS email_campaigns_audience_check;
ALTER TABLE public.email_campaigns ADD CONSTRAINT email_campaigns_audience_check CHECK (audience_type IN ('all', 'testimonials', 'subscribers', 'investors', 'prospects', 'partners', 'clients', 'members', 'custom'));

DROP POLICY IF EXISTS "Admins can manage email campaigns" ON public.email_campaigns;
CREATE POLICY "Admins can manage email campaigns"
ON public.email_campaigns
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.newsletter_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  subject text NOT NULL,
  preheader text NOT NULL DEFAULT '',
  html_preview text,
  html_content text,
  total_recipients integer NOT NULL DEFAULT 0,
  total_sent integer NOT NULL DEFAULT 0,
  total_failed integer NOT NULL DEFAULT 0,
  failed_recipients jsonb DEFAULT '[]'::jsonb,
  audience_type text DEFAULT 'all',
  status text NOT NULL DEFAULT 'sent',
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  batches_total integer NOT NULL DEFAULT 1,
  batches_completed integer NOT NULL DEFAULT 0,
  open_count integer NOT NULL DEFAULT 0,
  click_count integer NOT NULL DEFAULT 0,
  error_summary text,
  provider text NOT NULL DEFAULT 'brevo',
  media_preview jsonb NOT NULL DEFAULT '[]'::jsonb,
  sent_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_sends TO authenticated;
GRANT ALL ON public.newsletter_sends TO service_role;
ALTER TABLE public.newsletter_sends ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.newsletter_sends
  ADD COLUMN IF NOT EXISTS campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS preheader text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS html_content text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'sent',
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS batches_total integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS batches_completed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS open_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS click_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error_summary text,
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'brevo',
  ADD COLUMN IF NOT EXISTS media_preview jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.newsletter_sends DROP CONSTRAINT IF EXISTS newsletter_sends_status_check;
ALTER TABLE public.newsletter_sends ADD CONSTRAINT newsletter_sends_status_check CHECK (status IN ('scheduled', 'sending', 'sent', 'partial', 'failed', 'cancelled'));

DROP POLICY IF EXISTS "Admins can view newsletter sends" ON public.newsletter_sends;
DROP POLICY IF EXISTS "Admins can insert newsletter sends" ON public.newsletter_sends;
DROP POLICY IF EXISTS "Admins can update newsletter sends" ON public.newsletter_sends;
DROP POLICY IF EXISTS "Admins can delete newsletter sends" ON public.newsletter_sends;
DROP POLICY IF EXISTS "Admins can manage newsletter sends" ON public.newsletter_sends;
CREATE POLICY "Admins can manage newsletter sends"
ON public.newsletter_sends
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  visitor_id text NOT NULL,
  user_agent text,
  referrer text,
  domain text DEFAULT 'www.agricapital.ci',
  country text,
  city text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.page_visits TO anon, authenticated;
GRANT SELECT ON public.page_visits TO authenticated;
GRANT ALL ON public.page_visits TO service_role;
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Public can insert page visits" ON public.page_visits;
CREATE POLICY "Public can insert page visits"
ON public.page_visits
FOR INSERT
TO anon, authenticated
WITH CHECK (length(trim(page_path)) > 0 AND length(trim(visitor_id)) > 0);

DROP POLICY IF EXISTS "Admins can view page visits" ON public.page_visits;
CREATE POLICY "Admins can view page visits"
ON public.page_visits
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Public can read visitor counters" ON public.visitor_counters;
CREATE POLICY "Public can read visitor counters"
ON public.visitor_counters
FOR SELECT
TO anon, authenticated
USING (id = 'public');

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

INSERT INTO public.visitor_counters (id, total_visitors, weekly_visitors, week_started_at)
VALUES ('public', 3263, 136, date_trunc('week', now()))
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_newsletter_sends_campaign_id ON public.newsletter_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_status_scheduled ON public.newsletter_sends(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status_scheduled ON public.email_campaigns(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON public.page_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_page_visits_visitor_id ON public.page_visits(visitor_id);
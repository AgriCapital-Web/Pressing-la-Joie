ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS preheader text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS plain_text text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS source_prompt text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS include_image boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS include_video boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS video_url text;

ALTER TABLE public.email_campaigns DROP CONSTRAINT IF EXISTS email_campaigns_audience_check;
ALTER TABLE public.email_campaigns
  ADD CONSTRAINT email_campaigns_audience_check CHECK (audience_type IN ('all', 'testimonials', 'subscribers', 'investors', 'prospects', 'partners', 'clients', 'members', 'custom'));

CREATE TABLE IF NOT EXISTS public.waitlist_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  whatsapp text,
  residence text,
  land_status text NOT NULL DEFAULT 'no_land',
  desired_area_hectares numeric,
  land_area_hectares numeric,
  source_page text,
  message text,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_land_status_check CHECK (land_status IN ('has_land', 'no_land')),
  CONSTRAINT waitlist_status_check CHECK (status IN ('new', 'contacted', 'qualified', 'archived')),
  CONSTRAINT waitlist_email_check CHECK (position('@' in email) > 1)
);

GRANT INSERT ON public.waitlist_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.waitlist_submissions TO authenticated;
GRANT ALL ON public.waitlist_submissions TO service_role;

ALTER TABLE public.waitlist_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit waitlist" ON public.waitlist_submissions;
CREATE POLICY "Public can submit waitlist"
ON public.waitlist_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage waitlist" ON public.waitlist_submissions;
CREATE POLICY "Admins can manage waitlist"
ON public.waitlist_submissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS update_waitlist_submissions_updated_at ON public.waitlist_submissions;
CREATE TRIGGER update_waitlist_submissions_updated_at
BEFORE UPDATE ON public.waitlist_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
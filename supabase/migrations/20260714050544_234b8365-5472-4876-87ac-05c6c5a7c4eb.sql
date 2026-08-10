
CREATE TABLE IF NOT EXISTS public.dataroom_signatories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text, whatsapp text, profession text, organization text, country text,
  profile_type text CHECK (profile_type IN ('investisseur','partenaire','presse','autre')),
  newsletter_optin boolean NOT NULL DEFAULT false,
  id_document_url text, id_verified boolean NOT NULL DEFAULT false,
  access_code_hash text NOT NULL, nda_pdf_url text,
  nda_signed_at timestamptz NOT NULL DEFAULT now(),
  ip_address text, user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dataroom_signatories TO authenticated;
GRANT ALL ON public.dataroom_signatories TO service_role;
ALTER TABLE public.dataroom_signatories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dataroom_signatories_admin_all" ON public.dataroom_signatories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.dataroom_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('document','photo','video','presentation','platform')),
  title text NOT NULL, description text, category text,
  file_url text, video_url text,
  platform_url text, platform_login text, platform_password text,
  cover_url text, watermark_enabled boolean NOT NULL DEFAULT true,
  visibility text NOT NULL DEFAULT 'all' CHECK (visibility IN ('all','investisseur','partenaire','presse')),
  is_published boolean NOT NULL DEFAULT true,
  views_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dataroom_publications TO authenticated;
GRANT ALL ON public.dataroom_publications TO service_role;
ALTER TABLE public.dataroom_publications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dataroom_publications_admin_all" ON public.dataroom_publications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.dataroom_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signatory_id uuid REFERENCES public.dataroom_signatories(id) ON DELETE CASCADE,
  publication_id uuid REFERENCES public.dataroom_publications(id) ON DELETE CASCADE,
  action text NOT NULL, progress_pct integer,
  ip_address text, user_agent text, device_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.dataroom_access_logs TO authenticated;
GRANT ALL ON public.dataroom_access_logs TO service_role;
ALTER TABLE public.dataroom_access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dataroom_access_logs_admin_select" ON public.dataroom_access_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.dataroom_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signatory_id uuid NOT NULL REFERENCES public.dataroom_signatories(id) ON DELETE CASCADE,
  publication_id uuid NOT NULL REFERENCES public.dataroom_publications(id) ON DELETE CASCADE,
  reaction text NOT NULL, rating integer CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(signatory_id, publication_id, reaction)
);
GRANT SELECT, INSERT, DELETE ON public.dataroom_reactions TO authenticated;
GRANT ALL ON public.dataroom_reactions TO service_role;
ALTER TABLE public.dataroom_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dataroom_reactions_admin_all" ON public.dataroom_reactions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.dataroom_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signatory_id uuid NOT NULL REFERENCES public.dataroom_signatories(id) ON DELETE CASCADE,
  publication_id uuid NOT NULL REFERENCES public.dataroom_publications(id) ON DELETE CASCADE,
  body text NOT NULL, approved boolean NOT NULL DEFAULT false, admin_reply text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dataroom_comments TO authenticated;
GRANT ALL ON public.dataroom_comments TO service_role;
ALTER TABLE public.dataroom_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dataroom_comments_admin_all" ON public.dataroom_comments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.dataroom_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signatory_id uuid NOT NULL REFERENCES public.dataroom_signatories(id) ON DELETE CASCADE,
  publication_id uuid REFERENCES public.dataroom_publications(id) ON DELETE SET NULL,
  intent_type text NOT NULL, message text NOT NULL,
  status text NOT NULL DEFAULT 'nouveau',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dataroom_intents TO authenticated;
GRANT ALL ON public.dataroom_intents TO service_role;
ALTER TABLE public.dataroom_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dataroom_intents_admin_all" ON public.dataroom_intents FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

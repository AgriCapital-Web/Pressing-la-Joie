CREATE TABLE public.dataroom_download_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id uuid NOT NULL REFERENCES public.dataroom_publications(id) ON DELETE CASCADE,
  signatory_id uuid REFERENCES public.dataroom_signatories(id) ON DELETE SET NULL,
  email text,
  visibility_scope text NOT NULL DEFAULT 'nda',
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  max_uses integer NOT NULL DEFAULT 1,
  used_count integer NOT NULL DEFAULT 0,
  revoked boolean NOT NULL DEFAULT false,
  last_used_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dataroom_download_links TO authenticated;
GRANT ALL ON public.dataroom_download_links TO service_role;

ALTER TABLE public.dataroom_download_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage download links"
ON public.dataroom_download_links FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_dataroom_download_links_updated_at
BEFORE UPDATE ON public.dataroom_download_links
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_dataroom_download_links_pub ON public.dataroom_download_links(publication_id);
CREATE INDEX idx_dataroom_download_links_exp ON public.dataroom_download_links(expires_at);
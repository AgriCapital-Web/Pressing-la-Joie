-- 1. Sessions signataires (dataroom) — pas de FK : la table signataires est gérée hors de ce schéma
CREATE TABLE IF NOT EXISTS public.dataroom_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signatory_id uuid NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dataroom_sessions_token_hash_idx ON public.dataroom_sessions(token_hash);
CREATE INDEX IF NOT EXISTS dataroom_sessions_expires_at_idx ON public.dataroom_sessions(expires_at);

GRANT ALL ON public.dataroom_sessions TO service_role;

ALTER TABLE public.dataroom_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view dataroom sessions" ON public.dataroom_sessions;
CREATE POLICY "Admins can view dataroom sessions"
  ON public.dataroom_sessions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Politiques d'accès sur storage.objects (RLS déjà actif par défaut)
DROP POLICY IF EXISTS "Admins can read protected bucket objects" ON storage.objects;
CREATE POLICY "Admins can read protected bucket objects"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id IN ('database_export_03_07_26', 'dataroom')
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Admins can insert protected bucket objects" ON storage.objects;
CREATE POLICY "Admins can insert protected bucket objects"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('database_export_03_07_26', 'dataroom')
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Admins can update protected bucket objects" ON storage.objects;
CREATE POLICY "Admins can update protected bucket objects"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('database_export_03_07_26', 'dataroom')
    AND public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    bucket_id IN ('database_export_03_07_26', 'dataroom')
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Admins can delete protected bucket objects" ON storage.objects;
CREATE POLICY "Admins can delete protected bucket objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('database_export_03_07_26', 'dataroom')
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );
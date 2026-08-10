ALTER TABLE public.ai_chat_logs
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'success',
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS duration_ms integer,
  ADD COLUMN IF NOT EXISTS tokens_total integer,
  ADD COLUMN IF NOT EXISTS retry_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error_message text;

ALTER TABLE public.dataroom_publications
  ADD COLUMN IF NOT EXISTS platform_type text,
  ADD COLUMN IF NOT EXISTS preview_title text,
  ADD COLUMN IF NOT EXISTS preview_description text,
  ADD COLUMN IF NOT EXISTS preview_image_url text,
  ADD COLUMN IF NOT EXISTS screenshot_url text,
  ADD COLUMN IF NOT EXISTS dynamic_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source_file_name text,
  ADD COLUMN IF NOT EXISTS source_file_size integer,
  ADD COLUMN IF NOT EXISTS source_mime_type text;

DROP POLICY IF EXISTS "dataroom_storage_admin_read" ON storage.objects;
DROP POLICY IF EXISTS "dataroom_storage_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "dataroom_storage_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "dataroom_storage_admin_delete" ON storage.objects;

CREATE POLICY "dataroom_storage_admin_read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'dataroom' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "dataroom_storage_admin_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'dataroom' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "dataroom_storage_admin_update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'dataroom' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'dataroom' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "dataroom_storage_admin_delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'dataroom' AND public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.ai_chat_logs DROP CONSTRAINT IF EXISTS ai_chat_logs_status_check;
ALTER TABLE public.ai_chat_logs ADD CONSTRAINT ai_chat_logs_status_check CHECK (status IN ('success','failure'));

ALTER TABLE public.dataroom_publications DROP CONSTRAINT IF EXISTS dataroom_publications_platform_type_check;
ALTER TABLE public.dataroom_publications ADD CONSTRAINT dataroom_publications_platform_type_check CHECK (platform_type IS NULL OR platform_type IN ('website','dashboard','payment','document_portal','communication','other'));

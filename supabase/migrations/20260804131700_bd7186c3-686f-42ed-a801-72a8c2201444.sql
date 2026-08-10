-- 1. Workflow + downloads on publications
ALTER TABLE public.dataroom_publications
  ADD COLUMN IF NOT EXISTS workflow_status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS downloads_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

CREATE OR REPLACE FUNCTION public.dataroom_validate_workflow()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.workflow_status NOT IN ('draft','in_review','published','archived') THEN
    RAISE EXCEPTION 'Invalid workflow_status: %', NEW.workflow_status;
  END IF;
  IF NEW.workflow_status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = now();
  END IF;
  NEW.is_published = (NEW.workflow_status = 'published');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dataroom_validate_workflow ON public.dataroom_publications;
CREATE TRIGGER trg_dataroom_validate_workflow
  BEFORE INSERT OR UPDATE ON public.dataroom_publications
  FOR EACH ROW EXECUTE FUNCTION public.dataroom_validate_workflow();

UPDATE public.dataroom_publications SET workflow_status = 'published' WHERE is_published = true;

-- 2. Review comments (internal)
CREATE TABLE IF NOT EXISTS public.dataroom_review_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id uuid NOT NULL REFERENCES public.dataroom_publications(id) ON DELETE CASCADE,
  author_id uuid,
  author_name text,
  body text NOT NULL,
  status_at_comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dataroom_review_comments TO authenticated;
GRANT ALL ON public.dataroom_review_comments TO service_role;
ALTER TABLE public.dataroom_review_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage review comments" ON public.dataroom_review_comments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'));

-- 3. Document versions
CREATE TABLE IF NOT EXISTS public.dataroom_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id uuid NOT NULL REFERENCES public.dataroom_publications(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  title text,
  description text,
  file_url text,
  source_file_name text,
  source_file_size bigint,
  source_mime_type text,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  change_note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (publication_id, version_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dataroom_versions TO authenticated;
GRANT ALL ON public.dataroom_versions TO service_role;
ALTER TABLE public.dataroom_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage versions" ON public.dataroom_versions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'));

-- 4. Popularity counters
CREATE OR REPLACE FUNCTION public.increment_dataroom_download(_publication_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.dataroom_publications SET downloads_count = downloads_count + 1 WHERE id = _publication_id;
$$;
GRANT EXECUTE ON FUNCTION public.increment_dataroom_download(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_dataroom_view(_publication_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.dataroom_publications SET views_count = views_count + 1 WHERE id = _publication_id;
$$;
GRANT EXECUTE ON FUNCTION public.increment_dataroom_view(uuid) TO anon, authenticated;

-- 5. Broken image logs
CREATE TABLE IF NOT EXISTS public.broken_image_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  page_url text,
  user_agent text,
  status text NOT NULL DEFAULT 'open',
  hits integer NOT NULL DEFAULT 1,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (image_url)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.broken_image_logs TO authenticated;
GRANT ALL ON public.broken_image_logs TO service_role;
ALTER TABLE public.broken_image_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read broken images" ON public.broken_image_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'));
CREATE POLICY "Staff update broken images" ON public.broken_image_logs
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'));
CREATE POLICY "Staff delete broken images" ON public.broken_image_logs
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.report_broken_image(_image_url text, _page_url text, _user_agent text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _image_url IS NULL OR length(_image_url) > 2048 THEN RETURN; END IF;
  INSERT INTO public.broken_image_logs (image_url, page_url, user_agent)
  VALUES (_image_url, left(coalesce(_page_url,''), 2048), left(coalesce(_user_agent,''), 512))
  ON CONFLICT (image_url) DO UPDATE
    SET hits = public.broken_image_logs.hits + 1,
        last_seen_at = now(),
        page_url = EXCLUDED.page_url,
        status = CASE WHEN public.broken_image_logs.status = 'fixed' THEN 'open' ELSE public.broken_image_logs.status END;
END;
$$;
GRANT EXECUTE ON FUNCTION public.report_broken_image(text, text, text) TO anon, authenticated;
-- 1. dataroom_sessions : immuables, révocables uniquement par les admins
REVOKE UPDATE, DELETE ON public.dataroom_sessions FROM authenticated, anon;
GRANT SELECT, DELETE ON public.dataroom_sessions TO authenticated;
GRANT ALL ON public.dataroom_sessions TO service_role;

DROP POLICY IF EXISTS "Dataroom sessions are immutable" ON public.dataroom_sessions;
CREATE POLICY "Dataroom sessions are immutable"
ON public.dataroom_sessions FOR UPDATE TO authenticated, anon
USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Admins can revoke dataroom sessions" ON public.dataroom_sessions;
CREATE POLICY "Admins can revoke dataroom sessions"
ON public.dataroom_sessions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.purge_expired_dataroom_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE removed integer;
BEGIN
  DELETE FROM public.dataroom_sessions WHERE expires_at < now();
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
$$;
REVOKE ALL ON FUNCTION public.purge_expired_dataroom_sessions() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_dataroom_sessions() TO service_role;

-- 2. Masquage des noms d'auteur dans les commentaires / historique de commandes
REVOKE SELECT ON public.order_comments FROM authenticated;
GRANT SELECT (id, order_id, comment, author_id, created_at) ON public.order_comments TO authenticated;
GRANT INSERT ON public.order_comments TO authenticated;

REVOKE SELECT ON public.order_history FROM authenticated;
GRANT SELECT (id, order_id, action, details, performed_by, created_at) ON public.order_history TO authenticated;
GRANT INSERT ON public.order_history TO authenticated;

GRANT ALL ON public.order_comments TO service_role;
GRANT ALL ON public.order_history TO service_role;

CREATE OR REPLACE VIEW public.order_comments_safe
WITH (security_invoker = true) AS
SELECT
  c.id,
  c.order_id,
  c.comment,
  c.author_id,
  CASE
    WHEN public.has_role(auth.uid(), 'admin'::app_role) THEN c.author_name
    WHEN c.author_id = auth.uid() THEN c.author_name
    ELSE NULLIF(regexp_replace(coalesce(c.author_name, ''), '(\S)\S*', '\1.', 'g'), '')
  END AS author_name,
  c.created_at
FROM public.order_comments c;

CREATE OR REPLACE VIEW public.order_history_safe
WITH (security_invoker = true) AS
SELECT
  h.id,
  h.order_id,
  h.action,
  h.details,
  h.performed_by,
  CASE
    WHEN public.has_role(auth.uid(), 'admin'::app_role) THEN h.performer_name
    WHEN h.performed_by = auth.uid() THEN h.performer_name
    ELSE NULLIF(regexp_replace(coalesce(h.performer_name, ''), '(\S)\S*', '\1.', 'g'), '')
  END AS performer_name,
  h.created_at
FROM public.order_history h;

GRANT SELECT ON public.order_comments_safe TO authenticated;
GRANT SELECT ON public.order_history_safe TO authenticated;
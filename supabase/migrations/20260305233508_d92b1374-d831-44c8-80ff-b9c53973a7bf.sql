-- Add shares counter on news
ALTER TABLE public.news
ADD COLUMN IF NOT EXISTS shares_count integer NOT NULL DEFAULT 0;

-- Public-safe aggregate visitor counter
CREATE OR REPLACE FUNCTION public.get_public_visitor_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT visitor_id)::bigint
  FROM public.page_visits;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_visitor_count() TO anon, authenticated;

-- Public-safe increment for article views
CREATE OR REPLACE FUNCTION public.increment_news_view(p_news_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.news
  SET views_count = COALESCE(views_count, 0) + 1,
      updated_at = now()
  WHERE id = p_news_id
  RETURNING views_count INTO v_count;

  RETURN COALESCE(v_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_news_view(uuid) TO anon, authenticated;

-- Public-safe increment for article shares
CREATE OR REPLACE FUNCTION public.increment_news_share(p_news_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.news
  SET shares_count = COALESCE(shares_count, 0) + 1,
      updated_at = now()
  WHERE id = p_news_id
  RETURNING shares_count INTO v_count;

  RETURN COALESCE(v_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_news_share(uuid) TO anon, authenticated;
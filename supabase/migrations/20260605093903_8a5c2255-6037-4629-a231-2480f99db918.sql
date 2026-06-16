GRANT SELECT ON public.site_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_media TO authenticated;
GRANT ALL ON public.site_media TO service_role;

DROP POLICY IF EXISTS "Admin full access site_media" ON public.site_media;
DROP POLICY IF EXISTS "Public can read active media" ON public.site_media;

CREATE POLICY "Public can read active gallery media"
ON public.site_media
FOR SELECT
TO anon, authenticated
USING (is_active = true AND type = 'image' AND category IN ('gallery', 'gallery-featured'));

CREATE POLICY "Admins can manage site media"
ON public.site_media
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
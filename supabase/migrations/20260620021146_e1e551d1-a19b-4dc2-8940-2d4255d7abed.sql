DROP POLICY IF EXISTS "Public can submit waitlist" ON public.waitlist_submissions;
CREATE POLICY "Public can submit waitlist"
ON public.waitlist_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(full_name)) BETWEEN 2 AND 160
  AND length(trim(email)) BETWEEN 5 AND 255
  AND position('@' in email) > 1
  AND land_status IN ('has_land', 'no_land')
  AND (desired_area_hectares IS NULL OR desired_area_hectares >= 0)
  AND (land_area_hectares IS NULL OR land_area_hectares >= 0)
);
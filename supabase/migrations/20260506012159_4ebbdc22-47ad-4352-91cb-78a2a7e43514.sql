
-- Add html_content column to store full original HTML
ALTER TABLE public.newsletter_sends
ADD COLUMN IF NOT EXISTS html_content text;

-- Add DELETE policy for admins
CREATE POLICY "Admins can delete newsletter sends"
ON public.newsletter_sends
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

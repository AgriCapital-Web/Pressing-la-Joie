
CREATE TABLE public.newsletter_sends (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  html_preview text,
  total_recipients integer NOT NULL DEFAULT 0,
  total_sent integer NOT NULL DEFAULT 0,
  total_failed integer NOT NULL DEFAULT 0,
  failed_recipients jsonb DEFAULT '[]'::jsonb,
  audience_type text DEFAULT 'all',
  sent_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view newsletter sends"
ON public.newsletter_sends FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert newsletter sends"
ON public.newsletter_sends FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update newsletter sends"
ON public.newsletter_sends FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

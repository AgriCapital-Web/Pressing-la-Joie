-- Fix security issues: Update RLS policies for visitor_contacts
DROP POLICY IF EXISTS "Admins can view all visitor contacts" ON public.visitor_contacts;

CREATE POLICY "Admins can view all visitor contacts"
ON public.visitor_contacts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add update and delete policies for visitor_contacts (admin only)
CREATE POLICY "Admins can update visitor contacts"
ON public.visitor_contacts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete visitor contacts"
ON public.visitor_contacts
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix site_settings policy - restrict public read to non-sensitive settings only
DROP POLICY IF EXISTS "Public can read settings" ON public.site_settings;

CREATE POLICY "Public can read non-sensitive settings"
ON public.site_settings
FOR SELECT
USING (category NOT IN ('internal', 'security', 'api_keys', 'credentials'));

-- Create index for better performance on page_visits domain queries
CREATE INDEX IF NOT EXISTS idx_page_visits_domain ON public.page_visits(domain);
CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON public.page_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_visitor_contacts_session_id ON public.visitor_contacts(session_id);
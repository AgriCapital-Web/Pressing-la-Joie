
-- Rescope admin-only policies from public role to authenticated

-- contact_messages
DROP POLICY IF EXISTS "Admin full access contact_messages" ON public.contact_messages;
CREATE POLICY "Admin full access contact_messages" ON public.contact_messages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- visitor_contacts
DROP POLICY IF EXISTS "Admins can view all visitor contacts" ON public.visitor_contacts;
DROP POLICY IF EXISTS "Admins can update visitor contacts" ON public.visitor_contacts;
DROP POLICY IF EXISTS "Admins can delete visitor contacts" ON public.visitor_contacts;
CREATE POLICY "Admins can view all visitor contacts" ON public.visitor_contacts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update visitor contacts" ON public.visitor_contacts
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete visitor contacts" ON public.visitor_contacts
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- email_logs
DROP POLICY IF EXISTS "Admin full access email_logs" ON public.email_logs;
CREATE POLICY "Admin full access email_logs" ON public.email_logs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- email_recipients
DROP POLICY IF EXISTS "Admin full access email_recipients" ON public.email_recipients;
CREATE POLICY "Admin full access email_recipients" ON public.email_recipients
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- email_templates
DROP POLICY IF EXISTS "Admin full access email_templates" ON public.email_templates;
CREATE POLICY "Admin full access email_templates" ON public.email_templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- email_signatures
DROP POLICY IF EXISTS "Admin full access email_signatures" ON public.email_signatures;
CREATE POLICY "Admin full access email_signatures" ON public.email_signatures
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- auto_responses
DROP POLICY IF EXISTS "Admin full access auto_responses" ON public.auto_responses;
CREATE POLICY "Admin full access auto_responses" ON public.auto_responses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- form_submissions
DROP POLICY IF EXISTS "Admin full access form_submissions" ON public.form_submissions;
CREATE POLICY "Admin full access form_submissions" ON public.form_submissions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- partnerships
DROP POLICY IF EXISTS "Admin full access partnerships" ON public.partnerships;
CREATE POLICY "Admin full access partnerships" ON public.partnerships
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- site_content
DROP POLICY IF EXISTS "Admin full access site_content" ON public.site_content;
CREATE POLICY "Admin full access site_content" ON public.site_content
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- site_forms
DROP POLICY IF EXISTS "Admin full access site_forms" ON public.site_forms;
CREATE POLICY "Admin full access site_forms" ON public.site_forms
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- site_menu
DROP POLICY IF EXISTS "Admin full access site_menu" ON public.site_menu;
CREATE POLICY "Admin full access site_menu" ON public.site_menu
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- site_pages
DROP POLICY IF EXISTS "Admin full access site_pages" ON public.site_pages;
CREATE POLICY "Admin full access site_pages" ON public.site_pages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- site_sections
DROP POLICY IF EXISTS "Admin full access site_sections" ON public.site_sections;
CREATE POLICY "Admin full access site_sections" ON public.site_sections
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- site_settings
DROP POLICY IF EXISTS "Admin full access site_settings" ON public.site_settings;
CREATE POLICY "Admin full access site_settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- push_subscriptions: allow users to manage their own subscriptions
CREATE POLICY "Users can manage their own push subscriptions"
  ON public.push_subscriptions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

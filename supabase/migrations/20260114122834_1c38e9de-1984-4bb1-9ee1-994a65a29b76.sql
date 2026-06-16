-- Create function to log admin actions automatically
CREATE OR REPLACE FUNCTION public.log_admin_action()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get current user id from auth context
  current_user_id := auth.uid();
  
  -- Only log if there's an authenticated user
  IF current_user_id IS NOT NULL THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        new_data,
        metadata
      ) VALUES (
        current_user_id,
        'CREATE',
        TG_TABLE_NAME,
        NEW.id::text,
        to_jsonb(NEW),
        jsonb_build_object('trigger', 'automatic', 'table', TG_TABLE_NAME)
      );
    ELSIF TG_OP = 'UPDATE' THEN
      INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        old_data,
        new_data,
        metadata
      ) VALUES (
        current_user_id,
        'UPDATE',
        TG_TABLE_NAME,
        NEW.id::text,
        to_jsonb(OLD),
        to_jsonb(NEW),
        jsonb_build_object('trigger', 'automatic', 'table', TG_TABLE_NAME)
      );
    ELSIF TG_OP = 'DELETE' THEN
      INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        old_data,
        metadata
      ) VALUES (
        current_user_id,
        'DELETE',
        TG_TABLE_NAME,
        OLD.id::text,
        to_jsonb(OLD),
        jsonb_build_object('trigger', 'automatic', 'table', TG_TABLE_NAME)
      );
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create triggers for automatic audit logging on all main tables
CREATE TRIGGER audit_news_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_testimonials_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_site_content_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_site_pages_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.site_pages
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_site_sections_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.site_sections
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_site_menu_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.site_menu
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_partnerships_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.partnerships
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_partnership_requests_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.partnership_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_email_templates_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_site_settings_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_user_roles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

-- Create table for backup settings
CREATE TABLE IF NOT EXISTS public.backup_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_backup_enabled boolean DEFAULT false,
  backup_interval text DEFAULT 'daily',
  backup_destination text DEFAULT 'local',
  google_drive_folder_id text,
  last_backup_at timestamp with time zone,
  next_backup_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on backup_settings
ALTER TABLE public.backup_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can manage backup settings"
  ON public.backup_settings
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create table for backup history
CREATE TABLE IF NOT EXISTS public.backup_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type text NOT NULL DEFAULT 'manual',
  format text NOT NULL,
  tables_included jsonb,
  file_size text,
  destination text DEFAULT 'local',
  google_drive_file_id text,
  status text DEFAULT 'pending',
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Enable RLS on backup_history
ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can view backup history"
  ON public.backup_history
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_backup_settings_updated_at
  BEFORE UPDATE ON public.backup_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default backup settings if not exists
INSERT INTO public.backup_settings (auto_backup_enabled, backup_interval)
VALUES (false, 'daily')
ON CONFLICT DO NOTHING;
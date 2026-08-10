DROP TRIGGER IF EXISTS audit_dataroom_publications_changes ON public.dataroom_publications;
CREATE TRIGGER audit_dataroom_publications_changes
AFTER INSERT OR UPDATE OR DELETE ON public.dataroom_publications
FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

DROP TRIGGER IF EXISTS audit_dataroom_versions_changes ON public.dataroom_versions;
CREATE TRIGGER audit_dataroom_versions_changes
AFTER INSERT OR DELETE ON public.dataroom_versions
FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

DROP TRIGGER IF EXISTS audit_dataroom_review_comments_changes ON public.dataroom_review_comments;
CREATE TRIGGER audit_dataroom_review_comments_changes
AFTER INSERT OR DELETE ON public.dataroom_review_comments
FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

DROP TRIGGER IF EXISTS audit_dataroom_signatories_changes ON public.dataroom_signatories;
CREATE TRIGGER audit_dataroom_signatories_changes
AFTER UPDATE OR DELETE ON public.dataroom_signatories
FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();
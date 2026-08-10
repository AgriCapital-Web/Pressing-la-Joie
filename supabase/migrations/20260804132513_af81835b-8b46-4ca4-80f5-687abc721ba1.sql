ALTER TABLE public.dataroom_publications DROP CONSTRAINT IF EXISTS dataroom_publications_visibility_check;
ALTER TABLE public.dataroom_publications ADD CONSTRAINT dataroom_publications_visibility_check
  CHECK (visibility = ANY (ARRAY['public','nda','vip','all','investisseur','partenaire','presse']));
ALTER TABLE public.dataroom_publications DROP CONSTRAINT IF EXISTS dataroom_publications_type_check;
ALTER TABLE public.dataroom_publications ADD CONSTRAINT dataroom_publications_type_check
  CHECK (type = ANY (ARRAY['document','photo','image','video','presentation','platform']));
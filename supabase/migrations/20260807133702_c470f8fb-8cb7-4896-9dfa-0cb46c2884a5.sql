ALTER TABLE public.dataroom_signatories
  ADD COLUMN IF NOT EXISTS access_level text NOT NULL DEFAULT 'nda';

DO $$ BEGIN
  ALTER TABLE public.dataroom_signatories
    ADD CONSTRAINT dataroom_signatories_access_level_chk
    CHECK (access_level IN ('public','nda','vip'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO public.news (slug, title_fr, excerpt_fr, content_fr, category, featured_image, images, is_published, is_featured, published_at)
SELECT
 'agricapital-accelere-deploiement-organisation-operationnelle',
 'AgriCapital accélère le déploiement de son organisation opérationnelle',
 'Onze conseillers commerciaux ont rejoint la première session d''intégration et de formation du réseau commercial AgriCapital, quelques jours après l''ouverture du premier Bureau de Proximité.',
 '<p>Quelques jours après l''ouverture officielle de son premier Bureau de Proximité, AgriCapital franchit une nouvelle étape dans son développement avec le lancement de la première session d''intégration et de formation de son réseau commercial.</p>
<p>Onze (11) conseillers commerciaux ont rejoint cette première cohorte afin d''accompagner le déploiement progressif des activités de l''entreprise sur le terrain.</p>
<p>Au-delà de la présentation de nos offres, cette session avait pour objectif de transmettre ce qui constitue le socle d''AgriCapital : notre histoire, notre vision, notre modèle de création et de gestion d''actifs agricoles, ainsi que les valeurs et les exigences qui guideront chacune de nos actions.</p>
<p>Le développement d''une entreprise durable ne repose pas uniquement sur une stratégie ou un modèle économique. Il repose également sur des équipes formées, engagées et pleinement alignées avec la mission qu''elles portent.</p>
<p>Cette nouvelle étape illustre notre volonté de construire, progressivement, une organisation solide, structurée et capable d''accompagner durablement les propriétaires fonciers, les investisseurs, les membres de la diaspora et l''ensemble de nos partenaires.</p>
<p><strong>Le déploiement d''AgriCapital est en marche.</strong></p>',
 'entreprise',
 '/formation/formation-groupe-cohorte.jpg',
 '["/formation/formation-groupe-cohorte.jpg","/formation/formation-prise-parole.jpg","/formation/formation-session-salle.jpg","/formation/formation-presentation-offres.jpg","/formation/formation-participants-1.jpg","/formation/formation-echange-equipe.jpg"]'::jsonb,
 true, true, '2026-08-05T09:00:00+00'
WHERE NOT EXISTS (SELECT 1 FROM public.news WHERE slug = 'agricapital-accelere-deploiement-organisation-operationnelle');
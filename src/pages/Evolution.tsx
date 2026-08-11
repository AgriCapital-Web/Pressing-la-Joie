import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar, MapPin, Users, Leaf, Target, CheckCircle, Sprout, ArrowLeft, Clock, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ArticleJsonLD from "@/components/ArticleJsonLD";
import { supabase } from "@/integrations/supabase/client";

import nurseryPepiniere from "@/assets/nursery-pepiniere-daloa.jpg";
import lancementTerrainAsset from "@/assets/lancement-operations-terrain.jpg.asset.json";
import nurserySite from "@/assets/nursery-palm.jpg";
import nurseryInspection from "@/assets/nursery-inspection-2026.jpg";
import palmFruits from "@/assets/palm-mature-fruits.jpg";
import palmPlantation from "@/assets/palm-mature-plantation.jpg";
import palmNursery from "@/assets/palm-nursery-april2026.jpg";

const Evolution = () => {
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [adminPhotos, setAdminPhotos] = useState<{ src: string; title: string; comment: string; featured: boolean }[]>([]);

  const texts = {
    fr: {
      title: "Évolution du Projet",
      subtitle: "Suivez la progression opérationnelle d'AgriCapital sur le terrain",
      backHome: "Retour à l'accueil",
      milestones: "Jalons Clés",
      completed: "Réalisé",
      inProgress: "En cours",
      upcoming: "À venir",
      gallery: "Galerie photo",
      hectares: "ha de pépinière active",
      lands: "ha de terre identifiés à Daloa",
      available: "ha disponible pour déploiement immédiat",
      waitlist: "souscripteurs accompagnés",
      ctaTitle: "Créez votre patrimoine agricole",
      ctaSubtitle: "Faites-vous contacter et soyez parmi les premiers souscripteurs d'AgriCapital.",
      contactUs: "Nous contacter",
      daloaTitle: "Pépinière de Daloa — 120 hectares",
      daloaDesc: "Site pleinement opérationnel : système d'irrigation autonome, plants certifiés Tenera, équipe technique mobilisée.",
      launchTitle: "Photos terrain sélectionnées",
      viewAll: "Voir toutes les photos",
      m1: { date: "19 Novembre 2025", title: "Lancement des Opérations Terrain", desc: "Démarrage officiel d'AgriCapital avec l'installation de l'infrastructure opérationnelle et le début des activités sur le terrain." },
      m2: { date: "Nov – Déc 2025", title: "Pépinière Daloa — 120 ha", desc: "Installation complète de la pépinière de 120 hectares à Daloa avec irrigation autonome et plants certifiés Tenera." },
      m3: { date: "1er Août 2026", title: "Inauguration du 1er bureau de proximité — Gonaté", desc: "AgriCapital a inauguré son premier bureau de proximité à Gonaté (département de Daloa), en présence de plus de 100 participants : autorités locales, propriétaires fonciers, partenaires techniques, investisseurs, clients, jeunes et femmes. Cette ouverture marque le lancement officiel du déploiement opérationnel du modèle de création et de gestion d'actifs agricoles au plus près des territoires ruraux." },
      m5: { date: "5 Août 2026", title: "Première session de formation du réseau commercial", desc: "Onze (11) conseillers commerciaux ont rejoint la première cohorte AgriCapital. Au-delà des offres, la session a transmis l'histoire, la vision, le modèle de création et de gestion d'actifs agricoles ainsi que les exigences de qualité qui encadrent chaque engagement pris auprès des propriétaires fonciers et des souscripteurs." },
      m4: { date: "En cours", title: "Déploiement Commercial", desc: "Déploiement du réseau commercial, prospection communautaire active et premiers engagements de clients intéressés par nos formules." },
    },
    en: {
      title: "Project Evolution",
      subtitle: "Track AgriCapital's operational progress on the ground",
      backHome: "Back to home",
      milestones: "Key Milestones",
      completed: "Completed",
      inProgress: "In Progress",
      upcoming: "Upcoming",
      gallery: "Photo Gallery",
      hectares: "ha of active nursery",
      lands: "ha of land identified in Daloa",
      available: "ha available for immediate deployment",
      waitlist: "supported subscribers",
      ctaTitle: "Create your agricultural heritage",
      ctaSubtitle: "Get contacted and be among the first AgriCapital subscribers.",
      contactUs: "Contact us",
      daloaTitle: "Daloa Nursery — 120 hectares",
      daloaDesc: "Fully operational site: autonomous irrigation, certified Tenera seedlings, mobilized technical team.",
      launchTitle: "Selected field photos",
      viewAll: "View all photos",
      m1: { date: "November 19, 2025", title: "Field Operations Launch", desc: "Official start of AgriCapital with operational infrastructure installation and field activities." },
      m2: { date: "Nov – Dec 2025", title: "Daloa Nursery — 120 ha", desc: "Complete installation of the 120-hectare nursery in Daloa with autonomous irrigation and certified Tenera plants." },
      m3: { date: "August 1, 2026", title: "First local office opened — Gonaté", desc: "AgriCapital opened its first local office in Gonaté (Daloa department) with over 100 attendees: local authorities, landowners, technical partners, investors, clients, youth and women. It marks the official launch of the operational rollout of our agricultural asset creation and management model." },
      m5: { date: "August 5, 2026", title: "First sales network training session", desc: "Eleven (11) sales advisors joined AgriCapital's first cohort. Beyond the offering, the session shared our history, vision, agricultural asset creation and management model, and the quality standards framing every commitment made to landowners and subscribers." },
      m4: { date: "Ongoing", title: "Commercial Deployment", desc: "Sales network rollout, active community prospecting and first client commitments." },
    },
  };

  const t = texts[language as keyof typeof texts] || texts.fr;

  const milestones = [
    { ...t.m1, status: "completed", icon: Target, year: "2025", image: lancementTerrainAsset.url },
    { ...t.m2, status: "completed", icon: Sprout, year: "2025", image: "/inauguration/terrain-prospection.webp" },
    { ...t.m3, status: "completed", icon: MapPin, year: "2026", image: "/inauguration/inauguration-assemblee.webp" },
    { ...t.m5, status: "completed", icon: Users, year: "2026", image: "/formation/formation-prise-parole.webp" },
    { ...t.m4, status: "in_progress", icon: Users, year: "2026", image: "/formation/formation-groupe-cohorte.webp" },
  ];

  const curatedPhotos = [
    { src: "/inauguration/bureau-gonate-enseigne.webp", title: "Bureau de proximité de Gonaté", comment: "Inauguration du premier bureau de proximité AgriCapital, le 1er août 2026.", featured: true },
    { src: "/inauguration/inauguration-assemblee.webp", title: "Cérémonie d'inauguration", comment: "Plus de 100 participants : autorités locales, propriétaires fonciers, partenaires, clients, jeunes et femmes.", featured: true },
    { src: "/inauguration/inauguration-prise-parole.webp", title: "Présentation du modèle", comment: "Présentation publique de la vision et du modèle de création d'actifs agricoles.", featured: true },
    { src: "/inauguration/inauguration-remise-symbolique.webp", title: "Remise symbolique", comment: "Moment fort de la cérémonie d'ouverture du bureau de Gonaté.", featured: false },
    { src: "/inauguration/inauguration-groupe.webp", title: "Équipe et partenaires", comment: "L'équipe AgriCapital entourée de ses partenaires techniques et stratégiques.", featured: false },
    { src: "/inauguration/bureau-gonate-interieur.webp", title: "Espace d'accueil client", comment: "Guichet dédié à l'information, l'accompagnement et la contractualisation.", featured: false },
    { src: "/inauguration/pepiniere-plants-palmier.webp", title: "Pépinière — 20 000+ plants", comment: "Plants Tenera destinés aux plantations clés en main des souscripteurs.", featured: false },
    { src: "/formation/formation-groupe-cohorte.webp", title: "Première cohorte de conseillers commerciaux", comment: "Onze conseillers commerciaux formés le 5 août 2026 pour accompagner le déploiement terrain.", featured: true },
    { src: "/formation/formation-prise-parole.webp", title: "Transmission du modèle AgriCapital", comment: "Histoire, vision et modèle de création et de gestion d'actifs agricoles.", featured: false },
    { src: "/formation/formation-session-salle.webp", title: "Session d'intégration", comment: "Formation aux exigences de qualité et aux engagements pris envers les clients.", featured: false },
    { src: "/formation/formation-presentation-offres.webp", title: "Présentation des offres", comment: "Maîtrise complète des formules et du parcours de souscription.", featured: false },
    { src: "/formation/formation-echange-equipe.webp", title: "Échanges avec l'équipe", comment: "Alignement des conseillers sur la mission et les valeurs de l'entreprise.", featured: false },
    { src: nurseryPepiniere, title: "Pépinière structurée", comment: "Plants sélectionnés et organisation professionnelle du site.", featured: true },
    { src: palmNursery, title: "Plants en croissance", comment: "Développement progressif des plants pour les futures plantations.", featured: true },
    { src: nurserySite, title: "Suivi en pépinière", comment: "Contrôle régulier de la croissance et de l’état sanitaire des plants.", featured: false },
    { src: nurseryInspection, title: "Inspection terrain", comment: "Passage technique sur site pour vérifier la qualité du développement.", featured: false },
    { src: palmFruits, title: "Palmier mature", comment: "Illustration du potentiel productif recherché à long terme.", featured: false },
    { src: palmPlantation, title: "Plantation professionnelle", comment: "Référence visuelle d’une plantation structurée et productive.", featured: false },
  ];
  const galleryPhotos = [...adminPhotos, ...curatedPhotos].sort((a, b) => Number(b.featured) - Number(a.featured));
  const activePhoto = galleryPhotos[currentPhoto % galleryPhotos.length];

  useEffect(() => {
    supabase.from("site_media").select("name,url,alt_text_fr,category").in("category", ["gallery", "gallery-featured"]).eq("type", "image").eq("is_active", true).then(({ data }) => {
      setAdminPhotos((data || []).map((item) => ({ src: item.url, title: item.name, comment: item.alt_text_fr || "", featured: item.category === "gallery-featured" })));
    });
  }, []);

  useEffect(() => {
    if (!galleryPhotos.length) return;
    const timer = window.setInterval(() => setCurrentPhoto((prev) => (prev + 1) % galleryPhotos.length), 5500);
    return () => window.clearInterval(timer);
  }, [galleryPhotos.length]);

  const goToPreviousPhoto = () => {
    if (!galleryPhotos.length) return;
    setCurrentPhoto((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  const goToNextPhoto = () => {
    if (!galleryPhotos.length) return;
    setCurrentPhoto((prev) => (prev + 1) % galleryPhotos.length);
  };

  const stats = [
    { value: "120+", label: t.hectares, icon: Leaf },
    { value: "500+", label: t.lands, icon: MapPin },
    { value: "50", label: t.available, icon: Target },
  ];

  const statusStyles = {
    completed: { border: "border-l-primary", bg: "bg-primary/5", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", iconBg: "bg-primary/10 text-primary" },
    in_progress: { border: "border-l-accent", bg: "bg-accent/5", badge: "bg-amber-50 text-amber-700 border-amber-200", iconBg: "bg-accent/10 text-accent" },
    upcoming: { border: "border-l-border", bg: "bg-muted/30", badge: "bg-muted text-muted-foreground border-border", iconBg: "bg-muted text-muted-foreground" },
  };

  return (
    <>
      <SEOHead />
      <ArticleJsonLD
        type="Article"
        headline={t.title}
        description={t.subtitle}
        image="/inauguration/bureau-gonate-enseigne.webp"
        datePublished="2025-11-19"
        dateModified="2026-08-01"
        path="/evolution"
        section="Évolution du projet"
        keywords={["AgriCapital", "palmier à huile", "Daloa", "Gonaté", "actif agricole"]}
        breadcrumbs={[{ name: "Évolution du projet", path: "/evolution" }]}
      />
      <DynamicNavigation />

      <main className="pt-16 min-h-screen bg-background">
        {/* Hero — clean editorial */}
        <section className="relative py-20 sm:py-28 bg-gradient-primary text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zMCAzMGgyMHYyMEgzMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-40" />
          <div className="container mx-auto px-4 relative">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mb-6 text-white/70 hover:text-white hover:bg-white/10 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                {t.backHome}
              </Button>
            </Link>
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-4 text-white">{t.title}</h1>
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed">{t.subtitle}</p>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="py-0 -mt-10 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-3 sm:gap-5 max-w-3xl mx-auto">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-card rounded-xl border border-border shadow-medium p-4 sm:p-6 text-center">
                    <Icon className="w-6 h-6 mx-auto mb-2 text-primary/70" />
                    <p className="text-2xl sm:text-3xl font-bold text-foreground font-sans">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl text-center mb-12 sm:mb-16">{t.milestones}</h2>
            <div className="relative max-w-5xl mx-auto">
              {/* Ligne de chronologie */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" aria-hidden />
              <div className="space-y-10 sm:space-y-14">
                {milestones.map((ms, i) => {
                  const Icon = ms.icon;
                  const style = statusStyles[ms.status as keyof typeof statusStyles];
                  const right = i % 2 === 1;
                  return (
                    <div key={i} className="relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-10 items-center">
                      {/* Pastille */}
                      <div className={`absolute left-4 md:left-1/2 top-6 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10 w-9 h-9 rounded-full border-4 border-background flex items-center justify-center ${style.iconBg}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Visuel */}
                      <div className={`${right ? "md:order-2 md:pl-10" : "md:order-1 md:pr-10"} mb-4 md:mb-0`}>
                        <div className="overflow-hidden rounded-2xl border border-border shadow-medium aspect-[16/10] bg-muted group">
                          <img
                            src={ms.image}
                            alt={ms.title}
                            loading="lazy"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className={`${right ? "md:order-1 md:pr-10 md:text-right" : "md:order-2 md:pl-10"}`}>
                        <div className={`rounded-xl border-l-4 ${style.border} ${style.bg} border border-border p-5 sm:p-6 ${right ? "md:border-l-0 md:border-r-4" : ""}`}>
                          <div className={`flex flex-wrap items-center gap-2 mb-2 ${right ? "md:justify-end" : ""}`}>
                            <span className="text-xs font-bold tracking-wider text-primary">{ms.year}</span>
                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {ms.date}
                            </span>
                            <Badge variant="outline" className={`text-xs ${style.badge}`}>
                              {ms.status === "completed" && <><CheckCircle className="w-3 h-3 mr-1" />{t.completed}</>}
                              {ms.status === "in_progress" && t.inProgress}
                              {ms.status === "upcoming" && <><Clock className="w-3 h-3 mr-1" />{t.upcoming}</>}
                            </Badge>
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold font-sans mb-2">{ms.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{ms.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Unified Gallery */}
        <section className="py-16 sm:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-3xl sm:text-4xl mb-3">{t.gallery}</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">{t.daloaDesc}</p>
            </div>

            {activePhoto && (
              <div className="max-w-5xl mx-auto">
                <div className="relative overflow-hidden rounded-2xl shadow-medium aspect-[16/9] bg-muted group">
                  <img src={activePhoto.src} alt={activePhoto.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <button
                    onClick={goToPreviousPhoto}
                    aria-label="Photo précédente"
                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card/90 text-foreground shadow-medium flex items-center justify-center hover:bg-card transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goToNextPhoto}
                    aria-label="Photo suivante"
                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card/90 text-foreground shadow-medium flex items-center justify-center hover:bg-card transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-4 sm:p-6 text-primary-foreground">
                    <p className="font-bold text-base sm:text-lg">{activePhoto.title}</p>
                    {activePhoto.comment && <p className="text-sm text-white/80">{activePhoto.comment}</p>}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5">
                  <div className="flex justify-center gap-1.5">
                    {galleryPhotos.map((_, i) => (
                      <button key={i} onClick={() => setCurrentPhoto(i)} className={`h-2 rounded-full transition-all ${i === currentPhoto % galleryPhotos.length ? "w-7 bg-primary" : "w-2 bg-border"}`} aria-label={`Voir la photo ${i + 1}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-lg" onClick={() => setSelectedImage(activePhoto.src)}>
                      <Images className="w-4 h-4 mr-2" />
                      Agrandir
                    </Button>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg" onClick={() => setShowAllPhotos(true)}>
                      {t.viewAll}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl mb-3">{t.ctaTitle}</h2>
              <p className="text-muted-foreground mb-8 text-lg">{t.ctaSubtitle}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                  <Link to="/#contact">{t.contactUs}</Link>
                </Button>
                <Button variant="outline" asChild className="rounded-lg">
                  <a href="tel:+2250564551717">📞 05 64 55 17 17</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-2 bg-card">
          {selectedImage && <img src={selectedImage} alt="AgriCapital" className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>

      <Dialog open={showAllPhotos} onOpenChange={setShowAllPhotos}>
        <DialogContent className="max-w-6xl max-h-[88vh] overflow-y-auto bg-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Images className="w-5 h-5 text-primary" />
            <h3 className="text-xl sm:text-2xl font-bold font-sans">{t.gallery}</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {galleryPhotos.map((photo, i) => (
              <button key={i} className="overflow-hidden rounded-xl shadow-soft hover:shadow-medium transition-all aspect-[4/3] group relative" onClick={() => { setCurrentPhoto(i); setShowAllPhotos(false); }}>
                <img src={photo.src} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                {photo.featured && <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px]">★</Badge>}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Evolution;

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
import { supabase } from "@/integrations/supabase/client";

import nurseryPepiniere from "@/assets/nursery-pepiniere-daloa.jpg";
import nurserySite from "@/assets/nursery-site.webp";
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
      waitlist: "souscripteurs en liste d'attente",
      ctaTitle: "Créez votre patrimoine agricole",
      ctaSubtitle: "Rejoignez la liste d'attente et soyez parmi les premiers souscripteurs d'AgriCapital.",
      contactUs: "Nous contacter",
      daloaTitle: "Pépinière de Daloa — 120 hectares",
      daloaDesc: "Site pleinement opérationnel : système d'irrigation autonome, plants certifiés Tenera, équipe technique mobilisée.",
      launchTitle: "Photos terrain sélectionnées",
      viewAll: "Voir toutes les photos",
      m1: { date: "19 Novembre 2025", title: "Lancement des Opérations Terrain", desc: "Démarrage officiel d'AgriCapital avec l'installation de l'infrastructure opérationnelle et le début des activités sur le terrain." },
      m2: { date: "Nov – Déc 2025", title: "Pépinière Daloa — 120 ha", desc: "Installation complète de la pépinière de 120 hectares à Daloa avec irrigation autonome et plants certifiés Tenera." },
      m3: { date: "En cours", title: "Déploiement Commercial", desc: "Ouverture de la liste d'attente, prospection communautaire active et premiers engagements de clients intéressés par nos formules." },
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
      waitlist: "subscribers on waitlist",
      ctaTitle: "Create your agricultural heritage",
      ctaSubtitle: "Join the waitlist and be among the first AgriCapital subscribers.",
      contactUs: "Contact us",
      daloaTitle: "Daloa Nursery — 120 hectares",
      daloaDesc: "Fully operational site: autonomous irrigation, certified Tenera seedlings, mobilized technical team.",
      launchTitle: "Selected field photos",
      viewAll: "View all photos",
      m1: { date: "November 19, 2025", title: "Field Operations Launch", desc: "Official start of AgriCapital with operational infrastructure installation and field activities." },
      m2: { date: "Nov – Dec 2025", title: "Daloa Nursery — 120 ha", desc: "Complete installation of the 120-hectare nursery in Daloa with autonomous irrigation and certified Tenera plants." },
      m3: { date: "Ongoing", title: "Commercial Deployment", desc: "Waitlist opening, active community prospecting and first client commitments." },
    },
  };

  const t = texts[language as keyof typeof texts] || texts.fr;

  const milestones = [
    { ...t.m1, status: "completed", icon: Target },
    { ...t.m2, status: "completed", icon: Sprout },
    { ...t.m3, status: "in_progress", icon: Users },
  ];

  const curatedPhotos = [
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {milestones.map((ms, i) => {
                const Icon = ms.icon;
                const style = statusStyles[ms.status as keyof typeof statusStyles];
                return (
                  <div key={i} className={`rounded-xl border-l-4 ${style.border} ${style.bg} border border-border p-5 sm:p-6`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-xl ${style.iconBg} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
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
                        <h3 className="text-lg font-bold font-sans mb-1.5">{ms.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{ms.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
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

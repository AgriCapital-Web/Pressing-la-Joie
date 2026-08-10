import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, MapPin, Calendar, Users, Building2, Maximize2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Slide = { src: string; title: string; caption: string };

const slides: Slide[] = [
  {
    src: "/inauguration/bureau-gonate-enseigne.webp",
    title: "Le bureau de proximité de Gonaté",
    caption: "Premier bureau de proximité AgriCapital, inauguré le 1er août 2026 à Gonaté (département de Daloa).",
  },
  {
    src: "/inauguration/inauguration-assemblee.webp",
    title: "Une cérémonie très suivie",
    caption: "Partenaires, propriétaires fonciers, investisseurs, clients et invités réunis pour l'ouverture officielle.",
  },
  {
    src: "/inauguration/inauguration-prise-parole.webp",
    title: "Présentation du modèle économique",
    caption: "Présentation de la vision, du modèle de création d'actifs agricoles et des perspectives de développement.",
  },
  {
    src: "/inauguration/inauguration-remise-symbolique.webp",
    title: "Remise symbolique",
    caption: "Un moment fort de la cérémonie, symbole de l'ancrage d'AgriCapital au cœur des territoires ruraux.",
  },
  {
    src: "/inauguration/inauguration-groupe.webp",
    title: "L'équipe AgriCapital et ses partenaires",
    caption: "Une équipe mobilisée aux côtés de partenaires techniques et stratégiques reconnus.",
  },
  {
    src: "/inauguration/inauguration-accueil-client.webp",
    title: "Accueil et accompagnement de proximité",
    caption: "Un guichet dédié pour informer, accompagner et contractualiser au plus près des territoires.",
  },
  {
    src: "/inauguration/bureau-gonate-interieur.webp",
    title: "Un espace d'accueil dédié",
    caption: "Bureau opérationnel pour la relation client, l'instruction des dossiers et le suivi foncier.",
  },
  {
    src: "/inauguration/pepiniere-plants-palmier.webp",
    title: "Plus de 20 000 plants en pépinière",
    caption: "La pépinière alimente les plantations clés en main déployées auprès de nos souscripteurs.",
  },
];

const copy = {
  fr: {
    badge: "1er août 2026 — Gonaté, Daloa",
    title: "AgriCapital inaugure son premier bureau de proximité",
    lead:
      "L'ouverture du bureau de Gonaté marque le lancement officiel du déploiement opérationnel de notre modèle de création et de gestion d'actifs agricoles, au plus près des territoires ruraux.",
    stats: [
      { icon: Building2, value: "1er", label: "bureau de proximité" },
      { icon: Users, value: "100+", label: "participants à la cérémonie" },
      { icon: MapPin, value: "Gonaté", label: "département de Daloa" },
      { icon: Calendar, value: "20 000+", label: "plants en pépinière" },
    ],
    cta: "Lire l'actualité complète",
    ctaAlt: "Nous contacter",
    enlarge: "Agrandir",
  },
  en: {
    badge: "August 1, 2026 — Gonaté, Daloa",
    title: "AgriCapital opens its first local office",
    lead:
      "The opening of the Gonaté office marks the official launch of the operational rollout of our agricultural asset creation and management model, closer to rural territories.",
    stats: [
      { icon: Building2, value: "1st", label: "local office" },
      { icon: Users, value: "100+", label: "attendees" },
      { icon: MapPin, value: "Gonaté", label: "Daloa department" },
      { icon: Calendar, value: "20,000+", label: "nursery seedlings" },
    ],
    cta: "Read the full story",
    ctaAlt: "Contact us",
    enlarge: "Enlarge",
  },
};

const InaugurationSection = () => {
  const { language } = useLanguage();
  const t = copy[(language === "en" ? "en" : "fr") as keyof typeof copy];
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<string | null>(null);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = window.setInterval(next, 5000);
    return () => window.clearInterval(timer);
  }, [next]);

  const active = slides[index];

  return (
    <section id="inauguration" className="py-14 sm:py-16 lg:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Diaporama */}
          <div className="order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-2xl shadow-medium aspect-[4/3] sm:aspect-[16/10] bg-muted group">
              {slides.map((s, i) => (
                <img
                  key={s.src}
                  src={s.src}
                  alt={s.title}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = s.src.replace(".webp", ".jpg");
                  }}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    i === index ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}

              <button
                onClick={prev}
                aria-label="Photo précédente"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 shadow-medium flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                aria-label="Photo suivante"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 shadow-medium flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setZoom(active.src)}
                aria-label={t.enlarge}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/90 shadow-soft flex items-center justify-center hover:bg-background transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/85 to-transparent p-4 sm:p-5">
                <p className="font-bold text-sm sm:text-base text-white">{active.title}</p>
                <p className="text-xs sm:text-sm text-white/85 line-clamp-2">{active.caption}</p>
              </div>
            </div>

            <div className="flex justify-center gap-1.5 mt-4">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Photo ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === index ? "w-7 bg-primary" : "w-2 bg-border"}`}
                />
              ))}
            </div>
          </div>

          {/* Texte */}
          <div className="order-1 lg:order-2">
            <Badge className="mb-4 bg-accent/15 text-accent border-accent/30 hover:bg-accent/15">
              {t.badge}
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">{t.title}</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{t.lead}</p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-7">
              {t.stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="rounded-xl border border-border bg-card p-3.5 sm:p-4">
                    <Icon className="w-5 h-5 text-primary mb-2" />
                    <p className="text-xl sm:text-2xl font-bold leading-none">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">{s.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="bg-gradient-accent border-0 text-white hover:opacity-90">
                <Link to="/actualites/inauguration-premier-bureau-proximite-gonate">{t.cta}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/#contact">{t.ctaAlt}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!zoom} onOpenChange={() => setZoom(null)}>
        <DialogContent className="max-w-5xl p-2 bg-card">
          {zoom && <img src={zoom} alt={active.title} className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default InaugurationSection;

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Users, MapPin, Handshake, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import prospectImage1 from "@/assets/community-meeting-1.jpg";
import prospectImage2 from "@/assets/community-meeting-2.jpg";
import prospectImage3 from "@/assets/community-meeting-3.png";
import prospectImage4 from "@/assets/community-meeting-4.jpg";
import prospectImage5 from "@/assets/community-meeting-5.jpg";
import prospectImage6 from "@/assets/community-meeting-6.jpg";
import prospectImage7 from "@/assets/community-meeting-7.jpg";
import prospectImage8 from "@/assets/community-meeting-8.jpg";
import prospectImage9 from "@/assets/prospect-meeting-9.jpg";
import prospectImage10 from "@/assets/prospect-meeting-10.jpg";
import prospectImage11 from "@/assets/prospect-meeting-11.jpg";
import prospectImage12 from "@/assets/prospect-meeting-12.jpg";
import prospectImage13 from "@/assets/prospect-meeting-13.jpg";
import prospectImage14 from "@/assets/prospect-meeting-14.jpg";

const translations = {
  fr: {
    title: "Notre Ancrage Terrain",
    subtitle: "Une connaissance approfondie du territoire au service de nos clients",
    description: "De 2012 à 2024, **Inocent KOFFI**, fondateur d'AgriCapital, a développé une expertise terrain exceptionnelle à travers plus d'une décennie d'immersion dans les communautés rurales ivoiriennes. Cette connaissance intime du territoire, des réalités agricoles et du potentiel foncier constitue un atout stratégique majeur pour identifier et sécuriser les meilleures terres pour nos clients.",
    stats: {
      localities: "500+ ha identifiés",
      regions: "Région du Haut-Sassandra",
      producers: "50 ha disponibles",
      years: "Opérations lancées en 2025",
    },
    galleryTitle: "Photos Terrain",
    badge: "Opérateur agricole professionnel",
    highlights: [
      "Identification et validation technique des parcelles à fort potentiel",
      "Rencontres avec les propriétaires fonciers et communautés locales",
      "Cartographie GPS et sécurisation des périmètres agricoles",
      "Évaluation agronomique des sols et du potentiel de production",
    ],
  },
  en: {
    title: "Our Field Expertise",
    subtitle: "Deep territorial knowledge serving our clients",
    description: "From 2012 to 2024, **Inocent KOFFI**, founder of AgriCapital, developed exceptional field expertise through over a decade of immersion in Ivorian rural communities. This intimate knowledge of the territory, agricultural realities and land potential is a major strategic asset for identifying and securing the best lands for our clients.",
    stats: {
      localities: "500+ ha identified",
      regions: "Haut-Sassandra region",
      producers: "50 ha available",
      years: "Operations launched in 2025",
    },
    galleryTitle: "Field Photos",
    badge: "Professional agricultural operator",
    highlights: [
      "Identification and technical validation of high-potential plots",
      "Meetings with landowners and local communities",
      "GPS mapping and securing of agricultural perimeters",
      "Agronomic soil assessment and production potential evaluation",
    ],
  },
  ar: {
    title: "خبرتنا الميدانية",
    subtitle: "معرفة عميقة بالمنطقة لخدمة عملائنا",
    description: "من ٢٠١٢ إلى ٢٠٢٤، طور **إينوسنت كوفي**، مؤسس أغريكابيتال، خبرة ميدانية استثنائية عبر أكثر من عقد من الانغماس في المجتمعات الريفية الإيفوارية. هذه المعرفة العميقة بالإقليم والواقع الزراعي وإمكانات الأراضي تشكل ميزة استراتيجية كبرى لتحديد وتأمين أفضل الأراضي لعملائنا.",
    stats: {
      localities: "+٥٠٠ هكتار محددة",
      regions: "منطقة هوت ساساندرا",
      producers: "٥٠ هكتار متاحة",
      years: "بدء العمليات ٢٠٢٥",
    },
    galleryTitle: "صور ميدانية",
    badge: "مشغل زراعي محترف",
    highlights: [
      "تحديد والتحقق التقني من القطع ذات الإمكانات العالية",
      "لقاءات مع ملاك الأراضي والمجتمعات المحلية",
      "مسح GPS وتأمين المحيطات الزراعية",
      "تقييم زراعي للتربة وإمكانات الإنتاج",
    ],
  },
  es: {
    title: "Nuestra Experiencia de Campo",
    subtitle: "Conocimiento profundo del territorio al servicio de nuestros clientes",
    description: "De 2012 a 2024, **Inocent KOFFI**, fundador de AgriCapital, desarrolló una experiencia de campo excepcional a través de más de una década de inmersión en las comunidades rurales marfileñas. Este conocimiento íntimo del territorio, las realidades agrícolas y el potencial fundiario constituye una ventaja estratégica mayor para identificar y asegurar las mejores tierras para nuestros clientes.",
    stats: {
      localities: "500+ ha identificadas",
      regions: "Región de Haut-Sassandra",
      producers: "50 ha disponibles",
      years: "Operaciones lanzadas en 2025",
    },
    galleryTitle: "Fotos de Campo",
    badge: "Operador agrícola profesional",
    highlights: [
      "Identificación y validación técnica de parcelas de alto potencial",
      "Reuniones con propietarios y comunidades locales",
      "Cartografía GPS y aseguramiento de perímetros agrícolas",
      "Evaluación agronómica de suelos y potencial de producción",
    ],
  },
  de: {
    title: "Unsere Feldexpertise",
    subtitle: "Tiefes Gebietswissen im Dienste unserer Kunden",
    description: "Von 2012 bis 2024 entwickelte **Inocent KOFFI**, Gründer von AgriCapital, eine außergewöhnliche Feldexpertise durch über ein Jahrzehnt Immersion in ländlichen Gemeinden der Elfenbeinküste. Dieses intime Wissen über das Territorium, die landwirtschaftlichen Realitäten und das Landpotenzial ist ein strategischer Vorteil für die Identifizierung und Sicherung der besten Böden für unsere Kunden.",
    stats: {
      localities: "500+ ha identifiziert",
      regions: "Region Haut-Sassandra",
      producers: "50 ha verfügbar",
      years: "Betrieb gestartet 2025",
    },
    galleryTitle: "Feldfotos",
    badge: "Professioneller Agrarbetreiber",
    highlights: [
      "Identifizierung und technische Validierung ertragreicher Parzellen",
      "Treffen mit Grundbesitzern und lokalen Gemeinschaften",
      "GPS-Kartierung und Sicherung landwirtschaftlicher Perimeter",
      "Agronomische Bodenbewertung und Produktionspotenzialanalyse",
    ],
  },
  zh: {
    title: "我们的实地专长",
    subtitle: "为客户服务的深度地域知识",
    description: "从2012年到2024年，AgriCapital创始人**Inocent KOFFI**通过十多年在科特迪瓦农村社区的沉浸式工作，积累了卓越的实地专业知识。这种对领土、农业现实和土地潜力的深入了解，是为客户识别和确保最佳土地的重要战略优势。",
    stats: {
      localities: "500+公顷已确定",
      regions: "上萨桑德拉地区",
      producers: "50公顷可用",
      years: "2025年启动运营",
    },
    galleryTitle: "实地照片",
    badge: "专业农业运营商",
    highlights: [
      "识别和技术验证高潜力地块",
      "与土地所有者和当地社区会面",
      "GPS制图和农业边界安全保障",
      "土壤农艺评估和生产潜力评估",
    ],
  },
};

const CommunityProspecting = () => {
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const t = translations[language as keyof typeof translations] || translations.fr;

  const prospectingImages = [
    prospectImage12, // Large gathering under tent
    prospectImage11, // Meeting with AgriCapital polo
    prospectImage13, // Village meeting
    prospectImage14, // Field discussion
    prospectImage9,  // Small group meeting
    prospectImage10, // Community porch meeting
    prospectImage1,
    prospectImage2,
    prospectImage3,
    prospectImage4,
    prospectImage5,
    prospectImage6,
    prospectImage7,
    prospectImage8,
  ];

  const statsData = [
    { icon: MapPin, value: t.stats.localities },
    { icon: Users, value: t.stats.regions },
    { icon: Handshake, value: t.stats.producers },
    { icon: TrendingUp, value: t.stats.years },
  ];

  return (
    <section id="prospection" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-agri-green/10 text-agri-green border-agri-green/30 hover:bg-agri-green/20">
            <Handshake className="w-3.5 h-3.5 mr-1.5" />
            {t.badge}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.title}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12 max-w-4xl mx-auto">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-border hover:shadow-medium transition-smooth">
                <CardContent className="p-4 text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-agri-green" />
                  <p className="text-sm md:text-base font-semibold text-foreground leading-tight">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Description & Highlights */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
                {t.description.split('**Inocent KOFFI**').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <strong className="text-foreground font-extrabold">Inocent KOFFI</strong>}
                  </span>
                ))}
              </p>
            </div>
            <div className="space-y-3">
              {t.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-agri-green mt-2 shrink-0" />
                  <p className="text-foreground text-sm md:text-base">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Photo Gallery Carousel */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center">
            {t.galleryTitle}
          </h3>
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
            className="w-full max-w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {prospectingImages.map((image, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 basis-full xs:basis-1/2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <div
                    className="rounded-xl overflow-hidden shadow-medium aspect-[4/3] cursor-pointer group"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image}
                      alt={`${t.galleryTitle} ${index + 1}`}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-2 md:-left-6" />
            <CarouselNext className="-right-2 md:-right-6" />
          </Carousel>
        </div>
      </div>

      {/* Image Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-2">
          {selectedImage && (
            <img
              src={selectedImage}
              alt={t.galleryTitle}
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CommunityProspecting;

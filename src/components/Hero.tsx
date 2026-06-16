import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";

import slide1 from "@/assets/nursery-pepiniere-daloa.jpg";
import slide2 from "@/assets/founder-palm-field.jpg";
import slide3 from "@/assets/palm-mature-plantation.jpg";

interface Slide {
  image: string;
  eyebrow: Record<Language, string>;
  title: Record<Language, string>;
  description: Record<Language, string>;
}

const slides: Slide[] = [
  {
    image: slide1,
    eyebrow: { fr: "Notre savoir-faire", en: "Our expertise", ar: "خبرتنا", es: "Nuestra experiencia", de: "Unser Know-how", zh: "我们的专长" },
    title: {
      fr: "Bâtissons votre patrimoine agricole durable",
      en: "Building your sustainable agricultural heritage",
      ar: "نبني إرثكم الزراعي المستدام",
      es: "Construyamos su patrimonio agrícola sostenible",
      de: "Wir bauen Ihr nachhaltiges Agrarvermögen auf",
      zh: "共建您可持续的农业资产",
    },
    description: {
      fr: "AgriCapital accompagne particuliers et entreprises dans la création de plantations professionnelles de palmier à huile dans le Haut-Sassandra et partout en Côte d'Ivoire.",
      en: "AgriCapital supports individuals and businesses in creating professional oil palm plantations in Côte d'Ivoire.",
      ar: "تساعد AgriCapital الأفراد والشركات على إنشاء مزارع نخيل زيت احترافية في كوت ديفوار.",
      es: "AgriCapital acompaña a particulares y empresas en la creación de plantaciones profesionales de palma aceitera en Costa de Marfil.",
      de: "AgriCapital begleitet Privatpersonen und Unternehmen beim Aufbau professioneller Ölpalmplantagen in der Elfenbeinküste.",
      zh: "AgriCapital助力个人与企业在科特迪瓦建立专业油棕种植园。",
    },
  },
  {
    image: slide2,
    eyebrow: { fr: "Sécurisation du foncier", en: "Land securing", ar: "تأمين الأراضي", es: "Aseguramiento de tierras", de: "Landsicherung", zh: "土地保障" },
    title: {
      fr: "Vous avez la terre ? Nous la transformons en plantation productive",
      en: "You have the land? We turn it into a productive plantation",
      ar: "لديكم الأرض؟ نحوّلها إلى مزرعة منتجة",
      es: "¿Tiene tierras? Las convertimos en una plantación productiva",
      de: "Sie haben das Land? Wir machen daraus eine produktive Plantage",
      zh: "您拥有土地？我们将其转化为高产种植园",
    },
    description: {
      fr: "Défrichage, piquetage, plantation et fertilisation — nous prenons en charge l'intégralité de la création de la plantation jusqu'à l'entrée en production (36 mois).",
      en: "Agro-pedological studies, clearing, staking, planting and fertilisation — we handle the full development.",
      ar: "دراسات زراعية، إزالة، تخطيط، زراعة وتسميد — نتولى كامل التطوير.",
      es: "Estudios agropedológicos, desmonte, replanteo, plantación y fertilización — gestionamos todo el desarrollo.",
      de: "Bodenanalysen, Rodung, Vermessung, Pflanzung und Düngung — wir übernehmen die gesamte Entwicklung.",
      zh: "土壤研究、清理、放线、种植与施肥——我们负责全程开发。",
    },
  },
  {
    image: slide3,
    eyebrow: { fr: "Accompagnement intégral", en: "Full support", ar: "مرافقة كاملة", es: "Acompañamiento integral", de: "Komplette Begleitung", zh: "全程陪伴" },
    title: {
      fr: "Pas de terre ? Nous nous occupons de tout, jusqu'à l'exploitation",
      en: "No land? We handle everything, all the way to operations",
      ar: "لا تملك أرضًا؟ نتولى كل شيء حتى التشغيل",
      es: "¿Sin tierras? Nos encargamos de todo, hasta la explotación",
      de: "Kein Land? Wir kümmern uns um alles bis zur Bewirtschaftung",
      zh: "没有土地？从筹备到运营，我们全权负责",
    },
    description: {
      fr: "Identification et sécurisation du foncier, mise en culture et accompagnement technique sur toute la durée du contrat (28 ans — cycle du palmier à huile).",
      en: "Land identification, legal securing, cultivation and technical support throughout the contract.",
      ar: "تحديد الأراضي، التأمين القانوني، الزراعة والدعم الفني طوال مدة العقد.",
      es: "Identificación, seguridad jurídica, cultivo y soporte técnico durante todo el contrato.",
      de: "Landidentifikation, Rechtssicherheit, Anbau und technische Unterstützung über die gesamte Vertragslaufzeit.",
      zh: "土地识别、法律保障、种植与全程技术支持。",
    },
  },
];

const Hero = () => {
  const { language } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(next, 6500);
    return () => clearInterval(id);
  }, [next, isPaused]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const slide = slides[current];
  const t = (rec: Record<Language, string>) => rec[language] || rec.fr;

  return (
    <section
      id="hero"
      className="relative pt-20 lg:pt-24 pb-10 lg:pb-16 bg-secondary/40"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-strong bg-card">
          {/* Slides */}
          <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/9] xl:aspect-[24/9]">
            {slides.map((s, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                style={{ opacity: current === i ? 1 : 0, pointerEvents: current === i ? "auto" : "none" }}
              >
                <img
                  src={s.image}
                  alt={t(s.title)}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/45 sm:to-transparent" />
                <div className="absolute inset-0 flex items-end sm:items-center">
                  <div className="w-full px-5 sm:px-10 lg:px-16 pb-8 sm:pb-0">
                    <div className="max-w-xl lg:max-w-2xl">
                      <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
                        <span className="w-8 h-[2px] bg-accent rounded" />
                        <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-[0.18em] drop-shadow-md">
                          {t(s.eyebrow)}
                        </span>
                      </div>
                      <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-3 sm:mb-5">
                        {t(s.title)}
                      </h1>
                      <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed mb-5 sm:mb-7 max-w-lg">
                        {t(s.description)}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          size="lg"
                          onClick={() => scrollToSection("domaines")}
                          className="bg-accent hover:bg-accent/90 text-white border-0 rounded-full font-semibold group min-h-[48px] px-6"
                        >
                          {language === "en" ? "Our services" : language === "ar" ? "خدماتنا" : language === "es" ? "Nuestros servicios" : language === "de" ? "Unsere Leistungen" : language === "zh" ? "我们的服务" : "Nos services"}
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                          size="lg"
                          onClick={() => scrollToSection("contact")}
                          variant="outline"
                          className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/40 rounded-full font-semibold min-h-[48px] px-6"
                        >
                          {language === "en" ? "Contact us" : language === "ar" ? "اتصل بنا" : language === "es" ? "Contáctenos" : language === "de" ? "Kontakt" : language === "zh" ? "联系我们" : "Nous contacter"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Manual controls */}
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white text-accent hover:bg-accent hover:text-white shadow-medium flex items-center justify-center transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-accent text-white hover:bg-accent/90 shadow-medium flex items-center justify-center transition-all active:scale-95"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${current === i ? "w-8 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

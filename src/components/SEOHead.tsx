import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/lib/translations";

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  slogan: string;
}

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
}

const seoTranslations: Record<Language, SEOData> = {
  fr: {
    title: "AgriCapital - Le partenaire idéal des producteurs agricoles en Côte d'Ivoire",
    description: "AgriCapital propose un modèle innovant d'accompagnement agricole permettant aux petits producteurs et propriétaires terriens d'accéder à la filière palmier à huile sans barrière financière. Basé à Daloa, Haut-Sassandra.",
    keywords: "AgriCapital, Côte d'Ivoire, Daloa, Haut-Sassandra, SARL, modèle innovant, innovation agricole, accompagnement agricole, services intégrés, débouché commercial, garantie rachat, petits producteurs agricoles, propriétaires terriens, palmier à huile, filière palmier à huile, création de plantations, gestion de terres, valorisation de terres agricoles, encadrement technique agricole, développement rural, agriculture durable, pépinière palmier à huile, suivi technique plantations, Inocent KOFFI",
    slogan: "Cultivons ensemble l'avenir de l'agriculture ivoirienne",
  },
  en: {
    title: "AgriCapital - The ideal partner for agricultural producers in Côte d'Ivoire",
    description: "AgriCapital offers an innovative agricultural support model enabling small producers and landowners to access the oil palm industry without financial barriers. Based in Daloa, Haut-Sassandra.",
    keywords: "AgriCapital, Côte d'Ivoire, Daloa, Haut-Sassandra, innovative model, agricultural innovation, agricultural support, integrated services, commercial outlet, buyback guarantee, small agricultural producers, landowners, oil palm, oil palm industry, plantation creation, land management, agricultural land development, technical agricultural supervision, rural development, sustainable agriculture, oil palm nursery, plantation technical monitoring, Inocent KOFFI",
    slogan: "Transforming Ivorian agriculture together",
  },
  ar: {
    title: "أجري كابيتال - الشريك المثالي للمنتجين الزراعيين في كوت ديفوار",
    description: "تقدم أجري كابيتال نموذجًا مبتكرًا للدعم الزراعي يمكّن صغار المنتجين وأصحاب الأراضي من الوصول إلى صناعة زيت النخيل دون حواجز مالية. مقرها في دالوا، أعالي ساساندرا.",
    keywords: "أجري كابيتال، كوت ديفوار، دالوا، أعالي ساساندرا، نموذج مبتكر، ابتكار زراعي، دعم زراعي، خدمات متكاملة، منفذ تجاري، ضمان إعادة الشراء، صغار المنتجين الزراعيين، أصحاب الأراضي، زيت النخيل، صناعة زيت النخيل، إنشاء المزارع، إدارة الأراضي، تطوير الأراضي الزراعية، الإشراف الفني الزراعي، التنمية الريفية، الزراعة المستدامة، مشتل زيت النخيل، إينوسنت كوفي",
    slogan: "نزرع معًا مستقبل الزراعة الإيفوارية",
  },
  es: {
    title: "AgriCapital - El socio ideal de los productores agrícolas en Costa de Marfil",
    description: "AgriCapital ofrece un modelo innovador de apoyo agrícola que permite a los pequeños productores y propietarios de tierras acceder a la industria del aceite de palma sin barreras financieras. Con sede en Daloa, Haut-Sassandra.",
    keywords: "AgriCapital, Costa de Marfil, Daloa, Haut-Sassandra, modelo innovador, innovación agrícola, apoyo agrícola, servicios integrados, salida comercial, garantía de recompra, pequeños productores agrícolas, propietarios de tierras, aceite de palma, industria del aceite de palma, creación de plantaciones, gestión de tierras, desarrollo de tierras agrícolas, supervisión técnica agrícola, desarrollo rural, agricultura sostenible, vivero de palma de aceite, Inocent KOFFI",
    slogan: "Cultivemos juntos el futuro de la agricultura marfileña",
  },
  de: {
    title: "AgriCapital - Der ideale Partner für landwirtschaftliche Produzenten in der Elfenbeinküste",
    description: "AgriCapital bietet ein innovatives landwirtschaftliches Unterstützungsmodell, das Kleinbauern und Landbesitzern den Zugang zur Palmölindustrie ohne finanzielle Barrieren ermöglicht. Mit Sitz in Daloa, Haut-Sassandra.",
    keywords: "AgriCapital, Elfenbeinküste, Daloa, Haut-Sassandra, innovatives Modell, landwirtschaftliche Innovation, landwirtschaftliche Unterstützung, integrierte Dienstleistungen, kommerzieller Absatz, Rückkaufgarantie, kleine landwirtschaftliche Produzenten, Landbesitzer, Palmöl, Palmölindustrie, Plantagen-Erstellung, Landmanagement, landwirtschaftliche Landentwicklung, technische landwirtschaftliche Überwachung, ländliche Entwicklung, nachhaltige Landwirtschaft, Palmöl-Baumschule, Inocent KOFFI",
    slogan: "Gemeinsam die Zukunft der ivorischen Landwirtschaft gestalten",
  },
  zh: {
    title: "农业资本 - 科特迪瓦农业生产者的理想合作伙伴",
    description: "农业资本提供创新的农业支持模式，使小型生产者和土地所有者能够无需金融障碍进入油棕产业。总部位于达洛阿，上萨桑德拉地区。",
    keywords: "农业资本, 科特迪瓦, 达洛阿, 上萨桑德拉, 创新模式, 农业创新, 农业支持, 综合服务, 商业出口, 回购保证, 小型农业生产者, 土地所有者, 油棕, 油棕产业, 种植园创建, 土地管理, 农业土地开发, 农业技术监督, 农村发展, 可持续农业, 油棕苗圃, 伊诺森特·科菲",
    slogan: "共同培育科特迪瓦农业的未来",
  },
};

const localeMap: Record<Language, string> = {
  fr: "fr_FR",
  en: "en_US",
  ar: "ar_SA",
  es: "es_ES",
  de: "de_DE",
  zh: "zh_CN",
};

const languages: Language[] = ["fr", "en", "ar", "es", "de", "zh"];

const SEOHead = ({ title, description, image, type = "website" }: SEOHeadProps) => {
  const { language } = useLanguage();
  const location = useLocation();
  
  useEffect(() => {
    const seo = seoTranslations[language] || seoTranslations.fr;
    const locale = localeMap[language] || "fr_FR";
    const baseUrl = "https://agricapital.ci";
    const finalTitle = title || seo.title;
    const finalDescription = description || seo.description;
    const finalImage = image || `${baseUrl}/og-image.png`;
    
    // Determine the current URL based on the actual path
    // French is the default, so root URL is always French
    const currentPath = location.pathname;
    const currentUrl = currentPath === "/" || currentPath === ""
      ? baseUrl // Root URL = French (default for Côte d'Ivoire)
      : `${baseUrl}${currentPath}`;
    
    // Update document title with slogan
    document.title = `${finalTitle} | ${seo.slogan}`;
    
    // Update or create meta tags
    const updateMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    
    // Update or create link tags
    const updateLink = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang 
        ? `link[rel="${rel}"][hreflang="${hreflang}"]` 
        : `link[rel="${rel}"]:not([hreflang])`;
      let link = document.querySelector(selector) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        if (hreflang) link.hreflang = hreflang;
        document.head.appendChild(link);
      }
      link.href = href;
    };
    
    // Primary meta tags
    updateMeta("title", finalTitle);
    updateMeta("description", finalDescription);
    updateMeta("keywords", seo.keywords);
    
    // Geo and language targeting for Côte d'Ivoire
    updateMeta("geo.region", "CI");
    updateMeta("geo.placename", "Daloa, Haut-Sassandra");
    updateMeta("content-language", language);
    
    // Open Graph - critical for social media sharing
    updateMeta("og:type", type, true);
    updateMeta("og:site_name", "AgriCapital", true);
    updateMeta("og:title", finalTitle, true);
    updateMeta("og:description", finalDescription, true);
    updateMeta("og:url", currentUrl, true);
    updateMeta("og:locale", locale, true);
    updateMeta("og:image", finalImage, true);
    updateMeta("og:image:width", "1200", true);
    updateMeta("og:image:height", "630", true);
    updateMeta("og:image:alt", seo.slogan, true);
    
    // Twitter Card
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:site", "@AgriCapitalCI");
    updateMeta("twitter:title", finalTitle);
    updateMeta("twitter:description", finalDescription);
    updateMeta("twitter:url", currentUrl);
    updateMeta("twitter:image", finalImage);
    updateMeta("twitter:image:alt", seo.slogan);
    
    // Additional locale variants for OG - French first as primary
    const orderedLanguages = ['fr', ...languages.filter(l => l !== 'fr')];
    orderedLanguages.forEach((lang) => {
      if (lang !== language) {
        updateMeta(`og:locale:alternate`, localeMap[lang as Language], true);
      }
    });
    
    // Update canonical - French root URL is the primary
    updateLink("canonical", currentUrl);
    
    // Update hreflang tags dynamically for all languages
    // French is x-default since AgriCapital is based in Côte d'Ivoire
    languages.forEach((lang) => {
      const langUrl = lang === "fr" ? baseUrl : `${baseUrl}/${lang}`;
      updateLink("alternate", langUrl, lang);
    });
    updateLink("alternate", baseUrl, "x-default"); // French as default
    
    // Update html lang and dir attributes
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    
  }, [language, location.pathname, title, description, image, type]);
  
  return null;
};

export default SEOHead;

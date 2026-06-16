import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Language = "fr" | "en" | "ar" | "es" | "de" | "zh";

interface SEOData {
  title: string;
  description: string;
  slogan: string;
  locale: string;
}

const seoTranslations: Record<Language, SEOData> = {
  fr: {
    title: "AgriCapital - Le partenaire idéal des producteurs agricoles en Côte d'Ivoire",
    description: "AgriCapital propose un modèle innovant d'accompagnement agricole permettant aux petits producteurs et propriétaires terriens d'accéder à la filière palmier à huile sans barrière financière.",
    slogan: "Cultivons ensemble l'avenir de l'agriculture ivoirienne",
    locale: "fr_FR",
  },
  en: {
    title: "AgriCapital - The ideal partner for agricultural producers in Côte d'Ivoire",
    description: "AgriCapital offers an innovative agricultural support model enabling small producers and landowners to access the oil palm industry without financial barriers.",
    slogan: "Transforming Ivorian agriculture together",
    locale: "en_US",
  },
  ar: {
    title: "أجري كابيتال - الشريك المثالي للمنتجين الزراعيين في كوت ديفوار",
    description: "تقدم أجري كابيتال نموذجًا مبتكرًا للدعم الزراعي يمكّن صغار المنتجين وأصحاب الأراضي من الوصول إلى صناعة زيت النخيل دون حواجز مالية.",
    slogan: "نزرع معًا مستقبل الزراعة الإيفوارية",
    locale: "ar_SA",
  },
  es: {
    title: "AgriCapital - El socio ideal de los productores agrícolas en Costa de Marfil",
    description: "AgriCapital ofrece un modelo innovador de apoyo agrícola que permite a los pequeños productores y propietarios de tierras acceder a la industria del aceite de palma sin barreras financieras.",
    slogan: "Cultivemos juntos el futuro de la agricultura marfileña",
    locale: "es_ES",
  },
  de: {
    title: "AgriCapital - Der ideale Partner für landwirtschaftliche Produzenten in der Elfenbeinküste",
    description: "AgriCapital bietet ein innovatives landwirtschaftliches Unterstützungsmodell, das Kleinbauern und Landbesitzern den Zugang zur Palmölindustrie ohne finanzielle Barrieren ermöglicht.",
    slogan: "Gemeinsam die Zukunft der ivorischen Landwirtschaft gestalten",
    locale: "de_DE",
  },
  zh: {
    title: "农业资本 - 科特迪瓦农业生产者的理想合作伙伴",
    description: "农业资本提供创新的农业支持模式，使小型生产者和土地所有者能够无需金融障碍进入油棕产业。",
    slogan: "共同培育科特迪瓦农业的未来",
    locale: "zh_CN",
  },
};

const validLanguages: Language[] = ["fr", "en", "ar", "es", "de", "zh"];

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathParam = url.searchParams.get("path") || "/";
  const pathParts = pathParam.split("/").filter(Boolean);

  let lang: Language = "fr";
  if (pathParts.length > 0 && validLanguages.includes(pathParts[0] as Language)) {
    lang = pathParts[0] as Language;
  }

  const contentPath = lang === "fr" ? pathParts : pathParts.slice(1);

  const baseUrl = "https://agricapital.ci";
  const defaultSeo = seoTranslations[lang];
  let ogType = "website";
  let title = defaultSeo.title;
  let description = defaultSeo.description;
  let image = `${baseUrl}/og-image.png`;

  if (contentPath[0] === "actualites" && contentPath[1]) {
    const slug = contentPath[1];
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

      if (supabaseUrl && supabaseAnonKey) {
        const articleResp = await fetch(
          `${supabaseUrl}/rest/v1/news?select=*&slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&limit=1`,
          {
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (articleResp.ok) {
          const rows = await articleResp.json();
          const article = rows?.[0];
          if (article) {
            ogType = "article";
            title = article[`title_${lang}`] || article.title_fr || defaultSeo.title;
            const rawDescription = article[`excerpt_${lang}`] || article.excerpt_fr || defaultSeo.description;
            description = String(rawDescription).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) || defaultSeo.description;
            image = article.featured_image || image;
          }
        }
      }
    } catch (error) {
      console.error("og-meta article lookup failed", error);
    }
  }

  const locale = defaultSeo.locale;
  const currentUrl = `${baseUrl}${pathParam}`;
  const dir = lang === "ar" ? "rtl" : "ltr";

  const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | ${escapeHtml(defaultSeo.slogan)}</title>
  <meta name="title" content="${escapeHtml(title)}">
  <meta name="description" content="${escapeHtml(description)}">

  <meta property="og:type" content="${ogType}">
  <meta property="og:url" content="${escapeHtml(currentUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="${locale}">
  <meta property="og:site_name" content="AgriCapital">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(currentUrl)}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">

  <link rel="canonical" href="${escapeHtml(currentUrl)}">
  <link rel="alternate" hreflang="fr" href="${baseUrl}">
  <link rel="alternate" hreflang="en" href="${baseUrl}/en">
  <link rel="alternate" hreflang="ar" href="${baseUrl}/ar">
  <link rel="alternate" hreflang="es" href="${baseUrl}/es">
  <link rel="alternate" hreflang="de" href="${baseUrl}/de">
  <link rel="alternate" hreflang="zh" href="${baseUrl}/zh">
  <link rel="alternate" hreflang="x-default" href="${baseUrl}">
  <link rel="icon" type="image/png" href="${baseUrl}/favicon.png">
  <meta http-equiv="refresh" content="0; url=${escapeHtml(currentUrl)}">
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(currentUrl)}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
    },
  });
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Multilingual meta data
const metaData: Record<string, { title: string; description: string; keywords: string }> = {
  fr: {
    title: "AgriCapital - Le partenaire idéal des producteurs agricoles",
    description: "Transformez vos terres agricoles avec AgriCapital. Accompagnement complet pour la culture du palmier à huile, garantie de rachat sur 20 ans, sans apport initial.",
    keywords: "agriculture, palmier à huile, investissement agricole, Côte d'Ivoire, AgriCapital, plantation, producteur agricole"
  },
  en: {
    title: "AgriCapital - The ideal partner for agricultural producers",
    description: "Transform your agricultural land with AgriCapital. Complete support for oil palm cultivation, 20-year buyback guarantee, no initial investment required.",
    keywords: "agriculture, oil palm, agricultural investment, Ivory Coast, AgriCapital, plantation, agricultural producer"
  },
  ar: {
    title: "أجريكابيتال - الشريك المثالي للمنتجين الزراعيين",
    description: "حوّل أراضيك الزراعية مع أجريكابيتال. دعم كامل لزراعة نخيل الزيت، ضمان إعادة الشراء لمدة 20 عامًا، بدون استثمار أولي.",
    keywords: "زراعة، نخيل الزيت، استثمار زراعي، ساحل العاج، أجريكابيتال، مزرعة، منتج زراعي"
  },
  es: {
    title: "AgriCapital - El socio ideal de los productores agrícolas",
    description: "Transforme sus tierras agrícolas con AgriCapital. Acompañamiento completo para el cultivo de palma aceitera, garantía de recompra de 20 años, sin inversión inicial.",
    keywords: "agricultura, palma aceitera, inversión agrícola, Costa de Marfil, AgriCapital, plantación, productor agrícola"
  },
  de: {
    title: "AgriCapital - Der ideale Partner für landwirtschaftliche Produzenten",
    description: "Verwandeln Sie Ihr Ackerland mit AgriCapital. Vollständige Unterstützung für den Ölpalmenanbau, 20-Jahres-Rückkaufgarantie, keine Anfangsinvestition erforderlich.",
    keywords: "Landwirtschaft, Ölpalme, landwirtschaftliche Investition, Elfenbeinküste, AgriCapital, Plantage, landwirtschaftlicher Produzent"
  },
  zh: {
    title: "AgriCapital - 农业生产者的理想合作伙伴",
    description: "与AgriCapital一起改变您的农业用地。油棕种植全程支持，20年回购保证，无需初始投资。",
    keywords: "农业，油棕，农业投资，科特迪瓦，AgriCapital，种植园，农业生产者"
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const lang = url.searchParams.get('lang') || 'fr';
    const meta = metaData[lang] || metaData.fr;
    const baseUrl = 'https://www.agricapital.ci';
    const ogImage = `${baseUrl}/og-image.png`;

    // Generate pre-rendered HTML with meta tags
    const html = `<!DOCTYPE html>
<html lang="${lang}" ${lang === 'ar' ? 'dir="rtl"' : ''}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}">
  <meta name="keywords" content="${meta.keywords}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${baseUrl}/${lang}">
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.description}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:locale" content="${lang === 'fr' ? 'fr_FR' : lang === 'en' ? 'en_US' : lang === 'ar' ? 'ar_SA' : lang === 'es' ? 'es_ES' : lang === 'de' ? 'de_DE' : 'zh_CN'}">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${baseUrl}/${lang}">
  <meta name="twitter:title" content="${meta.title}">
  <meta name="twitter:description" content="${meta.description}">
  <meta name="twitter:image" content="${ogImage}">
  
  <!-- Canonical -->
  <link rel="canonical" href="${baseUrl}/${lang}">
  
  <!-- Alternate languages -->
  <link rel="alternate" hreflang="fr" href="${baseUrl}/fr">
  <link rel="alternate" hreflang="en" href="${baseUrl}/en">
  <link rel="alternate" hreflang="ar" href="${baseUrl}/ar">
  <link rel="alternate" hreflang="es" href="${baseUrl}/es">
  <link rel="alternate" hreflang="de" href="${baseUrl}/de">
  <link rel="alternate" hreflang="zh" href="${baseUrl}/zh">
  <link rel="alternate" hreflang="x-default" href="${baseUrl}">
</head>
<body>
  <h1>${meta.title}</h1>
  <p>${meta.description}</p>
  <script>window.location.href = '${baseUrl}/${lang}';</script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Prerender error:', error);
    return new Response(JSON.stringify({ error: 'Prerender failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

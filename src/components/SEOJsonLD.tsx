import { useLanguage } from "@/contexts/LanguageContext";

const SEOJsonLD = () => {
  const { language } = useLanguage();
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://agricapital.ci/#organization",
    "name": "AgriCapital",
    "alternateName": "AGRICAPITAL SARL",
    "url": "https://agricapital.ci",
    "logo": {
      "@type": "ImageObject",
      "url": "https://agricapital.ci/og-image.png",
      "width": 1200,
      "height": 630
    },
    "image": "https://agricapital.ci/og-image.png",
    "description": language === 'fr' 
      ? "AgriCapital accompagne les propriétaires terriens et petits agriculteurs dans la création et le développement de plantations de palmiers à huile en Côte d'Ivoire."
      : "AgriCapital supports landowners and small farmers in creating and developing oil palm plantations in Ivory Coast.",
    "foundingDate": "2025",
    "founder": {
      "@type": "Person",
      "name": "Innocent Koffi"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Gonaté",
      "addressLocality": "Daloa",
      "addressRegion": "Haut-Sassandra",
      "addressCountry": "CI"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 6.8770,
      "longitude": -6.4502
    },
    "areaServed": {
      "@type": "Country",
      "name": "Côte d'Ivoire"
    },
    "sameAs": [
      "https://www.facebook.com/agricapitalci",
      "https://www.linkedin.com/company/agricapital"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["French", "English", "Arabic", "Spanish", "German", "Chinese"]
    },
    "slogan": "Vos Terres Reprennent Vie",
    "knowsAbout": [
      "Palmier à huile",
      "Agriculture durable",
      "Développement rural",
      "Côte d'Ivoire"
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://agricapital.ci/#localbusiness",
    "name": "AgriCapital",
    "image": "https://agricapital.ci/og-image.png",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Gonaté",
      "addressLocality": "Daloa",
      "addressRegion": "Haut-Sassandra",
      "postalCode": "",
      "addressCountry": "CI"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 6.8770,
      "longitude": -6.4502
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "17:00"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://agricapital.ci/#website",
    "url": "https://agricapital.ci",
    "name": "AgriCapital - Plantations de Palmiers à Huile",
    "description": "AgriCapital accompagne les propriétaires terriens en Côte d'Ivoire",
    "publisher": {
      "@id": "https://agricapital.ci/#organization"
    },
    "inLanguage": language,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://agricapital.ci/?s={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": language === 'fr' 
          ? "Qu'est-ce qu'AgriCapital ?" 
          : "What is AgriCapital?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": language === 'fr'
            ? "AgriCapital est une entreprise ivoirienne qui accompagne les propriétaires terriens et petits agriculteurs dans la création et le développement de plantations de palmiers à huile, sans barrières financières."
            : "AgriCapital is an Ivorian company that supports landowners and small farmers in creating and developing oil palm plantations without financial barriers."
        }
      },
      {
        "@type": "Question",
        "name": language === 'fr'
          ? "Où se trouve AgriCapital ?"
          : "Where is AgriCapital located?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": language === 'fr'
            ? "AgriCapital est basé à Gonaté, Daloa, en Côte d'Ivoire."
            : "AgriCapital is based in Gonaté, Daloa, Ivory Coast."
        }
      },
      {
        "@type": "Question",
        "name": language === 'fr'
          ? "Quels services propose AgriCapital ?"
          : "What services does AgriCapital offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": language === 'fr'
            ? "AgriCapital propose un modèle intégré comprenant : plants certifiés, intrants, support technique, formation, suivi régulier et garantie de rachat sur 20 ans."
            : "AgriCapital offers an integrated model including: certified plants, inputs, technical support, training, regular monitoring, and a 20-year buyback guarantee."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
};

export default SEOJsonLD;

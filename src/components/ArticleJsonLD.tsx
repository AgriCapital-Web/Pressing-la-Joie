import { useEffect } from "react";
import { CANONICAL_ORIGIN } from "@/lib/canonical-host";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

interface ArticleJsonLDProps {
  /** "NewsArticle" pour les actualités, "Article" pour les pages éditoriales */
  type?: "NewsArticle" | "Article";
  headline: string;
  description?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  path: string;
  breadcrumbs?: BreadcrumbItem[];
  section?: string;
  keywords?: string[];
}

const SCRIPT_ID = "agricapital-article-jsonld";

/**
 * Injecte les données structurées JSON-LD (Article/NewsArticle + BreadcrumbList)
 * dans le <head>, toujours ancrées sur le domaine canonique agricapital.ci.
 */
const ArticleJsonLD = ({
  type = "Article",
  headline,
  description,
  image,
  datePublished,
  dateModified,
  path,
  breadcrumbs = [],
  section,
  keywords,
}: ArticleJsonLDProps) => {
  useEffect(() => {
    const absolute = (p: string) =>
      p?.startsWith("http") ? p : `${CANONICAL_ORIGIN}${p?.startsWith("/") ? p : `/${p}`}`;

    const articleSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": type,
      headline: headline?.slice(0, 110),
      description,
      inLanguage: "fr-CI",
      mainEntityOfPage: { "@type": "WebPage", "@id": absolute(path) },
      url: absolute(path),
      image: image ? [absolute(image)] : undefined,
      datePublished,
      dateModified: dateModified || datePublished,
      articleSection: section,
      keywords: keywords?.join(", "),
      author: { "@type": "Organization", name: "AgriCapital", url: CANONICAL_ORIGIN },
      publisher: {
        "@type": "Organization",
        name: "AgriCapital",
        url: CANONICAL_ORIGIN,
        logo: { "@type": "ImageObject", url: `${CANONICAL_ORIGIN}/og-image.png` },
      },
    };

    const crumbs = [{ name: "Accueil", path: "/" }, ...breadcrumbs];
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: absolute(c.path),
      })),
    };

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify([articleSchema, breadcrumbSchema]);

    return () => {
      document.getElementById(SCRIPT_ID)?.remove();
    };
  }, [type, headline, description, image, datePublished, dateModified, path, section, JSON.stringify(breadcrumbs), JSON.stringify(keywords)]);

  return null;
};

export default ArticleJsonLD;

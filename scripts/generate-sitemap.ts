/**
 * Génère public/sitemap.xml avant `vite dev` et `vite build`.
 * Domaine canonique unique : agricapital.ci (jamais les miroirs lovable/vercel).
 */
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://agricapital.ci";
const LOCALES = ["fr", "en", "ar", "es", "de", "zh"] as const;

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  alternates?: boolean;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0", alternates: true },
  { path: "/solutions", changefreq: "monthly", priority: "0.9", alternates: true },
  { path: "/evolution", changefreq: "weekly", priority: "0.9", alternates: true },
  { path: "/actualites", changefreq: "daily", priority: "0.9", alternates: true },
  { path: "/temoignages", changefreq: "monthly", priority: "0.7" },
  { path: "/partenariats", changefreq: "monthly", priority: "0.7" },
  { path: "/partnership-request", changefreq: "monthly", priority: "0.6" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/liste-attente", changefreq: "monthly", priority: "0.8" },
  { path: "/dataroom", changefreq: "monthly", priority: "0.6" },
];

async function fetchDynamicEntries(): Promise<SitemapEntry[]> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/news?select=slug&is_published=eq.true&limit=1000`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return [];
    const rows = (await res.json()) as { slug: string | null }[];
    return rows
      .filter((r) => !!r.slug)
      .map((r) => ({ path: `/actualites/${r.slug}`, changefreq: "monthly" as const, priority: "0.8" }));
  } catch {
    return [];
  }
}

function renderUrl(e: SitemapEntry) {
  const lines = [`  <url>`, `    <loc>${BASE_URL}${e.path === "/" ? "" : e.path}</loc>`];
  if (e.alternates) {
    for (const l of LOCALES) {
      lines.push(`    <xhtml:link rel="alternate" hreflang="${l}" href="${BASE_URL}${e.path === "/" ? "" : e.path}?lang=${l}"/>`);
    }
    lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${e.path === "/" ? "" : e.path}"/>`);
  }
  if (e.changefreq) lines.push(`    <changefreq>${e.changefreq}</changefreq>`);
  if (e.priority) lines.push(`    <priority>${e.priority}</priority>`);
  lines.push(`  </url>`);
  return lines.join("\n");
}

const dynamicEntries = await fetchDynamicEntries();
const entries = [...staticEntries, ...dynamicEntries];

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
  ...entries.map(renderUrl),
  `</urlset>`,
].join("\n");

writeFileSync(resolve("public/sitemap.xml"), xml);
console.log(`sitemap.xml written (${entries.length} entries)`);

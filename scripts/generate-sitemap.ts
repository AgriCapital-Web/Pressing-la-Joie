// Génère public/sitemap.xml à partir des routes publiques connues.
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE_URL = "https://www.agricapital.ci";

const routes = [
  "/",
  "/solutions",
  "/partenariats",
  "/actualites",
  "/faq",
  "/evolution",
  "/temoignages",
  "/tresor-foncier",
  "/tresor-palmier",
  "/souscrire",
  "/dataroom",
];

const today = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) =>
      `  <url>\n    <loc>${BASE_URL}${r}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${r === "/" ? "1.0" : "0.7"}</priority>\n  </url>`,
  )
  .join("\n")}
</urlset>
`;

const outDir = resolve(process.cwd(), "public");
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "sitemap.xml"), xml, "utf8");
console.log(`sitemap.xml généré (${routes.length} URLs)`);
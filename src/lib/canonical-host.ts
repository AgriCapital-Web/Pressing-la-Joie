/**
 * Canonical host enforcement.
 *
 * The site must only ever be indexed under agricapital.ci.
 * Any preview / staging host (lovable.app, vercel.app, localhost) is marked
 * `noindex, nofollow` at runtime and every canonical/hreflang/OG URL still
 * points to the production domain (see SEOHead + index.html).
 */

export const CANONICAL_ORIGIN = "https://agricapital.ci";

const NON_CANONICAL_HOST_PATTERNS = [
  /lovable\.app$/i,
  /lovableproject\.com$/i,
  /vercel\.app$/i,
  /netlify\.app$/i,
  /localhost$/i,
  /^127\./,
];

export function isCanonicalHost(host = window.location.hostname): boolean {
  return /(^|\.)agricapital\.ci$/i.test(host);
}

export function enforceCanonicalHost() {
  if (typeof window === "undefined") return;
  const host = window.location.hostname;
  const isPreview = NON_CANONICAL_HOST_PATTERNS.some((re) => re.test(host));

  if (!isPreview && isCanonicalHost(host)) return;

  // Block indexation of every non-canonical host so search engines never
  // surface the *.lovable.app / *.vercel.app mirrors.
  let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
  if (!robots) {
    robots = document.createElement("meta");
    robots.name = "robots";
    document.head.appendChild(robots);
  }
  robots.content = "noindex, nofollow, noarchive";

  let googlebot = document.querySelector('meta[name="googlebot"]') as HTMLMetaElement | null;
  if (!googlebot) {
    googlebot = document.createElement("meta");
    googlebot.name = "googlebot";
    document.head.appendChild(googlebot);
  }
  googlebot.content = "noindex, nofollow";
}

/** True when the app is served from the Data Room subdomain (data.agricapital.ci). */
export function isDataroomHost(host = window.location.hostname): boolean {
  return /^data\./i.test(host) || /^dataroom\./i.test(host);
}

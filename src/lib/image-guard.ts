/**
 * Global runtime guard against broken / 404 images in production.
 *
 * - Listens to image load errors at the document level (capture phase).
 * - Tries a sensible fallback chain (.webp -> .jpg -> .png -> /placeholder.svg).
 * - Never loops: each element is only retried a limited number of times.
 * - Reports every definitive failure to the backend (broken_image_logs) so the
 *   admin dashboard can list and track 404 images seen in production.
 */

import { supabase } from "@/integrations/supabase/client";

const FALLBACK = "/placeholder.svg";
const RETRIED = new WeakMap<HTMLImageElement, number>();

const broken = new Set<string>();
const reported = new Set<string>();

function nextCandidate(src: string, attempt: number): string | null {
  const clean = src.split("?")[0];
  const ext = clean.slice(clean.lastIndexOf("."));
  const base = clean.slice(0, clean.lastIndexOf("."));
  const chain: Record<string, string[]> = {
    ".webp": [".jpg", ".jpeg", ".png"],
    ".avif": [".webp", ".jpg", ".png"],
    ".jpg": [".webp", ".jpeg", ".png"],
    ".jpeg": [".jpg", ".webp", ".png"],
    ".png": [".webp", ".jpg"],
  };
  const alternatives = chain[ext.toLowerCase()];
  if (!alternatives || attempt >= alternatives.length) return null;
  return `${base}${alternatives[attempt]}`;
}

function report(imageUrl: string) {
  if (reported.has(imageUrl)) return;
  reported.add(imageUrl);
  void supabase.rpc("report_broken_image", {
    _image_url: imageUrl.slice(0, 2048),
    _page_url: window.location.href.slice(0, 2048),
    _user_agent: navigator.userAgent.slice(0, 512),
  });
}

export function installImageGuard() {
  if (typeof window === "undefined") return;
  if ((window as any).__imageGuardInstalled) return;
  (window as any).__imageGuardInstalled = true;
  (window as any).__brokenImages = broken;

  document.addEventListener(
    "error",
    (event) => {
      const el = event.target as HTMLElement | null;
      if (!el || el.tagName !== "IMG") return;
      const img = el as HTMLImageElement;
      const current = img.currentSrc || img.src;
      if (!current || current.endsWith(FALLBACK)) return;

      const attempt = RETRIED.get(img) ?? 0;
      RETRIED.set(img, attempt + 1);

      // Drop <picture> sources that also fail so the fallback actually applies.
      const picture = img.closest("picture");
      if (picture) picture.querySelectorAll("source").forEach((s) => s.remove());

      const candidate = attempt < 3 ? nextCandidate(current, attempt) : null;
      if (candidate) {
        img.src = candidate;
        return;
      }

      broken.add(current);
      report(current);
      img.src = FALLBACK;
      img.classList.add("img-fallback");
      if (import.meta.env.DEV) {
        console.warn("[image-guard] broken image replaced:", current);
      }
    },
    true,
  );
}

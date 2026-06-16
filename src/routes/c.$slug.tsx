import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useProfileBySlug, useApp } from "@/lib/mock/store";
import { BusinessCard } from "@/components/flex/BusinessCard";
import { Logo } from "@/components/flex/Logo";
import { Download, Save, Share2, ImagePlus, Megaphone, Newspaper } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/c/$slug")({
  
  ssr: false,head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — FlexCard` },
      { name: "description", content: "Carte de visite numérique FlexCard." },
      { property: "og:title", content: `${params.slug} sur FlexCard` },
      { property: "og:description", content: "Une carte. Mille connexions." },
    ],
  }),
  component: PublicCardPage,
});

function PublicCardPage() {
  const { slug } = Route.useParams();
  const profile = useProfileBySlug(slug);
  const recordScan = useApp((s) => s.recordScan);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkPhone, setLinkPhone] = useState("");
  const [linkName, setLinkName] = useState("");

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <Logo className="h-10 mb-6" />
        <h1 className="text-2xl font-bold">Profil introuvable</h1>
        <p className="text-muted-foreground mt-2">Le slug « {slug} » n'existe pas.</p>
        <Link to="/" className="mt-6 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow">Accueil</Link>
      </div>
    );
  }

  const photos = profile.gallery.filter((g) => g.category === "photos");
  const affiches = profile.gallery.filter((g) => g.category === "affiches");
  const visuels = profile.gallery.filter((g) => g.category === "visuels");
  const videos = profile.gallery.filter((g) => g.category === "videos");
  const news = profile.gallery.filter((g) => g.category === "actualites");

  return (
    <div className="min-h-screen bg-gradient-mesh pb-16">
      <header className="sticky top-0 z-30 glass border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/"><Logo className="h-7" /></Link>
          <button
            onClick={() => setLinkOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-xs font-semibold text-white shadow-glow"
          >
            <Save className="h-3.5 w-3.5" /> Enregistrer
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {profile.coverUrl && (
          <div className="h-44 w-full overflow-hidden rounded-3xl bg-secondary">
            <img src={profile.coverUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <BusinessCard profile={profile} variant="full" />

        {photos.length > 0 && <GallerySection title="Photos" icon={<ImagePlus className="h-4 w-4" />} items={photos} />}
        {affiches.length > 0 && <GallerySection title="Affiches" icon={<Megaphone className="h-4 w-4" />} items={affiches} />}
        {visuels.length > 0 && <GallerySection title="Visuels" icon={<ImagePlus className="h-4 w-4" />} items={visuels} />}
        {videos.length > 0 && <GallerySection title="Vidéos" icon={<ImagePlus className="h-4 w-4" />} items={videos} />}

        {news.length > 0 && (
          <section className="surface-elevated p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Newspaper className="h-4 w-4" /> Actualités
            </h3>
            <ul className="mt-4 space-y-3">
              {news.map((n) => (
                <li key={n.id} className="rounded-xl bg-secondary/60 p-3 text-sm">{n.text}</li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex items-center justify-center gap-3 pt-4 text-xs text-muted-foreground">
          <Share2 className="h-3.5 w-3.5" /> Carte synchronisée en temps réel via FlexCard
        </div>
      </div>

      {linkOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setLinkOpen(false)}>
          <div className="w-full max-w-md surface-elevated p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Enregistrer ce contact</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Pour la démo, indique ton numéro afin de créer le lien d'annuaire.
            </p>
            <div className="mt-5 space-y-3">
              <input
                value={linkName} onChange={(e) => setLinkName(e.target.value)}
                placeholder="Ton nom (optionnel)"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-brand"
              />
              <input
                value={linkPhone} onChange={(e) => setLinkPhone(e.target.value)}
                placeholder="+225 07 12 34 56 78"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-brand"
              />
              <button
                onClick={() => {
                  if (linkPhone.length < 6) return;
                  recordScan(profile.id, linkPhone, linkName || undefined);
                  alert("Contact enregistré ! Tu apparais maintenant dans son annuaire de prospects.");
                  setLinkOpen(false);
                }}
                className="w-full rounded-xl bg-gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-glow"
              >
                Enregistrer dans mon téléphone
              </button>
              <p className="text-[11px] text-muted-foreground">
                Sur l'app réelle, FlexCard utilisera l'API Contacts du téléphone et créera le lien automatiquement.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GallerySection({ title, icon, items }: { title: string; icon: React.ReactNode; items: { id: string; url?: string; caption?: string }[] }) {
  return (
    <section className="surface-elevated p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {title}
      </h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((g) => (
          <div key={g.id} className="aspect-square overflow-hidden rounded-xl bg-secondary">
            {g.url ? <img src={g.url} alt={g.caption || ""} className="h-full w-full object-cover" /> : <div className="h-full w-full grid place-items-center text-xs text-muted-foreground">visuel</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

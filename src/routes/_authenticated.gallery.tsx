import { createFileRoute } from "@tanstack/react-router";
import { useApp, useCurrentProfile } from "@/lib/mock/store";
import { useState } from "react";
import { Plus, Trash2, Image as ImageIcon, Megaphone, PaintBucket, Video, Newspaper } from "lucide-react";
import type { GalleryItem } from "@/lib/mock/types";

const CATS = [
  { id: "photos", label: "Photos", icon: ImageIcon, freeMax: 2 },
  { id: "affiches", label: "Affiches", icon: Megaphone, freeMax: 1 },
  { id: "visuels", label: "Visuels", icon: PaintBucket, freeMax: 1 },
  { id: "videos", label: "Vidéos", icon: Video, freeMax: 0 },
  { id: "actualites", label: "Actualités", icon: Newspaper, freeMax: 1 },
] as const;

export const Route = createFileRoute("/_authenticated/gallery")({ 
  ssr: false,component: GalleryPage });

function GalleryPage() {
  const me = useCurrentProfile()!;
  const update = useApp((s) => s.updateCurrent);
  const [tab, setTab] = useState<typeof CATS[number]["id"]>("photos");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  const cat = CATS.find((c) => c.id === tab)!;
  const items = me.gallery.filter((g) => g.category === tab);

  const add = () => {
    if (items.length >= cat.freeMax) {
      alert(`Compte gratuit : ${cat.freeMax} ${cat.label.toLowerCase()} max. Passe à la galerie étendue.`);
      return;
    }
    const newItem: GalleryItem = {
      id: `g${Date.now()}`,
      category: tab,
      url: tab === "actualites" ? undefined : url || undefined,
      text: tab === "actualites" ? text.slice(0, 280) : undefined,
      createdAt: Date.now(),
    };
    update({ gallery: [...me.gallery, newItem] });
    setUrl(""); setText("");
  };

  const remove = (id: string) => update({ gallery: me.gallery.filter((g) => g.id !== id) });

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Galerie</h1>
        <p className="mt-1 text-sm text-muted-foreground">5 catégories de contenu pour enrichir ta carte.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {CATS.map((c) => {
          const Icon = c.icon;
          const active = tab === c.id;
          const n = me.gallery.filter((g) => g.category === c.id).length;
          return (
            <button key={c.id} onClick={() => setTab(c.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                active ? "bg-gradient-brand text-white shadow-glow" : "bg-card border border-border hover:bg-secondary"
              }`}
            >
              <Icon className="h-4 w-4" /> {c.label}
              <span className="text-xs opacity-70">({n}/{c.freeMax === 0 ? "🔒" : c.freeMax})</span>
            </button>
          );
        })}
      </div>

      <div className="surface-elevated p-6">
        {cat.freeMax === 0 ? (
          <div className="text-center py-8">
            <p className="font-semibold">Vidéos indisponibles en gratuit</p>
            <p className="mt-1 text-sm text-muted-foreground">Passe à la galerie étendue pour 1 000 F / an.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row">
              {tab === "actualites" ? (
                <textarea
                  value={text} onChange={(e) => setText(e.target.value.slice(0, 280))}
                  placeholder="Ton actualité (280 caractères max)"
                  rows={2}
                  className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-brand"
                />
              ) : (
                <input
                  value={url} onChange={(e) => setUrl(e.target.value)}
                  placeholder="URL de l'image (https://…)"
                  className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-brand"
                />
              )}
              <button onClick={add} disabled={items.length >= cat.freeMax}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-50">
                <Plus className="h-4 w-4" /> Ajouter
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Limite gratuite : {cat.freeMax} {cat.label.toLowerCase()}.</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {items.map((g) => (
                <div key={g.id} className="group relative overflow-hidden rounded-2xl border border-border bg-secondary">
                  {g.url ? (
                    <img src={g.url} alt="" className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="aspect-square p-4 text-sm">{g.text}</div>
                  )}
                  <button onClick={() => remove(g.id)}
                    className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {items.length === 0 && <div className="col-span-full text-center text-sm text-muted-foreground py-8">Aucun élément.</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

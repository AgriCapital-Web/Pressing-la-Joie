import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Image as ImageIcon, Video, Presentation, Link2, LogOut, ShieldCheck, Loader2, ExternalLink } from "lucide-react";

type Signatory = { id: string; full_name: string; email: string; profile_type: string; access_level?: string };
type Publication = {
  id: string; type: string; title: string; description: string | null;
  category: string | null; cover_url: string | null; preview_url: string | null;
  inline_url: string | null; platform_login: string | null; platform_password: string | null;
  visibility: string; views_count: number; created_at: string;
};

const typeIcon: Record<string, any> = {
  document: FileText, photo: ImageIcon, image: ImageIcon, video: Video, presentation: Presentation, platform: Link2,
};

const FILTERS: [string, string][] = [
  ["all", "Tout"], ["document", "Documents"], ["image", "Photos"],
  ["video", "Vidéos"], ["presentation", "Présentations"], ["platform", "Plateformes"],
];

export default function DataroomVault() {
  const navigate = useNavigate();
  const [signatory, setSignatory] = useState<Signatory | null>(null);
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Publication | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("dataroom_signatory");
    if (!raw) { navigate("/dataroom", { replace: true }); return; }
    const s: Signatory = JSON.parse(raw);
    setSignatory(s);
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("dataroom-list", {
        body: { signatory_id: s.id, email: s.email },
      });
      if (error || (data as any)?.error) {
        setError((data as any)?.error ?? "Impossible de charger les publications.");
      } else {
        setPubs(((data as any).publications ?? []) as Publication[]);
        if ((data as any).signatory) {
          const merged = { ...s, ...(data as any).signatory };
          setSignatory(merged);
          localStorage.setItem("dataroom_signatory", JSON.stringify(merged));
        }
      }
      setLoading(false);
    })();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("dataroom_signatory");
    navigate("/dataroom");
  };

  const open = async (p: Publication) => {
    setActive(p);
    if (signatory) {
      supabase.functions.invoke("dataroom-list", {
        body: { signatory_id: signatory.id, action: "view", publication_id: p.id },
      });
    }
  };

  const filtered = filter === "all"
    ? pubs
    : pubs.filter((p) => p.type === filter || (filter === "image" && p.type === "photo"));

  return (
    <div className="min-h-screen bg-background relative">
      <Helmet><title>AgriCapital Cloud — Portail</title></Helmet>
      {/* Watermark */}
      {signatory && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-40 select-none overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06] flex flex-wrap gap-16 rotate-[-25deg] text-primary font-bold text-xl p-16">
            {Array.from({ length: 60 }).map((_, i) => (
              <span key={i}>AgriCapital · {signatory.email}</span>
            ))}
          </div>
        </div>
      )}

      <header className="border-b bg-card sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <div>
              <div className="font-bold text-sm">AgriCapital Cloud</div>
              <div className="text-xs text-muted-foreground">
                {signatory?.full_name} · {signatory?.email}
                {signatory?.access_level && <span className="ml-2 uppercase font-semibold text-primary">{signatory.access_level}</span>}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}><LogOut className="w-4 h-4 mr-2" />Quitter</Button>
        </div>
      </header>

      <main
        className="container mx-auto px-4 py-8 select-none"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 px-4 py-3 text-xs flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            <strong>Consultation en ligne uniquement.</strong> Le téléchargement des documents est
            désactivé. Un lien de téléchargement sécurisé et expirant peut vous être transmis par
            AgriCapital sur demande, selon votre niveau de permission.
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filter === k ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}>
              {l}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Chargement de vos documents…
          </div>
        ) : error ? (
          <div className="text-center py-16 text-destructive text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            Aucune publication disponible pour votre niveau d'accès.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => {
              const Icon = typeIcon[p.type] ?? FileText;
              return (
                <Card key={p.id} onClick={() => open(p)} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative">
                    {p.preview_url ? (
                      <img src={p.preview_url} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Icon className="w-12 h-12 text-primary/60" />
                    )}
                    <span className="absolute top-2 left-2 text-[10px] uppercase font-bold bg-primary/90 text-primary-foreground px-2 py-0.5 rounded">
                      {p.type}
                    </span>
                    <span className="absolute top-2 right-2 text-[10px] uppercase font-bold bg-accent/90 text-white px-2 py-0.5 rounded">
                      {p.visibility}
                    </span>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm mb-1 line-clamp-2">{p.title}</h3>
                    {p.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{p.description}</p>}
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{p.category ?? "—"}</span>
                      <span>{p.views_count} vues</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader><DialogTitle className="text-base">{active?.title}</DialogTitle></DialogHeader>
          {active?.description && <p className="text-xs text-muted-foreground">{active.description}</p>}
          {active?.type === "platform" ? (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">Plateforme AgriCapital accessible en ligne.</p>
              {active.platform_login && (
                <div className="rounded-md border p-3 text-xs">
                  <div><strong>Identifiant :</strong> {active.platform_login}</div>
                  {active.platform_password && <div><strong>Mot de passe :</strong> {active.platform_password}</div>}
                </div>
              )}
              {active.inline_url && (
                <a href={active.inline_url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm"><ExternalLink className="w-4 h-4 mr-2" />Ouvrir la plateforme</Button>
                </a>
              )}
            </div>
          ) : active?.inline_url ? (
            /\.(png|jpe?g|webp|gif)$/i.test(active.inline_url.split("?")[0]) ? (
              <img src={active.inline_url} alt={active.title} className="w-full rounded-md" />
            ) : /\.(mp4|webm)$/i.test(active.inline_url.split("?")[0]) ? (
              <video src={active.inline_url} controls controlsList="nodownload" className="w-full rounded-md" />
            ) : (
              <iframe
                title={active.title}
                src={`${active.inline_url}#toolbar=0&navpanes=0`}
                className="w-full h-[70vh] rounded-md border"
              />
            )
          ) : (
            <p className="text-sm text-muted-foreground">Aucun aperçu disponible pour ce document.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

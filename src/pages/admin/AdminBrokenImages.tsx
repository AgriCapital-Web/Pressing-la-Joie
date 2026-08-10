import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ImageOff, RefreshCw, CheckCircle2, Trash2, ExternalLink } from "lucide-react";

interface BrokenImage {
  id: string;
  image_url: string;
  page_url: string | null;
  status: string;
  hits: number;
  first_seen_at: string;
  last_seen_at: string;
}

const AdminBrokenImages = () => {
  const [rows, setRows] = useState<BrokenImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("broken_image_logs")
      .select("*")
      .order("last_seen_at", { ascending: false });
    if (error) toast({ title: "Erreur de chargement", description: error.message, variant: "destructive" });
    setRows((data as BrokenImage[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const markFixed = async (id: string) => {
    const { error } = await supabase.from("broken_image_logs").update({ status: "fixed" }).eq("id", id);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    toast({ title: "Image marquée comme corrigée" });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("broken_image_logs").delete().eq("id", id);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    load();
  };

  const filtered = rows.filter(
    (r) =>
      r.image_url.toLowerCase().includes(search.toLowerCase()) ||
      (r.page_url || "").toLowerCase().includes(search.toLowerCase()),
  );
  const open = rows.filter((r) => r.status === "open");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ImageOff className="w-6 h-6 text-primary" /> Images cassées (production)
            </h1>
            <p className="text-sm text-muted-foreground">
              Détection automatique des images 404 rencontrées par les visiteurs.
            </p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Actualiser
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">À corriger</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-destructive">{open.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total détecté</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{rows.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Occurrences</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {rows.reduce((sum, r) => sum + r.hits, 0)}
            </CardContent>
          </Card>
        </div>

        <Input
          placeholder="Rechercher une image ou une page…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {filtered.length === 0 && (
              <p className="p-6 text-sm text-muted-foreground text-center">
                {loading ? "Chargement…" : "Aucune image cassée détectée. 🎉"}
              </p>
            )}
            {filtered.map((r) => (
              <div key={r.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm truncate">{r.image_url}</p>
                  {r.page_url && (
                    <a
                      href={r.page_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 truncate"
                    >
                      {r.page_url} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {r.hits} occurrence(s) · dernière : {new Date(r.last_seen_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                <Badge variant={r.status === "open" ? "destructive" : "outline"}>
                  {r.status === "open" ? "À corriger" : "Corrigée"}
                </Badge>
                <div className="flex gap-2">
                  {r.status === "open" && (
                    <Button size="sm" variant="outline" onClick={() => markFixed(r.id)}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Corrigée
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminBrokenImages;

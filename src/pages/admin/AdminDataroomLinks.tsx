import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Link2, Ban, Copy, RefreshCw, Loader2 } from "lucide-react";

type LinkRow = {
  id: string; publication_id: string; email: string | null; visibility_scope: string;
  expires_at: string; max_uses: number; used_count: number; revoked: boolean;
  last_used_at: string | null; created_at: string;
  dataroom_publications?: { title: string } | null;
};

export default function AdminDataroomLinks() {
  const [rows, setRows] = useState<LinkRow[]>([]);
  const [pubs, setPubs] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ publication_id: "", email: "", expires_in_hours: 24, max_uses: 1 });

  const load = async () => {
    setLoading(true);
    const [{ data: links }, { data: publications }] = await Promise.all([
      supabase.from("dataroom_download_links")
        .select("*, dataroom_publications(title)")
        .order("created_at", { ascending: false }).limit(200),
      supabase.from("dataroom_publications").select("id, title").order("title"),
    ]);
    setRows((links ?? []) as any);
    setPubs((publications ?? []) as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.publication_id) { toast.error("Sélectionnez un document"); return; }
    setCreating(true);
    const { data, error } = await supabase.functions.invoke("dataroom-download-link", {
      body: { action: "create", ...form, email: form.email || null },
    });
    setCreating(false);
    if (error || (data as any)?.error) { toast.error((data as any)?.error ?? error?.message); return; }
    await navigator.clipboard.writeText((data as any).download_url).catch(() => {});
    toast.success("Lien créé et copié dans le presse-papiers");
    load();
  };

  const revoke = async (id: string) => {
    const { error } = await supabase.from("dataroom_download_links").update({ revoked: true }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Lien révoqué"); load(); }
  };

  const status = (r: LinkRow) => {
    if (r.revoked) return <Badge variant="destructive">Révoqué</Badge>;
    if (new Date(r.expires_at).getTime() < Date.now()) return <Badge variant="secondary">Expiré</Badge>;
    if (r.used_count >= r.max_uses) return <Badge variant="secondary">Épuisé</Badge>;
    return <Badge className="bg-emerald-600">Actif</Badge>;
  };

  return (
    <AdminLayout>
      <Helmet><title>Liens de téléchargement — Admin AgriCapital</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Link2 className="w-6 h-6 text-primary" />Liens de téléchargement sécurisés</h1>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-2" />Actualiser</Button>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Générer un lien</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-5 items-end">
            <div className="md:col-span-2">
              <Label className="text-xs">Document</Label>
              <Select value={form.publication_id} onValueChange={(v) => setForm({ ...form, publication_id: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir un document" /></SelectTrigger>
                <SelectContent>
                  {pubs.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">E-mail destinataire</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="optionnel" />
            </div>
            <div>
              <Label className="text-xs">Durée (heures)</Label>
              <Input type="number" min={1} max={720} value={form.expires_in_hours}
                onChange={(e) => setForm({ ...form, expires_in_hours: Number(e.target.value) })} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">Usages</Label>
                <Input type="number" min={1} max={20} value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })} />
              </div>
              <Button onClick={create} disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Liens émis ({rows.length})</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {loading ? (
              <div className="py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
            ) : (
              <table className="w-full text-xs">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="py-2">Document</th><th>Destinataire</th><th>Niveau</th>
                    <th>Expire le</th><th>Usages</th><th>Statut</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-medium">{r.dataroom_publications?.title ?? "—"}</td>
                      <td className="pr-3">{r.email ?? "—"}</td>
                      <td className="pr-3 uppercase">{r.visibility_scope}</td>
                      <td className="pr-3">{new Date(r.expires_at).toLocaleString("fr-FR")}</td>
                      <td className="pr-3">{r.used_count}/{r.max_uses}</td>
                      <td className="pr-3">{status(r)}</td>
                      <td>
                        {!r.revoked && (
                          <Button variant="ghost" size="sm" onClick={() => revoke(r.id)}>
                            <Ban className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Aucun lien généré.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

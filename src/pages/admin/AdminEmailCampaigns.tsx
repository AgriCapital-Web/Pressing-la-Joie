import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Mail, Plus, Save, Eye, Trash2, Send, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Campaign = {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  audience_type: "all" | "investors" | "partners" | "clients" | "subscribers";
  status: "draft" | "ready" | "sent" | "archived";
  provider: string;
  brevo_campaign_id: string | null;
  created_at: string;
  updated_at: string;
};

const emptyForm: Omit<Campaign, "id" | "created_at" | "updated_at" | "brevo_campaign_id" | "provider"> = {
  name: "",
  subject: "",
  html_content: "",
  audience_type: "all",
  status: "draft",
};

const AdminEmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [brevoConfigured, setBrevoConfigured] = useState<boolean>(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const { data, error } = await (supabase as any)
      .from("email_campaigns")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      toast.error("Erreur de chargement des campagnes");
    } else {
      setCampaigns((data || []) as Campaign[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
    // L'API Brevo sera connectée plus tard via la fonction edge — on signale juste l'état
    setBrevoConfigured(false);
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowPreview(false);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.subject.trim()) {
      toast.error("Nom et objet requis");
      return;
    }
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload: any = {
        name: form.name.trim(),
        subject: form.subject.trim(),
        html_content: form.html_content,
        audience_type: form.audience_type,
        status: form.status,
        provider: "brevo",
        updated_by: user?.id ?? null,
      };
      if (editingId) {
        const { error } = await (supabase as any)
          .from("email_campaigns")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Campagne mise à jour");
      } else {
        payload.created_by = user?.id ?? null;
        const { error } = await (supabase as any).from("email_campaigns").insert(payload);
        if (error) throw error;
        toast.success("Brouillon enregistré");
      }
      resetForm();
      fetchCampaigns();
    } catch (err: any) {
      toast.error(err?.message || "Erreur d'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (c: Campaign) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      subject: c.subject,
      html_content: c.html_content || "",
      audience_type: c.audience_type,
      status: c.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette campagne ?")) return;
    const { error } = await (supabase as any).from("email_campaigns").delete().eq("id", id);
    if (error) toast.error("Suppression impossible");
    else {
      toast.success("Campagne supprimée");
      fetchCampaigns();
    }
  };

  return (
    <AdminLayout title="Campagnes Email (Brevo)">
      <div className="space-y-6">
        {/* Brevo banner */}
        <Card className="border-amber-300/40 bg-amber-50/40 dark:bg-amber-900/10">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">
                Environnement Brevo prêt — clé API à connecter plus tard
              </p>
              <p className="text-muted-foreground">
                Vous pouvez dès maintenant composer, enregistrer et organiser vos campagnes. La
                connexion à Brevo (envoi réel) sera activée lorsque la clé API Brevo
                (<code className="text-xs">BREVO_API_KEY</code>) sera renseignée côté backend.
              </p>
              {brevoConfigured && <Badge className="mt-2 bg-emerald-600">Brevo connecté</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* Composer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5" />
              {editingId ? "Modifier la campagne" : "Nouvelle campagne"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nom interne</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Lancement pépinière — juin"
                />
              </div>
              <div>
                <Label>Audience</Label>
                <Select
                  value={form.audience_type}
                  onValueChange={(v) => setForm((f) => ({ ...f, audience_type: v as Campaign["audience_type"] }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les contacts</SelectItem>
                    <SelectItem value="investors">Investisseurs</SelectItem>
                    <SelectItem value="partners">Partenaires</SelectItem>
                    <SelectItem value="clients">Clients & planteurs</SelectItem>
                    <SelectItem value="subscribers">Abonnés newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Objet de l'email</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="Ex: AgriCapital — Lancement officiel de notre nouvelle pépinière"
              />
            </div>
            <div>
              <Label>Contenu HTML</Label>
              <Textarea
                value={form.html_content}
                onChange={(e) => setForm((f) => ({ ...f, html_content: e.target.value }))}
                placeholder="<h1>Bonjour</h1><p>Votre message...</p>"
                className="min-h-[220px] font-mono text-xs"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Campaign["status"] }))}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="ready">Prête à envoyer</SelectItem>
                  <SelectItem value="archived">Archivée</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? "Mettre à jour" : "Enregistrer"}
              </Button>
              <Button variant="outline" onClick={() => setShowPreview((v) => !v)} className="gap-2">
                <Eye className="w-4 h-4" />
                {showPreview ? "Masquer" : "Aperçu"}
              </Button>
              {editingId && (
                <Button variant="ghost" onClick={resetForm} className="gap-2">
                  <Plus className="w-4 h-4" /> Nouvelle
                </Button>
              )}
              <Button
                variant="secondary"
                className="gap-2 ml-auto"
                disabled={!brevoConfigured}
                title={brevoConfigured ? "Envoyer via Brevo" : "Brevo non connecté"}
              >
                <Send className="w-4 h-4" /> Envoyer (Brevo)
              </Button>
            </div>

            {showPreview && (
              <div className="border rounded-lg p-4 bg-card">
                <p className="text-xs text-muted-foreground mb-2">Aperçu HTML</p>
                <div className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: form.html_content || "<p>Aucun contenu</p>" }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Campagnes enregistrées</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : campaigns.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">Aucune campagne enregistrée</p>
            ) : (
              <ul className="divide-y divide-border">
                {campaigns.map((c) => (
                  <li key={c.id} className="py-3 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.subject}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{c.audience_type}</Badge>
                    <Badge className={
                      c.status === "sent" ? "bg-emerald-600" :
                      c.status === "ready" ? "bg-amber-600" :
                      c.status === "archived" ? "bg-muted text-foreground" :
                      "bg-secondary text-foreground"
                    }>{c.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(c)}>Modifier</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminEmailCampaigns;
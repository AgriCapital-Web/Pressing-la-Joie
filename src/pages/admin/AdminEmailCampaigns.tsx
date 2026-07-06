import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import WYSIWYGEditor from "@/components/admin/WYSIWYGEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CalendarClock, Loader2, Mail, Plus, Save, Eye, Trash2, Send, Sparkles, Image as ImageIcon, Video, FileText, MousePointer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Audience = "all" | "testimonials" | "subscribers" | "investors" | "prospects" | "partners" | "clients" | "members" | "custom";
type Status = "draft" | "ready" | "scheduled" | "sending" | "sent" | "failed" | "archived";

type Campaign = {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  html_content: string;
  plain_text: string;
  source_prompt: string;
  audience_type: Audience;
  status: Status;
  provider: string;
  brevo_campaign_id: string | null;
  include_image: boolean;
  include_video: boolean;
  image_url: string | null;
  video_url: string | null;
  scheduled_at: string | null;
  last_sent_at: string | null;
  batches_total: number;
  open_count: number;
  click_count: number;
  error_summary: string | null;
  created_at: string;
  updated_at: string;
};

type SendHistory = { id: string; campaign_id: string | null; subject: string; status: string; total_recipients: number; total_sent: number; total_failed: number; batches_total: number; batches_completed: number; open_count: number; click_count: number; error_summary: string | null; scheduled_at: string | null; created_at: string };

const emptyForm = {
  name: "",
  subject: "",
  preheader: "",
  html_content: "",
  plain_text: "",
  source_prompt: "",
  audience_type: "all" as Audience,
  status: "draft" as Status,
  include_image: false,
  include_video: false,
  image_url: "",
  video_url: "",
  scheduled_at: "",
};

const audienceOptions: { value: Audience; label: string; help: string }[] = [
  { value: "all", label: "Tous les contacts", help: "Ton global, clair et fédérateur" },
  { value: "testimonials", label: "Témoignants", help: "Ton chaleureux et relationnel" },
  { value: "subscribers", label: "Abonnés newsletter", help: "Ton informatif et fidélisation" },
  { value: "investors", label: "Investisseurs", help: "Ton financier et stratégique" },
  { value: "prospects", label: "Prospects", help: "Ton commercial et conversion" },
  { value: "partners", label: "Partenaires", help: "Ton institutionnel et collaboratif" },
  { value: "clients", label: "Clients", help: "Ton rassurant et orienté service" },
  { value: "members", label: "Membres", help: "Ton communautaire" },
  { value: "custom", label: "Personnalisé", help: "Ton adapté au prompt" },
];

const stripHtml = (html: string) => html.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const sanitizeFileName = (name: string) => name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-");

const absolutizeUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;
};

const validateCampaign = (form: typeof emptyForm) => {
  const errors: string[] = [];
  if (!form.name.trim()) errors.push("Nom interne requis");
  if (form.subject.trim().length < 6) errors.push("Objet trop court");
  if (form.preheader.trim().length < 12) errors.push("Pré-header requis");
  if (stripHtml(form.html_content).length < 80) errors.push("Corps du message trop court");
  if (form.include_image && !form.image_url) errors.push("Image demandée mais absente");
  if (form.include_video && !form.video_url) errors.push("Vidéo demandée mais absente");
  return errors;
};

const AdminEmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [sendHistory, setSendHistory] = useState<SendHistory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("email_campaigns").select("*").order("updated_at", { ascending: false });
    if (error) toast.error("Erreur de chargement des campagnes");
    else setCampaigns((data || []) as Campaign[]);
    const { data: history } = await (supabase as any).from("newsletter_sends").select("id,campaign_id,subject,status,total_recipients,total_sent,total_failed,batches_total,batches_completed,open_count,click_count,error_summary,scheduled_at,created_at").order("created_at", { ascending: false }).limit(25);
    setSendHistory((history || []) as SendHistory[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowPreview(true);
  };

  const handleGenerate = async () => {
    if (!form.source_prompt.trim()) {
      toast.error("Écrivez une idée, des mots-clés ou un brouillon");
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-newsletter", {
        body: {
          prompt: form.source_prompt,
          targetAudience: form.audience_type,
          includeImage: form.include_image,
          includeVideo: form.include_video,
        },
      });
      if (error) throw error;
      setForm((f) => ({
        ...f,
        name: data.name || f.source_prompt.slice(0, 60),
        subject: data.subject || "",
        preheader: data.preheader || "",
        html_content: data.html || "",
        plain_text: data.plainText || stripHtml(data.html || ""),
        image_url: f.include_image ? (data.imageUrl || data.mediaPreview?.find?.((m: any) => m.type === "image")?.url || f.image_url) : f.image_url,
        video_url: f.include_video ? (data.videoUrl || data.mediaPreview?.find?.((m: any) => m.type === "video")?.url || f.video_url) : f.video_url,
        status: "ready",
      }));
      setShowPreview(true);
      toast.success("Campagne IA générée");
    } catch (err: any) {
      toast.error(err?.message || "Erreur de génération IA");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    const validationErrors = validateCampaign(form);
    if (validationErrors.length) {
      toast.error(validationErrors[0]);
      return;
    }
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        name: form.name.trim(),
        subject: form.subject.trim(),
        preheader: form.preheader.trim(),
        html_content: form.html_content,
        plain_text: form.plain_text || stripHtml(form.html_content),
        source_prompt: form.source_prompt,
        audience_type: form.audience_type,
        status: form.status,
        provider: "brevo",
        include_image: form.include_image,
        include_video: form.include_video,
        image_url: form.image_url || null,
        video_url: form.video_url || null,
        scheduled_at: form.scheduled_at || null,
        batches_total: Math.max(1, Math.ceil(estimateRecipients(form.audience_type) / 5)),
        media_preview: buildMediaPreview(),
        updated_by: user?.id ?? null,
      };
      if (editingId) {
        const { error } = await supabase.from("email_campaigns").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success("Campagne mise à jour");
      } else {
        const { error } = await supabase.from("email_campaigns").insert({ ...payload, created_by: user?.id ?? null });
        if (error) throw error;
        toast.success("Campagne enregistrée");
      }
      resetForm();
      fetchCampaigns();
    } catch (err: any) {
      toast.error(err?.message || "Erreur d'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const buildMediaPreview = () => [
    ...(form.image_url ? [{ type: "image", url: absolutizeUrl(form.image_url), alt: form.name || "Visuel AgriCapital" }] : []),
    ...(form.video_url ? [{ type: "video", url: absolutizeUrl(form.video_url), alt: form.name || "Vidéo AgriCapital" }] : []),
  ];

  const estimateRecipients = (_audience: Audience) => 25;

  const handleSend = async (schedule = false) => {
    const validationErrors = validateCampaign(form);
    if (validationErrors.length) return toast.error(`Envoi bloqué : ${validationErrors[0]}`);
    if (schedule && !form.scheduled_at) return toast.error("Choisissez une date et une heure");
    if (!schedule && !confirm(`Envoyer cette campagne via Brevo au segment : ${audienceOptions.find((a) => a.value === form.audience_type)?.label} ?`)) return;
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-newsletter-batch", {
        body: { campaignId: editingId, subject: form.subject, preheader: form.preheader, html: form.html_content, audienceType: form.audience_type, scheduledAt: schedule ? form.scheduled_at : null, mediaPreview: buildMediaPreview() },
      });
      if (error) throw error;
      toast.success(schedule ? `Campagne programmée : ${data?.totalRecipients || 0} destinataires, ${data?.batchesTotal || 1} batch(es)` : `Envoi Brevo terminé : ${data?.totalSent || 0} envoyés, ${data?.totalFailed || 0} échecs`);
      setForm((f) => ({ ...f, status: schedule ? "scheduled" : "sent" }));
      fetchCampaigns();
    } catch (err: any) {
      toast.error(err?.message || "Erreur d'envoi Brevo");
    } finally {
      setIsSending(false);
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingId(campaign.id);
    setForm({
      name: campaign.name,
      subject: campaign.subject,
      preheader: campaign.preheader || "",
      html_content: campaign.html_content || "",
      plain_text: campaign.plain_text || stripHtml(campaign.html_content || ""),
      source_prompt: campaign.source_prompt || "",
      audience_type: campaign.audience_type,
      status: campaign.status,
      include_image: campaign.include_image,
      include_video: campaign.include_video,
      image_url: campaign.image_url || "",
      video_url: campaign.video_url || "",
      scheduled_at: campaign.scheduled_at ? campaign.scheduled_at.slice(0, 16) : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette campagne ?")) return;
    const { error } = await supabase.from("email_campaigns").delete().eq("id", id);
    if (error) toast.error("Suppression impossible");
    else { toast.success("Campagne supprimée"); fetchCampaigns(); }
  };

  const handleMedia = async (kind: "image" | "video", file?: File) => {
    if (!file) return;
    try {
      const path = `email-campaigns/${kind}/${Date.now()}-${sanitizeFileName(file.name)}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      const publicUrl = data.publicUrl;
      setForm((f) => ({ ...f, [kind === "image" ? "image_url" : "video_url"]: publicUrl }));
      toast.success(kind === "image" ? "Image prête pour l'email" : "Vidéo prête pour l'email");
    } catch (err: any) {
      toast.error(err?.message || "Import média impossible");
    }
  };

  const validationErrors = validateCampaign(form);
  const canSend = validationErrors.length === 0;

  return (
    <AdminLayout title="Générateur Premium Emailing IA">
      <div className="space-y-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-bold text-foreground">Brevo connecté au backend</p>
              <p className="text-sm text-muted-foreground">Génération IA, édition visuelle, HTML arrière-plan, texte brut et envoi segmenté sont centralisés ici.</p>
            </div>
            <Badge className="w-fit bg-primary text-primary-foreground">Module Premium</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> Assistant expert de campagne</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid lg:grid-cols-[1.4fr_.8fr] gap-4">
              <div className="space-y-2">
                <Label>Zone de saisie libre</Label>
                <Textarea value={form.source_prompt} onChange={(e) => setForm((f) => ({ ...f, source_prompt: e.target.value }))} className="min-h-[170px]" placeholder="Ex: Je veux présenter AgriCapital à des investisseurs agricoles et leur proposer un rendez-vous." />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Destinataires</Label>
                  <Select value={form.audience_type} onValueChange={(v) => setForm((f) => ({ ...f, audience_type: v as Audience }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{audienceOptions.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{audienceOptions.find((a) => a.value === form.audience_type)?.help}</p>
                </div>
                <div className="grid gap-3 rounded-md border p-3">
                  <label className="flex items-center gap-3 text-sm"><Checkbox checked={form.include_image} onCheckedChange={(v) => setForm((f) => ({ ...f, include_image: Boolean(v) }))} /> Générer avec image</label>
                  <label className="flex items-center gap-3 text-sm"><Checkbox checked={form.include_video} onCheckedChange={(v) => setForm((f) => ({ ...f, include_video: Boolean(v) }))} /> Générer avec vidéo</label>
                </div>
                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2">
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Générer
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom interne</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Objet optimisé</Label><Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Pré-header</Label><Input value={form.preheader} onChange={(e) => setForm((f) => ({ ...f, preheader: e.target.value }))} /></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Programmer l'envoi</Label><Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))} /></div>
              <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground"><p className="font-semibold text-foreground">Lots estimés</p><p>{Math.max(1, Math.ceil(estimateRecipients(form.audience_type) / 5))} batch(es) de 5 emails maximum pour protéger la délivrabilité.</p></div>
            </div>

            <div className="space-y-2">
              <Label>Éditeur visuel professionnel</Label>
              <WYSIWYGEditor value={form.html_content} onChange={(value) => setForm((f) => ({ ...f, html_content: value, plain_text: stripHtml(value) }))} rows={16} />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {form.include_image && <div className="rounded-md border p-3 space-y-2"><div className="flex items-center justify-between"><Label className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Image</Label><Button size="sm" variant="outline" onClick={() => imageInputRef.current?.click()}>Remplacer l'image</Button></div>{form.image_url && <img src={form.image_url} alt="Visuel email" className="max-h-44 rounded-md object-cover" />}<input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleMedia("image", e.target.files?.[0])} /></div>}
              {form.include_video && <div className="rounded-md border p-3 space-y-2"><div className="flex items-center justify-between"><Label className="flex items-center gap-2"><Video className="w-4 h-4" /> Vidéo</Label><Button size="sm" variant="outline" onClick={() => videoInputRef.current?.click()}>Remplacer la vidéo</Button></div>{form.video_url && <p className="text-sm text-muted-foreground truncate">Vidéo importée</p>}<input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleMedia("video", e.target.files?.[0])} /></div>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Status }))}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Brouillon</SelectItem><SelectItem value="ready">Prête</SelectItem><SelectItem value="scheduled">Programmée</SelectItem><SelectItem value="sending">En cours</SelectItem><SelectItem value="sent">Envoyée</SelectItem><SelectItem value="failed">Erreur</SelectItem><SelectItem value="archived">Archivée</SelectItem></SelectContent></Select>
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {editingId ? "Mettre à jour" : "Enregistrer"}</Button>
              <Button variant="outline" onClick={() => setShowPreview((v) => !v)} className="gap-2"><Eye className="w-4 h-4" /> Aperçu</Button>
              <Button variant="outline" onClick={() => handleSend(true)} disabled={isSending || !canSend} className="gap-2 ml-auto"><CalendarClock className="w-4 h-4" /> Programmer</Button>
              <Button variant="secondary" onClick={() => handleSend(false)} disabled={isSending || !canSend} className="gap-2">{isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Envoyer Brevo</Button>
              {editingId && <Button variant="ghost" onClick={resetForm} className="gap-2"><Plus className="w-4 h-4" /> Nouvelle</Button>}
            </div>
            {!canSend && <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5" /><span>Envoi bloqué : {validationErrors.join(" · ")}</span></div>}

            {showPreview && <div className="grid lg:grid-cols-[1fr_.55fr] gap-4"><div className="border rounded-md bg-background p-4"><p className="text-xs text-muted-foreground mb-3">Aperçu complet</p><div className="mb-4 rounded-md bg-muted/30 p-3 text-sm"><p><strong>Objet :</strong> {form.subject || "—"}</p><p><strong>Pré-header :</strong> {form.preheader || "—"}</p></div>{form.image_url && <img src={form.image_url} alt="Aperçu image" className="mb-4 max-h-72 w-full rounded-md object-cover" />}{form.video_url && <video src={form.video_url} className="mb-4 max-h-72 w-full rounded-md object-cover" controls muted loop playsInline />}<div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: form.html_content || "<p>Aucun contenu généré</p>" }} /></div><div className="border rounded-md bg-muted/20 p-4"><p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Version texte brut</p><pre className="whitespace-pre-wrap text-xs text-muted-foreground font-sans">{form.plain_text || stripHtml(form.html_content) || "Texte brut généré automatiquement"}</pre></div></div>}
          </CardContent>
        </Card>

        <Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Mail className="w-5 h-5" /> Campagnes enregistrées</CardTitle></CardHeader><CardContent>{isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div> : campaigns.length === 0 ? <p className="text-center text-muted-foreground py-6">Aucune campagne enregistrée</p> : <ul className="divide-y divide-border">{campaigns.map((c) => <li key={c.id} className="py-3 flex flex-wrap items-center gap-3"><div className="flex-1 min-w-[220px]"><p className="font-medium text-foreground truncate">{c.name}</p><p className="text-xs text-muted-foreground truncate">{c.subject}</p>{c.scheduled_at && <p className="text-xs text-primary">Programmée : {new Date(c.scheduled_at).toLocaleString("fr-FR")}</p>}</div><Badge variant="outline" className="text-xs">{audienceOptions.find((a) => a.value === c.audience_type)?.label || c.audience_type}</Badge><Badge>{c.status}</Badge><span className="text-xs text-muted-foreground">Lots {c.batches_total || 1}</span><span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Eye className="w-3 h-3" /> {c.open_count || 0}</span><span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MousePointer className="w-3 h-3" /> {c.click_count || 0}</span>{c.error_summary && <Badge variant="destructive" className="text-xs">{c.error_summary}</Badge>}<Button size="sm" variant="outline" onClick={() => handleEdit(c)}>Modifier</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4" /></Button></li>)}</ul>}</CardContent></Card>

        <Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><CalendarClock className="w-5 h-5" /> Historique & état d'envoi</CardTitle></CardHeader><CardContent>{sendHistory.length === 0 ? <p className="text-center text-muted-foreground py-6">Aucun historique d'envoi</p> : <ul className="divide-y divide-border">{sendHistory.map((s) => <li key={s.id} className="py-3 flex flex-wrap items-center gap-3"><div className="flex-1 min-w-[240px]"><p className="font-medium text-foreground truncate">{s.subject}</p><p className="text-xs text-muted-foreground">{s.scheduled_at ? `Programmée : ${new Date(s.scheduled_at).toLocaleString("fr-FR")}` : new Date(s.created_at).toLocaleString("fr-FR")}</p></div><Badge>{s.status}</Badge><span className="text-xs text-muted-foreground">{s.total_sent}/{s.total_recipients} envoyés</span><span className="text-xs text-muted-foreground">Lots {s.batches_completed}/{s.batches_total}</span><span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Eye className="w-3 h-3" /> {s.open_count || 0}</span><span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MousePointer className="w-3 h-3" /> {s.click_count || 0}</span>{s.total_failed > 0 && <Badge variant="destructive">{s.total_failed} erreur(s)</Badge>}</li>)}</ul>}</CardContent></Card>
      </div>
    </AdminLayout>
  );
};

export default AdminEmailCampaigns;
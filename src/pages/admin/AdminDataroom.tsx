import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  Download, Trash2, Plus, FileText, Users, MessageSquare,
  FileSignature, Upload, Link2, Image as ImageIcon,
  Edit, Save, X, Eye, EyeOff, ExternalLink, Search, Lock, ShieldCheck, Globe, History, RotateCcw,
  TrendingUp, Wand2
} from "lucide-react";
import DataroomTrends from "@/components/admin/DataroomTrends";
import { autofillFromFile } from "@/lib/dataroom-autofill";

const WORKFLOW_LABEL: Record<string, string> = {
  draft: "Brouillon",
  in_review: "En revue",
  published: "Publié",
  archived: "Archivé",
};

const WORKFLOW_STYLE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  in_review: "bg-amber-50 text-amber-700 border-amber-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  archived: "bg-slate-100 text-slate-600",
};
import { Badge } from "@/components/ui/badge";

const BUCKET = "dataroom";
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_BY_TYPE: Record<string, string[]> = {
  document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  photo: ["image/jpeg", "image/png", "image/webp"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  presentation: ["application/pdf", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
};

const CATEGORIES = [
  "Stratégie",
  "Finance",
  "Juridique",
  "Technique",
  "Foncier",
  "Opérations",
  "Marketing",
  "Gouvernance",
];

const VISIBILITIES: { value: string; label: string; help: string; icon: any }[] = [
  { value: "public", label: "Public (teaser)", help: "Visible par tout visiteur du portail, sans NDA.", icon: Globe },
  { value: "nda", label: "Signataires NDA", help: "Réservé aux signataires ayant validé le NDA.", icon: ShieldCheck },
  { value: "vip", label: "Accès restreint (VIP)", help: "Réservé aux profils investisseurs validés manuellement.", icon: Lock },
];

const emptyForm = {
  type: "document",
  title: "",
  description: "",
  category: "",
  file_url: "",
  video_url: "",
  platform_url: "",
  platform_type: "website",
  preview_title: "",
  preview_description: "",
  preview_image_url: "",
  screenshot_url: "",
  dynamic_fields: {} as Record<string, string>,
  source_file_name: "",
  source_file_size: 0,
  source_mime_type: "",
  is_published: false,
  workflow_status: "draft",
  visibility: "nda",
};

const makePlatformPreview = (url: string, type: string) => {
  const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
  const host = parsed.hostname.replace(/^www\./, "");
  const title = host.split(".")[0]?.replace(/-/g, " ") || "Plateforme";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#0f4f2f"/><text x="70" y="150" fill="#f59e0b" font-size="44" font-family="Arial" font-weight="700">AgriCapital Cloud</text><text x="70" y="300" fill="#fff" font-size="72" font-family="Arial" font-weight="800">${host}</text><text x="70" y="390" fill="#d9efe2" font-size="34" font-family="Arial">${type}</text></svg>`;
  return {
    normalizedUrl: parsed.toString(),
    previewTitle: title.charAt(0).toUpperCase() + title.slice(1),
    previewDescription: `Aperçu sécurisé de la plateforme ${host}`,
    previewImage: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    dynamicFields: { host, protocol: parsed.protocol.replace(":", ""), path: parsed.pathname, analyzed_at: new Date().toISOString() },
  };
};

const visibilityMeta = (v: string) => VISIBILITIES.find((x) => x.value === v) ?? VISIBILITIES[1];

export default function AdminDataroom() {
  const [pubs, setPubs] = useState<any[]>([]);
  const [sigs, setSigs] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [intents, setIntents] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // filtres
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterVisibility, setFilterVisibility] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // aperçu
  const [preview, setPreview] = useState<{ pub: any; url: string | null } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // workflow / versions / popularité
  const [sortBy, setSortBy] = useState<"recent" | "views" | "downloads">("recent");
  const [workflowPub, setWorkflowPub] = useState<any | null>(null);
  const [reviewComments, setReviewComments] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [newReview, setNewReview] = useState("");

  const [autofilling, setAutofilling] = useState(false);
  const [pendingMeta, setPendingMeta] = useState<any | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);

  // liens de téléchargement sécurisés
  const [linkPub, setLinkPub] = useState<any | null>(null);
  const [linkSignatory, setLinkSignatory] = useState<string>("");
  const [linkHours, setLinkHours] = useState(24);
  const [linkUses, setLinkUses] = useState(1);
  const [linkResult, setLinkResult] = useState<string | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);

  const notifySignatories = async (publication_id: string, event: "workflow" | "visibility", from: string, to: string) => {
    try {
      await supabase.functions.invoke("dataroom-notify", { body: { publication_id, event, from, to } });
    } catch (e) {
      console.warn("notification signataires échouée", e);
    }
  };

  const handleFileSelected = async (file: File | null) => {
    setSelectedFile(file);
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingPreviewUrl(null);
    if (!file) { setPendingMeta(null); setPendingFile(null); return; }
    setAutofilling(true);
    try {
      const meta = await autofillFromFile(file);
      setPendingFile(file);
      setPendingMeta(meta);
      if (file.type.startsWith("image/") || file.type === "application/pdf" || file.type.startsWith("video/")) {
        setPendingPreviewUrl(URL.createObjectURL(file));
      }
    } catch (e: any) {
      toast({ title: "Import partiel", description: e.message, variant: "destructive" });
    } finally {
      setAutofilling(false);
    }
  };

  const applyPendingMeta = () => {
    const meta = pendingMeta;
    if (!meta) return;
    setForm((prev) => ({
      ...prev,
      type: meta.type,
      title: meta.title,
      category: meta.category,
      description: meta.description,
      visibility: meta.visibility,
      source_file_name: meta.source_file_name,
      source_file_size: meta.source_file_size,
      source_mime_type: meta.source_mime_type,
      dynamic_fields: { ...(prev.dynamic_fields || {}), ...meta.dynamic_fields },
    }));
    toast({ title: "Champs validés", description: `Métadonnées appliquées depuis « ${meta.source_file_name} »` });
    setPendingMeta(null);
  };

  const generateSecureLink = async () => {
    if (!linkPub) return;
    setLinkLoading(true);
    setLinkResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("dataroom-download-link", {
        body: {
          action: "create",
          publication_id: linkPub.id,
          signatory_id: linkSignatory || null,
          email: sigs.find((s: any) => s.id === linkSignatory)?.email ?? null,
          expires_in_hours: linkHours,
          max_uses: linkUses,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setLinkResult((data as any).download_url);
      toast({ title: "Lien sécurisé généré", description: `Expire dans ${linkHours} h · ${linkUses} téléchargement(s)` });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setLinkLoading(false);
    }
  };


  const load = async () => {
    const [p, s, c, i] = await Promise.all([
      supabase.from("dataroom_publications").select("*").order("created_at", { ascending: false }),
      supabase.from("dataroom_signatories").select("*").order("created_at", { ascending: false }),
      supabase.from("dataroom_comments").select("*, dataroom_signatories(full_name,email), dataroom_publications(title)").order("created_at", { ascending: false }),
      supabase.from("dataroom_intents").select("*, dataroom_signatories(full_name,email), dataroom_publications(title)").order("created_at", { ascending: false }),
    ]);
    setPubs(p.data ?? []);
    setSigs(s.data ?? []);
    setComments(c.data ?? []);
    setIntents(i.data ?? []);
  };

  useEffect(() => { load(); }, []);

  const categories = useMemo(() => {
    const set = new Set<string>(CATEGORIES);
    pubs.forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [pubs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = pubs.filter((p) => {
      if (q && !`${p.title} ${p.description ?? ""} ${p.category ?? ""} ${p.source_file_name ?? ""}`.toLowerCase().includes(q)) return false;
      if (filterType !== "all" && p.type !== filterType) return false;
      if (filterCategory !== "all" && (p.category || "") !== filterCategory) return false;
      if (filterVisibility !== "all" && (p.visibility || "nda") !== filterVisibility) return false;
      if (filterStatus !== "all" && (p.workflow_status || (p.is_published ? "published" : "draft")) !== filterStatus) return false;
      return true;
    });
    if (sortBy === "views") return [...list].sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    if (sortBy === "downloads") return [...list].sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0));
    return list;
  }, [pubs, search, filterType, filterCategory, filterVisibility, filterStatus, sortBy]);

  const handleSave = async () => {
    if (!form.title) return toast({ title: "Titre requis", variant: "destructive" });
    setSaving(true);
    let payload: any = { ...form };

    try {
      if (editingId) {
        delete payload.id;
        delete payload.created_at;
        delete payload.updated_at;
        delete payload.views_count;
        delete payload.downloads_count;
        delete payload.created_by;
        delete payload.current_version;
        delete payload.reviewed_by;
        delete payload.reviewed_at;
        delete payload.published_at;
        // Snapshot de la version courante avant écrasement (historique restaurable)
        const previous = pubs.find((x) => x.id === editingId);
        if (previous) {
          await supabase.from("dataroom_versions").insert({
            publication_id: editingId,
            version_number: previous.current_version || 1,
            title: previous.title,
            description: previous.description,
            file_url: previous.file_url,
            source_file_name: previous.source_file_name,
            source_file_size: previous.source_file_size,
            source_mime_type: previous.source_mime_type,
            snapshot: previous,
            change_note: "Sauvegarde automatique avant modification",
          });
          payload.current_version = (previous.current_version || 1) + 1;
        }
        const { error } = await supabase.from("dataroom_publications").update(payload).eq("id", editingId);
        if (error) throw error;
        toast({ title: "Publication mise à jour" });
      } else {
        if (form.type === "platform") {
          if (!form.platform_url) { setSaving(false); return toast({ title: "URL plateforme requise", variant: "destructive" }); }
          const p = makePlatformPreview(form.platform_url, form.platform_type);
          payload = {
            ...payload,
            platform_url: p.normalizedUrl,
            preview_title: payload.preview_title || p.previewTitle,
            preview_description: payload.preview_description || p.previewDescription,
            preview_image_url: p.previewImage,
            screenshot_url: p.previewImage,
            cover_url: p.previewImage,
            dynamic_fields: p.dynamicFields,
          };
        } else {
          if (!selectedFile) { setSaving(false); return toast({ title: "Téléversement requis", description: "Veuillez choisir un fichier.", variant: "destructive" }); }
          const allowed = ALLOWED_BY_TYPE[form.type] || [];
          if (!allowed.includes(selectedFile.type)) { setSaving(false); return toast({ title: "Type de fichier non autorisé", variant: "destructive" }); }
          if (selectedFile.size > MAX_FILE_SIZE) { setSaving(false); return toast({ title: "Fichier trop volumineux", description: "Max 25 Mo", variant: "destructive" }); }

          const path = `${form.type}/${crypto.randomUUID()}-${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
          const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, selectedFile, { contentType: selectedFile.type, upsert: false });
          if (uploadError) throw uploadError;

          const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
          payload = {
            ...payload,
            file_url: path,
            video_url: null,
            platform_url: null,
            cover_url: selectedFile.type.startsWith("image/") ? signed?.signedUrl : null,
            source_file_name: selectedFile.name,
            source_file_size: selectedFile.size,
            source_mime_type: selectedFile.type,
          };
        }
        const { error } = await supabase.from("dataroom_publications").insert(payload);
        if (error) throw error;
        toast({ title: "Publication créée" });
      }

      setForm(emptyForm);
      setSelectedFile(null);
      setEditingId(null);
      load();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p: any) => {
    setForm({ ...emptyForm, ...p });
    setEditingId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedFile(null);
  };

  const delPub = async (p: any) => {
    if (!confirm(`Supprimer « ${p.title} » ?`)) return;
    if (p.file_url) await supabase.storage.from(BUCKET).remove([p.file_url]);
    const { error } = await supabase.from("dataroom_publications").delete().eq("id", p.id);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    toast({ title: "Publication supprimée" });
    load();
  };

  const togglePublish = async (p: any) => {
    const next = p.workflow_status === "published" ? "draft" : "published";
    await changeWorkflow(p, next);
  };

  const changeWorkflow = async (p: any, workflow_status: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const patch: any = { workflow_status };
    if (workflow_status === "in_review" || workflow_status === "published") {
      patch.reviewed_by = userData?.user?.id ?? null;
      patch.reviewed_at = new Date().toISOString();
    }
    const { error } = await supabase.from("dataroom_publications").update(patch).eq("id", p.id);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    await supabase.from("dataroom_review_comments").insert({
      publication_id: p.id,
      author_id: userData?.user?.id ?? null,
      author_name: userData?.user?.email ?? "Administrateur",
      body: `Statut changé : ${WORKFLOW_LABEL[p.workflow_status || "draft"]} → ${WORKFLOW_LABEL[workflow_status]}`,
      status_at_comment: workflow_status,
    });
    setPubs((prev) => prev.map((x) => (x.id === p.id ? { ...x, ...patch, is_published: workflow_status === "published" } : x)));
    if (workflowPub?.id === p.id) openWorkflow({ ...p, ...patch });
    if (workflow_status === "in_review" || workflow_status === "published") {
      notifySignatories(p.id, "workflow", p.workflow_status || "draft", workflow_status);
    }
    toast({ title: `Statut : ${WORKFLOW_LABEL[workflow_status]}`, description: (workflow_status === "in_review" || workflow_status === "published") ? "Signataires notifiés par e-mail." : undefined });
  };

  const openWorkflow = async (p: any) => {
    setWorkflowPub(p);
    setNewReview("");
    const [c, v] = await Promise.all([
      supabase.from("dataroom_review_comments").select("*").eq("publication_id", p.id).order("created_at", { ascending: false }),
      supabase.from("dataroom_versions").select("*").eq("publication_id", p.id).order("version_number", { ascending: false }),
    ]);
    setReviewComments(c.data ?? []);
    setVersions(v.data ?? []);
  };

  const addReviewComment = async () => {
    if (!newReview.trim() || !workflowPub) return;
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("dataroom_review_comments").insert({
      publication_id: workflowPub.id,
      author_id: userData?.user?.id ?? null,
      author_name: userData?.user?.email ?? "Administrateur",
      body: newReview.trim(),
      status_at_comment: workflowPub.workflow_status || "draft",
    });
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    setNewReview("");
    openWorkflow(workflowPub);
  };

  const restoreVersion = async (v: any) => {
    if (!workflowPub) return;
    if (!confirm(`Restaurer la version ${v.version_number} de « ${workflowPub.title} » ?`)) return;
    const snap = (v.snapshot || {}) as any;
    const { data: userData } = await supabase.auth.getUser();
    // On archive d'abord l'état courant afin de pouvoir revenir en arrière
    await supabase.from("dataroom_versions").insert({
      publication_id: workflowPub.id,
      version_number: (workflowPub.current_version || 1),
      title: workflowPub.title,
      description: workflowPub.description,
      file_url: workflowPub.file_url,
      source_file_name: workflowPub.source_file_name,
      source_file_size: workflowPub.source_file_size,
      source_mime_type: workflowPub.source_mime_type,
      snapshot: workflowPub,
      change_note: `Sauvegarde avant restauration de la v${v.version_number}`,
    });
    const patch = {
      title: snap.title ?? v.title,
      description: snap.description ?? v.description,
      file_url: snap.file_url ?? v.file_url,
      source_file_name: snap.source_file_name ?? v.source_file_name,
      source_file_size: snap.source_file_size ?? v.source_file_size,
      source_mime_type: snap.source_mime_type ?? v.source_mime_type,
      category: snap.category ?? workflowPub.category,
      visibility: snap.visibility ?? workflowPub.visibility,
      current_version: (workflowPub.current_version || 1) + 1,
    };
    const { error } = await supabase.from("dataroom_publications").update(patch).eq("id", workflowPub.id);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    await supabase.from("dataroom_review_comments").insert({
      publication_id: workflowPub.id,
      author_id: userData?.user?.id ?? null,
      author_name: userData?.user?.email ?? "Administrateur",
      body: `Restauration de la version ${v.version_number}`,
      status_at_comment: workflowPub.workflow_status || "draft",
    });
    toast({ title: `Version ${v.version_number} restaurée` });
    await load();
    openWorkflow({ ...workflowPub, ...patch });
  };

  const changeVisibility = async (p: any, visibility: string) => {
    const { error } = await supabase.from("dataroom_publications").update({ visibility }).eq("id", p.id);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    setPubs((prev) => prev.map((x) => (x.id === p.id ? { ...x, visibility } : x)));
    notifySignatories(p.id, "visibility", p.visibility || "nda", visibility);
    toast({ title: "Permission mise à jour", description: "Signataires notifiés par e-mail." });
  };

  const approveComment = async (id: string, v: boolean) => {
    await supabase.from("dataroom_comments").update({ approved: v }).eq("id", id);
    load();
  };

  const signedUrl = async (path: string, expires = 300) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expires);
    if (error) { toast({ title: "Erreur d'accès au fichier", description: error.message, variant: "destructive" }); return null; }
    return data.signedUrl;
  };

  const downloadFile = async (path: string, pubId?: string) => {
    const url = await signedUrl(path, 60);
    if (url) window.open(url, "_blank");
    if (pubId) {
      await supabase.rpc("increment_dataroom_download", { _publication_id: pubId });
      setPubs((prev) => prev.map((x) => (x.id === pubId ? { ...x, downloads_count: (x.downloads_count || 0) + 1 } : x)));
    }
  };

  const openPreview = async (p: any) => {
    setPreviewLoading(true);
    setPreview({ pub: p, url: null });
    let url: string | null = null;
    if (p.file_url) url = await signedUrl(p.file_url);
    else if (p.platform_url) url = p.platform_url;
    setPreview({ pub: p, url });
    setPreviewLoading(false);
  };

  const renderPreviewBody = () => {
    if (!preview) return null;
    const { pub, url } = preview;
    if (previewLoading) return <p className="text-sm text-muted-foreground py-8 text-center">Chargement de l'aperçu…</p>;
    if (!url) return <p className="text-sm text-muted-foreground py-8 text-center">Aucun contenu à prévisualiser.</p>;
    const mime = pub.source_mime_type || "";
    if (pub.type === "photo" || mime.startsWith("image/")) {
      return <img src={url} alt={pub.title} className="w-full max-h-[65vh] object-contain rounded-md bg-muted" />;
    }
    if (pub.type === "video" || mime.startsWith("video/")) {
      return <video src={url} controls className="w-full max-h-[65vh] rounded-md bg-black" />;
    }
    if (mime === "application/pdf") {
      return <iframe src={url} title={pub.title} className="w-full h-[65vh] rounded-md border" />;
    }
    if (pub.type === "platform") {
      return (
        <div className="space-y-3">
          {pub.preview_image_url && <img src={pub.preview_image_url} alt={pub.title} className="w-full rounded-md" />}
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline break-all">{url}</a>
        </div>
      );
    }
    return (
      <div className="text-center py-8 space-y-3">
        <FileText className="w-10 h-10 mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Aperçu non disponible pour ce format ({mime || "inconnu"}).</p>
        <Button onClick={() => window.open(url, "_blank")}><Download className="w-4 h-4 mr-2" />Ouvrir le fichier</Button>
      </div>
    );
  };

  return (
    <AdminLayout title="AgriCapital Cloud — Data Room">
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">AgriCapital Cloud — Data Room</h1>
            <p className="text-sm text-muted-foreground">Gestion complète des documents, catégories et permissions d'accès</p>
          </div>
          {editingId && (
            <Button variant="outline" onClick={cancelEdit}>
              <X className="w-4 h-4 mr-2" /> Annuler l'édition
            </Button>
          )}
        </div>

        <Tabs defaultValue="pubs">
          <TabsList className="mb-4 flex-wrap h-auto">
            <TabsTrigger value="pubs"><FileText className="w-4 h-4 mr-2" />Publications</TabsTrigger>
            <TabsTrigger value="nda"><FileSignature className="w-4 h-4 mr-2" />NDA / Signataires</TabsTrigger>
            <TabsTrigger value="comments"><MessageSquare className="w-4 h-4 mr-2" />Commentaires</TabsTrigger>
            <TabsTrigger value="intents"><Users className="w-4 h-4 mr-2" />Intentions</TabsTrigger>
            <TabsTrigger value="trends"><TrendingUp className="w-4 h-4 mr-2" />Tendances</TabsTrigger>
          </TabsList>

          <TabsContent value="pubs" className="space-y-6">
            <Card className={editingId ? "border-primary bg-primary/5" : ""}>
              <CardContent className="p-4 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2 flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-semibold text-lg">
                    {editingId ? "Modifier la publication" : "Nouvelle publication"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Statut de validation</Label>
                    <select
                      className="h-9 rounded-md border bg-background px-2 text-sm"
                      value={form.workflow_status || "draft"}
                      onChange={(e) => setForm({ ...form, workflow_status: e.target.value, is_published: e.target.value === "published" })}
                    >
                      <option value="draft">Brouillon</option>
                      <option value="in_review">En revue</option>
                      <option value="published">Publié</option>
                      <option value="archived">Archivé</option>
                    </select>
                  </div>
                </div>

                {!editingId && (
                  <div>
                    <Label>Type</Label>
                    <select
                      className="w-full h-10 rounded-md border bg-background px-3"
                      value={form.type}
                      onChange={(e) => { setForm({ ...emptyForm, type: e.target.value }); setSelectedFile(null); }}
                    >
                      <option value="document">Document</option>
                      <option value="photo">Photo</option>
                      <option value="video">Vidéo</option>
                      <option value="presentation">Présentation</option>
                      <option value="platform">Fiche Plateforme</option>
                    </select>
                  </div>
                )}

                <div>
                  <Label>Catégorie</Label>
                  <Input
                    list="dataroom-categories"
                    placeholder="Ex: Finance, Juridique, Technique..."
                    value={form.category || ""}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                  <datalist id="dataroom-categories">
                    {categories.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>

                <div>
                  <Label>Titre *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>

                <div>
                  <Label>Permission d'accès</Label>
                  <select
                    className="w-full h-10 rounded-md border bg-background px-3"
                    value={form.visibility || "nda"}
                    onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                  >
                    {VISIBILITIES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">{visibilityMeta(form.visibility).help}</p>
                </div>

                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description || ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Description détaillée visible par les investisseurs"
                  />
                </div>

                {form.type === "platform" ? (
                  <>
                    <div>
                      <Label>Type de plateforme</Label>
                      <select
                        className="w-full h-10 rounded-md border bg-background px-3"
                        value={form.platform_type || "website"}
                        onChange={(e) => setForm({ ...form, platform_type: e.target.value })}
                      >
                        <option value="website">Site web</option>
                        <option value="dashboard">Dashboard</option>
                        <option value="payment">Paiement</option>
                        <option value="document_portal">Portail documents</option>
                        <option value="communication">Communication</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                    <div>
                      <Label>URL plateforme</Label>
                      <Input
                        value={form.platform_url || ""}
                        onChange={(e) => setForm({ ...form, platform_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </>
                ) : !editingId ? (
                  <div className="md:col-span-2 rounded-md border border-dashed p-4 space-y-2 bg-muted/50">
                    <Label className="flex items-center gap-2"><Upload className="w-4 h-4" />Téléversement obligatoire</Label>
                    <Input
                      type="file"
                      accept={(ALLOWED_BY_TYPE[form.type] || []).join(",")}
                      onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
                    />
                    <p className="text-xs text-primary flex items-center gap-2">
                      <Wand2 className="w-3 h-3" />
                      {autofilling ? "Analyse du fichier en cours…" : "Import automatique : un écran de prévisualisation vous permet de valider les champs déduits avant application."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Types autorisés : {(ALLOWED_BY_TYPE[form.type] || []).join(", ")} · max 25 Mo
                    </p>
                    {selectedFile && <p className="text-xs font-medium text-primary">{selectedFile.name} · {(selectedFile.size / 1024 / 1024).toFixed(2)} Mo</p>}
                  </div>
                ) : (
                  <div className="md:col-span-2 p-3 bg-muted rounded-md text-sm flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>Fichier : {form.source_file_name || "Lien externe"}</span>
                    </div>
                    {form.file_url && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openPreview({ ...form, id: editingId })}>
                          <Eye className="w-3 h-3 mr-2" /> Aperçu
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => downloadFile(form.file_url)}>
                          <Download className="w-3 h-3 mr-2" /> Télécharger
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  {editingId && <Button variant="ghost" onClick={cancelEdit}>Annuler</Button>}
                  <Button onClick={handleSave} disabled={saving} className="min-w-[150px]">
                    {saving ? "Enregistrement..." : editingId ? <><Save className="w-4 h-4 mr-2" />Enregistrer</> : <><Plus className="w-4 h-4 mr-2" />Ajouter</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filtres */}
            <Card>
              <CardContent className="p-3 grid gap-2 md:grid-cols-5">
                <div className="relative md:col-span-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="all">Tous les types</option>
                  <option value="document">Document</option>
                  <option value="photo">Photo</option>
                  <option value="video">Vidéo</option>
                  <option value="presentation">Présentation</option>
                  <option value="platform">Plateforme</option>
                </select>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="all">Toutes les catégories</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={filterVisibility} onChange={(e) => setFilterVisibility(e.target.value)}>
                  <option value="all">Toutes les permissions</option>
                  {VISIBILITIES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">Tous les statuts</option>
                  <option value="draft">Brouillons</option>
                  <option value="in_review">En revue</option>
                  <option value="published">Publiés</option>
                  <option value="archived">Archivés</option>
                </select>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                  <option value="recent">Tri : plus récents</option>
                  <option value="views">Tri : plus vus</option>
                  <option value="downloads">Tri : plus téléchargés</option>
                </select>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Liste des publications
                <Badge variant="outline">{filtered.length} / {pubs.length}</Badge>
              </h3>
              {filtered.map((p) => {
                const vm = visibilityMeta(p.visibility || "nda");
                const VIcon = vm.icon;
                return (
                  <Card key={p.id} className="overflow-hidden group hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex gap-4 items-start min-w-0">
                        <button
                          onClick={() => openPreview(p)}
                          className="w-14 h-14 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden"
                          title="Aperçu"
                        >
                          {p.cover_url || p.preview_image_url ? (
                            <img src={p.cover_url || p.preview_image_url} alt={p.title} className="w-full h-full object-cover" />
                          ) : p.type === "platform" ? <Link2 className="w-6 h-6 text-blue-500" />
                            : p.type === "photo" ? <ImageIcon className="w-6 h-6 text-green-500" />
                            : p.type === "video" ? <ImageIcon className="w-6 h-6 text-purple-500" />
                            : <FileText className="w-6 h-6 text-amber-500" />}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold">{p.title}</span>
                            <Badge variant="outline" className={`text-[10px] h-4 ${WORKFLOW_STYLE[p.workflow_status || "draft"]}`}>
                              {WORKFLOW_LABEL[p.workflow_status || "draft"]}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] h-4 gap-1"><VIcon className="w-3 h-3" />{vm.label}</Badge>
                            <Badge variant="secondary" className="text-[10px] h-4">v{p.current_version || 1}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap mt-1">
                            <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">{p.type}</span>
                            <span>{p.category || "Sans catégorie"}</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.views_count} vues</span>
                            <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {p.downloads_count || 0} téléch.</span>
                            {p.source_file_name && <span className="truncate max-w-[150px] italic">({p.source_file_name})</span>}
                            <span>{new Date(p.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 flex-wrap">
                        <select
                          className="h-8 rounded-md border bg-background px-2 text-xs"
                          value={p.workflow_status || "draft"}
                          onChange={(e) => changeWorkflow(p, e.target.value)}
                          title="Statut de validation"
                        >
                          <option value="draft">Brouillon</option>
                          <option value="in_review">En revue</option>
                          <option value="published">Publié</option>
                          <option value="archived">Archivé</option>
                        </select>
                        <select
                          className="h-8 rounded-md border bg-background px-2 text-xs"
                          value={p.visibility || "nda"}
                          onChange={(e) => changeVisibility(p, e.target.value)}
                          title="Permission d'accès"
                        >
                          {VISIBILITIES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                        </select>
                        <Button variant="ghost" size="icon" onClick={() => openWorkflow(p)} title="Revue & versions">
                          <History className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => togglePublish(p)} title={p.workflow_status === "published" ? "Dépublier" : "Publier"}>
                          {p.workflow_status === "published" ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-amber-600" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openPreview(p)} title="Aperçu">
                          <Search className="w-4 h-4" />
                        </Button>
                        {p.file_url && (
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => { setLinkPub(p); setLinkResult(null); setLinkSignatory(""); }}
                            title="Générer un lien de téléchargement sécurisé et expirant"
                          >
                            <Lock className="w-4 h-4 text-amber-600" />
                          </Button>
                        )}
                        {p.platform_url && (
                          <Button variant="ghost" size="icon" asChild title="Ouvrir">
                            <a href={p.platform_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => startEdit(p)} title="Modifier">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => delPub(p)} title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12 border rounded-lg border-dashed">
                  <p className="text-muted-foreground text-sm">Aucune publication trouvée.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <DataroomTrends pubs={pubs} />
          </TabsContent>

          <TabsContent value="nda">
            <div className="grid gap-2">
              {sigs.map((s) => (
                <Card key={s.id}><CardContent className="p-3 flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{s.full_name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {s.email} · {s.profile_type} · {new Date(s.nda_signed_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {s.id_document_url && (
                      <Button variant="outline" size="sm" onClick={() => downloadFile(s.id_document_url)}>
                        <Download className="w-4 h-4 mr-2" /> ID
                      </Button>
                    )}
                  </div>
                </CardContent></Card>
              ))}
              {sigs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucun NDA signé pour le moment.</p>}
            </div>
          </TabsContent>

          <TabsContent value="comments">
            <div className="grid gap-2">
              {comments.map((c: any) => (
                <Card key={c.id}><CardContent className="p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="text-xs text-muted-foreground font-medium">
                      {c.dataroom_signatories?.full_name} sur <span className="text-foreground">{c.dataroom_publications?.title}</span>
                    </div>
                    <Badge variant={c.approved ? "default" : "outline"}>
                      {c.approved ? "Approuvé" : "En attente"}
                    </Badge>
                  </div>
                  <div className="text-sm border-l-2 pl-3 py-1 italic">{c.body}</div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant={c.approved ? "outline" : "default"} onClick={() => approveComment(c.id, !c.approved)}>
                      {c.approved ? "Retirer l'approbation" : "Approuver le commentaire"}
                    </Button>
                  </div>
                </CardContent></Card>
              ))}
              {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucun commentaire.</p>}
            </div>
          </TabsContent>

          <TabsContent value="intents">
            <div className="grid gap-2">
              {intents.map((i: any) => (
                <Card key={i.id}><CardContent className="p-3 space-y-1">
                  <div className="flex justify-between items-start">
                    <div className="text-xs text-muted-foreground font-medium">
                      {i.dataroom_signatories?.full_name} · {new Date(i.created_at).toLocaleString()}
                    </div>
                    <Badge>{i.intent_type}</Badge>
                  </div>
                  <div className="text-xs font-bold text-primary mb-1">Cible : {i.dataroom_publications?.title || "Général"}</div>
                  <div className="text-sm bg-muted p-2 rounded">{i.message}</div>
                </CardContent></Card>
              ))}
              {intents.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucune intention manifestée.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-6">
              {preview?.pub?.title}
              {preview?.pub && (
                <Badge variant="outline" className="text-[10px]">{visibilityMeta(preview.pub.visibility || "nda").label}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {preview?.pub?.description && (
            <p className="text-sm text-muted-foreground">{preview.pub.description}</p>
          )}
          {renderPreviewBody()}
        </DialogContent>
      </Dialog>

      {/* Prévisualisation & validation de l'import automatique */}
      <Dialog open={!!pendingMeta} onOpenChange={(o) => !o && setPendingMeta(null)}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-primary" /> Validation de l'import automatique
            </DialogTitle>
          </DialogHeader>
          {pendingMeta && (
            <div className="space-y-4">
              <div className="rounded-md border bg-muted/40 p-3 text-xs">
                <strong>{pendingFile?.name}</strong> · {((pendingFile?.size ?? 0) / 1024 / 1024).toFixed(2)} Mo · {pendingMeta.source_mime_type}
              </div>
              {pendingPreviewUrl && (
                <div className="rounded-md border overflow-hidden bg-muted/30">
                  {pendingMeta.source_mime_type?.startsWith("image/") ? (
                    <img src={pendingPreviewUrl} alt={pendingMeta.title} className="w-full max-h-64 object-contain" />
                  ) : pendingMeta.source_mime_type?.startsWith("video/") ? (
                    <video src={pendingPreviewUrl} controls className="w-full max-h-64" />
                  ) : (
                    <iframe src={pendingPreviewUrl} title="Aperçu" className="w-full h-64" />
                  )}
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Titre</Label><Input value={pendingMeta.title} onChange={(e) => setPendingMeta({ ...pendingMeta, title: e.target.value })} /></div>
                <div><Label>Catégorie</Label><Input value={pendingMeta.category} onChange={(e) => setPendingMeta({ ...pendingMeta, category: e.target.value })} /></div>
                <div>
                  <Label>Type</Label>
                  <select className="w-full border rounded-md h-10 px-3 bg-background text-sm"
                    value={pendingMeta.type} onChange={(e) => setPendingMeta({ ...pendingMeta, type: e.target.value })}>
                    {["document", "photo", "video", "presentation"].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Permission</Label>
                  <select className="w-full border rounded-md h-10 px-3 bg-background text-sm"
                    value={pendingMeta.visibility} onChange={(e) => setPendingMeta({ ...pendingMeta, visibility: e.target.value })}>
                    {VISIBILITIES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea rows={4} value={pendingMeta.description} onChange={(e) => setPendingMeta({ ...pendingMeta, description: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setPendingMeta(null)}>Ignorer</Button>
                <Button onClick={applyPendingMeta}><Save className="w-4 h-4 mr-2" />Valider et remplir</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lien de téléchargement sécurisé et expirant */}
      <Dialog open={!!linkPub} onOpenChange={(o) => !o && setLinkPub(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Lock className="w-4 h-4 text-amber-600" />Lien de téléchargement sécurisé</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Document : <strong>{linkPub?.title}</strong> · permission {visibilityMeta(linkPub?.visibility || "nda").label}
            </p>
            <div>
              <Label>Bénéficiaire (signataire)</Label>
              <select className="w-full border rounded-md h-10 px-3 bg-background text-sm"
                value={linkSignatory} onChange={(e) => setLinkSignatory(e.target.value)}>
                <option value="">— Aucun (lien nominatif non lié) —</option>
                {sigs.map((s: any) => <option key={s.id} value={s.id}>{s.full_name} · {s.email}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Expire dans (heures)</Label><Input type="number" min={1} max={720} value={linkHours} onChange={(e) => setLinkHours(Number(e.target.value))} /></div>
              <div><Label>Téléchargements max</Label><Input type="number" min={1} max={20} value={linkUses} onChange={(e) => setLinkUses(Number(e.target.value))} /></div>
            </div>
            {linkResult && (
              <div className="rounded-md border bg-muted p-3 space-y-2">
                <p className="text-[11px] break-all font-mono">{linkResult}</p>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(linkResult); toast({ title: "Lien copié" }); }}>
                  Copier le lien
                </Button>
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={generateSecureLink} disabled={linkLoading}>
                {linkLoading ? "Génération…" : <><Lock className="w-4 h-4 mr-2" />Générer le lien</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      <Dialog open={!!workflowPub} onOpenChange={(o) => !o && setWorkflowPub(null)}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-6">
              <History className="w-5 h-5 text-primary" />
              Revue & versions — {workflowPub?.title}
            </DialogTitle>
          </DialogHeader>

          {workflowPub && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                {["draft", "in_review", "published", "archived"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    {i > 0 && <span className="text-muted-foreground">→</span>}
                    <Button
                      size="sm"
                      variant={(workflowPub.workflow_status || "draft") === s ? "default" : "outline"}
                      onClick={() => changeWorkflow(workflowPub, s)}
                    >
                      {WORKFLOW_LABEL[s]}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Commentaires de revue (internes)</Label>
                <div className="flex gap-2">
                  <Textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Remarque, correction demandée, validation…"
                    rows={2}
                  />
                  <Button onClick={addReviewComment} disabled={!newReview.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {reviewComments.map((c) => (
                    <div key={c.id} className="text-sm border-l-2 border-primary/40 pl-3 py-1">
                      <div className="text-xs text-muted-foreground">
                        {c.author_name} · {new Date(c.created_at).toLocaleString("fr-FR")}
                      </div>
                      <div>{c.body}</div>
                    </div>
                  ))}
                  {reviewComments.length === 0 && (
                    <p className="text-xs text-muted-foreground">Aucun commentaire de revue.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">
                  Historique des versions (actuelle : v{workflowPub.current_version || 1})
                </Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {versions.map((v) => (
                    <div key={v.id} className="flex items-center justify-between gap-3 border rounded-md p-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">v{v.version_number} — {v.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {v.change_note} · {new Date(v.created_at).toLocaleString("fr-FR")}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {v.file_url && (
                          <Button size="sm" variant="ghost" onClick={() => downloadFile(v.file_url)}>
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => restoreVersion(v)}>
                          <RotateCcw className="w-4 h-4 mr-1" /> Restaurer
                        </Button>
                      </div>
                    </div>
                  ))}
                  {versions.length === 0 && (
                    <p className="text-xs text-muted-foreground">Aucune version antérieure enregistrée.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

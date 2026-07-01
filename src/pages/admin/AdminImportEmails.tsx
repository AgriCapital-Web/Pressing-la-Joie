import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, Sparkles, FileText, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const readAsBase64 = (file: File): Promise<{ base64: string; mime: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const [meta, b64] = result.split(",");
      const mime = meta.match(/data:([^;]+);/)?.[1] || file.type || "image/png";
      resolve({ base64: b64 || "", mime });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const AdminImportEmails = () => {
  const [text, setText] = useState("");
  const [images, setImages] = useState<{ name: string; base64: string; mime: string }[]>([]);
  const [category, setCategory] = useState("import");
  const [tag, setTag] = useState("attente");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const next: typeof images = [];
    for (const f of Array.from(files)) {
      if (f.type.startsWith("image/")) {
        const { base64, mime } = await readAsBase64(f);
        next.push({ name: f.name, base64, mime });
      } else {
        const t = await f.text();
        setText((prev) => (prev ? prev + "\n" : "") + t);
      }
    }
    setImages((prev) => [...prev, ...next]);
  };

  const run = async () => {
    if (!text.trim() && images.length === 0) return toast.error("Ajoutez du texte ou une image");
    setBusy(true); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("import-emails", {
        body: { text, images, defaultCategory: category, defaultTag: tag },
      });
      if (error) throw error;
      setResult(data);
      toast.success(`${data?.total || 0} adresse(s) traitées`);
    } catch (e: any) {
      toast.error(e?.message || "Erreur d'import");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title="Importer des emails (IA)">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Extraction automatique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Collez une liste, importez un fichier texte, un CSV, une capture d'écran ou une photo. L'IA extrait les adresses, tente de deviner le nom et l'étiquette (Oui/Non/Peut-être/En attente) puis les ajoute comme abonnés — <strong>sans envoyer d'email de bienvenue</strong>.</p>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="ex: prospect, partenaire" />
              </div>
              <div className="space-y-2">
                <Label>Étiquette par défaut</Label>
                <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="attente, oui, non..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><FileText className="w-4 h-4" /> Texte / CSV</Label>
              <Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Collez ici la liste. Une ligne par contact. Formats acceptés : email seul, `email;prénom nom;étiquette`, ou texte libre." />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Images / captures d'écran / documents</Label>
              <Input type="file" multiple accept="image/*,.csv,.txt" onChange={(e) => handleFiles(e.target.files)} />
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {images.map((img, i) => (
                    <Badge key={i} variant="secondary" className="gap-1"><ImageIcon className="w-3 h-3" />{img.name}</Badge>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={run} disabled={busy} className="gap-2">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Extraire et importer
            </Button>

            {result && (
              <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-2">
                <p><strong>{result.total || 0}</strong> adresse(s) traitée(s).</p>
                {Array.isArray(result.sample) && result.sample.length > 0 && (
                  <ul className="list-disc pl-5 text-xs text-muted-foreground">
                    {result.sample.map((r: any, i: number) => (
                      <li key={i}>{r.email} — {r.first_name} {r.last_name} <span className="text-primary">[{r.tag}]</span></li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminImportEmails;

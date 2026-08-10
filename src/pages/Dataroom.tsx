import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, FileSignature, KeyRound } from "lucide-react";

const NDA_TEXT = `ACCORD DE NON-DIVULGATION (NDA) — AgriCapital SARL

Entre AgriCapital SARL, société de droit ivoirien (RCCM CI-DAL-01-2025-B12-13435), représentée par son Gérant Monsieur Inocent KOFFI, dont le siège est situé à Daloa — Gonaté, Qr. Belleville, Îlot 230, Haut-Sassandra, Côte d'Ivoire,
Et le Lecteur soussigné, dont l'identité est renseignée dans le formulaire ci-après.

1. OBJET — Le présent accord régit l'accès du Lecteur aux documents, présentations, données, photos, vidéos et accès plateformes mis à disposition dans le portail AgriCapital Cloud.
2. CONFIDENTIALITÉ — Le Lecteur s'engage à ne pas divulguer, reproduire, publier ni utiliser à des fins personnelles ou commerciales les informations consultées, sans autorisation écrite préalable d'AgriCapital SARL.
3. DURÉE — Le présent engagement est valable pour une durée de trois (3) ans à compter de sa signature électronique.
4. RESPONSABILITÉ — Toute violation engage la responsabilité civile et pénale du Lecteur et peut donner lieu à des dommages et intérêts.
5. JURIDICTION — Le présent accord est régi par le droit ivoirien. Tout litige relève de la compétence exclusive des juridictions de Daloa (Côte d'Ivoire).
6. SIGNATURE — La signature électronique du Lecteur (nom complet + horodatage + adresse IP collectée) vaut acceptation pleine et entière. Le Gérant AgriCapital SARL appose son cachet officiel et sa signature numérique sur le document PDF généré.`;

export default function Dataroom() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"nda" | "code">("nda");
  const [loading, setLoading] = useState(false);
  const [ndaAccepted, setNdaAccepted] = useState(false);

  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", whatsapp: "",
    profession: "", organization: "", country: "",
    profile_type: "investisseur", newsletter_optin: false,
  });
  const [idFile, setIdFile] = useState<File | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginCode, setLoginCode] = useState("");

  useEffect(() => {
    const sig = localStorage.getItem("dataroom_signatory");
    if (sig) navigate("/dataroom/vault", { replace: true });
  }, [navigate]);

  const fileToBase64 = (f: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(f);
    });

  const submitNda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ndaAccepted) return toast({ title: "Veuillez accepter le NDA", variant: "destructive" });
    if (!form.full_name || !form.email) return toast({ title: "Nom et e-mail requis", variant: "destructive" });
    setLoading(true);
    try {
      let id_document_base64: string | undefined;
      let id_document_ext: string | undefined;
      if (idFile) {
        id_document_base64 = await fileToBase64(idFile);
        id_document_ext = idFile.name.split(".").pop()?.toLowerCase();
      }
      const { data, error } = await supabase.functions.invoke("dataroom-signup", {
        body: { ...form, id_document_base64, id_document_ext },
      });
      if (error) throw error;
      if (data?.already_signed) {
        toast({ title: "Déjà enregistré", description: data.message });
        setTab("code");
        setLoginEmail(form.email);
        return;
      }
      toast({
        title: "NDA signé ✓",
        description: `Votre code d'accès a été envoyé à ${form.email}. Notez-le : ${data.code}`,
      });
      setTab("code");
      setLoginEmail(form.email);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message ?? String(err), variant: "destructive" });
    } finally { setLoading(false); }
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("dataroom-login", {
        body: { email: loginEmail, code: loginCode },
      });
      if (error) throw error;
      if (data?.signatory) {
        localStorage.setItem("dataroom_signatory", JSON.stringify(data.signatory));
        toast({ title: "Bienvenue", description: `Bonjour ${data.signatory.full_name}` });
        navigate("/dataroom/vault");
      }
    } catch (err: any) {
      toast({ title: "Accès refusé", description: err.message ?? "Code ou e-mail invalide", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const resendCode = async () => {
    if (!loginEmail) return toast({ title: "Saisissez votre e-mail" });
    await supabase.functions.invoke("dataroom-login", { body: { email: loginEmail, action: "resend" } });
    toast({ title: "Demande enregistrée", description: "Si votre e-mail est reconnu, un renvoi sera effectué." });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Helmet>
        <title>AgriCapital Cloud — Portail Documentaire Confidentiel</title>
        <meta name="description" content="Portail sécurisé AgriCapital Cloud : signature NDA numérique, accès documents, présentations et données stratégiques." />
      </Helmet>

      <div className="container mx-auto px-4 py-10 md:py-14 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4" /> Espace sécurisé
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">AgriCapital Cloud</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Portail documentaire confidentiel — accès protégé par NDA numérique.
          </p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="bg-card border rounded-2xl p-4 md:p-6 shadow-sm">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="nda"><FileSignature className="w-4 h-4 mr-2" />Signer le NDA</TabsTrigger>
            <TabsTrigger value="code"><KeyRound className="w-4 h-4 mr-2" />J'ai un code</TabsTrigger>
          </TabsList>

          <TabsContent value="nda">
            <form onSubmit={submitNda} className="space-y-4">
              <div className="max-h-56 overflow-auto rounded-lg border bg-muted/40 p-4 text-xs whitespace-pre-wrap">
                {NDA_TEXT}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div><Label>Nom complet *</Label><Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
                <div><Label>E-mail professionnel *</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Téléphone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
                <div><Label>Profession / Fonction</Label><Input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} /></div>
                <div><Label>Organisation</Label><Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} /></div>
                <div><Label>Pays de résidence</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
                <div>
                  <Label>Type de profil</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                    value={form.profile_type} onChange={(e) => setForm({ ...form, profile_type: e.target.value })}>
                    <option value="investisseur">Investisseur</option>
                    <option value="partenaire">Partenaire institutionnel</option>
                    <option value="presse">Presse</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Pièce d'identité (CNI, passeport) — image ou PDF</Label>
                <Input type="file" accept="image/*,application/pdf" onChange={(e) => setIdFile(e.target.files?.[0] ?? null)} />
                <p className="text-xs text-muted-foreground mt-1">Stockée de façon sécurisée, accessible uniquement par les administrateurs AgriCapital.</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.newsletter_optin} onCheckedChange={(v) => setForm({ ...form, newsletter_optin: !!v })} />
                Je souhaite recevoir les newsletters et opportunités AgriCapital.
              </label>
              <label className="flex items-start gap-2 text-sm border-t pt-3">
                <Checkbox checked={ndaAccepted} onCheckedChange={(v) => setNdaAccepted(!!v)} />
                <span>Je déclare avoir lu et j'accepte les termes du NDA ci-dessus. Ma signature électronique (nom + horodatage + IP) vaut engagement.</span>
              </label>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSignature className="w-4 h-4 mr-2" />}
                Je signe et j'accepte
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="code">
            <form onSubmit={submitLogin} className="space-y-4">
              <div><Label>E-mail</Label><Input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} /></div>
              <div><Label>Code d'accès</Label><Input required maxLength={32} value={loginCode} onChange={(e) => setLoginCode(e.target.value.trim())} className="tracking-widest font-mono text-center" /></div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                Accéder au portail
              </Button>
              <button type="button" onClick={resendCode} className="text-sm text-primary hover:underline block mx-auto">
                J'ai perdu mon code
              </button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

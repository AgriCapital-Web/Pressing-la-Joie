import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  whatsapp: "",
  residence: "",
  landStatus: "no_land" as "has_land" | "no_land",
  desiredAreaHectares: "",
  landAreaHectares: "",
  message: "",
};

const WaitlistForm = ({ sourcePage, onSuccess }: { sourcePage?: string; onSuccess?: () => void }) => {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error("Nom complet et email requis");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("submit-waitlist", {
        body: { ...form, sourcePage: sourcePage || window.location.href },
      });
      if (error) throw error;
      setSubmitted(true);
      setForm(initialForm);
      toast.success("Inscription enregistrée");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message || "Inscription impossible");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-10 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-primary" />
        <h3 className="mb-2 text-2xl font-bold text-foreground">Inscription reçue</h3>
        <p className="text-muted-foreground">L'équipe AgriCapital vous contactera rapidement.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>Nom complet *</Label><Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
        <div className="space-y-2"><Label>Email *</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="space-y-2"><Label>Contact</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="space-y-2"><Label>Contact WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
        <div className="space-y-2"><Label>Lieu de résidence</Label><Input value={form.residence} onChange={(e) => setForm({ ...form, residence: e.target.value })} /></div>
        <div className="space-y-2"><Label>Procédez-vous la terre ?</Label><Select value={form.landStatus} onValueChange={(value) => setForm({ ...form, landStatus: value as "has_land" | "no_land" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no_land">Pas de terre</SelectItem><SelectItem value="has_land">J'ai une terre</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label>Superficie souhaitée (ha)</Label><Input type="number" min="0" step="0.01" value={form.desiredAreaHectares} onChange={(e) => setForm({ ...form, desiredAreaHectares: e.target.value })} /></div>
        {form.landStatus === "has_land" && <div className="space-y-2"><Label>Superficie de votre terre (ha)</Label><Input type="number" min="0" step="0.01" value={form.landAreaHectares} onChange={(e) => setForm({ ...form, landAreaHectares: e.target.value })} /></div>}
      </div>
      <div className="space-y-2"><Label>Message</Label><Textarea className="min-h-[110px]" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
      <Button type="submit" disabled={isSubmitting} className="w-full gap-2" size="lg">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Rejoindre la liste d'attente
      </Button>
    </form>
  );
};

export default WaitlistForm;
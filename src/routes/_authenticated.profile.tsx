import { createFileRoute } from "@tanstack/react-router";
import { useApp, useCurrentProfile } from "@/lib/mock/store";
import { useState } from "react";
import { detectOperator, normalizePhone, slugify, validatePhonesAgainstRules } from "@/lib/mock/utils";
import { Save, Plus, X } from "lucide-react";

const SECTORS = [
  "Tech & Innovation", "Architecture & BTP", "Photo & Vidéo", "Conseil & Formation",
  "Droit & Juridique", "Musique & Événementiel", "Restauration & Food", "Mode & Beauté",
  "Santé & Bien-être", "Finance & Banque", "Commerce & Distribution", "Éducation", "Autre",
];

export const Route = createFileRoute("/_authenticated/profile")({ 
  ssr: false,component: ProfilePage });

function ProfilePage() {
  const me = useCurrentProfile()!;
  const update = useApp((s) => s.updateCurrent);
  const [draft, setDraft] = useState(me);
  const [phoneInput, setPhoneInput] = useState("");
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => setDraft({ ...draft, [k]: v });
  const setSocial = (k: keyof typeof draft.socials, v: string) =>
    setDraft({ ...draft, socials: { ...draft.socials, [k]: v || undefined } });

  const addPhone = () => {
    const op = detectOperator(phoneInput);
    if (op === "Inconnu") return alert("Préfixe inconnu (accepté: 01/05/07 +225)");
    const next = [...draft.phones, { number: normalizePhone(phoneInput), operator: op }];
    const v = validatePhonesAgainstRules(next);
    if (!v.ok) return alert(v.reason);
    set("phones", next); setPhoneInput("");
  };

  const save = () => {
    const slug = slugify(`${draft.firstName}-${draft.lastName}`) || me.id;
    update({ ...draft, slug });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mon profil</h1>
        <button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow">
          <Save className="h-4 w-4" /> {saved ? "Enregistré ✓" : "Enregistrer"}
        </button>
      </header>

      <Section title="Identité">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom" value={draft.firstName} onChange={(v) => set("firstName", v)} />
          <Field label="Nom" value={draft.lastName} onChange={(v) => set("lastName", v)} />
          <Field label="Poste" value={draft.title} onChange={(v) => set("title", v)} />
          <Field label="Entreprise" value={draft.company ?? ""} onChange={(v) => set("company", v)} />
          <div>
            <label className="text-sm font-medium">Secteur</label>
            <select value={draft.sector} onChange={(e) => set("sector", e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-brand">
              {SECTORS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <Field label="Ville" value={draft.city ?? ""} onChange={(v) => set("city", v)} />
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium">Description ({(draft.description ?? "").length}/580)</label>
          <textarea
            value={draft.description ?? ""}
            onChange={(e) => set("description", e.target.value.slice(0, 580))}
            rows={3}
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-brand"
          />
        </div>
      </Section>

      <Section title="Contact">
        <div>
          <label className="text-sm font-medium">Numéros (max 3, un par opérateur)</label>
          <div className="mt-1.5 flex gap-2">
            <input value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+225 07 12 34 56 78"
              className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-brand" />
            <button onClick={addPhone} className="inline-flex items-center gap-1 rounded-xl bg-gradient-brand px-4 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Opérateur détecté : <strong>{phoneInput ? detectOperator(phoneInput) : "—"}</strong></p>
          <ul className="mt-3 space-y-2">
            {draft.phones.map((p, i) => (
              <li key={i} className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2 text-sm">
                <span>{p.number} <span className="text-xs text-muted-foreground">· {p.operator}</span></span>
                <button onClick={() => set("phones", draft.phones.filter((_, j) => j !== i))} className="text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Email public" value={draft.publicEmail ?? ""} onChange={(v) => set("publicEmail", v)} />
          <Field label="Site web" value={draft.website ?? ""} onChange={(v) => set("website", v)} placeholder="https://" />
        </div>
      </Section>

      <Section title="Réseaux sociaux">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp (+225…)" value={draft.socials.whatsapp ?? ""} onChange={(v) => setSocial("whatsapp", v)} />
          <Field label="LinkedIn (handle)" value={draft.socials.linkedin ?? ""} onChange={(v) => setSocial("linkedin", v)} />
          <Field label="Instagram" value={draft.socials.instagram ?? ""} onChange={(v) => setSocial("instagram", v)} />
          <Field label="Facebook" value={draft.socials.facebook ?? ""} onChange={(v) => setSocial("facebook", v)} />
          <Field label="TikTok" value={draft.socials.tiktok ?? ""} onChange={(v) => setSocial("tiktok", v)} />
          <Field label="Twitter / X" value={draft.socials.twitter ?? ""} onChange={(v) => setSocial("twitter", v)} />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-elevated p-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} {...rest}
        className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-brand" />
    </div>
  );
}

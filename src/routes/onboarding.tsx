import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useApp, useCurrentProfile } from "@/lib/mock/store";
import { useState } from "react";
import { detectOperator, normalizePhone, slugify, validatePhonesAgainstRules, isPersonalEmail } from "@/lib/mock/utils";
import { TEMPLATE_DEFS, PALETTE_PRESETS } from "@/lib/mock/templates";
import { BusinessCard } from "@/components/flex/BusinessCard";
import { Logo } from "@/components/flex/Logo";
import { ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  
  ssr: false,head: () => ({ meta: [{ title: "Créer ma carte — FlexCard" }] }),
  component: OnboardingPage,
});

const SECTORS = [
  "Tech & Innovation", "Architecture & BTP", "Photo & Vidéo", "Conseil & Formation",
  "Droit & Juridique", "Musique & Événementiel", "Restauration & Food", "Mode & Beauté",
  "Santé & Bien-être", "Finance & Banque", "Commerce & Distribution", "Éducation", "Autre",
];

function OnboardingPage() {
  const me = useCurrentProfile();
  const update = useApp((s) => s.updateCurrent);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  if (!me) return <Navigate to="/auth" />;

  const [firstName, setFirstName] = useState(me.firstName);
  const [lastName, setLastName] = useState(me.lastName);
  const [title, setTitle] = useState(me.title);
  const [company, setCompany] = useState(me.company ?? "");
  const [sector, setSector] = useState(me.sector || SECTORS[0]);
  const [description, setDescription] = useState(me.description ?? "");
  const [city, setCity] = useState(me.city ?? "Abidjan");
  const [phoneInput, setPhoneInput] = useState("");
  const [phones, setPhones] = useState(me.phones);
  const [website, setWebsite] = useState(me.website ?? "");
  const [publicEmail, setPublicEmail] = useState(me.publicEmail ?? me.email);
  const [templateId, setTemplateId] = useState(me.templateId);
  const [paletteIdx, setPaletteIdx] = useState(0);

  const palette = PALETTE_PRESETS[paletteIdx];
  const preview = { ...me, firstName, lastName, title, company, sector, description, city, phones, website, publicEmail, templateId, palette };

  const addPhone = () => {
    const op = detectOperator(phoneInput);
    if (op === "Inconnu") { alert("Numéro non valide. Préfixes acceptés : 01/05/07 +225"); return; }
    const next = [...phones, { number: normalizePhone(phoneInput), operator: op }];
    const v = validatePhonesAgainstRules(next);
    if (!v.ok) { alert(v.reason); return; }
    setPhones(next); setPhoneInput("");
  };

  const finish = () => {
    const slug = slugify(`${firstName}-${lastName}`) || me.id;
    update({ firstName, lastName, title, company, sector, description, city, phones, website, publicEmail, templateId, palette, slug });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <header className="border-b border-border/60 glass">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Logo className="h-7" />
          <div className="text-xs text-muted-foreground">Étape {step} / 4</div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="surface-elevated p-6 sm:p-8">
          {step === 1 && (
            <Step title="Qui es-tu ?" subtitle="Les bases de ta carte de visite.">
              <Field label="Prénom" value={firstName} onChange={setFirstName} />
              <Field label="Nom" value={lastName} onChange={setLastName} />
              <Field label="Poste / Titre" value={title} onChange={setTitle} placeholder="ex. Photographe événementiel" />
              <Field label="Entreprise (optionnel)" value={company} onChange={setCompany} />
              <div>
                <label className="text-sm font-medium">Secteur</label>
                <select value={sector} onChange={(e) => setSector(e.target.value)} className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-brand">
                  {SECTORS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description ({description.length}/580)</label>
                <textarea
                  value={description} onChange={(e) => setDescription(e.target.value.slice(0, 580))}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-brand"
                />
              </div>
              <Field label="Ville" value={city} onChange={setCity} />
            </Step>
          )}

          {step === 2 && (
            <Step title="Comment te joindre ?" subtitle="Numéros et liens. Compte gratuit : 1 par opérateur, 3 maximum.">
              <div>
                <label className="text-sm font-medium">Numéros de téléphone</label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+225 07 12 34 56 78"
                    className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-brand"
                  />
                  <button onClick={addPhone} className="rounded-xl bg-gradient-brand px-4 text-sm font-semibold text-white shadow-glow">Ajouter</button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Opérateur détecté : <strong>{phoneInput ? detectOperator(phoneInput) : "—"}</strong>
                </p>
                <ul className="mt-3 space-y-2">
                  {phones.map((p, i) => (
                    <li key={i} className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2 text-sm">
                      <span>{p.number} <span className="text-xs text-muted-foreground">· {p.operator}</span></span>
                      <button onClick={() => setPhones(phones.filter((_, j) => j !== i))} className="text-xs text-destructive">Retirer</button>
                    </li>
                  ))}
                </ul>
              </div>
              <Field label="Email public" value={publicEmail} onChange={setPublicEmail} type="email" />
              <Field label="Site web (max 1)" value={website} onChange={setWebsite} placeholder="https://" />
            </Step>
          )}

          {step === 3 && (
            <Step title="Choisis ton template" subtitle={`${TEMPLATE_DEFS.length * PALETTE_PRESETS.length} combinaisons. Tu pourras changer plus tard.`}>
              <div>
                <label className="text-sm font-medium">Palette</label>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {PALETTE_PRESETS.map((p, i) => (
                    <button
                      key={p.name}
                      onClick={() => setPaletteIdx(i)}
                      className={`relative h-12 rounded-xl ring-2 transition ${paletteIdx === i ? "ring-primary scale-105" : "ring-transparent"}`}
                      style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.accent})` }}
                      title={p.name}
                    >
                      {paletteIdx === i && <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium">Template</label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-[320px] overflow-y-auto">
                  {TEMPLATE_DEFS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTemplateId(t.id)}
                      className={`rounded-xl border p-3 text-left transition ${templateId === t.id ? "border-primary ring-brand bg-primary/5" : "border-border hover:bg-secondary"}`}
                    >
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </Step>
          )}

          {step === 4 && (
            <Step title="C'est prêt !" subtitle="Vérifie l'aperçu à côté puis valide.">
              <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkles className="h-4 w-4" /> Ton compte gratuit inclut
                </div>
                <ul className="mt-2 ml-6 list-disc text-sm text-muted-foreground space-y-1">
                  <li>1 carte de visite numérique avec QR code</li>
                  <li>Mise à jour en temps réel chez tes contacts</li>
                  <li>2 photos, 1 affiche, 1 visuel, 1 actualité dans la galerie</li>
                  <li>Annuaire des pros qui te scannent</li>
                </ul>
              </div>
              <button onClick={finish} className="w-full rounded-xl bg-gradient-brand px-5 py-3.5 text-base font-semibold text-white shadow-glow">
                Activer ma carte FlexCard
              </button>
            </Step>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            {step < 4 && (
              <button
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
              >
                Continuer <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-6 self-start">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Aperçu</div>
          <BusinessCard profile={preview} variant="full" />
        </div>
      </div>
    </div>
  );
}

function Step({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        value={value} onChange={(e) => onChange(e.target.value)}
        {...rest}
        className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-brand"
      />
    </div>
  );
}

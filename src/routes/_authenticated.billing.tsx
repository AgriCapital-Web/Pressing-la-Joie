import { createFileRoute } from "@tanstack/react-router";
import { useApp, useCurrentProfile } from "@/lib/mock/store";
import { Check, Crown, Building2, Sparkles } from "lucide-react";
import { useState } from "react";

const PARTICULIER_PLANS = [
  { id: "free", name: "Gratuit", price: "0 F", period: "à vie", features: ["1 carte numérique", "QR code permanent", "Annuaire prospects", "Galerie limitée"], cta: "Actuel" },
  { id: "boost", name: "Boost visibilité", price: "500 F", period: "/ mois", features: ["Apparition en tête d'annuaire", "Badge boost"], cta: "Activer" },
  { id: "gallery", name: "Galerie étendue", price: "1 000 F", period: "/ an", features: ["Vidéos activées", "Plus de visuels", "Actualités illimitées"], cta: "Activer" },
];

const ENTREPRISE_PLANS = [
  { id: "team3", name: "Jusqu'à 3", price: "Gratuit", pack: "—", features: ["3 employés", "Carte entreprise"] },
  { id: "team10", name: "Jusqu'à 10", price: "1 000 F", pack: "5 000 F", features: ["10 employés", "Charte commune"] },
  { id: "team20", name: "Jusqu'à 20", price: "1 500 F", pack: "9 000 F", features: ["20 employés"] },
  { id: "team50", name: "Jusqu'à 50", price: "2 500 F", pack: "20 000 F", features: ["50 employés"] },
  { id: "team100", name: "Jusqu'à 100", price: "3 500 F", pack: "35 000 F", features: ["100 employés"] },
  { id: "unlimited", name: "Illimité", price: "5 000 F", pack: "50 000 F", features: ["Sans limite"] },
];

export const Route = createFileRoute("/_authenticated/billing")({ 
  ssr: false,component: BillingPage });

function BillingPage() {
  const me = useCurrentProfile()!;
  const [tab, setTab] = useState<"particulier" | "entreprise">(me.kind === "entreprise" ? "entreprise" : "particulier");

  return (
    <div className="max-w-6xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Forfaits & paiements</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upgrade : seule la différence est facturée.</p>
      </header>

      <div className="inline-flex rounded-full border border-border bg-card p-1">
        {(["particulier", "entreprise"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)}
            className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition ${tab === k ? "bg-gradient-brand text-white shadow-glow" : "text-muted-foreground hover:text-foreground"}`}>
            {k}
          </button>
        ))}
      </div>

      {tab === "particulier" ? (
        <div className="grid gap-4 md:grid-cols-3">
          {PARTICULIER_PLANS.map((p) => (
            <PlanCard key={p.id} name={p.name} price={p.price} period={p.period} features={p.features} cta={p.cta} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENTREPRISE_PLANS.map((p) => (
            <div key={p.id} className="surface-elevated p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Forfait</div>
              <h3 className="mt-1 text-xl font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> {p.name}
              </h3>
              <div className="mt-4 text-3xl font-black">{p.price}<span className="ml-1 text-sm font-medium text-muted-foreground">/ mois</span></div>
              <div className="mt-1 text-xs text-muted-foreground">Pack premium impression : <strong>{p.pack}</strong></div>
              <ul className="mt-4 space-y-1.5 text-sm">
                {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-success mt-0.5" /> {f}</li>)}
              </ul>
              <button
                onClick={() => alert(`Paiement simulé pour ${p.name}. Avec Supabase + Stripe/Wave/Orange Money, le flux réel sera branché ici.`)}
                className="mt-5 w-full rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
              >
                Choisir ce forfait
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-sm flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <strong>Mode démo</strong> — les paiements sont simulés. Tu peux acheter une carte premium dans
          l'onglet « Carte Premium » pour générer un vrai code unique localement.
        </div>
      </div>
    </div>
  );
}

function PlanCard({ name, price, period, features, cta }: { name: string; price: string; period: string; features: string[]; cta: string }) {
  return (
    <div className="surface-elevated p-6 flex flex-col">
      <h3 className="text-xl font-bold flex items-center gap-2"><Crown className="h-4 w-4 text-primary" /> {name}</h3>
      <div className="mt-4 text-4xl font-black">{price}<span className="ml-1 text-sm font-medium text-muted-foreground">{period}</span></div>
      <ul className="mt-4 flex-1 space-y-1.5 text-sm">
        {features.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-success mt-0.5" /> {f}</li>)}
      </ul>
      <button
        onClick={() => alert(`Paiement simulé pour ${name}.`)}
        className="mt-5 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
      >{cta}</button>
    </div>
  );
}

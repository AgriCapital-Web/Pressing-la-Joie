import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentProfile, useApp } from "@/lib/mock/store";
import { Crown, Copy, CheckCircle2, Printer, ArrowRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/premium")({ 
  ssr: false,component: PremiumPage });

function PremiumPage() {
  const me = useCurrentProfile()!;
  const buy = useApp((s) => s.buyPremium);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const copy = () => {
    if (!me.premiumCode) return;
    navigator.clipboard.writeText(me.premiumCode);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <header className="flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
          <Crown className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold">Carte Premium</h1>
          <p className="text-sm text-muted-foreground">Version physique imprimable. Code unique valable à vie.</p>
        </div>
      </header>

      {me.hasPremium && me.premiumCode ? (
        <>
          <div className="rounded-3xl bg-gradient-brand p-8 text-white shadow-elev">
            <div className="text-xs uppercase tracking-widest opacity-80">Ton code unique</div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <code className="text-2xl sm:text-4xl font-black tracking-widest">{me.premiumCode}</code>
              <button onClick={copy} className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur-sm hover:bg-white/25">
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copié" : "Copier"}
              </button>
            </div>
            <p className="mt-4 text-sm opacity-90 max-w-md">
              Donne-le à n'importe quel imprimeur. Il ouvre flexcard.app, saisit le code, et imprime ta carte recto-verso.
            </p>
          </div>

          <Link to="/print/$code" params={{ code: me.premiumCode }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-secondary">
            <Printer className="h-4 w-4" /> Prévisualiser la carte d'imprimeur <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      ) : (
        <>
          <div className="surface-elevated p-8">
            <h2 className="text-2xl font-bold">Active ta carte premium</h2>
            <p className="mt-2 text-muted-foreground max-w-md">
              <strong>1 000 F</strong> — paiement unique, à vie, utilisable un nombre illimité de fois chez l'imprimeur.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {[
                "Code unique généré automatiquement",
                "Envoi par email + accès permanent ici",
                "QR haute correction d'erreur, scannable même imprimé",
                "Carte recto-verso, charte graphique automatique",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-success" /> {f}
                </li>
              ))}
            </ul>

            {confirming ? (
              <div className="mt-6 rounded-2xl border border-primary/40 bg-primary/5 p-4">
                <div className="text-sm font-semibold">Confirmer le paiement de 1 000 F</div>
                <p className="text-xs text-muted-foreground mt-1">Paiement simulé pour la démo.</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => { buy(); setConfirming(false); }}
                    className="rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
                  >Payer 1 000 F (simulé)</button>
                  <button onClick={() => setConfirming(false)} className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold">Annuler</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirming(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-base font-semibold text-white shadow-glow">
                <Crown className="h-5 w-5" /> Acheter ma carte premium
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

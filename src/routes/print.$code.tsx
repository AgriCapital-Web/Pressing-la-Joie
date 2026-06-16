import { createFileRoute } from "@tanstack/react-router";
import { useProfileByPremiumCode } from "@/lib/mock/store";
import { PrintableCard } from "@/components/flex/BusinessCard";
import { Logo } from "@/components/flex/Logo";
import { Download, Printer, ShieldCheck, AlertCircle } from "lucide-react";
import { useApp } from "@/lib/mock/store";

export const Route = createFileRoute("/print/$code")({
  
  ssr: false,head: () => ({ meta: [{ title: "Impression carte premium — FlexCard" }] }),
  component: PrintPage,
});

function PrintPage() {
  const { code } = Route.useParams();
  const { profile, org } = useProfileByPremiumCode(code);

  // Si org → on prend le premier membre comme exemple
  const memberProfile = org
    ? useApp.getState().profiles[org.memberIds[0]] ?? null
    : null;
  const target = profile ?? memberProfile;

  if (!target) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="surface-elevated max-w-md p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 text-xl font-bold">Code invalide</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Le code <code className="bg-secondary px-1.5 py-0.5 rounded">{code}</code> ne correspond à aucune carte premium FlexCard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 print:bg-white">
      <header className="border-b border-border bg-card print:hidden">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Logo className="h-7" />
          <div className="text-xs text-muted-foreground">Interface imprimeur · FlexCard</div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10 print:py-0">
        <div className="print:hidden">
          <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
            <ShieldCheck className="h-3.5 w-3.5" /> Code valide · {target.firstName} {target.lastName}
            {org && ` · ${org.name}`}
          </div>
          <h1 className="mt-4 text-2xl font-bold">Carte Premium prête à imprimer</h1>
          <p className="mt-1 text-sm text-muted-foreground">Recto-verso. Conserve ce code, il est valable à vie.</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 print:grid-cols-2 print:gap-2">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 print:hidden">RECTO</div>
            <PrintableCard profile={target} side="recto" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 print:hidden">VERSO</div>
            <PrintableCard profile={target} side="verso" />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-glow"
          >
            <Printer className="h-4 w-4" /> Imprimer recto-verso
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold">
            <Download className="h-4 w-4" /> Télécharger PDF
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs text-warning-foreground print:hidden">
          <strong>Imprimeur :</strong> assure-toi d'utiliser un papier 350g min., finition mate ou semi-mate.
          Le QR code utilise un niveau de correction d'erreur H — il reste scannable même partiellement abîmé.
        </div>
      </section>
    </div>
  );
}

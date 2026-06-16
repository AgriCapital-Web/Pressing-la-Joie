import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentProfile } from "@/lib/mock/store";
import { BusinessCard } from "@/components/flex/BusinessCard";
import { Users, Crown, Eye, TrendingUp, QrCode, ArrowRight, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { fmt } from "@/lib/mock/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  
  ssr: false,component: Dashboard,
});

function Dashboard() {
  const me = useCurrentProfile()!;
  const totalVisits = me.prospects.reduce((s, p) => s + p.visits, 0);
  const cardUrl = typeof window !== "undefined" ? `${window.location.origin}/c/${me.slug}` : "";

  return (
    <div className="space-y-8 max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Bienvenue</div>
          <h1 className="text-3xl font-bold sm:text-4xl">Salut {me.firstName} 👋</h1>
        </div>
        <Link to="/c/$slug" params={{ slug: me.slug }} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-secondary">
          <Eye className="h-4 w-4" /> Voir ma carte publique
        </Link>
      </header>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Users className="h-5 w-5" />} label="Prospects" value={fmt(me.prospects.length)} sub={`${totalVisits} visites cumulées`} />
        <Stat icon={<TrendingUp className="h-5 w-5" />} label="Visites" value={fmt(totalVisits)} sub="depuis le début" />
        <Stat icon={<Crown className="h-5 w-5" />} label="Statut" value={me.hasPremium ? "Premium" : "Gratuit"} sub={me.hasPremium ? "Carte imprimable active" : "Active la version premium"} highlight={me.hasPremium} />
      </div>

      {/* Carte preview + QR */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Aperçu de ta carte</h2>
          <BusinessCard profile={me} variant="full" />
        </div>
        <div className="surface-elevated p-6 flex flex-col items-center text-center">
          <QrCode className="h-5 w-5 text-primary" />
          <h3 className="mt-2 text-lg font-semibold">Ton QR code</h3>
          <p className="text-xs text-muted-foreground">Permanent · pointe vers ta carte</p>
          <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-border">
            <QRCodeSVG value={cardUrl} size={180} level="H" fgColor={me.palette.ink} />
          </div>
          <div className="mt-4 break-all rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            {cardUrl}
          </div>
        </div>
      </div>

      {/* Premium CTA */}
      {!me.hasPremium && (
        <Link to="/premium" className="block group">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-8 text-white shadow-elev">
            <div className="absolute inset-0 grid-noise opacity-25" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
                  <Sparkles className="h-4 w-4" /> Premium
                </div>
                <h3 className="mt-2 text-2xl font-bold">Passe à la carte premium imprimable</h3>
                <p className="mt-1 text-sm opacity-90 max-w-md">1 000 F. À vie. Un code unique pour imprimer chez n'importe quel imprimeur.</p>
              </div>
              <ArrowRight className="h-6 w-6 transition group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      )}

      {/* Recent prospects */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Derniers prospects</h2>
          <Link to="/prospects" className="text-xs font-semibold text-primary">Voir tout →</Link>
        </div>
        {me.prospects.length === 0 ? (
          <div className="surface-elevated p-8 text-center text-sm text-muted-foreground">
            Personne ne t'a encore scanné. Partage ta carte pour démarrer ton annuaire !
          </div>
        ) : (
          <ul className="space-y-2">
            {me.prospects.slice(0, 5).map((p) => (
              <li key={p.phone} className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
                <div>
                  <div className="font-semibold text-sm">{p.contactName ?? "Contact"}</div>
                  <div className="text-xs text-muted-foreground">{p.phone}</div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>{p.visits} visite{p.visits > 1 ? "s" : ""}</div>
                  <div>{new Date(p.lastVisitAt).toLocaleDateString("fr-FR")}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ icon, label, value, sub, highlight }: { icon: React.ReactNode; label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`surface-elevated p-5 ${highlight ? "bg-gradient-brand border-0 text-white" : ""}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-70">{icon}{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
      <div className="mt-1 text-xs opacity-70">{sub}</div>
    </div>
  );
}

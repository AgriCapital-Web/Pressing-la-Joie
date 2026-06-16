import { createFileRoute } from "@tanstack/react-router";
import { useCurrentProfile } from "@/lib/mock/store";
import { Users, MessageSquare, Mail, Smartphone, Download, Lock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/prospects")({ 
  ssr: false,component: ProspectsPage });

function ProspectsPage() {
  const me = useCurrentProfile()!;
  const list = [...me.prospects].sort((a, b) => b.lastVisitAt - a.lastVisitAt);

  return (
    <div className="max-w-5xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="h-7 w-7 text-primary" /> Mes prospects
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toutes les personnes qui ont scanné ta carte avec leur téléphone.
        </p>
      </header>

      {/* V1.2 teaser */}
      <div className="surface-elevated p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Lock className="h-3.5 w-3.5" /> V1.2 · Campagnes (bientôt)
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <ActionBtn icon={<MessageSquare className="h-4 w-4" />} label="SMS à tous" />
          <ActionBtn icon={<Mail className="h-4 w-4" />} label="Email à tous" />
          <ActionBtn icon={<Smartphone className="h-4 w-4" />} label="WhatsApp à tous" />
          <ActionBtn icon={<Download className="h-4 w-4" />} label="Exporter (CSV)" />
        </div>
      </div>

      <div className="surface-elevated overflow-hidden">
        <div className="border-b border-border bg-secondary/40 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {list.length} contact{list.length > 1 ? "s" : ""}
        </div>
        {list.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Personne ne t'a encore scanné. Partage ton QR code pour démarrer ton annuaire.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((p) => (
              <li key={p.phone} className="flex items-center gap-4 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white">
                  {(p.contactName ?? "?").split(" ").map((s) => s[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">{p.contactName ?? "Contact"}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.phone} {p.email && `· ${p.email}`}</div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div className="font-semibold text-foreground">{p.visits} visite{p.visits > 1 ? "s" : ""}</div>
                  <div>1ère: {new Date(p.firstScanAt).toLocaleDateString("fr-FR")}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button disabled className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium opacity-60 cursor-not-allowed">
      {icon} {label}
    </button>
  );
}

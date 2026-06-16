import { createFileRoute } from "@tanstack/react-router";
import { useApp, useCurrentProfile } from "@/lib/mock/store";
import { Building2, Users, Mail, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/team")({ 
  ssr: false,component: TeamPage });

function TeamPage() {
  const me = useCurrentProfile()!;
  const profiles = useApp((s) => s.profiles);
  const organizations = useApp((s) => s.organizations);
  const upsertOrg = useApp((s) => s.upsertOrg);
  const [inviteEmail, setInviteEmail] = useState("");

  const org = me.orgId ? organizations[me.orgId] : null;

  if (!org) {
    return (
      <div className="max-w-3xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold flex items-center gap-3"><Building2 className="h-7 w-7 text-primary" /> Espace entreprise</h1>
          <p className="mt-1 text-sm text-muted-foreground">Crée ton organisation pour rattacher tes employés.</p>
        </header>
        <div className="surface-elevated p-8">
          <p className="text-sm">
            Tu es actuellement en compte <strong>particulier</strong>.
            Pour créer un espace entreprise, contacte-nous ou utilise un des comptes démo « entreprise » (ex. marc.zinsou@nimbatech.ci).
          </p>
        </div>
      </div>
    );
  }

  const members = org.memberIds.map((id) => profiles[id]).filter(Boolean);

  const invite = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Invitation simulée envoyée à ${inviteEmail}. (Sera réelle avec Supabase + email service.)`);
    setInviteEmail("");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3"><Building2 className="h-7 w-7 text-primary" /> {org.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{org.sector} · Forfait <strong className="uppercase">{org.plan}</strong></p>
      </header>

      <div className="surface-elevated p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4" /> Membres ({members.length})
        </h2>
        <ul className="mt-4 divide-y divide-border">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white">
                  {m.firstName[0]}{m.lastName[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm">{m.firstName} {m.lastName}</div>
                  <div className="text-xs text-muted-foreground">{m.title} · {m.email}</div>
                </div>
              </div>
              {m.email === org.ownerEmail && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase">Owner</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={invite} className="surface-elevated p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Mail className="h-4 w-4" /> Inviter un employé
        </h2>
        <div className="mt-4 flex gap-2">
          <input
            type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="prenom@entreprise.ci"
            className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-brand"
          />
          <button className="rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow">Envoyer</button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-success" /> L'employé reçoit un email et accède directement à son profil rattaché.
        </p>
      </form>
    </div>
  );
}

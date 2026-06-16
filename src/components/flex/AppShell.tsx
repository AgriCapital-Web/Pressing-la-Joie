import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useApp, useCurrentProfile } from "@/lib/mock/store";
import {
  LayoutDashboard, User, Image as ImageIcon, Palette, CreditCard, Users, Building2, Crown, LogOut, Menu, X,
} from "lucide-react";
import { useState } from "react";

const nav = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/profile", label: "Profil", icon: User },
  { to: "/gallery", label: "Galerie", icon: ImageIcon },
  { to: "/templates", label: "Templates", icon: Palette },
  { to: "/prospects", label: "Prospects", icon: Users },
  { to: "/premium", label: "Carte Premium", icon: Crown },
  { to: "/team", label: "Équipe", icon: Building2 },
  { to: "/billing", label: "Forfaits", icon: CreditCard },
] as const;

export function AppShell() {
  const me = useCurrentProfile();
  const signOut = useApp((s) => s.signOut);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-30 glass border-b border-border/60">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/dashboard"><Logo className="h-10" /></Link>
          <button onClick={() => setOpen((v) => !v)} className="rounded-lg p-2">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav className="border-t border-border/60 bg-background/95 px-3 py-3 space-y-1">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = path === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                    active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
            <button
              onClick={() => { signOut(); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </nav>
        )}
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar desktop */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col gap-1 border-r border-border/60 bg-sidebar/80 px-4 py-6 min-h-screen sticky top-0">
          <Link to="/dashboard" className="mb-6 px-1"><Logo className="h-12" /></Link>
          <nav className="flex-1 space-y-1">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = path === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          {me && (
            <div className="mt-4 rounded-xl border border-border/60 bg-card p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white">
                  {(me.firstName[0] ?? "?") + (me.lastName[0] ?? "")}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{me.firstName} {me.lastName}</div>
                  <div className="truncate text-xs text-muted-foreground">{me.email}</div>
                </div>
              </div>
              <button
                onClick={signOut}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <LogOut className="h-3.5 w-3.5" /> Déconnexion
              </button>
            </div>
          )}
        </aside>

        <main className="flex-1 min-w-0 px-4 py-6 sm:px-8 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

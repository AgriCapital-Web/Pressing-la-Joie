import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useCurrentProfile } from "@/lib/mock/store";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/about", label: "À propos" },
  { to: "/contact", label: "Contact" },
];

export function PublicHeader() {
  const me = useCurrentProfile();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-11 sm:h-12" />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden md:block">
          {me ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:opacity-95"
            >
              Mon tableau de bord
            </Link>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:opacity-95"
            >
              Créer ma carte
            </Link>
          )}
        </div>
        <button
          className="md:hidden rounded-lg p-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 px-4 py-4 space-y-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium hover:bg-secondary"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to={me ? "/dashboard" : "/auth"}
            onClick={() => setOpen(false)}
            className="block rounded-lg bg-gradient-brand px-3 py-2 text-center text-base font-semibold text-white"
          >
            {me ? "Mon tableau de bord" : "Créer ma carte"}
          </Link>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-gradient-to-b from-background to-secondary/40 mt-24">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo className="h-12" />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              La première plateforme africaine de gestion de l'identité professionnelle
              et du networking intelligent. Une carte. Mille connexions.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">flexcard.app · © IKNov 2026</p>
          </div>
          <div className="text-sm">
            <h4 className="mb-3 font-semibold">Produit</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">À propos</Link></li>
              <li><Link to="/directory" className="hover:text-foreground">Annuaire</Link></li>
              <li><Link to="/auth" className="hover:text-foreground">Créer ma carte</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <h4 className="mb-3 font-semibold">Légal</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/confidentialite" className="hover:text-foreground">Confidentialité</Link></li>
              <li><Link to="/mentions-legales" className="hover:text-foreground">Mentions légales</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/mock/store";
import { PublicHeader, PublicFooter } from "@/components/flex/PublicHeader";
import { ArrowRight, Users, Search } from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/directory")({
  
  ssr: false,validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Annuaire — FlexCard" }] }),
  component: DirectoryPage,
});

function DirectoryPage() {
  const { q } = Route.useSearch();
  const phone = (q ?? "").trim();
  const profilesById = useApp((s) => s.profiles);
  const profiles = useMemo(() => Object.values(profilesById), [profilesById]);

  const linked = useMemo(() => {
    if (!phone) return [];
    const normalizedPhone = phone.replace(/\D/g, "");
    return profiles.filter((p) => p.prospects.some((pr) => pr.phone.replace(/\D/g, "").includes(normalizedPhone)));
  }, [phone, profiles]);

  // Group by sector
  const bySector = useMemo(() => linked.reduce<Record<string, typeof linked>>((acc, p) => {
    (acc[p.sector] ||= []).push(p);
    return acc;
  }, {}), [linked]);

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <PublicHeader />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="surface-elevated p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold">Ton annuaire FlexCard</h1>
              <p className="text-sm text-muted-foreground">
                Les pros qui ont déjà utilisé ton téléphone pour scanner leur carte.
              </p>
            </div>
          </div>

          <form action="/directory" className="mt-6 flex items-center gap-2 rounded-2xl border border-input bg-background p-2">
            <Search className="ml-2 h-4 w-4 text-muted-foreground" />
            <input
              name="q" defaultValue={phone}
              placeholder="Ton numéro (+225…)"
              className="flex-1 bg-transparent px-2 py-2 text-sm outline-none"
            />
            <button className="rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white">Voir</button>
          </form>
        </div>

        {!phone && (
          <p className="mt-8 text-center text-muted-foreground">Entre ton numéro pour découvrir ton annuaire.</p>
        )}

        {phone && linked.length === 0 && (
          <div className="mt-8 surface-elevated p-8 text-center">
            <p className="font-semibold">Aucun pro lié à ce numéro pour l'instant.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Quand un utilisateur FlexCard utilisera ton téléphone pour scanner sa carte, il apparaîtra ici.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Pour tester : essaie <code className="rounded bg-secondary px-1.5 py-0.5">+225 07 11 22 33 44</code>
            </p>
          </div>
        )}

        {phone && Object.keys(bySector).length > 0 && (
          <div className="mt-8 space-y-8">
            {Object.entries(bySector).map(([sector, list]) => (
              <div key={sector}>
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{sector}</h2>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {list.map((p) => (
                    <li key={p.id}>
                      <Link
                        to="/c/$slug" params={{ slug: p.slug }}
                        className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:shadow-card transition"
                      >
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                          style={{ background: p.palette.primary }}
                        >
                          {p.firstName[0]}{p.lastName[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate">{p.firstName} {p.lastName}</div>
                          <div className="text-xs text-muted-foreground truncate">{p.title} {p.company && `· ${p.company}`}</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
      <PublicFooter />
    </div>
  );
}

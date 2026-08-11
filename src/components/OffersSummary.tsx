import { Link } from "react-router-dom";
import { ArrowRight, Landmark, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const OFFERS = [
  {
    key: "palminvest",
    icon: Sprout,
    name: "PalmInvest",
    tag: "Vous n'avez pas de terre",
    desc: "AgriCapital sécurise le foncier et crée pour vous une plantation de palmier à huile clé en main, remise productive à 36 mois.",
    points: ["Foncier sécurisé et cartographié", "Plantation clé en main", "Garantie d'écoulement 25 ans"],
    to: "/palminvest",
  },
  {
    key: "terrapalm",
    icon: Landmark,
    name: "TerraPalm",
    tag: "Vous avez déjà une terre",
    desc: "Votre foncier dort ? Nous le transformons en plantation productive. Vous restez propriétaire, nous assurons toute la mise en valeur.",
    points: ["Votre terre reste la vôtre", "Levé GPS et documentation", "Suivi agronomique long terme"],
    to: "/terrapalm",
  },
];

const OffersSummary = () => (
  <section id="offres" className="bg-secondary/40 py-12 sm:py-14 lg:py-16">
    <div className="container mx-auto px-4">
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">Nos offres</p>
        <h2 className="text-2xl font-black leading-tight text-foreground sm:text-3xl lg:text-4xl">
          Deux voies pour devenir propriétaire d'une plantation
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Avec ou sans foncier, AgriCapital conçoit, développe et accompagne votre plantation de palmier à huile
          jusqu'à sa mise en production.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {OFFERS.map(({ key, icon: Icon, name, tag, desc, points, to }) => (
          <Card key={key} className="h-full border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
            <CardContent className="flex h-full flex-col p-6 sm:p-7">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-accent/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
                  {tag}
                </span>
              </div>
              <h3 className="text-xl font-black text-foreground sm:text-2xl">{name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              <ul className="mt-4 space-y-2">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-1">
                <Button asChild>
                  <Link to={to}>
                    Découvrir {name} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default OffersSummary;

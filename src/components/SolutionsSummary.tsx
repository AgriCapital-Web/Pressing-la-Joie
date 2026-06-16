import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { solutions, services } from "@/data/offerings";

const SolutionsSummary = () => {
  // Show 3 flagship solutions + 2 services to keep it concise
  const featured = [...solutions.slice(0, 3), ...services.slice(0, 2)];

  return (
    <section id="solutions" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            Solutions & Services
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Des solutions adaptées à chaque projet agricole
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Valorisation foncière, plantations clé en main, gestion, intrants, garantie
            d'écoulement : un accompagnement complet pour particuliers, entrepreneurs,
            investisseurs et institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {featured.map((o) => {
            const Icon = o.icon;
            const base = o.type === "solution" ? "/solutions" : "/services";
            return (
              <Card
                key={o.slug}
                className="h-full border-border/60 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 bg-card"
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                      {o.type === "solution" ? "Solution" : "Service"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{o.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                    {o.shortDescription}
                  </p>
                  <Link
                    to={`${base}/${o.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
                  >
                    En savoir plus <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg">
            <Link to="/solutions">Voir toutes les solutions</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/partenariats">Découvrir les partenariats</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SolutionsSummary;

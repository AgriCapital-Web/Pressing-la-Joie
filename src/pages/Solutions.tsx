import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { solutions, services } from "@/data/offerings";

const OfferingGrid = ({ items, basePath }: { items: typeof solutions; basePath: string }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {items.map((o) => {
      const Icon = o.icon;
      return (
        <Card
          key={o.slug}
          className="h-full flex flex-col border-border/60 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
        >
          <CardContent className="p-6 flex flex-col h-full">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{o.title}</h3>
            <p className="text-sm text-primary/80 font-medium mb-3">{o.tagline}</p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
              {o.shortDescription}
            </p>
            <Button asChild variant="outline" className="w-full justify-between group">
              <Link to={`${basePath}/${o.slug}`}>
                En savoir plus
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      );
    })}
  </div>
);

const Solutions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Solutions & Services agricoles — AgriCapital</title>
        <meta
          name="description"
          content="Découvrez les solutions et services d'AgriCapital : valorisation foncière, plantations clé en main, gestion, pépinière, intrants, garantie d'écoulement et collecte."
        />
        <link rel="canonical" href="https://agricapital.ci/solutions" />
        <meta property="og:title" content="Solutions & Services agricoles — AgriCapital" />
        <meta property="og:url" content="https://agricapital.ci/solutions" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: [...solutions, ...services].map((o, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: o.title,
              url: `https://agricapital.ci/${o.type === "solution" ? "solutions" : "services"}/${o.slug}`,
            })),
          })}
        </script>
      </Helmet>

      <DynamicNavigation />

      <main className="pt-28 pb-20">
        {/* Header */}
        <section className="container mx-auto px-4 md:px-6 mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            Nos solutions
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 max-w-3xl">
            Des solutions adaptées à chaque profil et à chaque projet agricole
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
            AgriCapital accompagne particuliers, entrepreneurs, investisseurs, propriétaires
            fonciers, coopératives et institutions dans la création, le développement et la
            valorisation de plantations agricoles durables.
          </p>
        </section>

        {/* Solutions */}
        <section className="container mx-auto px-4 md:px-6 mb-20">
          <OfferingGrid items={solutions} basePath="/solutions" />
        </section>

        {/* Services */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="mb-10 max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
              Services agricoles
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3">
              Des services techniques pour accompagner producteurs et exploitations
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Une offre complète d'intrants, d'interventions terrain et de débouchés commerciaux
              pour sécuriser et valoriser votre production.
            </p>
          </div>
          <OfferingGrid items={services} basePath="/services" />
        </section>

        {/* CTA Partenariats */}
        <section className="container mx-auto px-4 md:px-6 mt-20">
          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Vous souhaitez construire un partenariat ?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Financiers, techniques, commerciaux ou institutionnels — découvrez comment
                  collaborer avec AgriCapital pour une agriculture performante et durable.
                </p>
              </div>
              <Button asChild size="lg" className="shrink-0">
                <Link to="/partenariats">Découvrir les partenariats</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Solutions;

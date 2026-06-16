import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import { findOffering, solutions, services } from "@/data/offerings";

interface Props {
  type: "solution" | "service";
}

const OfferingDetail = ({ type }: Props) => {
  const { slug } = useParams<{ slug: string }>();
  const offering = slug ? findOffering(slug) : undefined;

  if (!offering || offering.type !== type) {
    return <Navigate to={type === "solution" ? "/solutions" : "/services"} replace />;
  }

  const Icon = offering.icon;
  const related = (type === "solution" ? solutions : services).filter((o) => o.slug !== offering.slug).slice(0, 3);
  const basePath = type === "solution" ? "/solutions" : "/services";
  const url = `https://agricapital.ci${basePath}/${offering.slug}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`${offering.title} — AgriCapital`}</title>
        <meta name="description" content={offering.shortDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={`${offering.title} — AgriCapital`} />
        <meta property="og:description" content={offering.shortDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: offering.title,
            description: offering.shortDescription,
            provider: { "@type": "Organization", name: "AgriCapital", url: "https://agricapital.ci" },
            areaServed: "Côte d'Ivoire",
          })}
        </script>
      </Helmet>

      <DynamicNavigation />

      <main className="pt-28 pb-20">
        <article className="container mx-auto px-4 md:px-6 max-w-5xl">
          <Link
            to={basePath}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour {type === "solution" ? "aux solutions" : "aux services"}
          </Link>

          <header className="mb-10">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <Icon className="w-8 h-8" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              {type === "solution" ? "Solution" : "Service"}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{offering.title}</h1>
            <p className="text-lg text-primary/80 font-medium mb-6">{offering.tagline}</p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {offering.intro}
            </p>
          </header>

          <Card className="mb-10 border-border/60">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Nos prestations</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {offering.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground/90">{b}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {offering.closing && (
            <div className="mb-12 p-6 md:p-8 rounded-2xl bg-muted/40 border border-border/60">
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed">
                {offering.closing}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            <Button asChild size="lg" className="h-14 text-base">
              <Link to="/partenariat-demande">Démarrer mon projet</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 text-base">
              <Link to="/contact">Contacter un conseiller</Link>
            </Button>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {type === "solution" ? "Autres solutions" : "Autres services"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {related.map((r) => {
                  const RIcon = r.icon;
                  return (
                    <Link
                      key={r.slug}
                      to={`${basePath}/${r.slug}`}
                      className="group p-5 rounded-xl border border-border/60 hover:border-primary/40 hover:-translate-y-1 transition-all bg-card"
                    >
                      <RIcon className="w-6 h-6 text-primary mb-3" />
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {r.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        En savoir plus <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default OfferingDetail;

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Handshake } from "lucide-react";
import { partnerTypes, partnershipImpact } from "@/data/offerings";

const Partenariats = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Partenariats — AgriCapital</title>
        <meta
          name="description"
          content="Construisons ensemble une agriculture performante, inclusive et durable. Partenaires financiers, techniques, commerciaux et institutionnels : devenez partenaire d'AgriCapital."
        />
        <link rel="canonical" href="https://agricapital.ci/partenariats" />
        <meta property="og:title" content="Partenariats — AgriCapital" />
        <meta property="og:url" content="https://agricapital.ci/partenariats" />
      </Helmet>

      <DynamicNavigation />

      <main className="pt-28 pb-20">
        {/* Header */}
        <section className="container mx-auto px-4 md:px-6 mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            Partenariats
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 max-w-3xl">
            Construisons ensemble une agriculture performante, inclusive et durable
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Nous recherchons des partenaires engagés dans le développement durable de
            l'agriculture et la création de valeur au sein des territoires.
          </p>
        </section>

        {/* Partner types */}
        <section className="container mx-auto px-4 md:px-6 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partnerTypes.map((p) => {
              const Icon = p.icon;
              return (
                <Card
                  key={p.slug}
                  className="border-border/60 hover:border-primary/40 hover:-translate-y-1 transition-all"
                >
                  <CardContent className="p-6 md:p-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">{p.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{p.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Impact */}
        <section className="container mx-auto px-4 md:px-6 mb-16">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Ensemble, nous contribuons à
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Un impact mesurable pour les territoires, les producteurs et les filières agricoles.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 max-w-4xl">
            {partnershipImpact.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/90">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 md:px-6">
          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <Handshake className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Vous souhaitez devenir partenaire ?
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
                Présentez-nous votre projet de collaboration : nos équipes reviennent vers vous
                rapidement pour étudier ensemble les meilleures synergies.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link to="/partenariat-demande">Soumettre une demande</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/contact">Nous contacter</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Partenariats;

import { createFileRoute } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/flex/PublicHeader";
import { MapPin, Target, Heart, Rocket } from "lucide-react";

export const Route = createFileRoute("/about")({
  
  ssr: false,head: () => ({
    meta: [
      { title: "À propos — FlexCard" },
      { name: "description", content: "FlexCard est la première plateforme africaine de gestion de l'identité professionnelle et du networking intelligent." },
      { property: "og:title", content: "À propos — FlexCard" },
      { property: "og:description", content: "Notre mission, notre vision, et la communauté qui fait FlexCard." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <PublicHeader />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-black sm:text-5xl">
            Notre mission : <span className="text-gradient-brand">redonner sa carte à chacun.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            FlexCard est née d'un constat simple : trop de talents africains sont privés d'un outil de networking
            professionnel parce que les cartes physiques coûtent cher, se perdent, et deviennent obsolètes au moindre changement.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <Block icon={<Target className="h-5 w-5" />} title="Pour qui ?">
            Tous les pros : freelances, entrepreneurs, salariés, étudiants en stage, artisans, créatifs.
            Et toutes les entreprises qui veulent une identité professionnelle cohérente et toujours à jour.
          </Block>
          <Block icon={<Heart className="h-5 w-5" />} title="Pour quoi ?">
            Éliminer la barrière d'accès au networking. Le compte gratuit est complet : carte numérique,
            QR code, partage instantané. La version Premium imprimable n'est qu'à 1 000 F, à vie.
          </Block>
          <Block icon={<Rocket className="h-5 w-5" />} title="Roadmap">
            V1.0 : carte, QR, annuaire. V1.1 : mini-CRM des prospects.
            V1.2 : campagnes SMS / Email / WhatsApp en un clic et export vers Mailchimp, Brevo, HubSpot.
          </Block>
          <Block icon={<MapPin className="h-5 w-5" />} title="Où ?">
            Abidjan, Yamoussoukro, Bouaké, San-Pédro, Korhogo, Daloa…
            FlexCard est conçue pour les opérateurs locaux (MTN, Orange, Moov).
          </Block>
        </div>

        {/* Carte (placeholder) */}
        <div className="mt-16 surface-elevated overflow-hidden">
          <div className="relative h-72 bg-gradient-brand">
            <div className="absolute inset-0 grid-noise opacity-30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
              <MapPin className="h-10 w-10 opacity-80" />
              <div className="mt-2 text-lg font-semibold">Carte des utilisateurs FlexCard</div>
              <div className="text-sm opacity-80">Visualisation interactive — bientôt disponible</div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          FlexCard est un produit IKNov · © 2026 · Une carte. Mille connexions.
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}

function Block({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="surface-elevated p-6">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}

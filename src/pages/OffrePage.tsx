import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, CheckCircle2, Leaf, MapPinned, ShieldCheck, Sprout, Timer, Users,
} from "lucide-react";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ContactCTA, { contactCtaLabel } from "@/components/ContactCTA";
import palmInvestHero from "@/assets/offre-palminvest-hero.jpg";
import terraPalmHero from "@/assets/offre-terrapalm-hero.jpg";

export type OffreKey = "palminvest" | "terrapalm";

const OFFERS = {
  palminvest: {
    name: "PalmInvest",
    eyebrow: "Pour les souscripteurs sans foncier",
    title: "Devenez propriétaire d'une plantation de palmier à huile, sans posséder de terre.",
    intro:
      "AgriCapital sécurise le foncier, crée votre plantation clé en main et vous la remet productive. Vous devenez propriétaire d'un patrimoine agricole tangible, cartographié et sécurisé par contrat, sans aucune contrainte technique.",
    image: palmInvestHero,
    alt: "Technicien AgriCapital tenant des plants de palmier à huile certifiés en pépinière",
    highlights: [
      { icon: MapPinned, title: "Foncier sécurisé par AgriCapital", desc: "Identification, vérification et sécurisation de la parcelle. Levé GPS et plan cartographique remis." },
      { icon: Sprout, title: "Plantation clé en main", desc: "143 plants Tenera certifiés/ha, nettoyage, piquetage, plantation, intrants et fertilisation." },
      { icon: Timer, title: "Remise à 36 mois", desc: "Une plantation entrée en production, livrée opérationnelle et documentée." },
      { icon: ShieldCheck, title: "Garantie d'écoulement 25 ans", desc: "Débouchés sécurisés auprès de nos partenaires industriels tout au long du cycle." },
    ],
    variants: [
      {
        name: "PalmInvest",
        desc: "Vous reprenez la gestion de votre plantation après la remise.",
        points: ["Gestion autonome après remise", "100 % des revenus pendant 25 ans", "Suivi agronomique et fourniture d'intrants", "Portail client digital"],
      },
      {
        name: "PalmInvest+",
        desc: "AgriCapital gère intégralement votre plantation pour vous.",
        points: ["Gestion entièrement déléguée", "75 % des revenus reversés", "Entretien, récolte et commercialisation pris en charge", "Rapports et photos terrain"],
      },
    ],
  },
  terrapalm: {
    name: "TerraPalm",
    eyebrow: "Pour les propriétaires fonciers",
    title: "Vous avez la terre. Nous la transformons en plantation productive.",
    intro:
      "Votre foncier dort ? AgriCapital le valorise intégralement : études, cartographie, création de la plantation et suivi agronomique. Vous restez propriétaire de votre terre et devenez propriétaire d'une plantation à forte valeur.",
    image: terraPalmHero,
    alt: "Famille propriétaire foncière et agronome AgriCapital effectuant un levé GPS sur une parcelle plantée",
    highlights: [
      { icon: Leaf, title: "Votre terre reste la vôtre", desc: "Aucune cession de propriété. AgriCapital intervient comme opérateur de valorisation." },
      { icon: MapPinned, title: "Cartographie et documentation", desc: "Levé topographique GPS, plan parcellaire et dossier technique complet." },
      { icon: Sprout, title: "Création de plantation", desc: "Plants certifiés, préparation du terrain, plantation, intrants et 6 visites techniques." },
      { icon: Users, title: "Accompagnement 25 ans", desc: "Conseil agronomique continu et garantie d'écoulement de votre production." },
    ],
    variants: [
      {
        name: "TerraPalm",
        desc: "Votre plantation vous est remise, vous en assurez la gestion.",
        points: ["Gestion autonome après remise", "100 % des revenus pendant 25 ans", "Suivi agronomique et fourniture d'intrants", "Portail client digital"],
      },
      {
        name: "TerraPalm+",
        desc: "AgriCapital exploite et gère la plantation à votre place.",
        points: ["Gestion entièrement déléguée", "75 % des revenus reversés", "Entretien, récolte et commercialisation pris en charge", "Rapports et photos terrain"],
      },
    ],
  },
} as const;

const STEPS = [
  "Identification et sécurisation de la parcelle",
  "Levé GPS, cartographie et documentation",
  "Signature du contrat et remise du plan parcellaire",
  "Développement de la plantation sur 36 mois",
  "Remise de la plantation et accompagnement long terme",
];

const OffrePage = ({ offer }: { offer: OffreKey }) => {
  const data = OFFERS[offer];
  const other = offer === "palminvest" ? OFFERS.terrapalm : OFFERS.palminvest;
  const otherPath = offer === "palminvest" ? "/terrapalm" : "/palminvest";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${data.name} — Plantation de palmier à huile clé en main | AgriCapital`}
        description={data.intro.slice(0, 155)}
      />
      <DynamicNavigation />

      <header className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="mb-4 inline-block rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
              {data.eyebrow}
            </p>
            <h1 className="mb-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">{data.title}</h1>
            <p className="max-w-xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">{data.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ContactCTA>
                <Button size="lg" variant="secondary">{contactCtaLabel()}</Button>
              </ContactCTA>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link to={otherPath}>Découvrir {other.name}</Link>
              </Button>
            </div>
          </div>
          <img
            src={data.image}
            alt={data.alt}
            width={1600}
            height={1008}
            className="h-[320px] w-full rounded-2xl object-cover shadow-strong lg:h-[440px]"
          />
        </div>
      </header>

      <section className="py-14 lg:py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold sm:text-3xl">Ce qui est inclus</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.highlights.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="h-full border-border/60">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-base font-bold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-14 lg:py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold sm:text-3xl">Deux formules, un même standard d'exigence</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {data.variants.map((v) => (
              <Card key={v.name} className="h-full border-primary/20">
                <CardContent className="p-7">
                  <h3 className="text-xl font-black text-primary">{v.name}</h3>
                  <p className="mb-5 mt-2 text-sm text-muted-foreground">{v.desc}</p>
                  <ul className="space-y-3">
                    {v.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Les conditions financières détaillées sont communiquées lors d'un entretien personnalisé avec un conseiller AgriCapital.
          </p>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold sm:text-3xl">Comment ça se passe</h2>
          <ol className="grid gap-4 md:grid-cols-5">
            {STEPS.map((s, i) => (
              <li key={s} className="rounded-xl border border-border/60 bg-card p-5">
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="text-sm font-medium leading-relaxed">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-primary py-14 text-primary-foreground lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mx-auto mb-4 max-w-3xl text-2xl font-black sm:text-4xl">
            Prêt à bâtir votre patrimoine agricole ?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/85">
            Un conseiller AgriCapital vous rappelle et étudie votre projet, avec ou sans foncier.
          </p>
          <ContactCTA>
            <Button size="lg" variant="secondary">
              {contactCtaLabel()} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </ContactCTA>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OffrePage;

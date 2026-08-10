import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, MapPin, Globe, ArrowRight, Sprout, HandHeart } from "lucide-react";
const heroAsset = { url: "/plantation-cle-main.png" };

const OFFRES = [
  "Valorisation & mise à disposition foncière",
  "Construction d'un patrimoine agricole durable",
  "Mise en place complète de la plantation",
  "Facilitation de l'écoulement de la production",
  "Suivi technique et agronomique (28 ans)",
  "Plantation développée et remise prête à produire",
];

const Solutions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Solutions & Services — Nous bâtissons votre patrimoine agricole durable | AgriCapital</title>
        <meta
          name="description"
          content="Avec ou sans terre, AgriCapital développe et gère pour vous des plantations de palmier à huile clé en main. TerraPalm & PalmInvest : gestion intégrale jusqu'à 28 ans."
        />
        <link rel="canonical" href="https://agricapital.ci/solutions" />
      </Helmet>

      <DynamicNavigation />

      <main className="pt-24 pb-16">
        {/* HERO — Nous bâtissons votre patrimoine agricole durable */}
        <section className="container mx-auto px-4 md:px-6 mb-14">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                <span className="text-primary block">Nous bâtissons</span>
                <span className="text-primary block">votre patrimoine</span>
                <span className="text-[#ed7500] block">agricole durable</span>
              </h1>
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed max-w-xl">
                Avec ou sans terre, AgriCapital développe et gère pour vous des plantations
                de palmier à huile clé en main.
              </p>
            </div>
            <div className="relative order-first lg:order-last">
              <img
                src={heroAsset.url}
                alt="AgriCapital — remise d'un plateau de jeunes palmiers"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="w-full h-auto object-contain max-h-[280px] sm:max-h-[380px] lg:max-h-[520px] mx-auto"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.jpeg"; }}
              />
            </div>
          </div>
        </section>

        {/* NOS SOLUTIONS pill */}
        <div className="flex justify-center mb-10">
          <span className="inline-flex items-center px-8 py-3 rounded-full bg-primary text-primary-foreground text-sm md:text-base font-bold uppercase tracking-widest shadow-lg">
            Nos Solutions
          </span>
        </div>

        {/* 2 cartes — TerraPalm & PalmInvest */}
        <section className="container mx-auto px-4 md:px-6 mb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* TerraPalm */}
            <Card className="border-2 border-[#ed7500]/60 hover:border-[#ed7500] transition-all overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#ed7500] text-white flex items-center justify-center shrink-0">
                    <Sprout className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-[#ed7500]">
                      Valorisation Foncière
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Vous avez déjà la terre ?</p>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-primary flex items-center gap-2 mb-3">
                  <Check className="w-6 h-6 text-primary" /> TerraPalm
                </h3>
                <p className="text-sm md:text-base text-foreground/85 leading-relaxed">
                  Nous la transformons en plantation productive de palmier à huile (36 mois).
                  <br />
                  <span className="font-semibold">Gestion intégrale optionnelle jusqu'à 28 ans.</span>
                </p>
              </CardContent>
            </Card>

            {/* PalmInvest */}
            <Card className="border-2 border-primary/60 hover:border-primary transition-all overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <HandHeart className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-primary">
                      Accompagnement Intégral
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Vous n'avez pas de terre ?</p>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-primary flex items-center gap-2 mb-3">
                  <Check className="w-6 h-6 text-primary" /> PalmInvest
                </h3>
                <p className="text-sm md:text-base text-foreground/85 leading-relaxed">
                  Nous mettons à votre disposition un foncier sécurisé et développons votre
                  plantation clé en main (36 mois).
                  <br />
                  <span className="font-semibold">Gestion intégrale optionnelle jusqu'à 28 ans.</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CE QUE COMPRENNENT NOS OFFRES */}
        <section className="container mx-auto px-4 md:px-6 mb-14">
          <Card className="border-2 border-primary/40 bg-primary/5">
            <CardContent className="p-6 md:p-10">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-primary uppercase tracking-wide mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <HandHeart className="w-5 h-5" />
                </span>
                Ce que comprennent nos offres
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {OFFRES.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-foreground/90 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* ESPACE CLIENT DIGITAL */}
        <section className="container mx-auto px-4 md:px-6 mb-14">
          <div className="max-w-4xl">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-[#ed7500] underline underline-offset-4 mb-4">
              Espace Client Digital AgriCapital
            </h2>
            <p className="text-sm md:text-base text-foreground/85 leading-relaxed font-medium">
              Un portail sécurisé vous permettant d'effectuer vos paiements mensuels, de suivre
              l'évolution de votre plantation, d'accéder à vos documents, rapports, photos et
              vidéos de terrain, et d'échanger avec nos équipes tout au long du cycle de
              production.
            </p>
          </div>
        </section>

        {/* Footer band — coordonnées */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="rounded-2xl bg-primary text-primary-foreground p-6 md:p-8 grid gap-4 md:grid-cols-2 items-center">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-[#ed7500] shrink-0" />
              <p className="text-sm md:text-base font-semibold">
                Gonaté – Daloa | 6J/7 – 08h à 18h
              </p>
            </div>
            <div className="flex items-center gap-3 md:justify-end">
              <Globe className="w-6 h-6 text-[#ed7500] shrink-0" />
              <p className="text-sm md:text-base font-semibold">
                Portail client :{" "}
                <a href="https://client.agricapital.ci" className="underline">
                  client.agricapital.ci
                </a>
              </p>
            </div>
          </div>
          <p className="text-center text-primary text-xl md:text-2xl lg:text-3xl font-extrabold mt-8">
            Investir la terre. Cultiver l'avenir.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button asChild size="lg">
              <Link to="/souscrire">Rejoindre AgriCapital <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/partenariats">Découvrir les partenariats</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Solutions;

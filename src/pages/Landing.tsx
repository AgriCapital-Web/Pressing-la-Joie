import { Link } from "react-router-dom";
import { Shirt, Clock, Truck, Shield, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVICE_PRESETS } from "@/lib/constants";
import logoImg from "@/assets/logo-lajoie.jpeg";

const features = [
  { icon: Shirt, title: "Nettoyage Expert", desc: "Soin professionnel pour tous types de vêtements" },
  { icon: Clock, title: "Service Rapide", desc: "Prêt en 24-48h selon le service" },
  { icon: Truck, title: "Collecte à domicile", desc: "On vient chercher et livrer vos vêtements" },
  { icon: Shield, title: "Garantie Qualité", desc: "Satisfaction garantie ou reprise gratuite" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="La Joie Pressing" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <h1 className="text-lg font-bold text-foreground">La Joie Pressing</h1>
              <p className="text-xs text-muted-foreground">La propreté, notre métier</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm">Connexion</Button>
            </Link>
            <Link to="/track">
              <Button size="sm">Suivre ma commande</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center">
        <div className="container max-w-3xl">
          <img src={logoImg} alt="La Joie Pressing" className="mx-auto mb-8 h-32 w-32 rounded-full object-cover shadow-card" />
          <h2 className="mb-4 text-4xl font-bold text-foreground">
            Votre satisfaction, notre fierté.
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Service de pressing professionnel avec collecte et livraison à domicile.
            Confiez-nous vos vêtements, on s'occupe du reste.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/track">
              <Button size="lg">Suivre ma commande</Button>
            </Link>
            <a href="#tarifs">
              <Button variant="outline" size="lg">Voir les tarifs</Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-card py-16">
        <div className="container">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-lg bg-background p-6 shadow-card animate-fade-in">
                <f.icon className="mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-1 font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="py-16">
        <div className="container max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">Nos Tarifs</h2>
          <div className="rounded-lg bg-card shadow-card overflow-hidden">
            <div className="divide-y">
              {SERVICE_PRESETS.map((s) => (
                <div key={s.name} className="flex items-center justify-between px-6 py-4">
                  <span className="font-medium text-foreground">{s.name}</span>
                  <span className="font-semibold tabular-nums text-primary">
                    {s.price.toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t bg-card py-16">
        <div className="container max-w-2xl text-center">
          <h2 className="mb-6 text-2xl font-bold text-foreground">Contactez-nous</h2>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>+33 1 23 45 67 89</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>123 Rue du Pressing, 75001 Paris</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} La Joie Pressing. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/flex/PublicHeader";

export const Route = createFileRoute("/confidentialite")({
  ssr: false,
  head: () => ({ meta: [{ title: "Politique de confidentialité — FlexCard" }] }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold">Politique de confidentialité</h1>
        <p className="mt-2 text-sm text-muted-foreground">Dernière mise à jour : juin 2026</p>

        <div className="prose prose-neutral mt-10 max-w-none space-y-6 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold">1. Données collectées</h2>
            <p>FlexCard collecte uniquement les données nécessaires à la création et au partage de votre carte de visite numérique : nom, prénom, titre, secteur, photo de profil, numéro(s) de téléphone, email, liens réseaux sociaux, localisation déclarée.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">2. Utilisation</h2>
            <p>Vos données servent exclusivement à : afficher votre carte publique, générer votre QR, lier vos prospects, calculer vos commissions de parrainage et vous notifier des changements importants.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">3. Partage</h2>
            <p>Aucune donnée n'est revendue. Vos informations ne sont visibles que via votre URL personnalisée ou votre QR code, partagés à votre initiative.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">4. Sécurité</h2>
            <p>Chiffrement AES-256 au repos, TLS 1.3 en transit. Authentification par OTP à usage unique. Aucun mot de passe stocké.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">5. Vos droits</h2>
            <p>Vous pouvez à tout moment modifier, exporter ou supprimer vos données depuis votre tableau de bord, ou nous écrire à <a className="text-primary" href="mailto:contact@flexcard.app">contact@flexcard.app</a>.</p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

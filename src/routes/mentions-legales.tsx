import { createFileRoute } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/flex/PublicHeader";

export const Route = createFileRoute("/mentions-legales")({
  ssr: false,
  head: () => ({ meta: [{ title: "Mentions légales — FlexCard" }] }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold">Mentions légales</h1>
        <div className="mt-10 space-y-6 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold">Éditeur</h2>
            <p>FlexCard est édité par <strong>IKNov</strong>, porteur : Inocent KOFFI.<br />Contact : contact@flexcard.app · Abidjan, Côte d'Ivoire.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Hébergement</h2>
            <p>Vercel Inc. (frontend) — Supabase (base de données et fichiers).</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Propriété intellectuelle</h2>
            <p>Logo, marque, nom commercial « FlexCard » et slogan « Une carte. Mille connexions. » sont la propriété exclusive d'IKNov. Toute reproduction est interdite sans autorisation écrite.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Responsabilité</h2>
            <p>Les utilisateurs sont responsables des informations qu'ils publient sur leur carte. FlexCard se réserve le droit de suspendre tout compte contraire à ses conditions d'utilisation.</p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

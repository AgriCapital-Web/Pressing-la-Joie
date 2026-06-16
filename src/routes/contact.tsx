import { createFileRoute } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/flex/PublicHeader";
import { useState } from "react";
import { Mail, MessageCircle, Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  
  ssr: false,head: () => ({
    meta: [
      { title: "Contact — FlexCard" },
      { name: "description", content: "Une question, un partenariat, un besoin entreprise ? Écris-nous." },
      { property: "og:title", content: "Contact — FlexCard" },
      { property: "og:description", content: "L'équipe IKNov te répond rapidement." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen">
      <PublicHeader />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-black sm:text-5xl">
              Parle à <span className="text-gradient-brand">IKNov</span>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-md">
              Question, partenariat, besoin entreprise sur-mesure — on répond sous 24h ouvrées.
            </p>
            <div className="mt-8 space-y-3">
              <a href="mailto:hello@flexcard.app" className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 hover:bg-secondary">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Mail className="h-5 w-5" /></span>
                <div>
                  <div className="text-sm font-semibold">hello@flexcard.app</div>
                  <div className="text-xs text-muted-foreground">Email général</div>
                </div>
              </a>
              <a href="https://wa.me/22507000000" className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 hover:bg-secondary">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success"><MessageCircle className="h-5 w-5" /></span>
                <div>
                  <div className="text-sm font-semibold">+225 07 00 00 00</div>
                  <div className="text-xs text-muted-foreground">WhatsApp Business</div>
                </div>
              </a>
            </div>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="surface-elevated p-6 sm:p-8"
          >
            {sent ? (
              <div className="flex flex-col items-center text-center py-10">
                <CheckCircle2 className="h-12 w-12 text-success" />
                <h3 className="mt-4 text-xl font-semibold">Message envoyé !</h3>
                <p className="mt-2 text-sm text-muted-foreground">On revient vers toi très vite.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold">Envoie ton message</h3>
                <div className="mt-5 space-y-4">
                  <Field label="Ton nom" name="name" required />
                  <Field label="Ton email" name="email" type="email" required />
                  <Field label="Sujet" name="subject" required />
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <textarea required rows={5} className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-brand" />
                  </div>
                  <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-glow">
                    <Send className="h-4 w-4" /> Envoyer
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}

function Field({ label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input {...rest} className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-brand" />
    </div>
  );
}

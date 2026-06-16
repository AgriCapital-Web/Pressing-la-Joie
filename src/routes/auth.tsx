import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PublicHeader } from "@/components/flex/PublicHeader";
import { useApp } from "@/lib/mock/store";
import { DEMO_ACCOUNTS } from "@/lib/mock/seed";
import { useState } from "react";
import { Mail, KeyRound, ArrowRight, CheckCircle2, User2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  
  ssr: false,head: () => ({ meta: [{ title: "Connexion — FlexCard" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const requestOtp = useApp((s) => s.requestOtp);
  const verifyOtp = useApp((s) => s.verifyOtp);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setError("Email invalide"); return; }
    setError("");
    requestOtp(email);
    setStep("otp");
  };

  const submitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = verifyOtp(email, otp);
    if (!profile) { setError("Code invalide. Pour la démo : 123456"); return; }
    if (!profile.firstName) navigate({ to: "/onboarding" });
    else navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <PublicHeader />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="surface-elevated p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <KeyRound className="h-3.5 w-3.5" /> Sans mot de passe · OTP par email
          </div>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
            {step === "email" ? "Bienvenue sur FlexCard" : "Vérifie ton email"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {step === "email"
              ? "Entre ton email — on t'envoie un code à 6 chiffres."
              : `Code envoyé à ${email}. Pour la démo, utilise 123456.`}
          </p>

          {step === "email" ? (
            <form onSubmit={submitEmail} className="mt-8 space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:ring-brand">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent py-3 text-sm outline-none"
                    placeholder="prenom@exemple.com"
                  />
                </div>
              </div>
              {error && <div className="text-sm text-destructive">{error}</div>}
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-glow">
                Recevoir mon code <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={submitOtp} className="mt-8 space-y-4">
              <div>
                <label className="text-sm font-medium">Code à 6 chiffres</label>
                <input
                  inputMode="numeric" pattern="[0-9]*" maxLength={6} autoFocus
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:ring-brand"
                  placeholder="••••••"
                />
              </div>
              {error && <div className="text-sm text-destructive">{error}</div>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep("email")} className="rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold">
                  Retour
                </button>
                <button className="flex-1 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-glow">
                  Valider
                </button>
              </div>
              <div className="rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                <CheckCircle2 className="inline h-3.5 w-3.5 mr-1 text-success" />
                Mode démo — code universel : <strong>123456</strong>
              </div>
            </form>
          )}
        </div>

        <div className="surface-elevated p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <User2 className="h-4 w-4 text-primary" /> Comptes de démonstration
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Clique sur un compte pour pré-remplir l'email.</p>
          <ul className="mt-4 max-h-[480px] overflow-y-auto divide-y divide-border/60">
            {DEMO_ACCOUNTS.map((a) => (
              <li key={a.email}>
                <button
                  type="button"
                  onClick={() => { setEmail(a.email); setStep("email"); }}
                  className="flex w-full items-start gap-3 px-2 py-3 text-left hover:bg-secondary/60 rounded-lg"
                >
                  <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">
                    {a.name.split(" ").map((p) => p[0]).join("").slice(0,2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{a.name}</span>
                      {a.kind === "entreprise" && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">ENTREPRISE</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{a.title} · {a.email}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

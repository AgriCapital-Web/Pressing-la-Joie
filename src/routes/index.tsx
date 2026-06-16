import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/flex/PublicHeader";
import { useStats } from "@/lib/mock/store";
import { useEffect, useRef, useState } from "react";
import {
  ScanLine, Search, ArrowRight, Sparkles, QrCode, Zap, Globe, Users, Crown,
  Mic, Keyboard, User, Store, Building2, Gift, TrendingUp, ShieldCheck,
  Check, X, MapPin, Star,
} from "lucide-react";
import { fmt } from "@/lib/mock/utils";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "FlexCard — Une carte. Mille connexions." },
      { name: "description", content: "La carte de visite numérique d'Afrique. Particuliers, informels, entreprises. Interface vocale pour tous. Partage instantané par QR code." },
      { property: "og:title", content: "FlexCard — Une carte. Mille connexions." },
      { property: "og:description", content: "La première plateforme africaine d'identité professionnelle et de networking intelligent." },
    ],
  }),
  component: HomePage,
});

/* ---------- Speech helper ---------- */
function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 0.95;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  } catch {}
}

/* ---------- Page ---------- */
function HomePage() {
  const stats = useStats();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"phone" | "printer">("phone");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = query.trim();
    if (!t) return;
    if (mode === "printer" || /^FX-/i.test(t)) {
      navigate({ to: "/print/$code", params: { code: t.toUpperCase() } });
    } else {
      navigate({ to: "/directory", search: { q: t } });
    }
  };

  return (
    <div className="min-h-screen">
      <PublicHeader />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grid-noise opacity-30 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div className="animate-float-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Lancement Afrique de l'Ouest · 2026
              </div>
              <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
                Une carte.
                <br />
                <span className="text-gradient-brand">Mille connexions.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                La carte de visite numérique pour <strong>tous</strong> les acteurs économiques d'Afrique :
                particuliers, vendeuses de marché, artisans, entreprises. Même sans savoir lire ni écrire — grâce à l'interface vocale.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-glow hover:opacity-95"
                >
                  Créer ma carte gratuite <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() =>
                    alert("Caméra QR — la lecture caméra sera activée à l'intégration backend. Pour démo : /c/inocent-koffi")
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold hover:bg-secondary"
                >
                  <ScanLine className="h-4 w-4" /> Scanner un QR
                </button>
              </div>

              {/* Search / Annuaire / Code imprimeur */}
              <form onSubmit={submit} className="mt-8 max-w-xl">
                <div className="flex gap-1 rounded-full border border-border bg-card p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setMode("phone")}
                    className={`flex-1 rounded-full px-3 py-1.5 transition ${
                      mode === "phone" ? "bg-gradient-brand text-white" : "text-muted-foreground"
                    }`}
                  >
                    Annuaire (téléphone)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("printer")}
                    className={`flex-1 rounded-full px-3 py-1.5 transition ${
                      mode === "printer" ? "bg-gradient-brand text-white" : "text-muted-foreground"
                    }`}
                  >
                    Code imprimeur
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-card focus-within:ring-brand">
                  <Search className="ml-2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={mode === "phone" ? "+225 07 12 34 56 78" : "FX-XXXX-XXXX-XXXX"}
                    className="flex-1 bg-transparent px-2 py-2 text-sm outline-none"
                  />
                  <button className="rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white">
                    {mode === "phone" ? "Voir mes pros" : "Ouvrir"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {mode === "phone"
                    ? "Saisis ton numéro : tu retrouves l'annuaire des pros qui t'ont déjà scanné."
                    : "Code unique imprimeur : ouvre le portail d'impression de la carte premium."}
                </p>
              </form>
            </div>

            {/* Counters live */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-float-up [animation-delay:120ms]">
              <CounterCard label="Utilisateurs" value={fmt(stats.total)} icon={<Users className="h-5 w-5" />} pulse />
              <CounterCard label="Cartes Premium" value={fmt(stats.premium)} icon={<Crown className="h-5 w-5" />} accent />
              <CounterCard label="Pros & entreprises" value={fmt(stats.pro)} icon={<Building2 className="h-5 w-5" />} />
              <DemoCard />
            </div>
          </div>
        </div>
      </section>

      {/* ============ CRÉER MA CARTE — 2 options ============ */}
      <CreateCardSection />

      {/* ============ QUI PEUT UTILISER FLEXCARD ============ */}
      <ProfilesSection />

      {/* ============ PARRAINAGE ============ */}
      <ReferralSection />

      {/* ============ POURQUOI FLEXCARD - COMPARAISON ============ */}
      <WhySection />

      {/* ============ TÉMOIGNAGES ============ */}
      <TestimonialsSection />

      {/* ============ CTA FINAL ============ */}
      <section className="mx-auto my-12 max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-10 text-white shadow-elev sm:p-16">
          <div className="absolute inset-0 grid-noise opacity-20 pointer-events-none" />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h3 className="text-3xl font-bold sm:text-4xl">Prêt à passer au numérique ?</h3>
              <p className="mt-3 max-w-xl opacity-90">
                Crée ton compte en 30 secondes. Email + OTP, pas de mot de passe.
                Carte premium imprimable à <strong>1 000 F</strong>, achat unique à vie.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link to="/auth" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary hover:opacity-95">
                Créer ma carte
              </Link>
              <Link to="/about" className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold">
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

/* ============ COMPONENTS ============ */

function CounterCard({
  label, value, icon, pulse, accent,
}: { label: string; value: string; icon: React.ReactNode; pulse?: boolean; accent?: boolean }) {
  return (
    <div className={`surface-elevated relative overflow-hidden p-5 ${accent ? "bg-gradient-brand text-white border-0" : ""}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-70">
        {icon} {label}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-4xl font-black tracking-tight">{value}</div>
        {pulse && <span className="inline-block h-2.5 w-2.5 rounded-full bg-success animate-pulse-ring" aria-hidden />}
      </div>
      <div className="mt-1 text-xs opacity-60">en temps réel</div>
    </div>
  );
}

function DemoCard() {
  return (
    <Link
      to="/c/$slug"
      params={{ slug: "inocent-koffi" }}
      className="col-span-2 group surface-elevated p-5 hover:shadow-elev transition"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Démo</div>
          <div className="mt-1 text-base font-semibold">Voir une carte FlexCard</div>
          <div className="text-sm text-muted-foreground">Inocent Koffi · IKNov</div>
        </div>
        <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

/* ----- Section "Créer ma carte" ----- */
function CreateCardSection() {
  const announced = useRef(false);
  useEffect(() => {
    if (announced.current) return;
    announced.current = true;
    // léger délai pour laisser charger les voix
    const t = setTimeout(() => {
      speak("Vous ne savez pas lire et écrire ? Cliquez sur le micro pour créer votre carte par la voix.");
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Crée ta carte en 2 minutes</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Choisis ta méthode préférée. La voix s'adresse à tous ceux qui n'écrivent pas — artisans, commerçants, vendeurs ambulants.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Saisie manuelle */}
        <Link
          to="/auth"
          className="group relative overflow-hidden rounded-3xl border-2 border-border bg-card p-8 transition hover:border-primary/40 hover:shadow-elev"
        >
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-brand opacity-10 blur-2xl transition group-hover:opacity-25" />
          <div className="relative">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow">
              <Keyboard className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-2xl font-bold">✏️ Saisie manuelle</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Pour celles et ceux à l'aise à l'écrit. 100+ templates au choix, palette dérivée automatiquement de ton logo.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Commencer <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </div>
        </Link>

        {/* Vocal */}
        <button
          type="button"
          onMouseEnter={() => speak("Cliquez ici pour créer votre carte par la voix.")}
          onClick={() => {
            speak("Bienvenue. Je vais vous guider, étape par étape.");
            // route /onboarding existante — la flow vocal arrive en Lot 3
            window.location.assign("/onboarding?mode=voice");
          }}
          className="group relative overflow-hidden rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/5 via-card to-card p-8 text-left transition hover:border-primary hover:shadow-elev"
        >
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/20 blur-2xl transition group-hover:bg-primary/30" />
          <div className="relative">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow animate-pulse-ring">
              <Mic className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-2xl font-bold">🎤 Interface vocale</h3>
            <p className="mt-2 text-sm text-foreground/80">
              <strong>Vous ne savez pas lire et écrire ?</strong> Cliquez sur le micro.
              Je vous pose les questions à voix haute. Vous me répondez à voix haute.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Pensé pour les artisans, commerçants, vendeurs ambulants, tailleurs, coiffeuses, mécaniciens, cuisinières.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Parler maintenant <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </div>
        </button>
      </div>
    </section>
  );
}

/* ----- 3 profils ----- */
function ProfilesSection() {
  const items = [
    {
      icon: <User className="h-7 w-7" />,
      title: "Particulier / Professionnel",
      desc: "Employés, étudiants, professions libérales, élus, médecins, avocats, enseignants. Carte personnelle complète, 100+ templates.",
      cta: "Je suis particulier",
      kind: "particulier",
    },
    {
      icon: <Store className="h-7 w-7" />,
      title: "Activité informelle",
      desc: "Commerçants, artisans, vendeurs ambulants, tailleurs, coiffeuses, mécaniciens, cuisinières. Formulaire simplifié, WhatsApp prioritaire, interface vocale disponible.",
      cta: "Je suis informel",
      kind: "informel",
    },
    {
      icon: <Building2 className="h-7 w-7" />,
      title: "Entreprise / Organisation",
      desc: "SARL, SA, ONG, cabinets, administrations. Charte graphique unique, employés rattachés, gratuit jusqu'à 3 personnes.",
      cta: "Je suis une entreprise",
      kind: "entreprise",
    },
  ];

  return (
    <section className="border-y border-border/60 bg-gradient-to-b from-secondary/30 via-background to-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Qui peut utiliser FlexCard ?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Trois profils, trois formulaires adaptés à la réalité économique africaine.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((it) => (
            <Link
              key={it.kind}
              to="/auth"
              search={{ kind: it.kind } as any}
              className="group surface-elevated relative overflow-hidden p-7 transition hover:shadow-elev"
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow">
                {it.icon}
              </div>
              <h3 className="mt-5 text-xl font-bold">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                {it.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----- Parrainage ----- */
function ReferralSection() {
  const levels = [
    { name: "Découverte", color: "linear-gradient(135deg,#9ca3af,#6b7280)", desc: "Dès l'inscription" },
    { name: "Bronze", color: "linear-gradient(135deg,#cd7f32,#8b4513)", desc: "Solde > 2 500 F" },
    { name: "Argent", color: "linear-gradient(135deg,#e5e7eb,#9ca3af)", desc: "Solde > 10 000 F" },
    { name: "Or", color: "linear-gradient(135deg,#fbbf24,#d97706)", desc: "Solde > 50 000 F" },
    { name: "Saphir", color: "linear-gradient(135deg,#3b82f6,#1d4ed8)", desc: "Solde > 150 000 F" },
    { name: "Diamant", color: "linear-gradient(135deg,#67e8f9,#0891b2)", desc: "Solde > 500 000 F" },
    { name: "Platine", color: "linear-gradient(135deg,#1f2937,#0b1220)", desc: "Solde > 1 000 000 F" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
            <Gift className="h-3.5 w-3.5" /> Programme parrainage
          </div>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Invitez. Gagnez. Encaissez.</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Chaque utilisateur reçoit un <strong>code parrain à 6 chiffres</strong>.
            Tu gagnes <strong className="text-primary">20%</strong> à chaque filleul payant,
            et <strong className="text-primary">10%</strong> à chaque renouvellement.
            Encaisse via Wave, crédite un plan ou booste ta visibilité.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat icon={<TrendingUp />} value="20%" label="par filleul" />
            <Stat icon={<Gift />} value="10%" label="renouvellements" />
            <Stat icon={<ShieldCheck />} value="7" label="niveaux fidélité" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-glow">
              Créer mon compte et parrainer <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Carte fidélité virtuelle - aperçu Or */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-mesh blur-3xl opacity-60" />
          <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
            {levels.map((lvl, i) => (
              <div
                key={lvl.name}
                className="relative overflow-hidden rounded-2xl p-4 text-white shadow-elev"
                style={{ background: lvl.color, transform: `translateY(${(i % 2) * 12}px)` }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-widest opacity-80">FlexCard</div>
                <div className="mt-6 text-lg font-bold">{lvl.name}</div>
                <div className="mt-1 text-[11px] opacity-80">{lvl.desc}</div>
                <div className="mt-3 text-[10px] font-mono opacity-70">•••• •••• ••••</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="surface-elevated p-4">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="mt-2 text-2xl font-black">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

/* ----- Pourquoi (comparaison physique vs numérique) ----- */
function WhySection() {
  const physical = [
    "Coût d'impression à chaque changement",
    "Perte, gaspillage, dégradation",
    "Numéro / poste périmé = carte morte",
    "Contacts perdus définitivement",
    "Aucune analytics, aucun suivi",
  ];
  const digital = [
    "Mise à jour automatique en temps réel",
    "QR + URL — partage instantané",
    "Suivi des prospects, scans, visites",
    "100+ templates, charte auto depuis logo",
    "Annuaire intelligent + parrainage rémunéré",
  ];

  return (
    <section className="border-y border-border/60 bg-secondary/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Pourquoi passer au numérique ?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            La carte papier coûte cher, se perd et se périme. FlexCard, c'est l'inverse.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="surface-elevated p-7">
            <div className="flex items-center gap-2 text-destructive">
              <X className="h-5 w-5" />
              <h3 className="text-lg font-bold">Carte papier</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {physical.map((x) => (
                <li key={x} className="flex items-start gap-2 text-muted-foreground">
                  <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="surface-elevated relative overflow-hidden border-primary/30 p-7">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-brand opacity-20 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-success">
                <Check className="h-5 w-5" />
                <h3 className="text-lg font-bold">FlexCard numérique</h3>
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                {digital.map((x) => (
                  <li key={x} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Mini-features */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Feature icon={<Zap />} title="Toujours à jour" desc="Modifie ton poste, ton numéro — tout se met à jour dans la poche de tes contacts." />
          <Feature icon={<QrCode />} title="QR code + URL" desc="flexcard.app/nomutilisateur. Scanné = enregistré dans l'annuaire." />
          <Feature icon={<Globe />} title="Annuaire intelligent" desc="Ton numéro affiche tous les pros que tu as scannés. Recherche par ville, secteur." />
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="surface-elevated p-6">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

/* ----- Témoignages ----- */
function TestimonialsSection() {
  const items = [
    { name: "Aïcha B.", role: "Photographe · Abidjan", text: "J'ai changé de numéro 3 fois cette année. Avant je devais réimprimer. Maintenant je modifie en 2 secondes, mes clients voient toujours le bon numéro." },
    { name: "Mamadou D.", role: "Architecte · Abidjan", text: "Le QR code sur mon téléphone remplace 500 cartes papier par an. Et je vois qui m'a scanné, c'est devenu mon CRM." },
    { name: "Esther G.", role: "Pâtissière · San-Pédro", text: "Les commandes arrivent direct sur mon WhatsApp depuis la carte. Bien plus simple qu'Instagram." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Ce qu'en disent les premiers utilisateurs</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((t) => (
          <div key={t.name} className="surface-elevated p-6">
            <div className="flex gap-0.5 text-warning">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed">"{t.text}"</p>
            <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand font-bold text-white">
                {t.name[0]}
              </div>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {t.role}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

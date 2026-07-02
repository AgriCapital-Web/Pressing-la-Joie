import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import WaitlistDialog from "@/components/WaitlistDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Leaf, MapPinned, Sprout } from "lucide-react";
import palmFruit from "@/assets/palm-mature-fruits.jpg";
import palmPlantation from "@/assets/palm-mature-plantation.jpg";
import vavouaLand from "@/assets/vavoua-land-2026.jpg";
import potentielAgricole from "@/assets/potentiel-agricole.jpg";
import champSunset from "@/assets/champ-cultures-sunset.jpg";
import prospectMeeting from "@/assets/prospect-meeting-10.jpg";
import production from "@/assets/palm-oil-production.jpg";
import leveTopoVideo from "@/assets/leve-topo.mp4";
import leveTopoPoster from "@/assets/leve-topo-poster.webp";

type PageKind = "foncier" | "palmier";

const stats = [
  ["Des millions d'hectares", "de terres à fort potentiel encore sous-valorisées en Côte d'Ivoire"],
  ["+500 ha", "de terres identifiées et mobilisables dans le réseau AgriCapital autour de Daloa"],
  ["10 000 ha", "de potentiel foncier identifié à terme dans le réseau AgriCapital"],
  ["25 ans", "de cycle productif sur une plantation de palmier à huile"],
];

const products = [
  ["Dans votre cuisine", "Huile, biscuits, margarines, snacks et fritures : le palmier à huile est un ingrédient discret de nombreux produits alimentaires."],
  ["Dans votre salle de bain", "Savons, crèmes, shampoings, baumes et rouges à lèvres utilisent des dérivés de palme et de palmiste."],
  ["Dans les usines", "Acides gras, lubrifiants, encres, résines et agents techniques entrent dans plusieurs chaînes industrielles."],
  ["Dans l'énergie", "Biodiesel, biogaz, biomasse et valorisation des résidus donnent au palmier une dimension circulaire."],
];

const TreasurePage = ({ type }: { type: PageKind }) => {
  const isFoncier = type === "foncier";
  const heroImage = isFoncier ? vavouaLand : palmFruit;
  const title = isFoncier ? "DU FONCIER AGRICOLE IVOIRIEN" : "DU PALMIER À HUILE";
  const subtitle = isFoncier
    ? "Des milliers d'hectares de terres fertiles attendent silencieusement ceux qui ont la vision d'y bâtir leur avenir."
    : "Il est dans votre cuisine, votre salle de bain, vos médicaments et parfois dans le carburant de certains moteurs.";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title={`Le trésor caché ${isFoncier ? "du foncier agricole" : "du palmier à huile"} | AgriCapital`} description="Page immersive AgriCapital sur le potentiel agricole ivoirien et les opportunités de plantation de palmier à huile." />
      <DynamicNavigation />
      <main>
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
          <img src={heroImage} alt={isFoncier ? "Foncier agricole ivoirien fertile" : "Régimes mûrs de palmier à huile"} className="absolute inset-0 h-full w-full object-cover" loading="eager" />
          {/* Overlay orange translucide (foncier) / vert (palmier) */}
          <div className={`absolute inset-0 ${isFoncier ? "bg-gradient-to-b from-accent/70 via-accent/55 to-accent/80" : "bg-gradient-to-b from-primary/55 via-primary/40 to-primary/70"}`} />
          <div className="container relative mx-auto px-4 py-24 text-center text-primary-foreground">
            <p className="treasure-eyebrow">Le trésor caché</p>
            <h1 className="mx-auto max-w-5xl text-4xl font-black leading-tight md:text-7xl">{title}</h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed md:text-2xl">{subtitle}</p>
            <p className="mx-auto mt-5 max-w-3xl text-base opacity-90 md:text-lg">{isFoncier ? "Pendant que vous cherchez où investir, la réponse est peut-être enfouie dans une terre que vous possédez déjà — ou que vous n'avez pas encore pensé à exploiter." : "Un arbre discret, omniprésent, productif toute l'année, capable de générer des dizaines d'applications utiles."}</p>
            <WaitlistDialog sourcePage={isFoncier ? "/tresor-foncier" : "/tresor-palmier"}>
              <Button size="lg" className="mt-8 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">Découvrir comment investir <ArrowRight className="h-4 w-4" /></Button>
            </WaitlistDialog>
          </div>
        </section>

        {isFoncier ? <FoncierContent /> : <PalmierContent />}
      </main>
      <Footer />
    </div>
  );
};

const FoncierContent = () => (
  <>
    <section className="py-20"><div className="container mx-auto grid gap-10 px-4 lg:grid-cols-2 lg:items-center"><img src={potentielAgricole} alt="Mains d'agriculteur tenant une terre fertile au coucher du soleil" className="h-[460px] w-full rounded-xl object-cover shadow-strong" /><div><p className="belife-eyebrow">Le paradoxe</p><h2 className="mb-6 text-3xl font-bold md:text-5xl">Un continent riche de terres. Des familles appauvries faute de les valoriser.</h2><p className="text-lg leading-8 text-muted-foreground">En Afrique, des familles possèdent des dizaines d'hectares de bas-fonds, plateaux fertiles et zones agricoles. Pourtant ces terres ne produisent rien, ne génèrent aucun revenu et attendent une structure capable de les transformer.</p><p className="mt-5 font-bold text-primary">Ce n'est pas un manque de terres. C'est un manque d'accès à la bonne structure.</p></div></div></section>
    <section className="bg-primary py-20 text-primary-foreground"><div className="container mx-auto px-4"><h2 className="mx-auto mb-10 max-w-4xl text-center text-3xl font-bold md:text-5xl">Ce que la plupart des Ivoiriens urbains ignorent sur le foncier agricole</h2><div className="grid gap-4 md:grid-cols-4">{stats.map(([value, label]) => <Card key={value} className="border-primary-foreground/20 bg-primary-foreground/10"><CardContent className="p-6 text-center"><p className="text-3xl font-black text-accent">{value}</p><p className="mt-3 text-sm text-primary-foreground/85">{label}</p></CardContent></Card>)}</div></div></section>
    <section className="py-20"><div className="container mx-auto px-4"><h2 className="mb-10 text-center text-3xl font-bold md:text-5xl">Pourquoi le foncier agricole est un actif puissant</h2><div className="grid gap-6 md:grid-cols-3">{[[MapPinned,"Un actif tangible et durable",vavouaLand],[Sprout,"La terre produit sans s'épuiser",champSunset],[Leaf,"Un patrimoine transmissible",prospectMeeting]].map(([Icon, title, image]: any) => <Card key={title} className="overflow-hidden"><img src={image} alt={title} className="h-52 w-full object-cover" /><CardContent className="p-6"><Icon className="mb-4 h-8 w-8 text-accent" /><h3 className="mb-3 text-xl font-bold">{title}</h3><p className="text-muted-foreground">Un foncier bien sécurisé et valorisé devient un patrimoine visible, productif et transmissible, capable de créer de la valeur pendant des décennies.</p></CardContent></Card>)}</div></div></section>
    <TrustBridge />
  </>
);

const PalmierContent = () => (
  <>
    <section className="py-20"><div className="container mx-auto max-w-4xl px-4 text-center"><p className="belife-eyebrow justify-center">Découverte</p><h2 className="mb-6 text-3xl font-bold md:text-5xl">Vous l'utilisez tous les jours. Sans le savoir.</h2><p className="text-lg leading-8 text-muted-foreground">Le palmier à huile entre dans la composition de nombreux produits de grande consommation : alimentation, cosmétique, industrie, santé et énergie. Discret, silencieux, omniprésent, il reste pourtant méconnu.</p></div></section>
    <section className="bg-secondary/40 py-20"><div className="container mx-auto grid gap-10 px-4 lg:grid-cols-2 lg:items-center"><img src={palmPlantation} alt="Palmier à huile adulte" className="h-[520px] w-full rounded-xl object-cover shadow-strong" /><div><h2 className="mb-6 text-3xl font-bold md:text-5xl">Un arbre. Des dizaines de vies.</h2><p className="text-lg leading-8 text-muted-foreground">Originaire du golfe de Guinée, le palmier à huile produit toute l'année, deux fois par mois, pendant environ vingt-cinq ans. Un seul fruit renferme deux trésors : l'huile de palme et l'huile de palmiste.</p></div></div></section>
    <section className="py-20"><div className="container mx-auto px-4"><h2 className="mb-10 text-center text-3xl font-bold md:text-5xl">Regardez autour de vous. Il est là.</h2><div className="grid gap-6 md:grid-cols-2">{products.map(([title, text]) => <Card key={title}><CardContent className="p-7"><h3 className="mb-3 text-2xl font-bold text-primary">{title}</h3><p className="leading-7 text-muted-foreground">{text}</p></CardContent></Card>)}</div></div></section>
    <section className="bg-primary py-20 text-primary-foreground"><div className="container mx-auto grid gap-10 px-4 lg:grid-cols-2 lg:items-center"><div><h2 className="mb-6 text-3xl font-bold md:text-5xl">Ici, le palmier à huile est chez lui.</h2><p className="text-lg leading-8 text-primary-foreground/85">La Côte d'Ivoire réunit naturellement les conditions de chaleur, d'humidité et de sols adaptées. Les zones du Haut-Sassandra offrent un potentiel exceptionnel pour structurer une production durable.</p></div><img src={production} alt="Production huile de palme" className="h-[420px] w-full rounded-xl object-cover" /></div></section>
    <TrustBridge />
  </>
);

const TrustBridge = () => (
  <section className="py-20"><div className="container mx-auto grid gap-10 px-4 lg:grid-cols-2 lg:items-center"><div><p className="belife-eyebrow">AgriCapital</p><h2 className="mb-6 text-3xl font-bold md:text-5xl">L'acteur de confiance qui fait le lien</h2><p className="text-lg leading-8 text-muted-foreground">AgriCapital identifie le foncier, sécurise contractuellement, développe les plantations, suit la production et accompagne la commercialisation. Vous investissez dans quelque chose de réel ; nous structurons le terrain.</p><div className="mt-6 space-y-3">{["Prospection terrain et validation agronomique", "Conventions sécurisées et cartographie GPS", "Plants certifiés, suivi technique et intrants", "Remise de plantation clé en main"].map((item) => <p key={item} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> {item}</p>)}</div><WaitlistDialog sourcePage="cta-tresor"><Button size="lg" className="mt-8 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">Découvrir nos offres <ArrowRight className="h-4 w-4" /></Button></WaitlistDialog></div><video src={leveTopoVideo} poster={leveTopoPoster} className="h-[500px] w-full rounded-xl object-cover shadow-strong" autoPlay muted loop playsInline controls preload="metadata" aria-label="Levée topographique AgriCapital sur le terrain" /></div></section>
);

export default TreasurePage;
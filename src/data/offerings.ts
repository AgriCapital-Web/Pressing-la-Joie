// Centralized content for Solutions, Services, and Partnerships
// Used by listing pages, detail pages, and the homepage summary section.

import {
  Sprout,
  TreePalm,
  Tractor,
  ClipboardList,
  Leaf,
  Package,
  Wrench,
  Handshake,
  Truck,
  PackageOpen,
  Landmark,
  Settings2,
  ShoppingCart,
  Building2,
  LucideIcon,
} from "lucide-react";

export interface Offering {
  slug: string;
  type: "solution" | "service";
  icon: LucideIcon;
  title: string;
  tagline: string;
  shortDescription: string; // for homepage / cards (3-5 lines)
  intro: string; // full intro paragraph(s) for detail page
  bullets: string[];
  closing?: string;
}

export const solutions: Offering[] = [
  {
    slug: "valorisation-fonciere",
    type: "solution",
    icon: Sprout,
    title: "Valorisation foncière",
    tagline: "Vous disposez déjà d'une terre agricole ?",
    shortDescription:
      "Nous transformons votre terrain en plantation productive de palmier à huile : de la préparation du sol à l'entrée en production, avec suivi technique offert.",
    intro:
      "AgriCapital prend en charge les principales étapes nécessaires à la mise en valeur de votre terrain, depuis les travaux préparatoires jusqu'à l'entrée en production de votre plantation de palmier à huile.",
    bullets: [
      "Étude et planification du projet",
      "Défrichage et préparation du terrain",
      "Piquetage et implantation",
      "Trouaison et planting",
      "Fourniture de plants sélectionnés",
      "Fertilisation et entretien initial",
      "Protection des jeunes plants",
      "Suivi technique et agronomique offert",
      "Accompagnement jusqu'à l'entrée en production",
    ],
    closing:
      "Selon vos objectifs, vous pouvez assurer vous-même la gestion de votre plantation ou bénéficier d'un accompagnement plus complet de nos équipes. Au-delà de la création, nous facilitons également l'écoulement de la production grâce à notre réseau de coopératives, d'acheteurs et de partenaires de transformation.",
  },
  {
    slug: "plantation-cle-en-main",
    type: "solution",
    icon: TreePalm,
    title: "Plantation clé en main",
    tagline: "Vous souhaitez créer une plantation sans disposer de terrain ?",
    shortDescription:
      "De l'identification et la sécurisation du foncier à la création complète de votre plantation : une solution totalement intégrée pour particuliers, entrepreneurs et investisseurs.",
    intro:
      "Cette solution permet aux particuliers, entrepreneurs et investisseurs de développer une plantation professionnelle sans avoir à gérer eux-mêmes les contraintes foncières et les opérations techniques.",
    bullets: [
      "Identification du foncier",
      "Sécurisation du foncier",
      "Démarches administratives liées au projet",
      "Création complète de la plantation",
      "Fourniture de plants certifiés",
      "Travaux de mise en place",
      "Suivi technique et agronomique offert",
      "Accompagnement jusqu'à l'entrée en production",
    ],
    closing:
      "Selon le niveau d'accompagnement souhaité, vous pouvez assurer directement la gestion de votre plantation ou nous en confier la gestion. Nous facilitons également l'écoulement de la production grâce à notre réseau de partenaires de la chaîne de valeur agricole.",
  },
  {
    slug: "gestion-de-plantations",
    type: "solution",
    icon: Tractor,
    title: "Gestion de plantations",
    tagline: "Vous souhaitez confier la gestion de votre plantation à des professionnels ?",
    shortDescription:
      "Nos équipes assurent le suivi technique, opérationnel et agronomique de votre plantation pour en optimiser durablement les performances.",
    intro:
      "Nos équipes assurent le suivi et la gestion des plantations pour le compte de propriétaires, investisseurs et porteurs de projets souhaitant bénéficier d'un accompagnement professionnel.",
    bullets: [
      "Planification des opérations culturales",
      "Organisation et supervision des travaux agricoles",
      "Gestion des équipes de terrain",
      "Suivi technique et agronomique",
      "Fourniture d'intrants adaptés",
      "Contrôle qualité des interventions",
      "Suivi des performances de la plantation",
      "Reporting et conseils stratégiques",
      "Assistance à la commercialisation",
      "Facilitation de l'écoulement de la production",
    ],
    closing:
      "Notre objectif est de permettre aux propriétaires de plantations de bénéficier d'une gestion rigoureuse et d'un accompagnement durable tout au long du cycle de production.",
  },
  {
    slug: "accompagnement-projets-agricoles",
    type: "solution",
    icon: ClipboardList,
    title: "Accompagnement de projets agricoles",
    tagline: "Vous portez un projet agricole ambitieux ?",
    shortDescription:
      "Particulier, entreprise, coopérative ou institution : nous structurons et déployons votre projet agricole de bout en bout pour sécuriser votre investissement.",
    intro:
      "AgriCapital accompagne la conception, la structuration, la mise en œuvre et le développement de projets agricoles de différentes tailles.",
    bullets: [
      "Conception et structuration de projets",
      "Planification opérationnelle",
      "Mobilisation des ressources",
      "Sécurisation foncière",
      "Mise en place des plantations",
      "Organisation des opérations agricoles",
      "Suivi technique et agronomique",
      "Accompagnement à la commercialisation",
    ],
    closing:
      "Notre objectif est de sécuriser les investissements agricoles tout en favorisant des exploitations performantes, durables et créatrices de valeur.",
  },
  {
    slug: "pepiniere-plants-certifies",
    type: "solution",
    icon: Leaf,
    title: "Pépinière & plants certifiés",
    tagline: "Vous recherchez des plants de qualité pour vos plantations ?",
    shortDescription:
      "Du matériel végétal sélectionné, à haut potentiel, issu de nos pépinières et de notre réseau de partenaires agréés.",
    intro:
      "AgriCapital développe ses propres capacités de production de plants et s'appuie également sur un vaste réseau de pépiniéristes partenaires sélectionnés.",
    bullets: [
      "Plants certifiés",
      "Plants sélectionnés à haut potentiel",
      "Conseils de plantation",
      "Assistance technique",
      "Accompagnement post-livraison",
    ],
    closing:
      "Notre objectif est de contribuer à la réussite des plantations grâce à un matériel végétal de qualité adapté aux exigences du terrain.",
  },
];

export const services: Offering[] = [
  {
    slug: "fourniture-intrants",
    type: "service",
    icon: Package,
    title: "Fourniture d'intrants agricoles",
    tagline: "Vous recherchez des intrants fiables et performants ?",
    shortDescription:
      "Accès facilité à des fertilisants, produits phytosanitaires et équipements sélectionnés auprès de fournisseurs reconnus.",
    intro:
      "Grâce à notre réseau de fournisseurs et distributeurs partenaires, nous facilitons l'accès à un large éventail de produits agricoles répondant aux exigences de qualité et de performance.",
    bullets: [
      "Fertilisants",
      "Produits phytosanitaires",
      "Équipements agricoles",
      "Matériels de plantation",
      "Solutions de protection des cultures",
    ],
    closing:
      "Nous privilégions des produits répondant aux exigences de qualité et de performance nécessaires au développement durable des plantations.",
  },
  {
    slug: "mise-en-place-suivi-plantations",
    type: "service",
    icon: Wrench,
    title: "Mise en place & suivi de plantations",
    tagline: "Vous avez besoin d'une intervention technique spécialisée ?",
    shortDescription:
      "Nos ingénieurs et techniciens interviennent du défrichage à l'entretien : un accompagnement terrain rigoureux à chaque étape.",
    intro:
      "Nos ingénieurs, techniciens agricoles et partenaires spécialisés interviennent sur l'ensemble des opérations techniques de création, développement et optimisation de plantations.",
    bullets: [
      "Défrichage",
      "Piquetage",
      "Trouaison",
      "Planting",
      "Fertilisation",
      "Protections contre ravageurs et rongeurs",
      "Entretien des parcelles",
      "Visites techniques",
      "Suivi agronomique",
      "Évaluation des performances",
    ],
    closing:
      "Notre réseau d'experts et de professionnels qualifiés nous permet d'assurer un accompagnement adapté aux réalités du terrain et aux objectifs de chaque exploitant.",
  },
  {
    slug: "garantie-decoulement",
    type: "service",
    icon: ShoppingCart,
    title: "Garantie d'écoulement",
    tagline: "Vous souhaitez sécuriser la commercialisation de votre production ?",
    shortDescription:
      "Nous facilitons l'accès aux débouchés grâce à un réseau de coopératives, acheteurs et transformateurs partenaires.",
    intro:
      "La commercialisation représente un enjeu majeur pour la rentabilité d'une plantation. AgriCapital développe un réseau de partenaires composé d'acteurs solides de la chaîne de valeur agricole.",
    bullets: [
      "Coopératives agricoles",
      "Acheteurs spécialisés",
      "Collecteurs",
      "Transformateurs",
      "Acteurs de la chaîne de valeur agricole",
    ],
    closing:
      "Cette dynamique vise à favoriser une meilleure valorisation des productions et à renforcer la sécurité économique des producteurs.",
  },
  {
    slug: "collecte-de-production",
    type: "service",
    icon: Truck,
    title: "Collecte de production",
    tagline: "Vous recherchez des régimes de palme ou des matières premières agricoles ?",
    shortDescription:
      "Nous organisons la mise en relation et la logistique entre producteurs, coopératives, acheteurs et transformateurs.",
    intro:
      "Grâce à notre présence sur le terrain et à notre réseau de partenaires, nous contribuons à l'organisation de la collecte et de la commercialisation des productions agricoles.",
    bullets: [
      "Producteurs",
      "Coopératives",
      "Industriels",
      "Unités de transformation",
      "Acheteurs professionnels",
    ],
    closing:
      "Notre objectif est de contribuer à la structuration des filières agricoles et à la sécurisation des approvisionnements.",
  },
];

export interface PartnerType {
  slug: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const partnerTypes: PartnerType[] = [
  {
    slug: "partenaires-financiers",
    icon: Landmark,
    title: "Partenaires financiers",
    description:
      "Investisseurs, fonds d'impact, banques, institutions financières et structures de financement souhaitant accompagner le développement de projets agricoles productifs et à fort impact économique et social.",
  },
  {
    slug: "partenaires-techniques",
    icon: Settings2,
    title: "Partenaires techniques",
    description:
      "Agronomes, cabinets spécialisés, centres de recherche, experts agricoles, fournisseurs d'équipements et opérateurs techniques souhaitant contribuer à l'amélioration continue des performances agricoles.",
  },
  {
    slug: "partenaires-commerciaux",
    icon: PackageOpen,
    title: "Partenaires commerciaux",
    description:
      "Acheteurs, transformateurs, distributeurs, exportateurs et industriels souhaitant développer des relations durables avec les producteurs et sécuriser leurs approvisionnements.",
  },
  {
    slug: "partenaires-institutionnels",
    icon: Building2,
    title: "Partenaires institutionnels",
    description:
      "Organisations de développement, ONG, programmes publics et privés, structures d'appui, institutions nationales et internationales engagées dans le développement économique et social des territoires.",
  },
];

export const partnershipImpact: string[] = [
  "Valoriser durablement les terres agricoles",
  "Renforcer les revenus des producteurs",
  "Créer des emplois en milieu rural",
  "Favoriser l'insertion économique des jeunes",
  "Soutenir l'autonomisation économique des femmes",
  "Renforcer les économies locales",
  "Structurer durablement les chaînes de valeur agricoles",
  "Encourager la transformation locale des productions",
  "Participer à la sécurité alimentaire",
  "Développer un patrimoine agricole durable au service des générations futures",
];

export function findOffering(slug: string): Offering | undefined {
  return [...solutions, ...services].find((o) => o.slug === slug);
}

import type { Profile, Organization, AppState } from "./types";

const now = Date.now();
const days = (n: number) => now - n * 86400_000;

function p(partial: Partial<Profile> & Pick<Profile, "id" | "email" | "firstName" | "lastName" | "title" | "sector" | "slug">): Profile {
  return {
    kind: "particulier",
    phones: [],
    socials: {},
    gallery: [],
    templateId: "vkard-cover",
    palette: { primary: "#2563eb", accent: "#0ea5e9", ink: "#0b1a3a" },
    hasPremium: false,
    prospects: [],
    createdAt: days(30),
    ...partial,
  } as Profile;
}

const profiles: Profile[] = [
  p({
    id: "u1", slug: "inocent-koffi", email: "inocent@flexcard.app",
    firstName: "Inocent", lastName: "Koffi", title: "Fondateur", company: "IKNov",
    sector: "Tech & Innovation", description: "Bâtisseur de FlexCard. Au croisement du design, du produit et de l'Afrique qui code.",
    publicEmail: "contact@iknov.africa", website: "https://iknov.africa", city: "Abidjan",
    phones: [{ number: "+225 07 11 22 33 44", operator: "Orange" }, { number: "+225 05 88 77 66 55", operator: "MTN" }],
    socials: { whatsapp: "+22507112233", linkedin: "inocent-koffi", twitter: "iknov_africa" },
    templateId: "vkard-cover",
    palette: { primary: "#1d4ed8", accent: "#22d3ee", ink: "#0b1a3a" },
    hasPremium: true, premiumCode: "FX-IKN0-V202-6FLX",
    prospects: [
      { phone: "+225 05 12 34 56 78", contactName: "Aïcha B.", firstScanAt: days(12), visits: 4, lastVisitAt: days(1) },
      { phone: "+225 07 88 99 00 11", contactName: "Mamadou D.", firstScanAt: days(8), visits: 2, lastVisitAt: days(2) },
      { phone: "+225 01 22 33 44 55", contactName: "Léa K.", firstScanAt: days(4), visits: 1, lastVisitAt: days(4) },
    ],
    createdAt: days(60),
  }),
  p({
    id: "u2", slug: "aicha-bamba", email: "aicha@gmail.com",
    firstName: "Aïcha", lastName: "Bamba", title: "Photographe événementiel",
    sector: "Photo & Vidéo", description: "Mariages, portraits corporate, événements. Abidjan & Grand-Bassam.",
    publicEmail: "aicha.photo@gmail.com", website: "https://aichabamba.com", city: "Abidjan",
    phones: [{ number: "+225 05 12 34 56 78", operator: "MTN" }],
    socials: { whatsapp: "+22505123456", instagram: "aicha.bamba.photo", tiktok: "aichabamba" },
    templateId: "teamwork-dramatic",
    palette: { primary: "#0f172a", accent: "#f59e0b", ink: "#0a0a0a" },
    prospects: [
      { phone: "+225 07 11 22 33 44", contactName: "Inocent K.", firstScanAt: days(10), visits: 3, lastVisitAt: days(1) },
    ],
  }),
  p({
    id: "u3", slug: "mamadou-diallo", email: "mamadou@gmail.com",
    firstName: "Mamadou", lastName: "Diallo", title: "Architecte d'intérieur",
    sector: "Architecture & BTP", description: "Aménagement résidentiel & tertiaire. Approche durable, matériaux locaux.",
    publicEmail: "studio@mdiallo.archi", website: "https://mdiallo.archi", city: "Abidjan",
    phones: [{ number: "+225 07 88 99 00 11", operator: "Orange" }],
    socials: { linkedin: "mamadou-diallo", instagram: "mdiallo.studio" },
    templateId: "swap-classic",
    palette: { primary: "#0c4a6e", accent: "#0ea5e9", ink: "#0c4a6e" },
  }),
  p({
    id: "u4", slug: "lea-kouame", email: "lea@gmail.com",
    firstName: "Léa", lastName: "Kouamé", title: "Coach business",
    sector: "Conseil & Formation", description: "J'accompagne entrepreneuses et entrepreneurs africains à passer du chaos à la clarté.",
    publicEmail: "lea@coach-kouame.com", city: "Yamoussoukro",
    phones: [{ number: "+225 01 22 33 44 55", operator: "Moov" }],
    socials: { whatsapp: "+22501223344", linkedin: "lea-kouame", instagram: "lea.coach" },
    templateId: "soft-blue",
    palette: { primary: "#7c3aed", accent: "#ec4899", ink: "#3b0764" },
  }),
  p({
    id: "u5", slug: "kofi-asante", email: "kofi@gmail.com",
    firstName: "Kofi", lastName: "Asante", title: "Développeur Full-Stack",
    sector: "Tech & Innovation", description: "React, Node, Postgres. Disponible en mission longue.",
    publicEmail: "hi@kofi.dev", website: "https://kofi.dev", city: "Bouaké",
    phones: [{ number: "+225 05 67 89 01 23", operator: "MTN" }, { number: "+225 07 65 43 21 09", operator: "Orange" }],
    socials: { linkedin: "kofi-asante", twitter: "kofi_dev" },
    templateId: "cartly-night",
    palette: { primary: "#10b981", accent: "#34d399", ink: "#022c22" },
  }),
  p({
    id: "u6", slug: "fatou-traore", email: "fatou@yahoo.fr",
    firstName: "Fatou", lastName: "Traoré", title: "Avocate au barreau",
    sector: "Droit & Juridique", description: "Droit des affaires, contentieux commercial. Cabinet Traoré & Associés.",
    publicEmail: "f.traore@cabinet-ta.ci", website: "https://cabinet-ta.ci", city: "Abidjan",
    phones: [{ number: "+225 27 22 44 55 66", operator: "Fixe" }, { number: "+225 07 33 44 55 66", operator: "Orange" }],
    socials: { linkedin: "fatou-traore-avocate" },
    templateId: "blue-header",
    palette: { primary: "#1e3a8a", accent: "#b45309", ink: "#0c1d4d" },
    hasPremium: true, premiumCode: "FX-FT99-LAW2-026X",
  }),
  p({
    id: "u7", slug: "yann-konate", email: "yann@gmail.com",
    firstName: "Yann", lastName: "Konaté", title: "DJ & Producteur",
    sector: "Musique & Événementiel", description: "Afro House, Amapiano, Coupé-Décalé. Bookings: festivals, clubs, mariages.",
    publicEmail: "booking@djyannk.com", city: "Abidjan",
    phones: [{ number: "+225 07 99 88 77 66", operator: "Orange" }],
    socials: { whatsapp: "+22507998877", instagram: "djyannk", tiktok: "djyannk", twitter: "djyannk" },
    templateId: "cartly-night",
    palette: { primary: "#a855f7", accent: "#22d3ee", ink: "#1e1b4b" },
  }),
  p({
    id: "u8", slug: "esther-gbagbo", email: "esther@gmail.com",
    firstName: "Esther", lastName: "Gbagbo", title: "Cheffe pâtissière",
    sector: "Restauration & Food", description: "Pâtisserie française & saveurs ivoiriennes. Commandes événementielles.",
    publicEmail: "commandes@esther-patisserie.ci", city: "San-Pédro",
    phones: [{ number: "+225 05 44 33 22 11", operator: "MTN" }],
    socials: { whatsapp: "+22505443322", instagram: "esther.patisserie", facebook: "esther.patisserie" },
    templateId: "curve-pop",
    palette: { primary: "#d97706", accent: "#fbbf24", ink: "#451a03" },
  }),
  // Entreprise
  p({
    id: "u9", slug: "marc-zinsou", email: "marc.zinsou@nimbatech.ci",
    firstName: "Marc", lastName: "Zinsou", title: "CEO", company: "Nimba Tech",
    sector: "Tech & Innovation", description: "On construit l'infra digitale de l'Afrique de l'Ouest.",
    publicEmail: "marc@nimbatech.ci", website: "https://nimbatech.ci", city: "Abidjan",
    phones: [{ number: "+225 07 10 20 30 40", operator: "Orange" }],
    socials: { linkedin: "marc-zinsou" },
    kind: "entreprise", orgId: "org1",
    templateId: "tilted-block",
    palette: { primary: "#1e40af", accent: "#06b6d4", ink: "#0c1d4d" },
  }),
  p({
    id: "u10", slug: "salimata-coulibaly", email: "salimata@nimbatech.ci",
    firstName: "Salimata", lastName: "Coulibaly", title: "Head of Design", company: "Nimba Tech",
    sector: "Tech & Innovation",
    publicEmail: "salimata@nimbatech.ci", city: "Abidjan",
    phones: [{ number: "+225 05 55 66 77 88", operator: "MTN" }],
    socials: { linkedin: "salimata-coulibaly", twitter: "salidesigns" },
    kind: "entreprise", orgId: "org1",
    templateId: "tilted-block",
    palette: { primary: "#1e40af", accent: "#06b6d4", ink: "#0c1d4d" },
  }),
  p({
    id: "u11", slug: "ibrahim-ouattara", email: "ibrahim@nimbatech.ci",
    firstName: "Ibrahim", lastName: "Ouattara", title: "Lead Backend", company: "Nimba Tech",
    sector: "Tech & Innovation",
    publicEmail: "ibrahim@nimbatech.ci", city: "Abidjan",
    phones: [{ number: "+225 01 99 88 77 66", operator: "Moov" }],
    socials: { linkedin: "ibrahim-ouattara", twitter: "ibou_dev" },
    kind: "entreprise", orgId: "org1",
    templateId: "tilted-block",
    palette: { primary: "#1e40af", accent: "#06b6d4", ink: "#0c1d4d" },
  }),
  p({
    id: "u12", slug: "naomi-koffi", email: "naomi@gmail.com",
    firstName: "Naomi", lastName: "Koffi", title: "Mannequin & Influenceuse",
    sector: "Mode & Beauté", description: "Lifestyle, mode africaine contemporaine. Collaborations marques.",
    publicEmail: "naomi.k.contact@gmail.com", city: "Abidjan",
    phones: [{ number: "+225 07 22 33 44 55", operator: "Orange" }],
    socials: { instagram: "naomi.k", tiktok: "naomi.k.officiel", whatsapp: "+22507223344" },
    templateId: "curve-pop",
    palette: { primary: "#be185d", accent: "#f9a8d4", ink: "#500724" },
  }),
];

const organizations: Organization[] = [
  {
    id: "org1",
    name: "Nimba Tech",
    sector: "Tech & Innovation",
    plan: "team10",
    hasPremiumPack: true,
    premiumCode: "FX-NIMB-A026-TECH",
    ownerEmail: "marc.zinsou@nimbatech.ci",
    memberIds: ["u9", "u10", "u11"],
    createdAt: days(120),
  },
];

export const seedState: AppState = {
  profiles: Object.fromEntries(profiles.map((p) => [p.id, p])),
  organizations: Object.fromEntries(organizations.map((o) => [o.id, o])),
  currentProfileId: null,
  pendingEmail: null,
};

export const DEMO_ACCOUNTS = profiles.map((p) => ({
  email: p.email,
  name: `${p.firstName} ${p.lastName}`,
  title: p.title,
  kind: p.kind,
}));

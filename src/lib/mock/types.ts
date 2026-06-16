export type Operator = "MTN" | "Orange" | "Moov" | "Fixe" | "Inconnu";

export type Phone = { number: string; operator: Operator };

export type GalleryItem = {
  id: string;
  category: "photos" | "affiches" | "visuels" | "videos" | "actualites";
  url?: string;
  caption?: string;
  text?: string; // for actualites
  createdAt: number;
};

export type SocialLinks = {
  whatsapp?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
};

export type AccountKind = "particulier" | "informel" | "entreprise";

export type Plan = "free" | "starter" | "team10" | "team20" | "team50" | "team100" | "unlimited";

export type Profile = {
  id: string;
  slug: string; // public URL
  email: string;
  kind: AccountKind;
  // entreprise: liens vers organisation
  orgId?: string;
  // identité
  firstName: string;
  lastName: string;
  title: string;
  company?: string;
  sector: string;
  description?: string; // 580 max
  avatarUrl?: string;
  coverUrl?: string;
  phones: Phone[];
  publicEmail?: string;
  website?: string;
  city?: string;
  socials: SocialLinks;
  gallery: GalleryItem[];
  templateId: string;
  palette: { primary: string; accent: string; ink: string };
  hasPremium: boolean;
  premiumCode?: string;
  boostUntil?: number;
  prospects: ProspectLink[];
  createdAt: number;
};

export type ProspectLink = {
  // numéro (ou email) du téléphone scanneur
  phone: string;
  contactName?: string;
  email?: string;
  firstScanAt: number;
  visits: number;
  lastVisitAt: number;
};

export type Organization = {
  id: string;
  name: string;
  sector: string;
  logoUrl?: string;
  plan: Plan;
  hasPremiumPack: boolean;
  premiumCode?: string;
  ownerEmail: string;
  memberIds: string[];
  createdAt: number;
};

export type AppState = {
  profiles: Record<string, Profile>;
  organizations: Record<string, Organization>;
  currentProfileId: string | null;
  // OTP en attente
  pendingEmail: string | null;
};

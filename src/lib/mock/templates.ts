/**
 * 8 vrais templates de carte de visite numérique mobile,
 * inspirés des leaders du marché (VKard, Swapkaart, Cartly, Teamwork.Co, BeWell...).
 * Chaque template est une mise en page complète (cover, avatar, boutons, social, QR).
 * Combinés à 9 palettes = 72 variations visuelles.
 */
export const TEMPLATE_DEFS = [
  { id: "vkard-cover", name: "Cover Story", desc: "Photo de couverture pleine largeur, avatar centré, fiche élégante." },
  { id: "swap-classic", name: "Swap Classic", desc: "Cover paysage + avatar circulaire, lignes contact, bouton bleu." },
  { id: "teamwork-dramatic", name: "Dramatic", desc: "Portrait pleine hauteur noir & blanc, titre éditorial." },
  { id: "curve-pop", name: "Curve Pop", desc: "Demi-photo + vague colorée, social pills rouges." },
  { id: "soft-blue", name: "Soft Blue", desc: "Carte rounded bleu pastel, partage de contact, doux & pro." },
  { id: "tilted-block", name: "Tilted Block", desc: "Photo + bloc incliné couleur, sections custom (Get insured)." },
  { id: "cartly-night", name: "Cartly Night", desc: "Fond violet/dark, avatar haut, boutons enregistrer/envoyer." },
  { id: "blue-header", name: "Blue Header", desc: "En-tête bleu sur photo, contact en carte blanche." },
];

export const PALETTE_PRESETS = [
  { name: "Bleu FlexCard", primary: "#1d4ed8", accent: "#22d3ee", ink: "#0b1a3a" },
  { name: "Indigo électrique", primary: "#4f46e5", accent: "#a78bfa", ink: "#1e1b4b" },
  { name: "Émeraude", primary: "#059669", accent: "#34d399", ink: "#022c22" },
  { name: "Ambre", primary: "#d97706", accent: "#fbbf24", ink: "#451a03" },
  { name: "Magenta", primary: "#be185d", accent: "#f9a8d4", ink: "#500724" },
  { name: "Cyan", primary: "#0891b2", accent: "#67e8f9", ink: "#083344" },
  { name: "Violet nuit", primary: "#6d28d9", accent: "#c084fc", ink: "#2e1065" },
  { name: "Corail", primary: "#dc2626", accent: "#fca5a5", ink: "#450a0a" },
  { name: "Graphite", primary: "#334155", accent: "#94a3b8", ink: "#0f172a" },
];

export const TEMPLATE_COUNT = TEMPLATE_DEFS.length * PALETTE_PRESETS.length;

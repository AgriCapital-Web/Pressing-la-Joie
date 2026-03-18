export const SERVICE_PRESETS = [
  { name: "Chemise", price: 500, icon: "shirt" },
  { name: "Pantalon", price: 750, icon: "shirt" },
  { name: "Costume (2 pièces)", price: 2500, icon: "shirt" },
  { name: "Costume (3 pièces)", price: 3500, icon: "shirt" },
  { name: "Robe simple", price: 2000, icon: "shirt" },
  { name: "Robe de soirée", price: 5000, icon: "shirt" },
  { name: "Manteau", price: 3000, icon: "shirt" },
  { name: "Veste", price: 1500, icon: "shirt" },
  { name: "Jupe", price: 1000, icon: "shirt" },
  { name: "Pull", price: 750, icon: "shirt" },
  { name: "Couette", price: 3500, icon: "shirt" },
  { name: "Rideau (par mètre)", price: 1500, icon: "shirt" },
] as const;

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En cours", color: "bg-warning/10 text-warning" },
  ready: { label: "Prêt", color: "bg-primary/10 text-primary" },
  collected: { label: "Retiré", color: "bg-success/10 text-success" },
};

export const formatPrice = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;

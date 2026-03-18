export const SERVICE_PRESETS = [
  { name: "Chemise", price: 2.00, icon: "shirt" },
  { name: "Pantalon", price: 3.00, icon: "shirt" },
  { name: "Costume (2 pièces)", price: 15.00, icon: "shirt" },
  { name: "Costume (3 pièces)", price: 20.00, icon: "shirt" },
  { name: "Robe simple", price: 12.00, icon: "shirt" },
  { name: "Robe de soirée", price: 25.00, icon: "shirt" },
  { name: "Manteau", price: 18.00, icon: "shirt" },
  { name: "Veste", price: 10.00, icon: "shirt" },
  { name: "Jupe", price: 5.00, icon: "shirt" },
  { name: "Pull", price: 4.00, icon: "shirt" },
  { name: "Couette", price: 20.00, icon: "shirt" },
  { name: "Rideau (par mètre)", price: 8.00, icon: "shirt" },
] as const;

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En cours", color: "bg-warning/10 text-warning" },
  ready: { label: "Prêt", color: "bg-primary/10 text-primary" },
  collected: { label: "Retiré", color: "bg-success/10 text-success" },
};

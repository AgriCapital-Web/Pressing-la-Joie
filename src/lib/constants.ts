import chemiseImg from "@/assets/clothes/chemise.png";
import pantalonImg from "@/assets/clothes/pantalon.png";
import costume2Img from "@/assets/clothes/costume2.png";
import costume3Img from "@/assets/clothes/costume3.png";
import robeSimpleImg from "@/assets/clothes/robe-simple.png";
import robeSoireeImg from "@/assets/clothes/robe-soiree.png";
import manteauImg from "@/assets/clothes/manteau.png";
import vesteImg from "@/assets/clothes/veste.png";
import jupeImg from "@/assets/clothes/jupe.png";
import pullImg from "@/assets/clothes/pull.png";
import couetteImg from "@/assets/clothes/couette.png";
import rideauImg from "@/assets/clothes/rideau.png";

export const SERVICE_PRESETS = [
  { name: "Chemise", price: 500, image: chemiseImg },
  { name: "Pantalon", price: 750, image: pantalonImg },
  { name: "Costume (2 pièces)", price: 2500, image: costume2Img },
  { name: "Costume (3 pièces)", price: 3500, image: costume3Img },
  { name: "Robe simple", price: 2000, image: robeSimpleImg },
  { name: "Robe de soirée", price: 5000, image: robeSoireeImg },
  { name: "Manteau", price: 3000, image: manteauImg },
  { name: "Veste", price: 1500, image: vesteImg },
  { name: "Jupe", price: 1000, image: jupeImg },
  { name: "Pull", price: 750, image: pullImg },
  { name: "Couette", price: 3500, image: couetteImg },
  { name: "Rideau (par mètre)", price: 1500, image: rideauImg },
] as const;

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En cours", color: "bg-warning/10 text-warning" },
  ready: { label: "Prêt", color: "bg-primary/10 text-primary" },
  collected: { label: "Retiré", color: "bg-success/10 text-success" },
};

export const formatPrice = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;

import type { Operator, Phone } from "./types";

export function detectOperator(raw: string): Operator {
  const digits = raw.replace(/\D/g, "");
  // Format attendu: 225XXXXXXXXXX ou 0XXXXXXXXX
  let local = digits;
  if (local.startsWith("225")) local = local.slice(3);
  if (local.startsWith("00225")) local = local.slice(5);
  const prefix = local.slice(0, 2);
  switch (prefix) {
    case "05":
    case "06":
      return "MTN";
    case "07":
    case "08":
    case "09":
      return "Orange";
    case "01":
    case "02":
    case "03":
      return "Moov";
    case "20":
    case "21":
    case "22":
    case "25":
    case "27":
      return "Fixe";
    default:
      return "Inconnu";
  }
}

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("225")) local = local.slice(3);
  if (local.startsWith("00225")) local = local.slice(5);
  return `+225 ${local.slice(0, 2)} ${local.slice(2, 4)} ${local.slice(4, 6)} ${local.slice(6, 8)} ${local.slice(8, 10)}`.trim();
}

export function validatePhonesAgainstRules(phones: Phone[]): { ok: boolean; reason?: string } {
  const ops = new Set<string>();
  for (const p of phones) {
    if (p.operator === "Inconnu") return { ok: false, reason: "Numéro non valide (préfixe inconnu)." };
    if (ops.has(p.operator)) return { ok: false, reason: `Un seul numéro ${p.operator} autorisé en gratuit.` };
    ops.add(p.operator);
  }
  if (phones.length > 3) return { ok: false, reason: "Maximum 3 numéros." };
  return { ok: true };
}

export function isPersonalEmail(email: string): boolean {
  const personalDomains = [
    "gmail.com", "yahoo.com", "yahoo.fr", "hotmail.com", "hotmail.fr",
    "outlook.com", "outlook.fr", "live.com", "live.fr", "icloud.com",
    "me.com", "aol.com", "proton.me", "protonmail.com",
  ];
  const domain = email.toLowerCase().split("@")[1] ?? "";
  return personalDomains.includes(domain);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function generatePremiumCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `FX-${seg(4)}-${seg(4)}-${seg(4)}`;
}

export function fmt(n: number): string {
  return n.toLocaleString("fr-FR");
}

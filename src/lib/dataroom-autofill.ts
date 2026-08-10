/**
 * Import automatique Data Room :
 * déduit les métadonnées d'une publication à partir du nom de fichier,
 * du type MIME et (pour les PDF/textes) d'un extrait du contenu.
 */

export interface AutofillResult {
  type: string;
  title: string;
  category: string;
  description: string;
  visibility: string;
  source_file_name: string;
  source_file_size: number;
  source_mime_type: string;
  dynamic_fields: Record<string, string>;
}

const CATEGORY_RULES: { re: RegExp; category: string; visibility?: string }[] = [
  { re: /(statut|rccm|dfe|juridique|journal officiel|contrat|nda|attestation|cnps|registre)/i, category: "Juridique", visibility: "nda" },
  { re: /(financ|budget|bilan|business ?plan|invest|tresor|trésor|facture|prix)/i, category: "Finance", visibility: "vip" },
  { re: /(foncier|terrain|topo|cadastr|parcelle|leve|levé)/i, category: "Foncier", visibility: "nda" },
  { re: /(technique|pepiniere|pépinière|plantation|agronom|itinerair|itinéraire)/i, category: "Technique" },
  { re: /(strateg|stratég|vision|roadmap|pitch|deck|presentation|présentation)/i, category: "Stratégie" },
  { re: /(gouvernance|organigramme|equipe|équipe|cv|conseil)/i, category: "Gouvernance" },
  { re: /(communiqu|presse|marketing|flyer|affiche|brochure|logo|cachet)/i, category: "Marketing", visibility: "public" },
  { re: /(rapport|operation|opération|chantier|suivi|inauguration)/i, category: "Opérations" },
];

export const typeFromMime = (mime: string, name = ""): string => {
  if (mime.startsWith("image/")) return "photo";
  if (mime.startsWith("video/")) return "video";
  if (/presentation|powerpoint|\.pptx?$/i.test(mime + name)) return "presentation";
  if (/deck|pitch|presentation|présentation/i.test(name)) return "presentation";
  return "document";
};

export const titleFromFileName = (name: string): string => {
  const base = name.replace(/\.[^.]+$/, "");
  const cleaned = base
    .replace(/[_\-]+/g, " ")
    .replace(/\b\d{6,}\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "Document";
  return cleaned
    .split(" ")
    .map((w) => (w.length > 3 && w === w.toUpperCase() ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
};

const detectDate = (text: string): string | undefined => {
  const m = text.match(/\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/) || text.match(/\b(20\d{2})\b/);
  return m?.[1];
};

/** Extrait un texte lisible des premiers octets d'un PDF (streams non compressés / métadonnées). */
const extractPdfText = async (file: File): Promise<string> => {
  try {
    const buf = new Uint8Array(await file.slice(0, 400_000).arrayBuffer());
    let raw = "";
    for (let i = 0; i < buf.length; i++) raw += String.fromCharCode(buf[i]);
    const parts: string[] = [];
    const titleMatch = raw.match(/\/Title\s*\(([^)]{3,200})\)/);
    if (titleMatch) parts.push(titleMatch[1]);
    const subjectMatch = raw.match(/\/Subject\s*\(([^)]{3,300})\)/);
    if (subjectMatch) parts.push(subjectMatch[1]);
    const tj = raw.match(/\(([^()\\]{3,120})\)\s*Tj/g);
    if (tj) parts.push(tj.slice(0, 120).map((s) => s.replace(/^\(/, "").replace(/\)\s*Tj$/, "")).join(" "));
    return parts.join(" ").replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
};

export const autofillFromFile = async (file: File): Promise<AutofillResult> => {
  const mime = file.type || "application/octet-stream";
  const type = typeFromMime(mime, file.name);
  const title = titleFromFileName(file.name);

  let extracted = "";
  if (mime === "application/pdf") extracted = await extractPdfText(file);
  else if (mime.startsWith("text/")) extracted = (await file.slice(0, 20_000).text()).replace(/\s+/g, " ").trim();

  const haystack = `${file.name} ${extracted}`;
  const rule = CATEGORY_RULES.find((r) => r.re.test(haystack));
  const detectedDate = detectDate(haystack);

  const snippet = extracted.slice(0, 400).trim();
  const description = snippet
    ? `${snippet}${extracted.length > 400 ? "…" : ""}`
    : `${type === "photo" ? "Visuel" : type === "video" ? "Vidéo" : "Document"} officiel AgriCapital « ${title} »${detectedDate ? ` (${detectedDate})` : ""}.`;

  return {
    type,
    title,
    category: rule?.category ?? "Opérations",
    description,
    visibility: rule?.visibility ?? "nda",
    source_file_name: file.name,
    source_file_size: file.size,
    source_mime_type: mime,
    dynamic_fields: {
      imported_at: new Date().toISOString(),
      detected_type: type,
      detected_category: rule?.category ?? "Opérations",
      ...(detectedDate ? { detected_date: detectedDate } : {}),
      extraction: extracted ? "contenu+nom" : "nom de fichier",
    },
  };
};

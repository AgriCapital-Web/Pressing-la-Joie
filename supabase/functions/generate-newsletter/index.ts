import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const audienceLabels: Record<string, string> = {
  all: "tous les contacts",
  testimonials: "personnes ayant laissé un témoignage",
  subscribers: "abonnés newsletter",
  investors: "investisseurs",
  prospects: "prospects commerciaux",
  partners: "partenaires techniques, financiers ou institutionnels",
  clients: "clients et planteurs",
  members: "membres de la communauté AgriCapital",
  custom: "segment personnalisé",
};

async function verifyAdmin(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (error || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: roleData } = await adminClient.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
  if (!roleData) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  return { userId: user.id };
}

const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const stripHtml = (html: string) => html.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authResult = await verifyAdmin(req);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await req.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const targetAudience = typeof body.targetAudience === "string" ? body.targetAudience : "all";
    const includeImage = Boolean(body.includeImage);
    const includeVideo = Boolean(body.includeVideo);

    if (prompt.length < 2) {
      return new Response(JSON.stringify({ error: "Décrivez l'intention de la campagne" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const audience = audienceLabels[targetAudience] || audienceLabels.all;
    const mediaInstruction = [
      includeImage ? "prévoir un bloc image avec une légende utile" : "ne pas insérer d'image",
      includeVideo ? "prévoir un bloc vidéo sous forme de lien/bouton compatible email" : "ne pas insérer de vidéo",
    ].join(" ; ");

    const systemPrompt = `Tu es un expert senior en marketing digital, communication institutionnelle, copywriting, acquisition client, relations investisseurs et fidélisation pour AgriCapital SARL.

Tu dois transformer n'importe quelle entrée utilisateur (mots-clés, idée, brouillon, note désordonnée ou texte complet) en campagne emailing professionnelle prête à envoyer.

Contexte AgriCapital : promoteur agricole ivoirien basé à Daloa, plantations professionnelles de palmier à huile, foncier agricole sécurisé, accompagnement clé en main, slogan "Investir la terre. Cultiver l'avenir.".

Règles :
- Segment destinataire : ${audience}. Adapte le ton, les arguments et le vocabulaire au segment.
- Types possibles : prospection, investisseurs, partenaires, événement, promotion, newsletter, relance, fidélisation, rendez-vous, institutionnel, collecte de fonds, recrutement, sensibilisation ou tout besoin futur.
- ${mediaInstruction}.
- Pas de prix inventé. Pas de promesse financière irréaliste.
- Salutation dynamique obligatoire : "Bonjour {{prenom}} {{nom}}," puis expliquer que si les champs sont absents le système utilisera "Bonjour très cher,".
- Signature premium modifiable d'Inocent KOFFI, Fondateur & Gérant, AgriCapital SARL.
- Retourne uniquement un JSON valide, sans markdown.

Schéma JSON exact :
{
  "name": "nom interne court de campagne",
  "subject": "objet optimisé ouverture, max 70 caractères",
  "preheader": "pré-header optimisé, max 120 caractères",
  "headline": "titre principal",
  "greeting": "Bonjour {{prenom}} {{nom}},",
  "intro": "introduction",
  "sections": [{"title":"titre", "body":"paragraphe", "bullets":["puce"]}],
  "trustElements": ["preuve ou élément de confiance"],
  "cta": {"label":"texte bouton", "url":"https://www.agricapital.ci/contact", "supportingText":"phrase avant bouton"},
  "closing": "conclusion",
  "signature": "signature complète en texte",
  "plainText": "version texte brut complète",
  "imageSuggestion": "description d'image si demandée, sinon chaîne vide",
  "videoSuggestion": "description ou lien vidéo si demandé, sinon chaîne vide"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt.slice(0, 5000) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Limite de requêtes atteinte." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const campaign = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || content);
    const html = buildCampaignHtml(campaign, { includeImage, includeVideo });

    return new Response(JSON.stringify({
      ...campaign,
      html,
      plainText: campaign.plainText || stripHtml(html),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Campaign generation error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur de génération" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

function buildCampaignHtml(data: any, media: { includeImage: boolean; includeVideo: boolean }): string {
  const sections = Array.isArray(data.sections) ? data.sections : [];
  const trust = Array.isArray(data.trustElements) ? data.trustElements : [];
  const sectionHtml = sections.map((s: any) => `
    <h2 style="color:#1A5C38;font-size:20px;margin:24px 0 10px;line-height:1.3;">${escapeHtml(s.title)}</h2>
    <p style="color:#2f3a34;font-size:15px;line-height:1.7;margin:0 0 12px;">${escapeHtml(s.body)}</p>
    ${Array.isArray(s.bullets) && s.bullets.length ? `<ul style="padding-left:22px;color:#2f3a34;font-size:15px;line-height:1.7;margin:8px 0 18px;">${s.bullets.map((b: string) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>` : ""}
  `).join("");

  const trustHtml = trust.length ? `<div style="background:#F7F3EA;border-left:4px solid #E8960A;padding:16px 18px;margin:22px 0;border-radius:8px;"><p style="margin:0 0 8px;color:#1A5C38;font-weight:700;">Éléments de confiance</p><ul style="margin:0;padding-left:20px;color:#2f3a34;font-size:14px;line-height:1.6;">${trust.map((item: string) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : "";
  const imageHtml = media.includeImage ? `<div style="margin:24px 0;background:#F7F3EA;border:1px dashed #d8c9a4;border-radius:10px;padding:18px;text-align:center;color:#6b5a32;font-size:14px;">Image recommandée : ${escapeHtml(data.imageSuggestion || "photo terrain AgriCapital premium")}</div>` : "";
  const videoHtml = media.includeVideo ? `<p style="text-align:center;margin:22px 0;"><a href="https://www.agricapital.ci" style="color:#1A5C38;font-weight:700;text-decoration:underline;">▶ Voir la vidéo AgriCapital</a></p>` : "";
  const cta = data.cta || {};

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;"><div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(data.preheader)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:20px 0;"><tr><td align="center"><table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;"><tr><td style="background:#f5efe1;padding:26px 28px;text-align:center;border-bottom:3px solid #1A5C38;"><img src="https://www.agricapital.ci/Logo_AgriCapital_-V2-4.png" alt="AgriCapital" width="200" style="display:block;margin:0 auto 8px;max-width:200px;height:auto;"><p style="color:#ed7500;font-size:13px;margin:0;font-weight:700;">Investir la terre. Cultiver l'avenir.</p></td></tr><tr><td style="padding:30px;"><p style="color:#66716b;font-size:14px;margin:0 0 16px;">${escapeHtml(data.greeting || "Bonjour {{prenom}} {{nom}},")}</p><h1 style="color:#14231b;font-size:28px;line-height:1.2;margin:0 0 16px;">${escapeHtml(data.headline)}</h1><p style="color:#2f3a34;font-size:16px;line-height:1.7;margin:0 0 18px;">${escapeHtml(data.intro)}</p>${imageHtml}${sectionHtml}${trustHtml}${videoHtml}<div style="text-align:center;margin:28px 0;"><p style="color:#2f3a34;font-size:15px;line-height:1.6;margin:0 0 14px;">${escapeHtml(cta.supportingText || "Échangeons sur votre projet.")}</p><a href="${escapeHtml(cta.url || "https://www.agricapital.ci/contact")}" style="display:inline-block;background:#E8960A;color:#ffffff;padding:14px 30px;border-radius:8px;text-decoration:none;font-weight:800;font-size:15px;">${escapeHtml(cta.label || "Nous contacter")}</a></div><p style="color:#2f3a34;font-size:15px;line-height:1.7;margin:22px 0;">${escapeHtml(data.closing)}</p><div style="border-top:2px solid #EAE4D5;margin-top:26px;padding-top:18px;color:#2f3a34;font-size:14px;line-height:1.6;"><p style="margin:0;font-weight:800;color:#14231b;">Inocent KOFFI</p><p style="margin:2px 0;">Fondateur & Gérant<br>AgriCapital SARL</p><p style="margin:8px 0 0;">🌐 www.agricapital.ci<br>📧 contact@agricapital.ci<br>📞 +225 05 64 55 17 17</p><p style="margin:8px 0 0;color:#E8960A;font-weight:700;">Investir la terre. Cultiver l'avenir.</p></div></td></tr></table></td></tr></table></body></html>`;
}
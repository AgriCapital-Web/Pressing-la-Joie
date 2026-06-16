import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function verifyAdmin(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = data.claims.sub as string;

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data: roleData } = await adminClient
    .from("user_roles").select("role")
    .eq("user_id", userId).eq("role", "admin").single();

  if (!roleData) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return { userId };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Admin auth check
  const authResult = await verifyAdmin(req);
  if (authResult instanceof Response) return authResult;

  try {
    const { prompt, targetAudience } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Un sujet est requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const audienceContext = targetAudience === 'investors' 
      ? "investisseurs et partenaires financiers" 
      : targetAudience === 'partners' 
        ? "partenaires techniques et institutionnels"
        : targetAudience === 'clients'
          ? "clients, planteurs et producteurs agricoles"
          : "tous les abonnés (investisseurs, partenaires, planteurs)";

    const systemPrompt = `Tu es le directeur de communication d'AgriCapital, promoteur agricole ivoirien spécialisé dans la création et gestion clé en main de plantations de palmier à huile.

MISSION : Générer une newsletter professionnelle, moderne et engageante.

CONTEXTE :
- AgriCapital = Promoteur agricole et services intégrés en Côte d'Ivoire
- Activité : Création, entretien et gestion de plantations de palmier à huile clé en main
- Slogan : "Investir la terre. Cultiver l'avenir."
- Ton : professionnel, chaleureux, inspirant, orienté patrimoine et investissement durable
- Public cible : ${audienceContext}
- JAMAIS mentionner de montants financiers spécifiques ni de prix
- JAMAIS mentionner "Palmier Solidaire" — utiliser "nos programmes" ou "notre accompagnement"
- Orthographe irréprochable
- Inclure un appel à l'action clair et universel

FORMAT JSON STRICT :
{
  "subject": "Objet du mail percutant et professionnel (max 60 car)",
  "greeting": "Salutation personnalisée selon l'audience",
  "headline": "Titre principal accrocheur",
  "introduction": "2-3 phrases d'accroche engageantes",
  "sections": [
    {
      "title": "Titre de section",
      "content": "Contenu de la section (3-4 phrases max)",
      "emoji": "🌴"
    }
  ],
  "callToAction": {
    "text": "Texte du bouton d'action",
    "description": "Phrase accompagnant le CTA"
  },
  "closing": "Message de clôture inspirant",
  "hashtags": ["tag1", "tag2", "tag3"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Génère une newsletter complète sur ce thème : "${prompt.slice(0, 2000)}"` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse newsletter content");
    }

    const newsletter = JSON.parse(jsonMatch[0]);
    const html = buildNewsletterHtml(newsletter);

    return new Response(JSON.stringify({ 
      ...newsletter,
      html,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Newsletter generation error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erreur de génération" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildNewsletterHtml(data: any): string {
  const sections = (data.sections || []).map((s: any) => `
    <tr>
      <td style="padding: 20px 30px;">
        <h2 style="color: #166534; font-size: 18px; margin: 0 0 10px; font-weight: 700;">${s.emoji || '🌿'} ${s.title}</h2>
        <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0;">${s.content}</p>
      </td>
    </tr>
    <tr><td style="padding: 0 30px;"><hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;"></td></tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Arial, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
  <tr>
    <td style="background: linear-gradient(135deg, #166534 0%, #14532d 50%, #0f4c25 100%); padding: 30px; text-align: center;">
      <img src="https://www.agricapital.ci/Logo_AgriCapital_-V2-4.png" alt="AgriCapital" width="180" style="margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto;">
      <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 8px 0 0; font-weight: 400;">Investir la terre. Cultiver l'avenir.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 30px 30px 10px;">
      <h1 style="color: #111827; font-size: 24px; margin: 0 0 15px; font-weight: 800; line-height: 1.3;">${data.headline || ''}</h1>
      <p style="color: #6b7280; font-size: 14px; margin: 0;">${data.greeting || ''}</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 10px 30px 20px;">
      <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0;">${data.introduction || ''}</p>
    </td>
  </tr>
  <tr><td style="padding: 0 30px;"><hr style="border: none; border-top: 2px solid #166534; margin: 0;"></td></tr>
  ${sections}
  ${data.callToAction ? `
  <tr>
    <td style="padding: 25px 30px; text-align: center;">
      <p style="color: #374151; font-size: 15px; margin: 0 0 15px;">${data.callToAction.description || ''}</p>
      <a href="https://www.agricapital.ci" style="display: inline-block; background: linear-gradient(135deg, #166534, #22863a); color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">${data.callToAction.text || 'En savoir plus'}</a>
    </td>
  </tr>` : ''}
  <tr>
    <td style="padding: 20px 30px;">
      <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0; font-style: italic;">${data.closing || ''}</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px 30px; border-top: 2px solid #e5e7eb;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align: top; width: 50px;">
            <div style="width: 40px; height: 40px; background: #166534; border-radius: 50%; text-align: center; line-height: 40px; color: white; font-weight: bold; font-size: 18px;">A</div>
          </td>
          <td style="vertical-align: top; padding-left: 12px;">
            <p style="margin: 0; font-weight: 700; color: #111827; font-size: 14px;">L'équipe AgriCapital</p>
            <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">Promoteur agricole et services intégrés</p>
            <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">📞 05 64 55 17 17 | 📧 contact@agricapital.ci</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        AgriCapital SARL - Côte d'Ivoire<br/>
        <a href="https://www.agricapital.ci" style="color: #166534; text-decoration: none;">www.agricapital.ci</a>
      </p>
      ${data.hashtags?.length ? `<p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0;">${data.hashtags.map((h: string) => `#${h.replace(/^#/,'')}`).join(' ')}</p>` : ''}
    </td>
  </tr>
</table>
</td></tr></table>
</body></html>`;
}

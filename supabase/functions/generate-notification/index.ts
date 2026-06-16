import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const { type, userData } = await req.json();
    
    if (!type || !userData) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate type
    const allowedTypes = ["inscription", "connexion", "reset_password", "opportunites", "administratif", "securite"];
    const sanitizedType = typeof type === "string" ? type.slice(0, 100) : "unknown";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es un assistant IA spécialisé dans la communication client pour AgriCapital.
Ton rôle est de générer des messages de notification automatiques personnalisés, professionnels et sécurisés.

RÈGLES DE GÉNÉRATION :
1. Commence TOUJOURS par : "Message généré automatiquement, ne pas répondre."
2. Ton professionnel, concis et engageant (2-3 phrases maximum).
3. Inclus le nom de l'utilisateur pour la personnalisation.
4. Génère un lien d'action fictif pertinent (ex: [LienSecurise], [LienConfirmation]).
5. Le message doit être clair et inciter à l'action appropriée.

FORMAT DE RÉPONSE ATTENDU (JSON STRICT) :
{
  "utilisateur": {
    "nom": "Nom complet de l'utilisateur",
    "telephone": "Numéro de téléphone"
  },
  "type_notification": "Type de l'événement",
  "message": "Le message complet généré"
}`;

    // Sanitize user data
    const safeFirstName = typeof userData.firstName === "string" ? userData.firstName.slice(0, 100) : "Utilisateur";
    const safeLastName = typeof userData.lastName === "string" ? userData.lastName.slice(0, 100) : "";
    const safePhone = typeof userData.phone === "string" ? userData.phone.slice(0, 20) : "Non renseigné";

    const userPrompt = `Génère une notification pour l'événement "${sanitizedType}" concernant l'utilisateur suivant :
Nom : ${safeFirstName} ${safeLastName}
Téléphone : ${safePhone}
Statut : ${typeof userData.status === "string" ? userData.status.slice(0, 50) : "Standard"}

Le message doit être adapté à cet événement spécifique.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI Gateway error:", error);
      throw new Error("Failed to generate notification");
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;
    
    let parsedContent;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        parsedContent = {
          utilisateur: { nom: `${safeFirstName} ${safeLastName}`, telephone: safePhone },
          type_notification: sanitizedType,
          message: aiContent
        };
      }
    } catch (e) {
      console.error("Error parsing AI response:", e);
      parsedContent = {
        utilisateur: { nom: `${safeFirstName} ${safeLastName}`, telephone: safePhone },
        type_notification: sanitizedType,
        message: aiContent
      };
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("admin_notifications").insert({
      title: `Notification: ${sanitizedType}`,
      message: parsedContent.message,
      type: "system_notification",
      data: parsedContent
    });

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-notification function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

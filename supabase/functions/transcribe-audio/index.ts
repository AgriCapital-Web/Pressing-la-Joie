import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { checkRateLimit, clientKey, rateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting : 10 transcriptions / minute et 60 / heure par IP.
    const minute = checkRateLimit(clientKey(req, "stt:m"), { limit: 10, windowMs: 60_000 });
    if (!minute.allowed) return rateLimitResponse(minute, corsHeaders);
    const hour = checkRateLimit(clientKey(req, "stt:h"), { limit: 60, windowMs: 3_600_000 });
    if (!hour.allowed) return rateLimitResponse(hour, corsHeaders);

    const { audio, mimeType } = await req.json();
    
    if (!audio) {
      throw new Error("No audio data provided");
    }

    // Cap payload size (~6 MB of base64 audio) before hitting the AI gateway
    const MAX_BASE64_LENGTH = 8_000_000;
    if (typeof audio !== "string" || audio.length > MAX_BASE64_LENGTH) {
      return new Response(JSON.stringify({ error: "Audio trop volumineux (max ~6 Mo)." }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Sending audio to Gemini for transcription...");

    // Use Gemini multimodal for transcription (replaces ElevenLabs)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Transcris exactement ce message audio mot pour mot. Retourne UNIQUEMENT le texte transcrit, sans commentaire, sans guillemets, sans préfixe. Si l'audio est en français, transcris en français. Si dans une autre langue, transcris dans cette langue."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType || "audio/webm"};base64,${audio}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques instants." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content?.trim() || "";
    
    console.log("Transcription successful:", text.substring(0, 100));

    return new Response(
      JSON.stringify({ text, language: "auto" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Transcription error:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

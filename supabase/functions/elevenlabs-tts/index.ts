import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Female voices — multilingual, warm and professional.
// For French/Ivorian context we use Sarah (warm, multilingual, suits African French phonetics)
const voiceMap: Record<string, string> = {
  fr: "EXAVITQu4vr4xnSDxMaL", // Sarah - female, warm, multilingual (best for Ivorian French)
  en: "EXAVITQu4vr4xnSDxMaL", // Sarah
  ar: "EXAVITQu4vr4xnSDxMaL", // Sarah - multilingual
  es: "FGY2WhTYpPnrIDTdsKH5", // Laura - female
  de: "FGY2WhTYpPnrIDTdsKH5", // Laura - female
  zh: "XrExE9yKIg1WjnnlVkGX", // Matilda - female multilingual
};

/**
 * Strip Markdown / formatting characters so the TTS does not vocalize
 * symbols like "**", "*", "#", "`", "_", "~", links, lists, tables, etc.
 */
function sanitizeForTTS(input: string): string {
  if (!input) return "";
  let text = input;

  // Remove code blocks (```...```)
  text = text.replace(/```[\s\S]*?```/g, " ");
  // Remove inline code (`...`)
  text = text.replace(/`([^`]+)`/g, "$1");
  // Remove images ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  // Convert markdown links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // Remove headings (# Title)
  text = text.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  // Remove blockquotes (> ...)
  text = text.replace(/^\s{0,3}>\s?/gm, "");
  // Remove bold/italic markers (**, __, *, _) without removing inner text
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");
  // Remove strikethrough ~~text~~
  text = text.replace(/~~(.*?)~~/g, "$1");
  // Remove horizontal rules
  text = text.replace(/^\s*[-*_]{3,}\s*$/gm, " ");
  // Remove markdown table separators |---|---|
  text = text.replace(/^\s*\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/gm, " ");
  // Convert table cell separators "|" to commas for natural reading
  text = text.replace(/\s*\|\s*/g, ", ");
  // Remove bullet markers
  text = text.replace(/^\s*[-*+]\s+/gm, "");
  // Remove numbered list markers (1. 2. ...)
  text = text.replace(/^\s*\d+\.\s+/gm, "");
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  // Remove leftover stray markdown characters
  text = text.replace(/[*_`~#>]+/g, " ");
  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language = "fr" } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "TTS service not configured", fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const voiceId = voiceMap[language] || voiceMap["fr"];
    const cleanText = sanitizeForTTS(text).slice(0, 1500);

    if (!cleanText) {
      return new Response(
        JSON.stringify({ error: "Empty after sanitization", fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`TTS [${language}] voice=${voiceId} len=${cleanText.length}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_multilingual_v2", // Best for Ivorian French phonetics
          voice_settings: {
            stability: 0.55,        // Slightly higher for serious, professional tone
            similarity_boost: 0.85, // Stay close to selected voice
            style: 0.45,            // Some warmth/expressiveness
            use_speaker_boost: true,
            speed: 0.95,            // Slightly slower for clarity & natural flow
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "SPEECH_GENERATION_FAILED", fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", fallback: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

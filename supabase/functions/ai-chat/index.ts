import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const MAX_MESSAGE_LENGTH = 8000;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const SITE_CONTEXT = `
Tu es KAPITA, l'assistante virtuelle d'AgriCapital. Tu réponds comme une conseillère professionnelle, claire, chaleureuse et factuelle.
Réponds uniquement avec les informations vérifiées du site AgriCapital. Si une information manque, oriente vers l'équipe AgriCapital.
Ne révèle jamais de prix, montants, mécanismes internes, détails contractuels confidentiels ou promesses financières.
AgriCapital est un opérateur et promoteur agricole professionnel : patrimoine agricole durable, contrats sécurisés, accompagnement professionnel, PalmInvest, PalmInvest+, TerraPalm, TerraPalm+.
Contacts officiels : +225 05 64 55 17 17, contact@agricapital.ci, www.agricapital.ci.
Réponds dans la langue du visiteur, en texte simple, sans Markdown lourd.
`;

const MODEL_CHAIN = [
  { id: "openai/gpt-5-mini", family: "GPT" },
  { id: "openai/gpt-5-nano", family: "GPT" },
  { id: "google/gemini-2.5-flash", family: "Fallback" },
];

const isRateLimited = (ip: string) => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) return true;
  record.count++;
  return false;
};

const cleanupRateLimitStore = () => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) if (now > record.resetAt) rateLimitStore.delete(ip);
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  cleanupRateLimitStore();

  const startTime = Date.now();
  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(clientIP)) {
    return new Response(JSON.stringify({ error: "Trop de requêtes. Veuillez patienter." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  let usedModel = "";
  let retryCount = 0;
  let lastError = "";
  let sanitizedVisitorId = "anonymous";
  let lastUserText = "";
  let language = "fr";

  const writeLog = async (status: "success" | "failure", errorMessage?: string) => {
    try {
      const approxTokens = Math.ceil((lastUserText.length + SITE_CONTEXT.length) / 4);
      await supabase.from("ai_chat_logs").insert({
        session_id: sanitizedVisitorId,
        user_message: lastUserText.slice(0, 5000) || "[message]",
        assistant_response: status === "success" ? "streaming" : (errorMessage || "failure"),
        language,
        status,
        model: usedModel || null,
        duration_ms: Date.now() - startTime,
        tokens_total: approxTokens,
        retry_count: retryCount,
        error_message: errorMessage || null,
      } as any);
    } catch (logError) {
      console.error("AI log error", logError);
    }
  };

  try {
    const body = await req.json();
    const { messages, visitorId, attachment } = body;
    language = body.language || "fr";
    sanitizedVisitorId = (visitorId || "anonymous").slice(0, 100).replace(/[^a-zA-Z0-9-_]/g, "");

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages requis" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const limitedMessages = messages.slice(-12);
    for (const msg of limitedMessages) {
      const content = typeof msg.content === "string" ? msg.content : "";
      if (content.length > MAX_MESSAGE_LENGTH) {
        return new Response(JSON.stringify({ error: `Message trop long. Maximum ${MAX_MESSAGE_LENGTH} caractères.` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const langInstruction = { fr: "Réponds en français clair et naturel.", en: "Reply in English.", ar: "أجب بالعربية.", es: "Responde en español.", de: "Antworte auf Deutsch.", zh: "用中文回答。" }[language] || "Réponds en français.";
    const apiMessages: any[] = [{ role: "system", content: `${SITE_CONTEXT}\n${langInstruction}\nID visiteur: ${sanitizedVisitorId}` }];
    for (let i = 0; i < limitedMessages.length - 1; i++) apiMessages.push({ role: limitedMessages[i].role, content: limitedMessages[i].content });

    const lastMessage = limitedMessages[limitedMessages.length - 1];
    lastUserText = typeof lastMessage.content === "string" ? lastMessage.content : "[multimodal]";

    if (attachment?.content && attachment.type === "image") {
      const base64Data = attachment.content.includes(",") ? attachment.content.split(",")[1] : attachment.content;
      const mimeType = attachment.content.includes("data:") ? attachment.content.split(";")[0].split(":")[1] : "image/jpeg";
      apiMessages.push({ role: "user", content: [{ type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }, { type: "text", text: `${lastUserText || "Analyse cette image."}` }] });
    } else {
      apiMessages.push({ role: lastMessage.role, content: lastMessage.content });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let response: Response | null = null;
    const chain = attachment?.type === "image" ? [{ id: "google/gemini-2.5-pro", family: "Vision" }, ...MODEL_CHAIN] : MODEL_CHAIN;
    for (const entry of chain) {
      usedModel = entry.id;
      try {
        const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: entry.id, messages: apiMessages, stream: true }),
        });
        if (r.ok) { response = r; break; }
        if (r.status === 402) {
          await writeLog("failure", "Crédits IA épuisés");
          return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        lastError = `${entry.id} HTTP ${r.status}: ${(await r.text()).slice(0, 250)}`;
        retryCount++;
      } catch (e) {
        lastError = `${entry.id}: ${e instanceof Error ? e.message : "erreur réseau"}`;
        retryCount++;
      }
    }

    if (!response?.body) throw new Error(lastError || "Tous les modèles ont échoué");
    await writeLog("success");
    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream", "X-AI-Model": usedModel, "X-AI-Retry-Count": String(retryCount), "X-AI-Duration-Ms": String(Date.now() - startTime) } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    await writeLog("failure", message);
    return new Response(JSON.stringify({ error: "Le service IA est temporairement indisponible. Veuillez réessayer." }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
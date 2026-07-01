import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

async function extractFromImage(base64: string, mime: string): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return "";
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Extract every email address and, if visible next to it, the person's name and any label like Oui/Non/Peut-être/En attente. Return one CSV line per contact: email;name;label. No headers, no comments." },
          { type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } },
        ],
      }],
    }),
  });
  const json = await res.json();
  return json?.choices?.[0]?.message?.content || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Admin check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) return new Response(JSON.stringify({ error: "Accès refusé" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json();
    const { text = "", images = [], defaultCategory = "import", defaultTag = "attente" } = body || {};

    let combined = String(text || "");
    const iaLines: string[] = [];
    for (const img of images || []) {
      if (img?.base64 && img?.mime) {
        const extracted = await extractFromImage(img.base64, img.mime);
        if (extracted) iaLines.push(extracted);
      }
    }
    combined = [combined, ...iaLines].join("\n");

    const emails = new Map<string, { first_name: string; last_name: string; tag: string }>();
    for (const line of combined.split(/\r?\n/)) {
      const found = line.match(EMAIL_RE);
      if (!found) continue;
      for (const raw of found) {
        const email = raw.toLowerCase().trim();
        if (emails.has(email)) continue;
        // try to parse `email;name;label` or `label,email` context
        const parts = line.split(/[;,\t|]+/).map(s => s.trim());
        const nameGuess = parts.find(p => p && !p.includes("@") && !/^(oui|non|peut-?être|en attente|facultatif|attente)$/i.test(p)) || "";
        const labelGuess = parts.map(p => p.toLowerCase()).find(p => /^(oui|non|peut-?être|en attente|facultatif|attente)$/i.test(p)) || defaultTag;
        const [first = "", ...rest] = nameGuess.split(/\s+/);
        emails.set(email, {
          first_name: first,
          last_name: rest.join(" "),
          tag: labelGuess.replace(/peut-?être/i, "peut-etre").replace(/en attente/i, "attente").toLowerCase(),
        });
      }
    }

    if (emails.size === 0) {
      return new Response(JSON.stringify({ inserted: 0, updated: 0, total: 0, message: "Aucune adresse détectée" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const rows = [...emails.entries()].map(([email, info]) => ({
      email, first_name: info.first_name, last_name: info.last_name,
      is_active: true, source: "admin_import", category: defaultCategory, tag: info.tag,
    }));

    // Upsert (do not send welcome email)
    const { error, count } = await supabase.from("newsletter_subscribers").upsert(rows, { onConflict: "email", ignoreDuplicates: false, count: "exact" });
    if (error) throw error;

    return new Response(JSON.stringify({ success: true, total: rows.length, inserted: count ?? rows.length, sample: rows.slice(0, 5) }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("import-emails error", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

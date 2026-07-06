import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const htmlPage = (title: string, body: string) => `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><title>${title}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:'Segoe UI',Arial,sans-serif;background:#f5efe1;margin:0;padding:40px 20px;color:#1f2937}
.box{max-width:520px;margin:40px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.06)}
h1{color:#166534;margin:0 0 8px;font-size:22px}
p{color:#4b5563;line-height:1.6;margin:8px 0}
.brand{color:#ed7500;font-weight:700}
a{color:#166534}</style></head>
<body><div class="box"><p class="brand">AgriCapital · Investir la terre. Cultiver l'avenir.</p><h1>${title}</h1>${body}<p style="margin-top:20px;font-size:12px;color:#9ca3af">Vous pouvez toujours revenir sur <a href="https://www.agricapital.ci">www.agricapital.ci</a>.</p></div></body></html>`;

const brevoFetch = (apiKey: string, path: string, init: RequestInit = {}) =>
  fetch(`https://api.brevo.com/v3${path}`, {
    ...init,
    headers: { "api-key": apiKey, "Content-Type": "application/json", ...(init.headers || {}) },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    let token = url.searchParams.get("token") || "";
    let email = (url.searchParams.get("email") || "").toLowerCase().trim();

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      token = token || String(body.token || "");
      email = email || String(body.email || "").toLowerCase().trim();
    }

    if (!token && !email) {
      return new Response(htmlPage("Lien invalide", "<p>Aucun identifiant de désabonnement fourni.</p>"), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const query = supabase.from("newsletter_subscribers").update({ is_active: false, unsubscribed_at: new Date().toISOString() });
    const { data, error } = token
      ? await query.eq("unsubscribe_token", token).select("email").maybeSingle()
      : await query.eq("email", email).select("email").maybeSingle();

    if (error) throw error;
    if (!data) {
      return new Response(htmlPage("Adresse introuvable", "<p>Cet abonnement n'existe pas ou a déjà été retiré.</p>"), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Best-effort: mirror status to Brevo (contact blacklisted)
    const BREVO = Deno.env.get("BREVO_API_KEY");
    if (BREVO) {
      try {
        await brevoFetch(BREVO, `/contacts/${encodeURIComponent(data.email)}`, {
          method: "PUT",
          body: JSON.stringify({ emailBlacklisted: true }),
        });
      } catch (e) { console.log("Brevo blacklist warn:", e); }
    }

    return new Response(htmlPage("Désabonnement confirmé", `<p>L'adresse <strong>${data.email}</strong> ne recevra plus nos emails.</p><p>Nous respectons votre choix — vous pouvez vous réabonner à tout moment depuis notre site.</p>`), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("unsubscribe error", err);
    return new Response(htmlPage("Erreur", "<p>Une erreur est survenue. Merci de réessayer plus tard.</p>"), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_RETRIES = 3;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startedAt = Date.now();
  const attempts: Array<{ attempt: number; status: number | null; message: string; latency_ms: number }> = [];

  try {
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      return new Response(JSON.stringify({
        success: false,
        stage: "config",
        error: "BREVO_API_KEY absent des variables d'environnement.",
        attempts,
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, stage: "auth", error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ success: false, stage: "auth", error: "Session invalide" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").single();
    if (!roleData) {
      return new Response(JSON.stringify({ success: false, stage: "auth", error: "Réservé aux administrateurs" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { to } = await req.json().catch(() => ({ to: user.email }));
    const recipient = (typeof to === "string" && to.includes("@")) ? to : user.email!;

    const payload = {
      sender: { name: "AgriCapital", email: "contact@agricapital.ci" },
      to: [{ email: recipient }],
      subject: `[Test AgriCapital] Envoi Brevo — ${new Date().toLocaleString("fr-FR")}`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f3f4f6;border-radius:12px;">
          <h2 style="color:#166534;margin:0 0 12px;">✅ Test d'envoi Brevo</h2>
          <p style="color:#374151;line-height:1.6;">
            Cet email confirme que la chaîne d'envoi Brevo depuis l'admin AgriCapital fonctionne correctement.
          </p>
          <p style="color:#6b7280;font-size:13px;margin-top:24px;">
            Déclenché par : ${user.email}<br/>
            Horodatage : ${new Date().toISOString()}
          </p>
        </div>
      `,
    };

    let lastBrevoBody: any = null;
    let success = false;
    let brevoStatus: number | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const t0 = Date.now();
      try {
        const r = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json", accept: "application/json" },
          body: JSON.stringify(payload),
        });
        brevoStatus = r.status;
        const body = await r.json().catch(() => ({ raw: "réponse non-JSON" }));
        lastBrevoBody = body;
        attempts.push({ attempt, status: r.status, message: r.ok ? "ok" : (body?.message || body?.code || "erreur"), latency_ms: Date.now() - t0 });
        if (r.ok) { success = true; break; }
        if (r.status >= 400 && r.status < 500 && r.status !== 429) break; // erreur client non retryable
      } catch (e) {
        attempts.push({ attempt, status: null, message: e instanceof Error ? e.message : "exception réseau", latency_ms: Date.now() - t0 });
      }
      if (attempt < MAX_RETRIES) await new Promise((res) => setTimeout(res, 500 * attempt));
    }

    return new Response(JSON.stringify({
      success,
      stage: success ? "sent" : "brevo",
      recipient,
      brevo_status: brevoStatus,
      brevo_response: lastBrevoBody,
      attempts,
      total_ms: Date.now() - startedAt,
    }), { status: success ? 200 : 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      stage: "server",
      error: error?.message || "Erreur serveur",
      attempts,
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

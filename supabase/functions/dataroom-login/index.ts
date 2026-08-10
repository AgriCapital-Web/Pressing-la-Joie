// AgriCapital Cloud — login with email + access code
// Le code d'accès personnel (généré à l'inscription) est le SEUL moyen de connexion.
// Une session serveur (jeton opaque haché) est émise à la connexion réussie.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Durée de vie d'une session signataire
const SESSION_TTL_HOURS = 12;

async function sha256(v: string): Promise<string> {
  const data = new TextEncoder().encode(v);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function genToken(): string {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { email, code, action, device_email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (action === "resend") {
      return new Response(JSON.stringify({ ok: true, message: "Si votre e-mail existe, un code vous sera renvoyé." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!code) {
      return new Response(JSON.stringify({ error: "Code requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ua = req.headers.get("user-agent") ?? null;

    const cleanCode = String(code).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    // Signatory MUST already exist (NDA rempli + email en base) — comparaison insensible à la casse
    const { data: sigList } = await supabase
      .from("dataroom_signatories")
      .select("id, full_name, email, profile_type, access_code_hash")
      .ilike("email", cleanEmail)
      .limit(1);
    const sig = sigList?.[0];

    if (!sig) {
      return new Response(JSON.stringify({ error: "E-mail non enregistré. Veuillez d'abord remplir le NDA." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let authorized = false;
    // Code personnel généré à l'inscription (essai exact puis normalisé)
    const candidates = [cleanCode, cleanCode.toUpperCase(), cleanCode.toLowerCase()];
    for (const c of candidates) {
      if (sig.access_code_hash && (await sha256(c)) === sig.access_code_hash) { authorized = true; break; }
    }


    if (!authorized) {
      await supabase.from("dataroom_access_logs").insert({
        signatory_id: sig.id,
        action: "login_failed",
        ip_address: ip,
        user_agent: ua,
        device_type: device_email ?? null,
      });
      return new Response(JSON.stringify({ error: "Code invalide" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Création d'une session serveur : seul le hash est stocké
    const sessionToken = genToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000).toISOString();
    await supabase.from("dataroom_sessions").insert({
      signatory_id: sig.id,
      token_hash: await sha256(sessionToken),
      expires_at: expiresAt,
      ip_address: ip,
      user_agent: ua,
    });

    // Log success — device_type field re-used to capture "device email" (email connecté sur l'appareil)
    await supabase.from("dataroom_access_logs").insert({
      signatory_id: sig.id,
      action: "login",
      ip_address: ip,
      user_agent: ua,
      device_type: device_email ?? null,
    });

    return new Response(JSON.stringify({
      ok: true,
      signatory: { id: sig.id, full_name: sig.full_name, email: sig.email, profile_type: sig.profile_type },
      session_token: sessionToken,
      expires_at: expiresAt,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dataroom-login error", e);
    return new Response(JSON.stringify({ error: "Erreur interne" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

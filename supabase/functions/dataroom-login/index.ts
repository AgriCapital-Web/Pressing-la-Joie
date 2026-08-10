// AgriCapital Cloud — login with email + access code
// Supports a MASTER access code ("AgriCap") for owner/emergency use.
// Master code only grants access if the email is already registered as a signatory.
// All master-code usage is fully tracked (IP, UA, timestamp) in dataroom_access_logs.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Codes maîtres acceptés (insensibles à la casse et aux espaces)
const MASTER_ACCESS_CODES = ["agricap", "agrica"];

async function sha256(v: string): Promise<string> {
  const data = new TextEncoder().encode(v);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
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
    const isMaster = MASTER_ACCESS_CODES.includes(cleanCode.toLowerCase());

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
    let method: "normal" | "master" = "normal";

    if (isMaster) {
      authorized = true;
      method = "master";
    } else {
      // Code personnel généré à l'inscription (essai exact puis normalisé)
      const candidates = [cleanCode, cleanCode.toUpperCase(), cleanCode.toLowerCase()];
      for (const c of candidates) {
        if ((await sha256(c)) === sig.access_code_hash) { authorized = true; break; }
      }
    }


    if (!authorized) {
      await supabase.from("dataroom_access_logs").insert({
        signatory_id: sig.id,
        action: isMaster ? "login_failed_master" : "login_failed",
        ip_address: ip,
        user_agent: ua,
        device_type: device_email ?? null,
      });
      return new Response(JSON.stringify({ error: "Code invalide" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log success — device_type field re-used to capture "device email" (email connecté sur l'appareil)
    await supabase.from("dataroom_access_logs").insert({
      signatory_id: sig.id,
      action: method === "master" ? "login_master_code" : "login",
      ip_address: ip,
      user_agent: ua,
      device_type: device_email ?? null,
    });

    return new Response(JSON.stringify({
      ok: true,
      signatory: { id: sig.id, full_name: sig.full_name, email: sig.email, profile_type: sig.profile_type },
      auth_method: method,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

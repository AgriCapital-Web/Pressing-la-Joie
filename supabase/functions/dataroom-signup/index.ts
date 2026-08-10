// AgriCapital Cloud — signup (NDA + KYC + access-code delivery)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
function genCode(len = 6): string {
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  let out = "";
  for (const b of buf) out += CHARS[b % CHARS.length];
  return out;
}

async function sha256(v: string): Promise<string> {
  const data = new TextEncoder().encode(v);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const {
      full_name, email, phone, whatsapp, profession, organization, country,
      profile_type, newsletter_optin, id_document_base64, id_document_ext,
    } = body ?? {};

    if (!full_name || !email) {
      return new Response(JSON.stringify({ error: "Nom et e-mail requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Existing signatory? Ask them to use their code.
    const { data: existing } = await supabase
      .from("dataroom_signatories").select("id").eq("email", email).maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({
        already_signed: true,
        message: "Vous avez déjà signé le NDA. Utilisez votre code d'accès ou demandez un renvoi.",
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Upload id document if provided
    let id_document_url: string | null = null;
    if (id_document_base64) {
      try {
        const bytes = Uint8Array.from(atob(id_document_base64.split(",").pop()!), (c) => c.charCodeAt(0));
        const path = `id-docs/${crypto.randomUUID()}.${(id_document_ext || "jpg").replace(/[^a-z0-9]/gi, "")}`;
        const { error: upErr } = await supabase.storage.from("dataroom").upload(path, bytes, {
          contentType: id_document_ext?.includes("pdf") ? "application/pdf" : "image/jpeg",
          upsert: false,
        });
        if (!upErr) id_document_url = path;
      } catch (e) {
        console.warn("id doc upload failed", e);
      }
    }

    const code = genCode(6);
    const access_code_hash = await sha256(code);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ua = req.headers.get("user-agent") ?? null;

    const { data: sig, error: insErr } = await supabase
      .from("dataroom_signatories").insert({
        full_name, email, phone, whatsapp, profession, organization, country,
        profile_type: profile_type ?? "autre",
        newsletter_optin: !!newsletter_optin,
        id_document_url, access_code_hash,
        ip_address: ip, user_agent: ua,
      }).select("id").single();
    if (insErr) throw insErr;

    // Send access code by email (best-effort via Resend)
    const resend = Deno.env.get("RESEND_API_KEY");
    if (resend) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resend}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "AgriCapital Cloud <contact@agricapital.ci>",
            to: [email],
            subject: "Votre code d'accès AgriCapital Cloud",
            html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#111">
              <h2 style="color:#006B43;margin:0 0 12px">Bienvenue sur AgriCapital Cloud</h2>
              <p>Bonjour ${full_name},</p>
              <p>Votre NDA a bien été signé et enregistré. Voici votre <strong>code d'accès personnel</strong> :</p>
              <p style="font-size:28px;font-weight:800;letter-spacing:4px;background:#f5f5f5;padding:16px;text-align:center;border-radius:8px;color:#006B43">${code}</p>
              <p>Conservez-le précieusement. Il vous permettra de vous reconnecter à tout moment.</p>
              <p style="color:#ED9600;font-weight:600">AgriCapital — Investir la terre. Cultiver l'avenir.</p>
            </div>`,
          }),
        });
      } catch (e) { console.warn("resend email failed", e); }
    }

    return new Response(JSON.stringify({ ok: true, signatory_id: sig.id, code }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dataroom-signup error", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

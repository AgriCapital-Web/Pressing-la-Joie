// AgriCapital Cloud — notifications e-mail aux signataires
// Événements : changement de statut (brouillon → en revue → publié) et changement de permission.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const WORKFLOW_LABEL: Record<string, string> = {
  draft: "Brouillon",
  in_review: "En revue",
  published: "Publié",
  archived: "Archivé",
};

const VISIBILITY_LABEL: Record<string, string> = {
  public: "Public",
  nda: "Signataires NDA",
  vip: "Accès VIP",
};

const shell = (title: string, body: string) => `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;background:#f3f4f6;padding:24px">
  <div style="background:#ffffff;border-radius:12px;padding:28px;color:#111">
    <h2 style="color:#006B43;margin:0 0 16px">${title}</h2>
    ${body}
    <p style="margin-top:24px;color:#ED9600;font-weight:600">AgriCapital — Investir la terre. Cultiver l'avenir.</p>
  </div>
</div>`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    // --- Admin authentication (required) ---
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await authClient.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await authClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { publication_id, event, from, to } = await req.json();
    if (!publication_id || !event) {
      return new Response(JSON.stringify({ error: "publication_id et event requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Strict allowlist validation (no attacker-controlled text in the email) ---
    if (event !== "visibility" && event !== "workflow") {
      return new Response(JSON.stringify({ error: "event invalide" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const allowed = event === "visibility" ? VISIBILITY_LABEL : WORKFLOW_LABEL;
    const isAllowed = (v: unknown) => v === undefined || v === null || (typeof v === "string" && v in allowed);
    if (!isAllowed(from) || typeof to !== "string" || !(to in allowed)) {
      return new Response(JSON.stringify({ error: "from/to invalides" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const fromLabel = from ? allowed[from as string] : "—";
    const toLabel = allowed[to];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: pub } = await supabase
      .from("dataroom_publications")
      .select("id, title, category, visibility, workflow_status")
      .eq("id", publication_id)
      .maybeSingle();
    if (!pub) {
      return new Response(JSON.stringify({ error: "Publication introuvable" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: sigs } = await supabase
      .from("dataroom_signatories")
      .select("email, full_name");
    const recipients = (sigs ?? []).filter((s) => !!s.email);

    const isVisibility = event === "visibility";
    const subject = isVisibility
      ? `Permissions mises à jour — ${pub.title}`
      : `${toLabel} — ${pub.title}`;

    const bodyHtml = isVisibility
      ? `<p>Le niveau d'accès du document <strong>${pub.title}</strong> a été modifié :</p>
         <p style="font-size:16px"><strong>${fromLabel}</strong> → <strong>${toLabel}</strong></p>
         <p>Connectez-vous à AgriCapital Cloud avec votre code d'accès pour consulter les documents disponibles.</p>
         <p style="font-size:12px;color:#666">La consultation est en ligne uniquement : le téléchargement direct est désactivé.</p>`
      : `<p>Le document <strong>${pub.title}</strong>${pub.category ? ` (${pub.category})` : ""} a changé de statut :</p>
         <p style="font-size:16px"><strong>${fromLabel}</strong> → <strong>${toLabel}</strong></p>
         ${to === "published" ? "<p>Le document est désormais consultable dans votre espace AgriCapital Cloud.</p>" : "<p>Vous serez notifié dès sa publication.</p>"}
         <p style="font-size:12px;color:#666">La consultation est en ligne uniquement : le téléchargement direct est désactivé.</p>`;

    const html = shell(subject, bodyHtml);
    const resend = Deno.env.get("RESEND_API_KEY");
    let sent = 0;
    const failed: string[] = [];

    if (resend) {
      for (const r of recipients) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resend}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: "AgriCapital Cloud <contact@agricapital.ci>",
              to: [r.email],
              subject,
              html,
            }),
          });
          if (res.ok) sent++;
          else { failed.push(r.email); console.error(`resend ${res.status}: ${await res.text()}`); }
        } catch (e) {
          failed.push(r.email);
          console.error("resend error", e);
        }
      }
    }

    await supabase.from("email_logs").insert({
      recipient_email: `${recipients.length} signataire(s)`,
      subject,
      body: html,
      status: sent > 0 ? "sent" : "failed",
      sent_at: new Date().toISOString(),
      error_message: failed.length ? `Échecs : ${failed.length}` : null,
    });

    return new Response(JSON.stringify({ ok: true, recipients: recipients.length, sent, failed: failed.length }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dataroom-notify error", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

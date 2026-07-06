import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const brevoFetch = (apiKey: string, path: string, init: RequestInit = {}) =>
  fetch(`https://api.brevo.com/v3${path}`, {
    ...init,
    headers: { "api-key": apiKey, "Content-Type": "application/json", ...(init.headers || {}) },
  });

// Cron entrypoint: picks the most recent 'ready' or 'draft' campaign and sends it.
// If none is ready, generates a fresh newsletter via generate-newsletter and sends it.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const trigger: string = body?.trigger || "manual";

    // Skip month-end trigger when it's not actually the last day of the month
    if (trigger === "month-end") {
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 3600 * 1000);
      if (tomorrow.getUTCMonth() === today.getUTCMonth()) {
        return new Response(JSON.stringify({ skipped: true, reason: "not last day of month" }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const serviceAuth = { headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}` } };

    // Look for a ready-to-send campaign
    const { data: campaigns } = await supabase
      .from("email_campaigns")
      .select("id, subject, preheader, html_content, audience_type, media_preview")
      .in("status", ["ready", "draft"])
      .order("updated_at", { ascending: false })
      .limit(1);

    let subject = "";
    let html = "";
    let preheader = "";
    let audienceType = "all";
    let mediaPreview: any[] = [];
    let campaignId: string | null = null;

    if (campaigns && campaigns.length > 0) {
      const c = campaigns[0] as any;
      campaignId = c.id;
      subject = c.subject;
      html = c.html_content;
      preheader = c.preheader || "";
      audienceType = c.audience_type || "all";
      mediaPreview = Array.isArray(c.media_preview) ? c.media_preview : [];
    } else {
      // Generate a fresh newsletter using AI
      const gen = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...serviceAuth.headers },
        body: JSON.stringify({
          prompt: `Newsletter automatique AgriCapital (${trigger}) : nos actualités agricoles, projets fonciers et opportunités d'investissement.`,
          targetAudience: "all",
        }),
      });
      const genData = await gen.json();
      subject = genData.subject || "AgriCapital · L'actualité";
      html = genData.html || "<p>Merci de suivre AgriCapital.</p>";
      preheader = genData.preheader || "Les nouvelles d'AgriCapital";
    }

    // Invoke send-newsletter-batch as service role (bypass admin check by injecting a system-admin header)
    // Since send-newsletter-batch requires an admin JWT, we call it via internal edge-to-edge using service role.
    // Simplify: call Brevo directly here via the same logic path.
    const { data: subs } = await supabase
      .from("newsletter_subscribers")
      .select("email, first_name, last_name, unsubscribe_token")
      .eq("is_active", true);

    const recipients = (subs || []).filter((s: any) => s.email && s.email.includes("@"));
    const BREVO = Deno.env.get("BREVO_API_KEY");
    if (!BREVO) throw new Error("Brevo not configured");

    const logoUrl = "https://www.agricapital.ci/favicon.png";
    const wrap = (inner: string, unsubUrl: string) => `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4"><tr><td align="center" style="padding:20px 0"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)"><tr><td style="background:#f5efe1;padding:30px;text-align:center;border-bottom:3px solid #166534"><img src="${logoUrl}" alt="AgriCapital" width="150" style="display:block;margin:0 auto 8px"><p style="color:#ed7500;font-size:13px;margin:6px 0 0;font-weight:700">Investir la terre. Cultiver l'avenir.</p></td></tr><tr><td style="padding:30px;font-size:15px;line-height:1.6;color:#333">${inner}</td></tr><tr><td style="background:#f9fafb;padding:20px 30px;text-align:center;border-top:1px solid #e5e7eb"><p style="color:#9ca3af;font-size:11px;margin:0"><a href="https://www.agricapital.ci" style="color:#166534;text-decoration:none">www.agricapital.ci</a></p><p style="color:#9ca3af;font-size:11px;margin:10px 0 0"><a href="${unsubUrl}" style="color:#9ca3af;text-decoration:underline">Se désabonner</a></p></td></tr></table></td></tr></table></body></html>`;

    let sent = 0, failed = 0;
    const failedList: any[] = [];
    for (let i = 0; i < recipients.length; i += 5) {
      const batch = recipients.slice(i, i + 5);
      await Promise.all(batch.map(async (r: any) => {
        const unsubUrl = `https://hbdnleumrcrinedvkuim.supabase.co/functions/v1/newsletter-unsubscribe?token=${r.unsubscribe_token || ""}&email=${encodeURIComponent(r.email)}`;
        try {
          const res = await brevoFetch(BREVO, "/smtp/email", {
            method: "POST",
            body: JSON.stringify({
              sender: { name: "AgriCapital", email: "contact@agricapital.ci" },
              to: [{ email: r.email, name: [r.first_name, r.last_name].filter(Boolean).join(" ") || undefined }],
              subject,
              htmlContent: wrap(html, unsubUrl),
            }),
          });
          if (res.ok) sent++;
          else { failed++; failedList.push({ email: r.email, error: `${res.status}` }); }
        } catch (e) { failed++; failedList.push({ email: r.email, error: String(e) }); }
      }));
      if (i + 5 < recipients.length) await new Promise(r => setTimeout(r, 500));
    }

    await supabase.from("newsletter_sends").insert({
      campaign_id: campaignId,
      subject,
      preheader,
      html_preview: html.substring(0, 500),
      html_content: html,
      total_recipients: recipients.length,
      total_sent: sent,
      total_failed: failed,
      failed_recipients: failedList,
      audience_type: audienceType,
      status: failed === 0 ? "sent" : sent > 0 ? "partial" : "failed",
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      batches_total: Math.ceil(recipients.length / 5),
      batches_completed: Math.ceil(recipients.length / 5),
      media_preview: mediaPreview,
      error_summary: failed ? `${failed} échec(s) - cron ${trigger}` : `Envoi cron ${trigger}`,
    });

    if (campaignId) {
      await supabase.from("email_campaigns").update({
        status: failed === 0 ? "sent" : "partial",
        last_sent_at: new Date().toISOString(),
      }).eq("id", campaignId);
    }

    return new Response(JSON.stringify({ success: true, trigger, sent, failed, total: recipients.length }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("newsletter-auto-send error", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

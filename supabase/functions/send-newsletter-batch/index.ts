import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NewsletterRequest {
  subject: string;
  html: string;
  preheader?: string;
  audienceType?: string;
  includeTestimonials?: boolean;
  retryEmails?: string[];
  campaignId?: string | null;
  scheduledAt?: string | null;
  mediaPreview?: { type: "image" | "video"; url: string; alt?: string; poster?: string }[];
  processDue?: boolean;
}

type Recipient = { email: string; first_name?: string | null; last_name?: string | null };
type AdminUser = { id: string; email?: string };

// Basic HTML sanitization
const sanitizeHtml = (html: string): string => {
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  sanitized = sanitized.replace(/javascript\s*:/gi, '');
  sanitized = sanitized.replace(/data\s*:[^"'\s>]*/gi, '');
  sanitized = sanitized.replace(/vbscript\s*:/gi, '');
  sanitized = sanitized.replace(/expression\s*\(/gi, '');
  sanitized = sanitized.replace(/<(iframe|embed|object|form)[^>]*>[\s\S]*?<\/\1>/gi, '');
  sanitized = sanitized.replace(/<(iframe|embed|object|form)[^>]*\/?>/gi, '');
  return sanitized;
};

const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const personalizeHtml = (html: string, recipient: Recipient): string => {
  const firstName = recipient.first_name?.trim() || "";
  const lastName = recipient.last_name?.trim() || "";
  const greeting = firstName ? `Bonjour ${[firstName, lastName].filter(Boolean).join(" ")},` : "Bonjour très cher,";
  const withGreeting = html
    .replace(/Bonjour\s*\{\{prenom\}\}\s*\{\{nom\}\}\s*,?/gi, greeting)
    .replace(/\{\{prenom\}\}/g, firstName || "")
    .replace(/\{\{nom\}\}/g, lastName || "");
  const token = (recipient as any).unsubscribe_token || "";
  const email = encodeURIComponent(recipient.email);
  const unsubUrl = token
    ? `https://hbdnleumrcrinedvkuim.supabase.co/functions/v1/newsletter-unsubscribe?token=${token}`
    : `https://hbdnleumrcrinedvkuim.supabase.co/functions/v1/newsletter-unsubscribe?email=${email}`;
  return withGreeting.replace(/\{\{unsubscribe_url\}\}/g, unsubUrl);
};

const brevoFetch = (apiKey: string, path: string, init: RequestInit = {}) =>
  fetch(`https://api.brevo.com/v3${path}`, {
    ...init,
    headers: { "api-key": apiKey, "Content-Type": "application/json", ...(init.headers || {}) },
  });

const getRecipients = async (supabase: any, request: NewsletterRequest): Promise<Recipient[]> => {
  if (request.retryEmails && Array.isArray(request.retryEmails) && request.retryEmails.length > 0) {
    return request.retryEmails.filter(e => typeof e === 'string' && e.includes('@')).map((email) => ({ email }));
  }

  const audienceType = request.audienceType || "all";
  const map = new Map<string, Recipient>();
  const add = (items?: Recipient[] | null) => (items || []).forEach((item) => {
    if (item.email && item.email.includes("@")) map.set(item.email.toLowerCase(), item);
  });

  if (["all", "subscribers"].includes(audienceType)) {
    const { data, error } = await supabase.from('newsletter_subscribers').select('email, first_name, last_name, unsubscribe_token').eq('is_active', true);
    if (error) throw error;
    add(data as Recipient[]);
  }
  if (["all", "testimonials", "clients"].includes(audienceType) || request.includeTestimonials) {
    const { data } = await supabase.from('testimonials').select('email, first_name, last_name').not('email', 'is', null);
    add(data as Recipient[]);
  }
  if (["all", "investors", "partners", "prospects", "clients"].includes(audienceType)) {
    const { data } = await supabase.from('partnership_requests').select('email, first_name, last_name, partner_type, request_type').not('email', 'is', null);
    const filtered = (data || []).filter((p: any) => {
      if (audienceType === "all") return true;
      if (audienceType === "investors") return p.request_type === "investor" || p.partner_type === "investor" || p.request_type === "investment";
      if (audienceType === "partners") return ["technical", "institution", "industrial"].includes(p.request_type) || ["company", "ngo", "institution"].includes(p.partner_type);
      if (audienceType === "clients") return ["landowner", "producer"].includes(p.request_type);
      if (audienceType === "prospects") return true;
      return false;
    });
    add(filtered as Recipient[]);
  }
  if (["all", "prospects", "clients", "members"].includes(audienceType)) {
    const { data } = await supabase.from('visitor_contacts').select('email, first_name, last_name').not('email', 'is', null);
    add(data as Recipient[]);
  }
  if (["all", "prospects", "clients", "members"].includes(audienceType)) {
    const { data } = await supabase.from('waitlist_submissions').select('email, full_name').not('email', 'is', null);
    add((data || []).map((w: any) => ({ email: w.email, first_name: String(w.full_name || "").split(" ")[0], last_name: String(w.full_name || "").split(" ").slice(1).join(" ") })));
  }
  return [...map.values()];
};

const buildFormattedHtml = (html: string, preheader = "", mediaPreview: NewsletterRequest["mediaPreview"] = []) => {
  const logoUrl = "https://www.agricapital.ci/favicon.png";
  const mediaHtml = (mediaPreview || []).filter((m) => m?.url).map((m) => {
    if (m.type === "video") {
      const poster = (m as any).poster || "";
      const fallback = poster ? `<img src="${escapeHtml(poster)}" alt="${escapeHtml(m.alt || "Aperçu vidéo AgriCapital")}" width="560" style="display:block;width:100%;max-width:560px;height:auto;border-radius:12px;margin:0 auto;">` : "";
      return `<div style="margin:22px 0;text-align:center;"><video controls muted playsinline preload="metadata" ${poster ? `poster="${escapeHtml(poster)}"` : ""} style="width:100%;max-width:560px;border-radius:12px;border:1px solid #d8c9a4;display:block;margin:0 auto;"><source src="${escapeHtml(m.url)}" type="video/mp4">${fallback}</video><p style="font-size:12px;line-height:1.5;color:#6b7280;margin:8px 0 0;">Aperçu vidéo terrain intégré.</p></div>`;
    }
    return `<div style="margin:22px 0;text-align:center;"><img src="${escapeHtml(m.url)}" alt="${escapeHtml(m.alt || "Visuel AgriCapital")}" style="max-width:100%;height:auto;border-radius:12px;border:0;display:block;margin:0 auto;" /></div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<!--[if mso]><style>table,td,div,p,a{font-family:Arial,sans-serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;">
<tr><td align="center" style="padding:20px 0;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:#f3f4f6;padding:30px;text-align:center;border-bottom:3px solid #166534;">
    <img src="${logoUrl}" alt="AgriCapital" width="150" style="display:block;margin:0 auto 8px;max-width:150px;height:auto;border:0;outline:none;text-decoration:none;">
    <p style="color:#ed7500;font-size:13px;margin:6px 0 0;font-weight:700;line-height:1.4;">Investir la terre. Cultiver l'avenir.</p>
  </td></tr>
  <tr><td style="padding:30px;font-size:15px;line-height:1.6;color:#333333;">
    ${mediaHtml}
    ${html}
  </td></tr>
  <tr><td style="background:#f9fafb;padding:20px 30px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="color:#4b5563;font-size:12px;margin:0 0 8px;line-height:1.6;font-weight:700;">AgriCapital SARL</p>
    <p style="color:#9ca3af;font-size:11px;margin:0;line-height:1.5;">
      C&ocirc;te d'Ivoire<br/>
      <a href="https://www.agricapital.ci" style="color:#166534;text-decoration:none;">www.agricapital.ci</a> |
      <a href="mailto:contact@agricapital.ci" style="color:#166534;text-decoration:none;">contact@agricapital.ci</a> |
      <a href="tel:+2250564551717" style="color:#166534;text-decoration:none;">05 64 55 17 17</a>
    </p>
    <p style="color:#9ca3af;font-size:11px;margin:10px 0 0;line-height:1.5;">
      Vous recevez ce message parce que vous êtes abonné à la newsletter AgriCapital.<br/>
      <a href="{{unsubscribe_url}}" style="color:#9ca3af;text-decoration:underline;">Se désabonner en un clic</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
};

const sendEmailWithRetry = async (
  brevoKey: string,
  lovableApiKey: string,
  recipient: Recipient,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await brevoFetch(brevoKey, "/smtp/email", {
        method: "POST",
        body: JSON.stringify({
          sender: { name: "AgriCapital", email: "contact@agricapital.ci" },
          to: [{ email: recipient.email }],
          subject,
          htmlContent: personalizeHtml(html, recipient),
        }),
      });

      if (response.ok) {
        return { success: true };
      }

      const errorBody = await response.text();

      // Don't retry on 4xx (except 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return { success: false, error: `${response.status}: ${errorBody}` };
      }

      // Retry on 429 or 5xx
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt;
        console.log(`Retry ${attempt}/${MAX_RETRIES} for ${recipient.email} after ${delay}ms (status: ${response.status})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return { success: false, error: `${response.status}: ${errorBody}` };
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt;
        console.log(`Retry ${attempt}/${MAX_RETRIES} for ${recipient.email} after network error: ${err}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
  return { success: false, error: "Max retries exceeded" };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      throw new Error("Brevo is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Accès refusé - Admin requis" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const request: NewsletterRequest = await req.json();
    const { subject, html, scheduledAt, campaignId, preheader = "", mediaPreview = [] } = request;

    if (!subject || typeof subject !== 'string' || subject.length > 500) {
      return new Response(JSON.stringify({ error: "Sujet invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!html || typeof html !== 'string' || html.length > 100000) {
      return new Response(JSON.stringify({ error: "Contenu invalide ou trop long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedHtml = sanitizeHtml(html);
    const recipients = await getRecipients(supabase, request);

    if (recipients.length === 0) {
      return new Response(JSON.stringify({ error: "Aucun destinataire trouvé" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formattedHtml = buildFormattedHtml(sanitizedHtml, preheader, mediaPreview);
    const BATCH_SIZE = 5;
    const batchesTotal = Math.ceil(recipients.length / BATCH_SIZE);

    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      if (!Number.isFinite(scheduledDate.getTime())) {
        return new Response(JSON.stringify({ error: "Date de programmation invalide" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data: sendRow, error: scheduleError } = await supabase.from("newsletter_sends").insert({
        campaign_id: campaignId || null,
        subject,
        preheader,
        html_preview: sanitizedHtml.substring(0, 500),
        html_content: sanitizedHtml,
        total_recipients: recipients.length,
        audience_type: request.audienceType || "all",
        status: "scheduled",
        scheduled_at: scheduledDate.toISOString(),
        batches_total: batchesTotal,
        media_preview: mediaPreview,
        sent_by: user.id,
      }).select("id").single();
      if (scheduleError) throw scheduleError;
      if (campaignId) await supabase.from("email_campaigns").update({ status: "scheduled", scheduled_at: scheduledDate.toISOString(), batches_total: batchesTotal }).eq("id", campaignId);
      return new Response(JSON.stringify({ success: true, scheduled: true, sendId: sendRow?.id, totalRecipients: recipients.length, batchesTotal }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let successCount = 0;
    let failCount = 0;
    const failedRecipients: { email: string; error: string }[] = [];

    console.log(`Newsletter send initiated by admin ${user.email} to ${recipients.length} recipients`);

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(recipient => sendEmailWithRetry(BREVO_API_KEY, "", recipient, subject, formattedHtml))
      );

      results.forEach((result, idx) => {
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          failedRecipients.push({ email: batch[idx].email, error: result.error || "Unknown" });
        }
      });

      // Pause between batches to respect rate limits
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`Newsletter sent: ${successCount} success, ${failCount} failed`);
    if (failedRecipients.length > 0) {
      console.log(`Failed recipients: ${JSON.stringify(failedRecipients)}`);
    }

    const status = failCount === 0 ? "sent" : successCount > 0 ? "partial" : "failed";
    const sendPayload = {
      campaign_id: campaignId || null,
      subject,
      preheader,
      html_preview: sanitizedHtml.substring(0, 500),
      html_content: sanitizedHtml,
      total_recipients: recipients.length,
      total_sent: successCount,
      total_failed: failCount,
      failed_recipients: failedRecipients,
      audience_type: request.audienceType || "all",
      status,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      batches_total: batchesTotal,
      batches_completed: batchesTotal,
      error_summary: failedRecipients.length ? `${failedRecipients.length} échec(s)` : null,
      media_preview: mediaPreview,
      sent_by: user.id,
    };
    await supabase.from("newsletter_sends").insert(sendPayload);
    if (campaignId) {
      await supabase.from("email_campaigns").update({ status, last_sent_at: new Date().toISOString(), batches_total: batchesTotal, error_summary: sendPayload.error_summary }).eq("id", campaignId);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      totalSent: successCount,
      totalFailed: failCount,
      totalRecipients: recipients.length,
      batchesTotal,
      status,
      failedRecipients: failedRecipients.length > 0 ? failedRecipients : undefined,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error sending newsletter:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: msg }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);

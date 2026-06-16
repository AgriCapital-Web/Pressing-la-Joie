import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NewsletterRequest {
  subject: string;
  html: string;
  includeTestimonials?: boolean;
  retryEmails?: string[];
}

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

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const sendEmailWithRetry = async (
  apiKey: string,
  lovableApiKey: string | undefined,
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      let response: Response;

      // Use Resend connector gateway if LOVABLE_API_KEY available, else direct
      if (lovableApiKey) {
        response = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "X-Connection-Api-Key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "AgriCapital <newsletter@agricapital.ci>",
            to: [to],
            subject,
            html,
          }),
        });
      } else {
        response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "AgriCapital <newsletter@agricapital.ci>",
            to: [to],
            subject,
            html,
          }),
        });
      }

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
        console.log(`Retry ${attempt}/${MAX_RETRIES} for ${to} after ${delay}ms (status: ${response.status})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return { success: false, error: `${response.status}: ${errorBody}` };
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt;
        console.log(`Retry ${attempt}/${MAX_RETRIES} for ${to} after network error: ${err}`);
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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

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

    const { subject, html, includeTestimonials, retryEmails }: NewsletterRequest = await req.json();

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

    let allEmails: string[];

    if (retryEmails && Array.isArray(retryEmails) && retryEmails.length > 0) {
      // Retry mode: only send to specified emails
      allEmails = retryEmails.filter(e => typeof e === 'string' && e.includes('@'));
    } else {
      // Normal mode: gather all recipients
      const { data: subscribers, error: subError } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('is_active', true);

      if (subError) throw subError;

      let testimonialEmails: string[] = [];
      if (includeTestimonials) {
        const { data: testimonials } = await supabase
          .from('testimonials')
          .select('email')
          .not('email', 'is', null);
        if (testimonials) {
          testimonialEmails = testimonials.map(t => t.email).filter(Boolean) as string[];
        }
      }

      allEmails = [...new Set([
        ...(subscribers?.map(s => s.email) || []),
        ...testimonialEmails,
      ])];
    }

    if (allEmails.length === 0) {
      return new Response(JSON.stringify({ error: "Aucun destinataire trouvé" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Outlook/Gmail compatible HTML template with fallback logo
    const logoUrl = "https://agricapital.lovable.app/Logo_AgriCapital_-V2-4.png";
    const formattedHtml = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<!--[if mso]><style>table,td,div,p,a{font-family:Arial,sans-serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;">
<tr><td align="center" style="padding:20px 0;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#166534 0%,#14532d 50%,#0f4c25 100%);padding:30px;text-align:center;">
    <!--[if mso]><table role="presentation" width="180" align="center"><tr><td><![endif]-->
    <img src="${logoUrl}" alt="AgriCapital" width="180" height="auto" style="display:block;margin:0 auto 12px;max-width:180px;height:auto;border:0;outline:none;text-decoration:none;">
    <!--[if mso]></td></tr></table><![endif]-->
    <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:8px 0 0;font-weight:400;line-height:1.4;">Investir la terre. Cultiver l'avenir.</p>
  </td></tr>
  <!-- Content -->
  <tr><td style="padding:30px;font-size:15px;line-height:1.6;color:#333333;">
    ${sanitizedHtml}
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f9fafb;padding:20px 30px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="color:#9ca3af;font-size:11px;margin:0;line-height:1.5;">
      AgriCapital SARL - C&ocirc;te d'Ivoire<br/>
      <a href="https://www.agricapital.ci" style="color:#166534;text-decoration:none;">www.agricapital.ci</a> |
      <a href="tel:+2250564551717" style="color:#166534;text-decoration:none;">05 64 55 17 17</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    let successCount = 0;
    let failCount = 0;
    const failedRecipients: { email: string; error: string }[] = [];

    console.log(`Newsletter send initiated by admin ${user.email} to ${allEmails.length} recipients`);

    // Send emails in batches of 5 concurrently
    const BATCH_SIZE = 5;
    for (let i = 0; i < allEmails.length; i += BATCH_SIZE) {
      const batch = allEmails.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(email => sendEmailWithRetry(RESEND_API_KEY, LOVABLE_API_KEY, email, subject, formattedHtml))
      );

      results.forEach((result, idx) => {
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          failedRecipients.push({ email: batch[idx], error: result.error || "Unknown" });
        }
      });

      // Pause between batches to respect rate limits
      if (i + BATCH_SIZE < allEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`Newsletter sent: ${successCount} success, ${failCount} failed`);
    if (failedRecipients.length > 0) {
      console.log(`Failed recipients: ${JSON.stringify(failedRecipients)}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      totalSent: successCount,
      totalFailed: failCount,
      totalRecipients: allEmails.length,
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

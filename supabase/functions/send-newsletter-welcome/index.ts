import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const newsletterSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
});

// Rate limiting: max 3 requests per email per hour
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;
  const existing = rateLimitMap.get(identifier);

  if (!existing || now > existing.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + hourInMs });
    return true;
  }

  if (existing.count >= 3) {
    return false;
  }

  existing.count++;
  return true;
}

// HTML escape function to prevent XSS
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

const brevoFetch = (apiKey: string, path: string, init: RequestInit = {}) =>
  fetch(`https://api.brevo.com/v3${path}`, {
    ...init,
    headers: { "api-key": apiKey, "Content-Type": "application/json", ...(init.headers || {}) },
  });

// Create admin notification for newsletter subscription
async function createNewsletterNotification(firstName: string, lastName: string, email: string) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from("admin_notifications").insert({
      type: "newsletter_subscription",
      title: `Nouvelle inscription newsletter`,
      message: `${firstName} ${lastName} (${email}) s'est inscrit à la newsletter`,
      data: { firstName, lastName, email },
    });
    console.log("Admin notification created for newsletter subscription");
  } catch (error) {
    console.error("Error creating admin notification:", error);
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const parseResult = newsletterSchema.safeParse(body);
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error.errors);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid input data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const { firstName, lastName, email } = parseResult.data;

    // Check rate limit
    if (!checkRateLimit(email)) {
      console.warn(`Rate limit exceeded for email: ${email}`);
      return new Response(
        JSON.stringify({ success: false, error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

    console.log("Sending welcome email to:", email);

    if (!BREVO_API_KEY) {
      console.log("Brevo not configured, skipping email");
      return new Response(JSON.stringify({ success: true, message: "Email skipped - no API key" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Sanitize user inputs for HTML
    const safeFirstName = escapeHtml(firstName);
    const safeLastName = escapeHtml(lastName);
    const currentYear = new Date().getFullYear();

    const logoUrl = "https://www.agricapital.ci/favicon.png";
    const htmlContent = `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenue chez AgriCapital</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;">
              <tr>
                <td style="padding: 40px 20px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="background: #f5efe1; padding: 40px 40px 30px; text-align: center; border-bottom: 3px solid #1a5d3a;">
                        <img src="${logoUrl}" alt="AgriCapital" width="140" style="margin-bottom: 12px;display:inline-block;height:auto;">
                        <p style="color: #ed7500; font-size: 14px; margin: 4px 0 0; font-weight: 700; letter-spacing: 0.3px;">Investir la terre. Cultiver l'avenir.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="color: #1a5d3a; font-size: 24px; margin: 0 0 20px; font-weight: 600;">Cher(e) ${safeFirstName} ${safeLastName},</h2>
                        <p style="color: #333; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">Merci de rejoindre la communauté <strong style="color: #c9a227;">AgriCapital</strong>. Votre inscription à notre newsletter est confirmée : vous recevrez nos actualités, nos opportunités et nos analyses sur le foncier agricole et le palmier à huile.</p>
                        <div style="background: linear-gradient(135deg, #f0f9f4 0%, #e8f5e9 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #1a5d3a;">
                          <h3 style="color: #1a5d3a; font-size: 16px; margin: 0 0 16px; font-weight: 600;">📬 Ce que vous recevrez :</h3>
                          <ul style="color: #333; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;"><li>Les dernières actualités de notre projet</li><li>Des informations exclusives sur la filière palmier à huile</li><li>Des conseils pratiques pour bâtir votre patrimoine agricole</li><li>Les opportunités de partenariat en avant-première</li></ul>
                        </div>
                        <div style="text-align: center; margin: 32px 0;"><a href="https://www.agricapital.ci" style="display: inline-block; background: linear-gradient(135deg, #c9a227 0%, #d4af37 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px;">🌐 Visiter notre site web</a></div>
                        <p style="color: #666; font-size: 15px; line-height: 1.7; margin: 20px 0 0;">Merci de votre confiance.<br><strong style="color: #1a5d3a;">L'équipe AgriCapital</strong><br><span style="color:#c9a227;font-weight:700;">Investir la terre. Cultiver l'avenir.</span></p>
                      </td>
                    </tr>
                    <tr><td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef; font-size: 14px; color: #666; line-height: 1.8;"><strong style="color: #1a5d3a;">📍 Nos coordonnées</strong><br>Daloa, Haut-Sassandra, Côte d'Ivoire<br>📧 contact@agricapital.ci<br>📞 +225 05 64 55 17 17<br>🌐 www.agricapital.ci</td></tr>
                    <tr><td style="background: linear-gradient(135deg, #1a5d3a 0%, #2d8f5e 100%); padding: 24px 40px; text-align: center;"><p style="color: rgba(255,255,255,0.9); font-size: 12px; margin: 0 0 8px; line-height: 1.6;">© ${currentYear} <strong>AgriCapital SARL</strong> - Tous droits réservés</p></td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>`;

    const emailResponse = await brevoFetch(BREVO_API_KEY, "/smtp/email", {
      method: "POST",
      body: JSON.stringify({
        sender: { name: "AgriCapital Newsletter", email: "contact@agricapital.ci" },
        to: [{ email }],
        subject: "🌴 Bienvenue dans la communauté AgriCapital !",
        htmlContent,
      }),
    });

    const data = await emailResponse.json();
    console.log("Email response:", data);

    if (!emailResponse.ok) {
      console.error("Brevo API error:", data);
      return new Response(JSON.stringify({ success: false, error: data }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create admin notification for the new subscription
    await createNewsletterNotification(firstName, lastName, email);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending newsletter welcome email:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred", success: false }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

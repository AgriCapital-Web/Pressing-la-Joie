import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

// Basic HTML sanitization - removes script tags and dangerous attributes
const sanitizeHtml = (html: string): string => {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove on* event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript\s*:/gi, '');
  
  // Remove data: URLs (can be used for XSS)
  sanitized = sanitized.replace(/data\s*:[^"'\s>]*/gi, '');
  
  // Remove vbscript: URLs
  sanitized = sanitized.replace(/vbscript\s*:/gi, '');
  
  // Remove expression() (IE CSS hack)
  sanitized = sanitized.replace(/expression\s*\(/gi, '');
  
  // Remove iframe, embed, object tags
  sanitized = sanitized.replace(/<(iframe|embed|object|form)[^>]*>[\s\S]*?<\/\1>/gi, '');
  sanitized = sanitized.replace(/<(iframe|embed|object|form)[^>]*\/?>/gi, '');
  
  return sanitized;
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

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Accès refusé" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailData: EmailRequest = await req.json();

    // Validate inputs
    if (!emailData.to || !Array.isArray(emailData.to) || emailData.to.length === 0) {
      return new Response(JSON.stringify({ error: "Destinataires invalides" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!emailData.subject || typeof emailData.subject !== 'string' || emailData.subject.length > 500) {
      return new Response(JSON.stringify({ error: "Sujet invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!emailData.html || typeof emailData.html !== 'string' || emailData.html.length > 100000) {
      return new Response(JSON.stringify({ error: "Contenu invalide ou trop long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize HTML content
    const sanitizedHtml = sanitizeHtml(emailData.html);

    // Format HTML with signature
    const formattedHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${sanitizedHtml}
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e5e5;" />
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Envoyé depuis AgriCapital<br/>
          <a href="https://agricapital.ci" style="color: #166534;">www.agricapital.ci</a> | 
          <a href="tel:+2250564551717" style="color: #166534;">05 64 55 17 17</a>
        </p>
      </div>
    `;

    const emailPayload: any = {
      from: emailData.from || "AgriCapital <onboarding@resend.dev>",
      to: emailData.to,
      subject: emailData.subject,
      html: formattedHtml,
    };

    if (emailData.cc?.length) emailPayload.cc = emailData.cc;
    if (emailData.bcc?.length) emailPayload.bcc = emailData.bcc;
    if (emailData.replyTo) emailPayload.reply_to = emailData.replyTo;

    // Log email send for audit
    console.log(`Email sent by admin ${user.email} to ${emailData.to.join(', ')}`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || "Erreur d'envoi");
    }

    console.log("Email sent successfully:", responseData);

    return new Response(JSON.stringify({ success: true, ...responseData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);

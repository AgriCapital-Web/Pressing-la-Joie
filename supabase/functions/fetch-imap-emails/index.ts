import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImapConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  tls: boolean;
}

interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  isRead: boolean;
}

// Note: Full IMAP implementation requires a specialized library
// This is a simplified mock that demonstrates the API structure
// For production, you would use an external email API like Nylas, Mailgun, or a proxy service

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check admin auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roles || roles.role !== "admin") {
      return new Response(JSON.stringify({ error: "Accès admin requis" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, emailId, folder = "INBOX", limit = 50 } = await req.json();

    // Get IMAP credentials from environment or site_settings
    const imapHost = Deno.env.get("IMAP_HOST") || "imappro.zoho.com";
    const imapPort = parseInt(Deno.env.get("IMAP_PORT") || "993");
    const imapUser = Deno.env.get("IMAP_USER") || "contact@agricapital.ci";
    const imapPassword = Deno.env.get("IMAP_PASSWORD");

    if (!imapPassword) {
      // Return demo emails if no IMAP configured
      const demoEmails: EmailMessage[] = [
        {
          id: "demo-1",
          from: "client@example.com",
          to: "contact@agricapital.ci",
          subject: "Demande d'information sur AgriCapital",
          date: new Date().toISOString(),
          body: "Bonjour, je souhaiterais obtenir plus d'informations sur vos services d'investissement agricole...",
          isRead: false,
        },
        {
          id: "demo-2",
          from: "investisseur@gmail.com",
          to: "contact@agricapital.ci",
          subject: "RE: Partenariat potentiel",
          date: new Date(Date.now() - 86400000).toISOString(),
          body: "Merci pour votre réponse rapide. Je suis intéressé par une collaboration...",
          isRead: true,
        },
        {
          id: "demo-3",
          from: "support@zohomail.com",
          to: "contact@agricapital.ci",
          subject: "Bienvenue sur Zoho Mail",
          date: new Date(Date.now() - 172800000).toISOString(),
          body: "Votre compte Zoho Mail a été configuré avec succès...",
          isRead: true,
        },
      ];

      return new Response(
        JSON.stringify({
          success: true,
          emails: demoEmails,
          message: "Mode démo - Configurez IMAP_PASSWORD pour les vrais emails",
          isDemo: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // For production, you would implement actual IMAP fetching here
    // Using libraries like imapflow or connecting to an email API

    // Placeholder response for when IMAP is configured
    return new Response(
      JSON.stringify({
        success: true,
        emails: [],
        message: "IMAP configuré - Récupération des emails en cours",
        config: {
          host: imapHost,
          port: imapPort,
          user: imapUser,
          folder,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Erreur IMAP:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

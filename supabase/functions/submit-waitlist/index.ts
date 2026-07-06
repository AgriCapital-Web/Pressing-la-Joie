import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const schema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().default(""),
  whatsapp: z.string().trim().max(40).optional().default(""),
  residence: z.string().trim().max(160).optional().default(""),
  landStatus: z.enum(["has_land", "no_land"]),
  desiredAreaHectares: z.union([z.number(), z.string()]).optional(),
  landAreaHectares: z.union([z.number(), z.string()]).optional(),
  sourcePage: z.string().trim().max(500).optional().default(""),
  message: z.string().trim().max(3000).optional().default(""),
});

const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const brevoFetch = (apiKey: string, path: string, init: RequestInit = {}) =>
  fetch(`https://api.brevo.com/v3${path}`, {
    ...init,
    headers: { "api-key": apiKey, "Content-Type": "application/json", ...(init.headers || {}) },
  });

const toNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return null;
  const number = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(number) && number >= 0 ? number : null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const parsed = schema.parse(await req.json());
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const row = {
      full_name: parsed.fullName,
      email: parsed.email.toLowerCase(),
      phone: parsed.phone || null,
      whatsapp: parsed.whatsapp || null,
      residence: parsed.residence || null,
      land_status: parsed.landStatus,
      desired_area_hectares: toNumber(parsed.desiredAreaHectares),
      land_area_hectares: toNumber(parsed.landAreaHectares),
      source_page: parsed.sourcePage || null,
      message: parsed.message || null,
    };

    const { error } = await supabase.from("waitlist_submissions").insert(row);
    if (error) throw error;

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (BREVO_API_KEY) {
      const html = `<h2>Nouvelle inscription liste d'attente AgriCapital</h2>
        <p><strong>Nom complet :</strong> ${escapeHtml(parsed.fullName)}</p>
        <p><strong>Email :</strong> ${escapeHtml(parsed.email)}</p>
        <p><strong>Téléphone :</strong> ${escapeHtml(parsed.phone)}</p>
        <p><strong>WhatsApp :</strong> ${escapeHtml(parsed.whatsapp)}</p>
        <p><strong>Lieu de résidence :</strong> ${escapeHtml(parsed.residence)}</p>
        <p><strong>Statut foncier :</strong> ${parsed.landStatus === "has_land" ? "Possède une terre" : "Pas de terre"}</p>
        <p><strong>Superficie souhaitée :</strong> ${escapeHtml(row.desired_area_hectares ?? "Non renseignée")} ha</p>
        <p><strong>Superficie disponible :</strong> ${escapeHtml(row.land_area_hectares ?? "Non renseignée")} ha</p>
        <p><strong>Message :</strong><br>${escapeHtml(parsed.message).replace(/\n/g, "<br>")}</p>
        <p><em>Source : ${escapeHtml(parsed.sourcePage)}</em></p>`;

      const emailResponse = await brevoFetch(BREVO_API_KEY, "/smtp/email", {
        method: "POST",
        body: JSON.stringify({
          sender: { name: "AgriCapital", email: "contact@agricapital.ci" },
          to: [{ email: "innocentkoffi1@gmail.com" }, { email: "contact@agricapital.ci" }],
          subject: `Nouvelle inscription AgriCapital - ${parsed.fullName}`,
          htmlContent: html,
          replyTo: { email: parsed.email },
        }),
      });
      if (!emailResponse.ok) console.error("Waitlist notification failed:", await emailResponse.text());
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("submit-waitlist error:", error);
    return new Response(JSON.stringify({ success: false, error: "Inscription impossible" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
// AgriCapital Cloud — liste des publications visibles pour un signataire
// Le portail signataire n'utilise pas Supabase Auth : l'accès est validé ici via
// un jeton de session opaque émis par dataroom-login (haché en base), puis filtré par niveau.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function sha256(v: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Hiérarchie des permissions
const TIERS: Record<string, string[]> = {
  public: ["public"],
  nda: ["public", "nda"],
  vip: ["public", "nda", "vip"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const { publication_id, action } = body ?? {};
    const headerToken = req.headers.get("x-dataroom-session") ?? "";
    const sessionToken = String(body?.session_token ?? headerToken ?? "").trim();

    if (!sessionToken) {
      return json({ error: "Session invalide. Veuillez vous reconnecter." }, 401);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Résolution du signataire à partir de la session serveur uniquement
    const { data: session } = await admin
      .from("dataroom_sessions")
      .select("signatory_id, expires_at")
      .eq("token_hash", await sha256(sessionToken))
      .maybeSingle();

    if (!session || new Date(session.expires_at).getTime() < Date.now()) {
      return json({ error: "Session expirée. Veuillez vous reconnecter." }, 401);
    }

    const { data: sig } = await admin
      .from("dataroom_signatories")
      .select("id, full_name, email, profile_type, access_level")
      .eq("id", session.signatory_id)
      .maybeSingle();

    if (!sig) return json({ error: "Session invalide. Veuillez vous reconnecter." }, 401);

    const level = (sig.access_level as string) ?? "nda";
    const allowed = TIERS[level] ?? TIERS.nda;

    // Journalisation d'une vue de document
    if (action === "view" && publication_id) {
      await admin.from("dataroom_access_logs").insert({
        signatory_id: sig.id,
        publication_id,
        action: "view",
        ip_address: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        user_agent: req.headers.get("user-agent") ?? null,
      });
      await admin.rpc("increment_dataroom_view", { _publication_id: publication_id });
      return json({ ok: true });
    }

    const { data: pubs, error } = await admin
      .from("dataroom_publications")
      .select("id, type, title, description, category, cover_url, file_url, platform_url, platform_login, platform_password, visibility, views_count, created_at")
      .eq("is_published", true)
      .eq("workflow_status", "published")
      .in("visibility", allowed)
      .order("created_at", { ascending: false });
    if (error) throw error;

    // Signature courte des visuels privés pour l'affichage en ligne
    const enriched = await Promise.all((pubs ?? []).map(async (p: any) => {
      let preview_url: string | null = p.cover_url ?? null;
      const key = p.cover_url && !/^https?:/i.test(p.cover_url) ? p.cover_url : (!p.cover_url && p.file_url && /\.(png|jpe?g|webp|gif)$/i.test(p.file_url) ? p.file_url : null);
      if (key) {
        const { data: signed } = await admin.storage.from("dataroom").createSignedUrl(key, 900);
        preview_url = signed?.signedUrl ?? null;
      }
      let inline_url: string | null = p.platform_url ?? null;
      if (!inline_url && p.file_url && !/^https?:/i.test(p.file_url)) {
        const { data: signed } = await admin.storage.from("dataroom").createSignedUrl(p.file_url, 900);
        inline_url = signed?.signedUrl ?? null;
      }
      return { ...p, preview_url, inline_url, file_url: undefined };
    }));

    await admin.from("dataroom_access_logs").insert({
      signatory_id: sig.id,
      action: "list_publications",
      ip_address: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      user_agent: req.headers.get("user-agent") ?? null,
    });

    return json({
      ok: true,
      signatory: { id: sig.id, full_name: sig.full_name, email: sig.email, profile_type: sig.profile_type, access_level: level },
      publications: enriched,
    });
  } catch (e) {
    console.error("dataroom-list error", e);
    return json({ error: "Erreur interne" }, 500);
  }
});

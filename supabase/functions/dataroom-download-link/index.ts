// AgriCapital Cloud — liens de téléchargement sécurisés et expirants
// action=create : réservé aux administrateurs authentifiés (JWT Supabase + rôle admin)
// action=redeem : consommation publique du jeton (vérifie expiration, quota, révocation, permission)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const BUCKET = "dataroom";

async function sha256(v: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function genToken(): string {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // --- REDEEM (GET ?token=...) ---
    const url = new URL(req.url);
    const qToken = url.searchParams.get("token");
    let payload: any = {};
    if (req.method === "POST") {
      try { payload = await req.json(); } catch { payload = {}; }
    }
    const action = payload.action ?? (qToken ? "redeem" : null);
    const token = payload.token ?? qToken;

    if (action === "redeem") {
      if (!token) return json({ error: "Jeton requis" }, 400);
      const token_hash = await sha256(token);
      const { data: link } = await admin
        .from("dataroom_download_links")
        .select("*, dataroom_publications(id, title, file_url, visibility)")
        .eq("token_hash", token_hash)
        .maybeSingle();

      if (!link) return json({ error: "Lien invalide" }, 404);
      if (link.revoked) return json({ error: "Lien révoqué" }, 403);
      if (new Date(link.expires_at).getTime() < Date.now()) return json({ error: "Lien expiré" }, 410);
      if (link.used_count >= link.max_uses) return json({ error: "Nombre de téléchargements atteint" }, 403);

      const pub: any = link.dataroom_publications;
      if (!pub?.file_url) return json({ error: "Aucun fichier associé" }, 404);
      if ((pub.visibility ?? "nda") !== link.visibility_scope && link.visibility_scope !== "vip") {
        return json({ error: "Permission insuffisante pour ce document" }, 403);
      }

      const { data: signed, error: signErr } = await admin.storage
        .from(BUCKET).createSignedUrl(pub.file_url, 120, { download: true });
      if (signErr || !signed) return json({ error: signErr?.message ?? "Erreur de signature" }, 500);

      await admin.from("dataroom_download_links").update({
        used_count: link.used_count + 1,
        last_used_at: new Date().toISOString(),
      }).eq("id", link.id);

      await admin.from("dataroom_access_logs").insert({
        signatory_id: link.signatory_id,
        publication_id: pub.id,
        action: "secure_download",
        ip_address: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        user_agent: req.headers.get("user-agent") ?? null,
      });
      await admin.rpc("increment_dataroom_download", { _publication_id: pub.id });

      if (req.method === "GET") {
        return new Response(null, { status: 302, headers: { ...corsHeaders, Location: signed.signedUrl } });
      }
      return json({ ok: true, url: signed.signedUrl, title: pub.title });
    }

    // --- CREATE (admin only) ---
    if (action === "create") {
      const authHeader = req.headers.get("Authorization") ?? "";
      const jwt = authHeader.replace("Bearer ", "");
      if (!jwt) return json({ error: "Authentification requise" }, 401);
      const { data: userRes } = await admin.auth.getUser(jwt);
      const user = userRes?.user;
      if (!user) return json({ error: "Session invalide" }, 401);
      const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!isAdmin) return json({ error: "Accès réservé aux administrateurs" }, 403);

      const { publication_id, signatory_id, email, expires_in_hours = 24, max_uses = 1 } = payload;
      if (!publication_id) return json({ error: "publication_id requis" }, 400);

      const { data: pub } = await admin
        .from("dataroom_publications").select("id, title, file_url, visibility")
        .eq("id", publication_id).maybeSingle();
      if (!pub?.file_url) return json({ error: "Document sans fichier téléchargeable" }, 400);

      const tok = genToken();
      const token_hash = await sha256(tok);
      const expires_at = new Date(Date.now() + Math.min(Number(expires_in_hours) || 24, 720) * 3600 * 1000).toISOString();

      const { data: link, error } = await admin.from("dataroom_download_links").insert({
        publication_id,
        signatory_id: signatory_id ?? null,
        email: email ?? null,
        visibility_scope: pub.visibility ?? "nda",
        token_hash,
        expires_at,
        max_uses: Math.max(1, Math.min(Number(max_uses) || 1, 20)),
        created_by: user.id,
      }).select("id, expires_at, max_uses").single();
      if (error) throw error;

      const download_url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/dataroom-download-link?token=${tok}`;
      return json({ ok: true, id: link.id, download_url, expires_at: link.expires_at, max_uses: link.max_uses });
    }

    return json({ error: "Action inconnue" }, 400);
  } catch (e) {
    console.error("dataroom-download-link error", e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});

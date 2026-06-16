import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE_URL = `${SUPABASE_URL}/functions/v1`;

Deno.test("generate-article: rejects unauthenticated with 401", async () => {
  const res = await fetch(`${BASE_URL}/generate-article`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ topic: "Test" }),
  });
  await res.text();
  assertEquals(res.status, 401);
});

Deno.test("generate-article: OPTIONS returns CORS", async () => {
  const res = await fetch(`${BASE_URL}/generate-article`, {
    method: "OPTIONS",
    headers: { "apikey": SUPABASE_ANON_KEY },
  });
  await res.text();
  assertEquals(res.headers.get("access-control-allow-origin"), "*");
});

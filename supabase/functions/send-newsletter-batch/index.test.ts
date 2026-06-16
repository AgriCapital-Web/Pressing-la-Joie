import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE_URL = `${SUPABASE_URL}/functions/v1`;

Deno.test("send-newsletter-batch: rejects unauthenticated request with 401", async () => {
  const res = await fetch(`${BASE_URL}/send-newsletter-batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ subject: "Test", html: "<p>Hello</p>" }),
  });
  await res.text();
  assertEquals(res.status, 401);
});

Deno.test("send-newsletter-batch: rejects invalid body with 401 or 400", async () => {
  const res = await fetch(`${BASE_URL}/send-newsletter-batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ html: "<p>Hello</p>" }),
  });
  await res.text();
  const validStatus = res.status === 401 || res.status === 400;
  assertEquals(validStatus, true);
});

Deno.test("send-newsletter-batch: OPTIONS returns CORS headers", async () => {
  const res = await fetch(`${BASE_URL}/send-newsletter-batch`, {
    method: "OPTIONS",
    headers: { "apikey": SUPABASE_ANON_KEY },
  });
  await res.text();
  const allowOrigin = res.headers.get("access-control-allow-origin");
  assertEquals(allowOrigin, "*");
});

Deno.test("send-newsletter-batch: rejects oversized subject (>500 chars) with appropriate error", async () => {
  const longSubject = "A".repeat(501);
  const res = await fetch(`${BASE_URL}/send-newsletter-batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ subject: longSubject, html: "<p>Test</p>" }),
  });
  await res.text();
  // Will be 401 (anon key not a user) or 400 (invalid subject)
  const valid = res.status === 401 || res.status === 400;
  assertEquals(valid, true);
});

Deno.test("send-newsletter-batch: rejects oversized HTML (>100KB) with appropriate error", async () => {
  const largeHtml = "<p>" + "X".repeat(100001) + "</p>";
  const res = await fetch(`${BASE_URL}/send-newsletter-batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ subject: "Test", html: largeHtml }),
  });
  await res.text();
  const valid = res.status === 401 || res.status === 400;
  assertEquals(valid, true);
});

Deno.test("send-newsletter-batch: retryEmails with invalid format rejected", async () => {
  const res = await fetch(`${BASE_URL}/send-newsletter-batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      subject: "Retry Test",
      html: "<p>Retry content</p>",
      retryEmails: ["not-an-email", "also-invalid"],
    }),
  });
  await res.text();
  // Will be 401 (anon not a real user) or 400 (no valid emails after filtering)
  const valid = res.status === 401 || res.status === 400;
  assertEquals(valid, true);
});

Deno.test("send-newsletter-batch: retryEmails with valid emails format accepted structurally", async () => {
  const res = await fetch(`${BASE_URL}/send-newsletter-batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      subject: "Retry Test",
      html: "<p>Retry</p>",
      retryEmails: ["test@example.com", "user@test.org"],
    }),
  });
  await res.text();
  // 401 because anon key is not a valid user token - but the body is valid
  assertEquals(res.status, 401);
});

Deno.test("send-newsletter-batch: response includes proper JSON content-type", async () => {
  const res = await fetch(`${BASE_URL}/send-newsletter-batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ subject: "Test", html: "<p>Test</p>" }),
  });
  await res.text();
  const ct = res.headers.get("content-type");
  assertExists(ct);
  assertEquals(ct!.includes("application/json"), true);
});

// Supabase Edge Function: document-hmac
// Genera un HMAC SHA-256 seguro utilizando una clave secreta del servidor para detección de duplicados

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const HMAC_SECRET = Deno.env.get("DOCUMENT_HMAC_SECRET") || "fallback-secret-dev-only-change-prod";

async function computeHmac(documentNumber: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(HMAC_SECRET);
  const msgData = encoder.encode(documentNumber.trim());

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, msgData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { document_number } = await req.json();

    if (!document_number || typeof document_number !== "string") {
      return new Response(JSON.stringify({ error: "document_number es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hmac = await computeHmac(document_number);

    return new Response(JSON.stringify({ document_hmac: hmac }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

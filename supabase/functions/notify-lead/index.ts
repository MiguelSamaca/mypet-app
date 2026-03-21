import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nombre, email, accepts_marketing = true, origen = "popup_descuento" } = await req.json();

    // Sync lead to Shopify as customer via Client Credentials
    const SHOPIFY_STORE_URL = Deno.env.get("SHOPIFY_STORE_URL");
    const SHOPIFY_CLIENT_ID = Deno.env.get("SHOPIFY_CLIENT_ID");
    const SHOPIFY_CLIENT_SECRET = Deno.env.get("SHOPIFY_CLIENT_SECRET");

    if (SHOPIFY_STORE_URL && SHOPIFY_CLIENT_ID && SHOPIFY_CLIENT_SECRET) {
      try {
        // Step 1: Get access token via Client Credentials Grant
        const tokenRes = await fetch(
          `https://${SHOPIFY_STORE_URL}/admin/oauth/access_token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: SHOPIFY_CLIENT_ID,
              client_secret: SHOPIFY_CLIENT_SECRET,
              grant_type: "client_credentials",
            }),
          }
        );
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok) {
          console.error("Shopify token error:", JSON.stringify(tokenData));
        } else {
          const accessToken = tokenData.access_token;

          // Step 2: Create customer with the obtained token
          const shopifyRes = await fetch(
            `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/customers.json`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": accessToken,
              },
              body: JSON.stringify({
                customer: {
                  email,
                  first_name: nombre || "",
                  tags: `lead_mayte,${origen},hotel`,
                  note: `Lead registrado desde Mayte Pet Hotel (sitio web) - Origen: ${origen}`,
                  email_marketing_consent: {
                    state: accepts_marketing ? "subscribed" : "not_subscribed",
                    opt_in_level: "single_opt_in",
                    consent_updated_at: new Date().toISOString(),
                  },
                },
              }),
            }
          );
          const shopifyData = await shopifyRes.json();
          if (!shopifyRes.ok) {
            console.error("Shopify error:", JSON.stringify(shopifyData));
          } else {
            console.log("Shopify customer created:", shopifyData.customer?.id);
          }
        }
      } catch (shopifyErr) {
        console.error("Shopify sync failed:", shopifyErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in notify-lead:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

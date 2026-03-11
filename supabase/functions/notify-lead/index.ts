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

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { nombre, email } = await req.json();

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #d4a574;">🐾 Nuevo lead registrado en Mayte Pet Hotel</h2>
        <div style="background: #f9f5f0; border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="margin: 8px 0;"><strong>Nombre:</strong> ${nombre || "No proporcionado"}</p>
          <p style="margin: 8px 0;"><strong>Correo:</strong> ${email}</p>
          <p style="margin: 8px 0;"><strong>Origen:</strong> Popup de descuento 10%</p>
          <p style="margin: 8px 0;"><strong>Fecha:</strong> ${new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" })}</p>
        </div>
        <p style="color: #888; font-size: 12px;">Este correo fue enviado automáticamente desde maytepethotel.com</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mayte Pet Hotel <onboarding@resend.dev>",
        to: ["maitepetbouteque@gmail.com"],
        subject: `🐾 Nuevo lead: ${nombre || email}`,
        html: htmlBody,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", JSON.stringify(data));
    }

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
                  tags: "lead_mayte,popup_descuento",
                  marketing_consent: {
                    state: "subscribed",
                    opt_in_level: "single_opt_in",
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
    console.error("Error sending notification:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

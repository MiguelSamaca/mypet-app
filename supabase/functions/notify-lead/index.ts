import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

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
    const { nombre, email, accepts_marketing = true, origen = "popup_descuento", event_id, client_ip, client_ua, fbc, fbp } = await req.json();

    // Sync lead to Shopify as customer via Client Credentials
    const SHOPIFY_STORE_URL = Deno.env.get("SHOPIFY_STORE_URL");
    const SHOPIFY_CLIENT_ID = Deno.env.get("SHOPIFY_CLIENT_ID");
    const SHOPIFY_CLIENT_SECRET = Deno.env.get("SHOPIFY_CLIENT_SECRET");

    // Resultado del sync con Shopify, por el mismo motivo que el de Meta:
    // sin esto un fallo de credenciales o de permisos es invisible desde fuera.
    let shopifyResult: Record<string, unknown> = { sent: false, reason: "sin credenciales" };

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
          shopifyResult = { sent: false, paso: "token", status: tokenRes.status, error: tokenData?.errors ?? tokenData };
        } else {
          const accessToken = tokenData.access_token;

          const leadMetafields = [
            {
              namespace: "lead",
              key: "origen",
              type: "single_line_text_field",
              value: origen,
            },
            {
              namespace: "lead",
              key: "fuente",
              type: "single_line_text_field",
              value: "Mayte Pet Hotel - sitio web",
            },
            {
              namespace: "lead",
              key: "registrado_en",
              type: "date",
              value: new Date().toISOString().slice(0, 10),
            },
          ];

          const customerPayload = {
            customer: {
              email,
              first_name: nombre || "",
              tags: `lead_mayte,${origen},hotel`,
              email_marketing_consent: {
                state: accepts_marketing ? "subscribed" : "not_subscribed",
                opt_in_level: "single_opt_in",
                consent_updated_at: new Date().toISOString(),
              },
              metafields: leadMetafields,
            },
          };

          // Step 2: Try to create customer
          const shopifyRes = await fetch(
            `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/customers.json`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": accessToken,
              },
              body: JSON.stringify(customerPayload),
            }
          );
          const shopifyData = await shopifyRes.json();

          if (!shopifyRes.ok && shopifyData?.errors?.email?.[0] === "has already been taken") {
            // Customer exists — search and update
            const searchRes = await fetch(
              `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/customers/search.json?query=email:${encodeURIComponent(email)}`,
              {
                headers: { "X-Shopify-Access-Token": accessToken },
              }
            );
            const searchData = await searchRes.json();
            const existingCustomer = searchData?.customers?.[0];

            if (existingCustomer) {
              const existingTags = existingCustomer.tags ? existingCustomer.tags.split(",").map((t: string) => t.trim()) : [];
              const newTags = [`lead_mayte`, origen, `hotel`];
              const mergedTags = [...new Set([...existingTags, ...newTags])].join(",");

              const updateRes = await fetch(
                `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/customers/${existingCustomer.id}.json`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": accessToken,
                  },
                  body: JSON.stringify({
                    customer: {
                      id: existingCustomer.id,
                      tags: mergedTags,
                      email_marketing_consent: customerPayload.customer.email_marketing_consent,
                      metafields: leadMetafields,
                    },
                  }),
                }
              );
              await updateRes.json();
              console.log("Shopify customer updated:", existingCustomer.id);
              shopifyResult = { sent: true, accion: "actualizado", customer_id: existingCustomer.id };
            } else {
              console.error("Shopify: email taken but not found via search");
              shopifyResult = { sent: false, paso: "busqueda", reason: "email ocupado pero no encontrado" };
            }
          } else if (!shopifyRes.ok) {
            console.error("Shopify error:", JSON.stringify(shopifyData));
            shopifyResult = { sent: false, paso: "crear", status: shopifyRes.status, error: shopifyData?.errors ?? shopifyData };
          } else {
            console.log("Shopify customer created:", shopifyData.customer?.id);
            shopifyResult = { sent: true, accion: "creado", customer_id: shopifyData.customer?.id };
          }
        }
      } catch (shopifyErr) {
        console.error("Shopify sync failed:", shopifyErr);
        shopifyResult = { sent: false, reason: String(shopifyErr) };
      }
    }

    // --- Meta Conversions API ---
    const META_TOKEN = Deno.env.get("META_CONVERSIONS_API_TOKEN");
    const PIXEL_ID = "915339354347019";

    // Resultado del envío a Meta. Se devuelve en la respuesta para que un fallo
    // sea observable: quien llama la ignora (fire-and-forget), pero sin esto un
    // token revocado se traduce en conversiones perdidas sin ninguna señal.
    let metaResult: Record<string, unknown> = { sent: false, reason: "sin token" };

    if (META_TOKEN) {
      try {
        const eventData: Record<string, unknown> = {
          event_name: "CompleteRegistration",
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: "https://maytepethotel.com/",
          user_data: {
            em: [await sha256(email.trim().toLowerCase())],
            ...(nombre ? { fn: [await sha256(nombre.trim().toLowerCase())] } : {}),
            ...(client_ip ? { client_ip_address: client_ip } : {}),
            ...(client_ua ? { client_user_agent: client_ua } : {}),
            ...(fbc ? { fbc } : {}),
            ...(fbp ? { fbp } : {}),
          },
          custom_data: {
            content_name: origen,
          },
          ...(event_id ? { event_id } : {}),
        };

        const metaRes = await fetch(
          `https://graph.facebook.com/v22.0/${PIXEL_ID}/events`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data: [eventData],
              access_token: META_TOKEN,
            }),
          }
        );
        const metaData = await metaRes.json();
        if (!metaRes.ok) {
          console.error("Meta CAPI error:", JSON.stringify(metaData));
          metaResult = { sent: false, status: metaRes.status, error: metaData?.error ?? metaData };
        } else {
          console.log("Meta CAPI event sent:", metaData.events_received);
          metaResult = { sent: true, events_received: metaData.events_received };
        }
      } catch (metaErr) {
        console.error("Meta CAPI failed:", metaErr);
        metaResult = { sent: false, reason: String(metaErr) };
      }
    }

    return new Response(JSON.stringify({ success: true, shopify: shopifyResult, meta: metaResult }), {
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

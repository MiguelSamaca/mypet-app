import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const nombre = String(body.nombre ?? "").trim();
    const telefono = String(body.telefono ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const articulo = String(body.articulo ?? "").trim();
    const fecha_compra = String(body.fecha_compra ?? "").trim();
    const dias_duracion = parseInt(String(body.dias_duracion ?? ""), 10);
    const notas = body.notas ? String(body.notas).trim() : null;

    if (!nombre || nombre.length > 120) throw new Error("Nombre inválido");
    if (!telefono || telefono.length > 30) throw new Error("Teléfono inválido");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email inválido");
    if (!articulo || articulo.length > 120) throw new Error("Artículo inválido");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_compra)) throw new Error("Fecha de compra inválida");
    if (!Number.isFinite(dias_duracion) || dias_duracion < 1 || dias_duracion > 365) {
      throw new Error("Duración inválida (1-365 días)");
    }

    const fecha_renovacion = addDays(fecha_compra, dias_duracion);

    // Save to DB
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: insertedRows, error: insertError } = await supabase
      .from("compras")
      .insert({
        nombre,
        telefono,
        email,
        articulo,
        fecha_compra,
        dias_duracion,
        fecha_renovacion,
        notas,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("DB insert error:", insertError);
      throw new Error("No se pudo guardar el registro");
    }

    let shopifyCustomerId: string | null = null;

    // Shopify sync
    const SHOPIFY_STORE_URL = Deno.env.get("SHOPIFY_STORE_URL");
    const SHOPIFY_CLIENT_ID = Deno.env.get("SHOPIFY_CLIENT_ID");
    const SHOPIFY_CLIENT_SECRET = Deno.env.get("SHOPIFY_CLIENT_SECRET");

    if (SHOPIFY_STORE_URL && SHOPIFY_CLIENT_ID && SHOPIFY_CLIENT_SECRET) {
      try {
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
          const tagSlug = slugify(articulo);
          const newTags = [
            "recompra",
            `recompra_${tagSlug}`,
            `renueva_${fecha_renovacion}`,
            "hotel",
          ];
          const noteLine = `Compra registrada: ${articulo} el ${fecha_compra} (dura ${dias_duracion} días). Próxima recompra: ${fecha_renovacion}.${notas ? ` Notas: ${notas}` : ""}`;

          // Find existing customer
          const searchRes = await fetch(
            `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/customers/search.json?query=email:${encodeURIComponent(email)}`,
            { headers: { "X-Shopify-Access-Token": accessToken } }
          );
          const searchData = await searchRes.json();
          const existing = searchData?.customers?.[0];

          const metafields = [
            {
              namespace: "recompra",
              key: "next_renewal_date",
              type: "date",
              value: fecha_renovacion,
            },
            {
              namespace: "recompra",
              key: "last_product",
              type: "single_line_text_field",
              value: articulo,
            },
            {
              namespace: "recompra",
              key: "last_purchase_date",
              type: "date",
              value: fecha_compra,
            },
          ];

          if (existing) {
            const existingTags = existing.tags
              ? existing.tags.split(",").map((t: string) => t.trim())
              : [];
            const merged = [...new Set([...existingTags, ...newTags])].join(",");
            const [first_name, ...rest] = nombre.split(" ");
            const last_name = rest.join(" ");

            const updateRes = await fetch(
              `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/customers/${existing.id}.json`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  "X-Shopify-Access-Token": accessToken,
                },
                body: JSON.stringify({
                  customer: {
                    id: existing.id,
                    first_name: first_name || existing.first_name,
                    last_name: last_name || existing.last_name,
                    phone: telefono,
                    tags: merged,
                    note: noteLine,
                    metafields,
                  },
                }),
              }
            );
            const updateData = await updateRes.json();
            if (!updateRes.ok) {
              console.error("Shopify update error:", JSON.stringify(updateData));
            } else {
              shopifyCustomerId = String(existing.id);
              console.log("Shopify customer updated:", existing.id);
            }
          } else {
            const [first_name, ...rest] = nombre.split(" ");
            const last_name = rest.join(" ");
            const createRes = await fetch(
              `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/customers.json`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Shopify-Access-Token": accessToken,
                },
                body: JSON.stringify({
                  customer: {
                    first_name: first_name || "",
                    last_name: last_name || "",
                    email,
                    phone: telefono,
                    tags: newTags.join(","),
                    note: noteLine,
                    metafields,
                  },
                }),
              }
            );
            const createData = await createRes.json();
            if (!createRes.ok) {
              console.error("Shopify create error:", JSON.stringify(createData));
            } else {
              shopifyCustomerId = String(createData.customer?.id ?? "");
              console.log("Shopify customer created:", shopifyCustomerId);
            }
          }

          if (shopifyCustomerId) {
            await supabase
              .from("compras")
              .update({
                shopify_synced: true,
                shopify_customer_id: shopifyCustomerId,
              })
              .eq("id", insertedRows.id);
          }
        }
      } catch (shopifyErr) {
        console.error("Shopify sync failed:", shopifyErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, fecha_renovacion }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in register-purchase:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

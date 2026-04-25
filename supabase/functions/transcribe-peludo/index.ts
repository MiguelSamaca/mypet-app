// Edge function: transcribe-peludo
// Recibe audio en base64 + modo ("visita" | "perfil") y devuelve JSON estructurado
// usando Gemini 2.5 Flash (audio nativo) vía Lovable AI Gateway.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROMPT_VISITA = `Eres un asistente que organiza notas de visitas de un hotel canino.
Recibirás un audio en español hablado por un cuidador. Debes:
1) Transcribirlo mentalmente.
2) Estructurar la información en los campos del formulario.

Reglas:
- "comportamiento": cómo se portó el perro (ánimo, sociabilidad, sueño, comida, energía).
- "actividades": qué hizo (paseos, juegos, baños, entrenamientos). Usa formato bullet con un guion al inicio de cada línea (ej: "- Paseo en la mañana").
- "recomendaciones": consejos para el dueño / próxima visita. Usa también bullets con guiones.
- "fecha_entrada" y "fecha_salida": SOLO si las menciona explícitamente. Formato YYYY-MM-DD. Si no, déjalas null.
- Si un campo no se menciona, déjalo como string vacío "" (o null para fechas).
- No inventes nada que no esté en el audio. Sé fiel al hablante.
- Escribe en español natural, claro y cariñoso.`;

const PROMPT_PERFIL = `Eres un asistente que organiza la información de un perro huésped en un hotel canino.
Recibirás un audio en español. Extrae:
- "nombre": nombre del perro (si se menciona).
- "raza": raza (si se menciona).
- "descripcion_especial": una frase corta y bonita que lo describa (ej: "El más juguetón que nos ha visitado"). Si el hablante da varias ideas, condénsalas en una frase.
- "dueno_nombre", "dueno_email", "dueno_telefono": SOLO si se mencionan.
- Campos no mencionados: string vacío "".
- No inventes datos.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurado");

    const { audioBase64, mimeType, modo } = await req.json();
    if (!audioBase64 || !modo) {
      return new Response(JSON.stringify({ error: "Faltan audioBase64 o modo" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isVisita = modo === "visita";
    const systemPrompt = isVisita ? PROMPT_VISITA : PROMPT_PERFIL;

    const tool = isVisita
      ? {
          type: "function",
          function: {
            name: "guardar_visita",
            description: "Estructura la información de una visita.",
            parameters: {
              type: "object",
              properties: {
                comportamiento: { type: "string" },
                actividades: { type: "string" },
                recomendaciones: { type: "string" },
                fecha_entrada: { type: ["string", "null"] },
                fecha_salida: { type: ["string", "null"] },
              },
              required: ["comportamiento", "actividades", "recomendaciones"],
              additionalProperties: false,
            },
          },
        }
      : {
          type: "function",
          function: {
            name: "guardar_perfil",
            description: "Estructura la información de un peludo.",
            parameters: {
              type: "object",
              properties: {
                nombre: { type: "string" },
                raza: { type: "string" },
                descripcion_especial: { type: "string" },
                dueno_nombre: { type: "string" },
                dueno_email: { type: "string" },
                dueno_telefono: { type: "string" },
              },
              required: ["descripcion_especial"],
              additionalProperties: false,
            },
          },
        };

    const toolName = isVisita ? "guardar_visita" : "guardar_perfil";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Procesa este audio y devuelve los campos estructurados." },
              {
                type: "input_audio",
                input_audio: {
                  data: audioBase64,
                  format: mimeType?.includes("wav") ? "wav" : "mp3",
                },
              },
            ],
          },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: toolName } },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas solicitudes, intenta de nuevo en un momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados. Añade créditos en Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ error: "Error del modelo IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("Sin tool_call:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "El modelo no devolvió datos estructurados" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("transcribe-peludo error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

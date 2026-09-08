// Edge function: transcribe-peludo
// Recibe audio en base64 + modo ("visita" | "perfil") y devuelve JSON estructurado
// usando Gemini 2.5 Flash (audio nativo) vía la API de Google Gemini.

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

const SCHEMA_VISITA = {
  type: "OBJECT",
  properties: {
    comportamiento: { type: "STRING" },
    actividades: { type: "STRING" },
    recomendaciones: { type: "STRING" },
    fecha_entrada: { type: "STRING", nullable: true },
    fecha_salida: { type: "STRING", nullable: true },
  },
  required: ["comportamiento", "actividades", "recomendaciones"],
};

const SCHEMA_PERFIL = {
  type: "OBJECT",
  properties: {
    nombre: { type: "STRING" },
    raza: { type: "STRING" },
    descripcion_especial: { type: "STRING" },
    dueno_nombre: { type: "STRING" },
    dueno_email: { type: "STRING" },
    dueno_telefono: { type: "STRING" },
  },
  required: ["descripcion_especial"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY no configurado");

    const { audioBase64, mimeType, modo } = await req.json();
    if (!audioBase64 || !modo) {
      return new Response(JSON.stringify({ error: "Faltan audioBase64 o modo" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isVisita = modo === "visita";
    const systemPrompt = isVisita ? PROMPT_VISITA : PROMPT_PERFIL;
    const schema = isVisita ? SCHEMA_VISITA : SCHEMA_PERFIL;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [
            {
              role: "user",
              parts: [
                { text: "Procesa este audio y devuelve los campos estructurados." },
                {
                  inlineData: {
                    mimeType: mimeType || "audio/mp3",
                    data: audioBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        }),
      },
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("Gemini API error:", response.status, t);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas solicitudes, intenta de nuevo en un momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ error: "Error del modelo IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) {
      console.error("Sin respuesta estructurada:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "El modelo no devolvió datos estructurados" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(jsonText);
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

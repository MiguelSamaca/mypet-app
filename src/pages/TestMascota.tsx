import { useState, useMemo } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";

/**
 * Test de Comportamiento de Mascotas — Lead Magnet
 * Origen: "quiz_comportamiento"
 * Contacto: WhatsApp 315 4148380
 */

type Opcion = {
  emoji: string;
  texto: string;
  // Puntajes por dimensión
  energia: number;
  sociable: number;
  obediencia: number;
  ansiedad: number;
};

type Pregunta = {
  id: string;
  emoji: string;
  pregunta: string;
  opciones: Opcion[];
};

const PREGUNTAS: Pregunta[] = [
  {
    id: "saludo",
    emoji: "🚪",
    pregunta: "Cuando llegas a casa, tu peludo…",
    opciones: [
      { emoji: "🎉", texto: "Salta, ladra y no para de moverse", energia: 3, sociable: 3, obediencia: 0, ansiedad: 2 },
      { emoji: "🐶", texto: "Mueve la cola y te recibe tranquilo", energia: 1, sociable: 3, obediencia: 2, ansiedad: 0 },
      { emoji: "😴", texto: "Sigue durmiendo en su lugar", energia: 0, sociable: 1, obediencia: 1, ansiedad: 0 },
      { emoji: "🙈", texto: "Se esconde o llora", energia: 0, sociable: 0, obediencia: 0, ansiedad: 3 },
    ],
  },
  {
    id: "paseo",
    emoji: "🦮",
    pregunta: "En el paseo, ¿cómo se comporta?",
    opciones: [
      { emoji: "🏃", texto: "Hala la correa todo el tiempo", energia: 3, sociable: 2, obediencia: 0, ansiedad: 1 },
      { emoji: "🚶", texto: "Camina al lado tuyo", energia: 1, sociable: 2, obediencia: 3, ansiedad: 0 },
      { emoji: "🛑", texto: "Se queda quieto o no quiere salir", energia: 0, sociable: 0, obediencia: 1, ansiedad: 3 },
      { emoji: "👀", texto: "Quiere saludar a todo el mundo", energia: 2, sociable: 3, obediencia: 1, ansiedad: 0 },
    ],
  },
  {
    id: "otrosperros",
    emoji: "🐕‍🦺",
    pregunta: "Cuando ve a otros perros…",
    opciones: [
      { emoji: "🤝", texto: "Se acerca a jugar feliz", energia: 2, sociable: 3, obediencia: 1, ansiedad: 0 },
      { emoji: "😤", texto: "Ladra o gruñe", energia: 2, sociable: 0, obediencia: 0, ansiedad: 2 },
      { emoji: "🫣", texto: "Se esconde detrás de ti", energia: 0, sociable: 0, obediencia: 1, ansiedad: 3 },
      { emoji: "😐", texto: "Los ignora, va a lo suyo", energia: 1, sociable: 1, obediencia: 2, ansiedad: 0 },
    ],
  },
  {
    id: "solo",
    emoji: "🏠",
    pregunta: "Cuando lo dejas solo en casa…",
    opciones: [
      { emoji: "😇", texto: "Se acuesta a descansar", energia: 0, sociable: 1, obediencia: 3, ansiedad: 0 },
      { emoji: "🪑", texto: "Mordisquea cosas o muebles", energia: 2, sociable: 1, obediencia: 0, ansiedad: 3 },
      { emoji: "😭", texto: "Llora o ladra mucho rato", energia: 1, sociable: 1, obediencia: 0, ansiedad: 3 },
      { emoji: "🎾", texto: "Juega con sus juguetes", energia: 2, sociable: 1, obediencia: 2, ansiedad: 0 },
    ],
  },
  {
    id: "comida",
    emoji: "🍖",
    pregunta: "A la hora de comer…",
    opciones: [
      { emoji: "🤤", texto: "Devora todo en segundos", energia: 3, sociable: 2, obediencia: 1, ansiedad: 1 },
      { emoji: "🧐", texto: "Come tranquilo y a su ritmo", energia: 1, sociable: 1, obediencia: 3, ansiedad: 0 },
      { emoji: "😒", texto: "Es muy delicado, a veces no come", energia: 0, sociable: 0, obediencia: 1, ansiedad: 2 },
      { emoji: "👮", texto: "Cuida su plato, gruñe si te acercas", energia: 1, sociable: 0, obediencia: 0, ansiedad: 2 },
    ],
  },
  {
    id: "ninos",
    emoji: "🧒",
    pregunta: "Con niños o gente nueva…",
    opciones: [
      { emoji: "🥰", texto: "Es súper cariñoso con todos", energia: 2, sociable: 3, obediencia: 2, ansiedad: 0 },
      { emoji: "🤨", texto: "Toma su tiempo para confiar", energia: 1, sociable: 1, obediencia: 2, ansiedad: 1 },
      { emoji: "😨", texto: "Le da miedo o se aleja", energia: 0, sociable: 0, obediencia: 1, ansiedad: 3 },
      { emoji: "🙉", texto: "Se emociona mucho y salta encima", energia: 3, sociable: 3, obediencia: 0, ansiedad: 1 },
    ],
  },
  {
    id: "orden",
    emoji: "🎓",
    pregunta: "Cuando le das una orden básica (sentado, ven)…",
    opciones: [
      { emoji: "💯", texto: "Obedece siempre", energia: 1, sociable: 2, obediencia: 3, ansiedad: 0 },
      { emoji: "🤔", texto: "Sólo si hay premio", energia: 2, sociable: 2, obediencia: 1, ansiedad: 0 },
      { emoji: "🙃", texto: "Te mira y sigue en lo suyo", energia: 2, sociable: 1, obediencia: 0, ansiedad: 0 },
      { emoji: "❓", texto: "Nunca le hemos enseñado", energia: 1, sociable: 1, obediencia: 0, ansiedad: 1 },
    ],
  },
  {
    id: "juego",
    emoji: "🎾",
    pregunta: "¿Cuánta energía tiene para jugar?",
    opciones: [
      { emoji: "⚡", texto: "Inagotable, juega horas", energia: 3, sociable: 2, obediencia: 1, ansiedad: 0 },
      { emoji: "🙂", texto: "Le gusta, pero también descansa", energia: 2, sociable: 2, obediencia: 2, ansiedad: 0 },
      { emoji: "😪", texto: "Prefiere dormir", energia: 0, sociable: 1, obediencia: 2, ansiedad: 0 },
      { emoji: "🤯", texto: "Se exalta tanto que cuesta calmarlo", energia: 3, sociable: 2, obediencia: 0, ansiedad: 2 },
    ],
  },
];

type Perfil = {
  key: string;
  titulo: string;
  emoji: string;
  descripcion: string;
  recomendacion: string;
  color: string; // tailwind bg class
};

const PERFILES: Record<string, Perfil> = {
  social: {
    key: "social",
    titulo: "El Alma de la Fiesta",
    emoji: "🥳",
    descripcion:
      "Tu peludo es súper sociable y disfruta cada interacción. Le encanta la gente, los otros perros y vivir nuevas experiencias.",
    recomendacion:
      "Necesita estimulación social constante. En Mayte Pet Hotel vivirá su mejor vida jugando en manada todo el día.",
    color: "from-pink-400 to-fuchsia-500",
  },
  atleta: {
    key: "atleta",
    titulo: "El Atleta Imparable",
    emoji: "⚡",
    descripcion:
      "Energía pura. Tu peludo necesita gastar batería todos los días o se aburre y hace travesuras.",
    recomendacion:
      "Los paseos largos, juego en piscina y manada son perfectos. Te encantará nuestro programa de actividades diarias.",
    color: "from-orange-400 to-pink-500",
  },
  zen: {
    key: "zen",
    titulo: "El Maestro Zen",
    emoji: "🧘",
    descripcion:
      "Tu peludo es tranquilo, obediente y disfruta de la calma. Es el compañero ideal para descansar.",
    recomendacion:
      "Le encantará nuestro hotel: ambiente familiar, descanso en zonas suaves y cariño sin estrés.",
    color: "from-purple-400 to-indigo-500",
  },
  sensible: {
    key: "sensible",
    titulo: "El Corazón Sensible",
    emoji: "🫧",
    descripcion:
      "Tu peludo es noble pero un poco ansioso o tímido. Necesita confianza, rutinas claras y mucho amor.",
    recomendacion:
      "En Mayte lo atendemos como en casa: adaptación gradual, cuidadores fijos y cero estrés. Ideal para él.",
    color: "from-fuchsia-400 to-purple-600",
  },
  travieso: {
    key: "travieso",
    titulo: "El Travieso Encantador",
    emoji: "😈",
    descripcion:
      "Es inteligente, curioso y un poco rebelde. Le falta canalizar su energía con actividades divertidas.",
    recomendacion:
      "Necesita juego, manada y rutina. Nuestro hotel lo mantiene ocupado y feliz todo el día.",
    color: "from-pink-500 to-orange-400",
  },
};

function calcularPerfil(respuestas: Opcion[]) {
  const totales = respuestas.reduce(
    (acc, o) => ({
      energia: acc.energia + o.energia,
      sociable: acc.sociable + o.sociable,
      obediencia: acc.obediencia + o.obediencia,
      ansiedad: acc.ansiedad + o.ansiedad,
    }),
    { energia: 0, sociable: 0, obediencia: 0, ansiedad: 0 }
  );

  const max = Math.max(totales.energia, totales.sociable, totales.obediencia, totales.ansiedad);

  let perfilKey: string;
  if (totales.ansiedad === max && totales.ansiedad >= 8) perfilKey = "sensible";
  else if (totales.sociable === max) perfilKey = "social";
  else if (totales.energia === max && totales.obediencia < totales.energia - 2) perfilKey = "travieso";
  else if (totales.energia === max) perfilKey = "atleta";
  else if (totales.obediencia === max) perfilKey = "zen";
  else perfilKey = "social";

  // Puntaje global de comportamiento (0-100)
  const maxPosible = respuestas.length * 3;
  const positivo = totales.sociable + totales.obediencia;
  const negativo = totales.ansiedad;
  const score = Math.max(
    10,
    Math.min(100, Math.round(((positivo - negativo * 0.5 + maxPosible) / (maxPosible * 2)) * 100))
  );

  return { perfil: PERFILES[perfilKey], totales, score };
}

const WHATSAPP = "573154148380";

export default function TestMascota() {
  const [paso, setPaso] = useState<"intro" | "quiz" | "form" | "resultado">("intro");
  const [nombreMascota, setNombreMascota] = useState("");
  const [respuestas, setRespuestas] = useState<Opcion[]>([]);
  const [idx, setIdx] = useState(0);

  // Lead form (capturado ANTES de mostrar el resultado)
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const resultado = useMemo(
    () => (respuestas.length === PREGUNTAS.length ? calcularPerfil(respuestas) : null),
    [respuestas]
  );

  const progreso = (idx / PREGUNTAS.length) * 100;

  const responder = (op: Opcion) => {
    const nuevas = [...respuestas, op];
    setRespuestas(nuevas);
    if (idx + 1 < PREGUNTAS.length) {
      setIdx(idx + 1);
    } else {
      setPaso("form");
    }
  };

  const reiniciar = () => {
    setPaso("intro");
    setIdx(0);
    setRespuestas([]);
    setNombreMascota("");
    setNombre("");
    setEmail("");
    setTelefono("");
    setError("");
  };

  const iniciarTest = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombreMascota.trim()) {
      setError("Cuéntanos cómo se llama tu peludo");
      return;
    }
    setPaso("quiz");
  };

  const verResultado = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) {
      setError("Ingresa tu nombre");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Ingresa un correo válido");
      return;
    }
    setEnviando(true);
    try {
      const { error: dbError } = await supabase.from("leads").insert({
        email: email.trim(),
        nombre: nombre.trim(),
        telefono: telefono.trim() || null,
        origen: "quiz_comportamiento",
      });
      if (dbError) throw dbError;

      if (typeof (window as any).fbq === "function") {
        (window as any).fbq("track", "Lead", { content_name: "Quiz Comportamiento Mascota" });
      }

      supabase.functions
        .invoke("notify-lead", {
          body: {
            nombre: nombre.trim(),
            email: email.trim(),
            telefono: telefono.trim(),
            accepts_marketing: true,
            origen: "quiz_comportamiento",
          },
        })
        .catch(console.error);

      setPaso("resultado");
    } catch {
      setError("Hubo un error, intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const compartir = async () => {
    const url = window.location.href;
    const text = `¡Hice el test de comportamiento de mi peludo en Mayte Pet Hotel! 🐾 Descubre el perfil del tuyo:`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Test de Comportamiento", text, url });
      } catch {
        /* cancelado */
      }
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      alert("¡Enlace copiado!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(300,100%,95%)] via-background to-[hsl(314,73%,90%)] py-6 px-4">
      <Seo
        title="Test de Comportamiento para tu Mascota | Mayte Pet Hotel"
        description="Descubre en 2 minutos el perfil de comportamiento de tu peludo. Test interactivo y gratis del Mayte Pet Hotel."
        path="/test-mascota"
      />

      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block text-xs text-muted-foreground hover:text-primary">
            ← Volver a Mayte Pet Hotel
          </Link>
        </div>

        {/* INTRO + LEAD */}
        {paso === "intro" && (
          <div className="bg-card rounded-3xl shadow-xl border-2 border-primary/20 p-6 sm:p-8 text-center animate-in fade-in duration-500">
            <div className="text-6xl mb-3">🐾</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              ¿Qué tipo de personalidad tiene tu peludo?
            </h1>
            <p className="text-sm text-muted-foreground mb-5">
              Test rápido y divertido: <strong className="text-primary">8 preguntas, 2 minutos</strong>. Descubre su perfil
              + recibe <strong className="text-primary">10% OFF</strong> en su primera noche.
            </p>

            <div className="grid grid-cols-4 gap-2 mb-5 text-3xl">
              <div className="bg-primary/10 rounded-2xl py-3">🐶</div>
              <div className="bg-accent/10 rounded-2xl py-3">🦴</div>
              <div className="bg-secondary/10 rounded-2xl py-3">🎾</div>
              <div className="bg-primary/10 rounded-2xl py-3">❤️</div>
            </div>

            <form onSubmit={iniciarTest} className="space-y-3 text-left">
              <input
                type="text"
                placeholder="¿Cómo se llama tu peludo? (opcional)"
                value={nombreMascota}
                onChange={(e) => setNombreMascota(e.target.value)}
                maxLength={40}
                className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Tu nombre (opcional)"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="email"
                placeholder="Tu correo *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="tel"
                placeholder="WhatsApp (opcional)"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={enviando}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-base shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                {enviando ? "Cargando..." : "¡Empezar el test! 🚀"}
              </button>
              <p className="text-[11px] text-muted-foreground text-center">
                Tu correo nos sirve para enviarte el cupón. No spam, lo prometemos 🐾
              </p>
            </form>
          </div>
        )}

        {/* QUIZ */}
        {paso === "quiz" && (
          <div className="bg-card rounded-3xl shadow-xl border-2 border-primary/20 p-5 sm:p-7 animate-in fade-in duration-300">
            {/* Progress */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>
                  Pregunta {idx + 1} de {PREGUNTAS.length}
                </span>
                <span>{Math.round(progreso)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                  style={{ width: `${((idx + 1) / PREGUNTAS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Pregunta */}
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">{PREGUNTAS[idx].emoji}</div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                {PREGUNTAS[idx].pregunta.replace(
                  "tu peludo",
                  nombreMascota ? nombreMascota : "tu peludo"
                )}
              </h2>
            </div>

            {/* Opciones */}
            <div className="grid gap-3">
              {PREGUNTAS[idx].opciones.map((op, i) => (
                <button
                  key={i}
                  onClick={() => responder(op)}
                  className="flex items-center gap-3 text-left p-4 rounded-2xl border-2 border-input bg-background hover:border-primary hover:bg-primary/5 hover:scale-[1.01] transition-all"
                >
                  <span className="text-2xl flex-shrink-0">{op.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{op.texto}</span>
                </button>
              ))}
            </div>

            {idx > 0 && (
              <button
                onClick={() => {
                  setIdx(idx - 1);
                  setRespuestas(respuestas.slice(0, -1));
                }}
                className="mt-4 text-xs text-muted-foreground hover:text-primary"
              >
                ← Pregunta anterior
              </button>
            )}
          </div>
        )}


        {/* RESULTADO */}
        {paso === "resultado" && resultado && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* Perfil */}
            <div
              className={`rounded-3xl shadow-xl p-6 sm:p-8 text-center text-white bg-gradient-to-br ${resultado.perfil.color}`}
            >
              <div className="text-6xl mb-3">{resultado.perfil.emoji}</div>
              <p className="text-sm opacity-90 uppercase tracking-wide font-semibold">
                {nombreMascota ? `${nombreMascota} es...` : "Tu peludo es..."}
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">{resultado.perfil.titulo}</h2>
              <p className="text-sm sm:text-base opacity-95 leading-relaxed">
                {resultado.perfil.descripcion}
              </p>
            </div>

            {/* Score */}
            <div className="bg-card rounded-3xl shadow-xl border-2 border-primary/20 p-6">
              <h3 className="text-base font-bold text-foreground mb-3 text-center">
                Puntaje de comportamiento
              </h3>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="text-5xl font-bold text-primary">{resultado.score}</div>
                <div className="text-sm text-muted-foreground">/ 100</div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden mb-5">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
                  style={{ width: `${resultado.score}%` }}
                />
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "⚡ Energía", val: resultado.totales.energia, max: PREGUNTAS.length * 3 },
                  { label: "🤝 Sociabilidad", val: resultado.totales.sociable, max: PREGUNTAS.length * 3 },
                  { label: "🎓 Obediencia", val: resultado.totales.obediencia, max: PREGUNTAS.length * 3 },
                  { label: "💭 Ansiedad", val: resultado.totales.ansiedad, max: PREGUNTAS.length * 3 },
                ].map((m) => (
                  <div key={m.label} className="bg-muted/40 rounded-xl p-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{m.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round((m.val / m.max) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(m.val / m.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendación + CTA */}
            <div className="bg-card rounded-3xl shadow-xl border-2 border-primary/20 p-6">
              <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-4">
                <p className="text-xs font-semibold text-primary mb-1">
                  💡 Recomendación para {nombreMascota || "tu peludo"}
                </p>
                <p className="text-sm text-foreground">{resultado.perfil.recomendacion}</p>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-dashed border-primary rounded-2xl p-4 mb-4 text-center">
                <p className="text-xs font-bold text-primary uppercase mb-1">🎉 Cupón desbloqueado</p>
                <p className="text-2xl font-bold text-foreground">10% OFF</p>
                <p className="text-xs text-muted-foreground">en la primera noche de hospedaje</p>
              </div>

              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                  `¡Hola! Hice el test de comportamiento de ${
                    nombreMascota || "mi peludo"
                  } y me salió: ${resultado.perfil.titulo}. Quiero reservar con mi 10% OFF 🐾`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-center shadow-lg hover:scale-[1.02] transition-transform mb-2"
              >
                Reservar por WhatsApp 💬
              </a>

              <button
                onClick={compartir}
                className="w-full py-3 rounded-2xl border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors mb-2"
              >
                Compartir test 📲
              </button>

              <button
                onClick={reiniciar}
                className="w-full py-2 text-xs text-muted-foreground hover:text-primary"
              >
                Hacer test de otro peludo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

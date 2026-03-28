import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-2.webp";
import ballpitImg from "@/assets/ballpit-2.webp";

const SCROLL_THRESHOLD = 0.3; // 30% of page
const FALLBACK_DELAY_MS = 12000; // 12 seconds
const STORAGE_KEY = "mayte_lead_popup_ts";
const SUPPRESS_DAYS = 7;

function isPopupSuppressed(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return false;
  const ts = parseInt(stored, 10);
  if (isNaN(ts)) return false;
  const daysSince = (Date.now() - ts) / (1000 * 60 * 60 * 24);
  return daysSince < SUPPRESS_DAYS;
}

function markPopupShown() {
  localStorage.setItem(STORAGE_KEY, Date.now().toString());
}

const LeadPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [acceptsMarketing, setAcceptsMarketing] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPopupSuppressed()) return;

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      setIsOpen(true);
      markPopupShown();
      window.removeEventListener("scroll", onScroll);
      clearTimeout(fallbackTimer);
    };

    const onScroll = () => {
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrolled >= SCROLL_THRESHOLD) show();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    const fallbackTimer = setTimeout(show, FALLBACK_DELAY_MS);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Por favor ingresa un correo válido");
      return;
    }

    setIsLoading(true);
    try {
      const { error: dbError } = await supabase
        .from("leads")
        .insert({ email: email.trim(), nombre: nombre.trim() || null, origen: "popup_descuento" });

      if (dbError) throw dbError;

      // Fire Meta Pixel Lead event
      if (typeof (window as any).fbq === "function") {
        (window as any).fbq("track", "Lead");
      }

      setIsSubmitted(true);

      // Sync to Shopify (fire and forget)
      supabase.functions.invoke("notify-lead", {
        body: { nombre: nombre.trim(), email: email.trim(), accepts_marketing: acceptsMarketing, origen: "popup_descuento" },
      }).catch(console.error);
    } catch {
      setError("Hubo un error. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden border-2 border-primary/30">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 z-10 rounded-full bg-background/80 p-1.5 text-foreground/70 hover:text-foreground transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        {!isSubmitted ? (
          <>
            {/* Hero image */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={heroImg}
                alt="Peludos felices en Mayte Pet Hotel"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  🎉 10% DE DESCUENTO
                </span>
              </div>
            </div>

            {/* Form */}
            <div className="p-5 pt-3">
              <h3 className="text-lg font-bold text-foreground mb-1">
                ¡Te invitamos a conocer nuestro hotel! 🐾
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Déjanos tu correo y obtén un <strong className="text-primary">10% de descuento</strong> en el primer hospedaje. Trae tu peludo hermoso a conocer este hotel que lo atienden como en casa.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Tu nombre y apellido (opcional)"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="email"
                  placeholder="Tu correo electrónico *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptsMarketing}
                    onChange={(e) => setAcceptsMarketing(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-primary text-primary accent-primary"
                  />
                  <span className="text-xs text-muted-foreground leading-tight">
                    🐾 Quiero recibir promociones, tips y cuidados para mi peludo
                  </span>
                </label>
                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? "Enviando..." : "¡Quiero mi descuento! 🐶"}
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            {/* Success state */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={ballpitImg}
                alt="Peludos disfrutando en Mayte Pet Hotel"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>

            <div className="p-5 pt-2 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                ¡Gracias por registrarte!
              </h3>
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-primary mb-1">
                  Tu descuento: 10% OFF
                </p>
                <p className="text-xs text-muted-foreground">
                  📸 <strong>Guarda este pantallazo</strong> para que al asistir a la primera noche puedas reclamar tu descuento.
                </p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Te esperamos con los brazos abiertos 🐾
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                ¡Listo!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeadPopup;

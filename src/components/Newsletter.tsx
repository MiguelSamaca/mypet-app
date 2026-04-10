import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [acceptsMarketing, setAcceptsMarketing] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Por favor ingresa un correo válido");
      return;
    }

    if (!acceptsMarketing) {
      setError("Debes aceptar recibir novedades para suscribirte");
      return;
    }

    setIsLoading(true);
    try {
      const { error: dbError } = await supabase
        .from("leads")
        .insert({ email: email.trim(), nombre: nombre.trim() || null, origen: "newsletter_tarifas" });

      if (dbError) throw dbError;

      if (typeof (window as any).fbq === "function") {
        (window as any).fbq("track", "CompleteRegistration", {
          content_name: "newsletter_tarifas",
        });
      }

      setIsSubmitted(true);

      supabase.functions.invoke("notify-lead", {
        body: { nombre: nombre.trim(), email: email.trim(), accepts_marketing: true, origen: "newsletter_tarifas" },
      }).catch(console.error);
    } catch {
      setError("Hubo un error. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-card py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            📬 Mantente al día con tu peludo
          </h2>
          <p className="text-muted-foreground mb-8">
            Recibe noticias, promociones exclusivas y tips de cuidado para tu mascota directamente en tu correo.
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-3 text-left">
              <input
                type="text"
                placeholder="Tu nombre y apellido (opcional)"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="email"
                placeholder="Tu correo electrónico *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptsMarketing}
                  onChange={(e) => setAcceptsMarketing(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-primary text-primary accent-primary"
                />
                <span className="text-xs text-muted-foreground leading-tight">
                  🐾 Acepto recibir promociones, novedades y cuidados para mi peludo
                </span>
              </label>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="text-center pt-1">
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-semibold shadow-lg"
                >
                  {isLoading ? "Enviando..." : "¡Suscribirme! 🐶"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-lg font-bold text-foreground mb-1">¡Gracias por suscribirte!</h3>
              <p className="text-sm text-muted-foreground">
                Te enviaremos las mejores promociones y tips para tu peludo 🐾
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Newsletter;

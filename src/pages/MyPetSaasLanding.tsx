import { useEffect, useState } from "react";
import Seo from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, PawPrint, ShieldCheck, Sparkles, Building2, Users, BarChart3, X, Quote } from "lucide-react";
import heroDogs from "@/assets/mypet-hero-dogs.jpg";
import caseMayte from "@/assets/mypet-case-mayte.jpg";

// MyPet SaaS landing — palette LOCKED, independent of any tenant theme.
const C = {
  bg: "#FFFFFF",
  ink: "#0B1F17",
  emeraldDeep: "#064E3B",
  emerald: "#10B981",
  mint: "#A7F3D0",
  mintSoft: "#ECFDF5",
  border: "#D1FAE5",
  muted: "#4B5563",
  inputBorder: "#D1D5DB",
};

// Neutral paw favicon (data URI) — replaces Mayte pink favicon on the SaaS host.
const PAW_FAVICON =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#10B981"/><g fill="#fff"><circle cx="20" cy="24" r="6"/><circle cx="32" cy="18" r="6"/><circle cx="44" cy="24" r="6"/><circle cx="50" cy="36" r="5"/><path d="M32 30c-9 0-16 7-16 14 0 5 4 8 9 8 3 0 5-2 7-2s4 2 7 2c5 0 9-3 9-8 0-7-7-14-16-14z"/></g></svg>`
  );

const Feature = ({ icon: Icon, title, body }: { icon: any; title: string; body: string }) => (
  <div className="rounded-2xl p-6 border" style={{ background: C.bg, borderColor: C.border }}>
    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: C.mintSoft, color: C.emeraldDeep }}>
      <Icon className="w-5 h-5" />
    </div>
    <h3 className="text-lg font-semibold mb-1" style={{ color: C.ink }}>{title}</h3>
    <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{body}</p>
  </div>
);

const DemoModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", guarderia: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.nombre.trim()) {
      toast.error("Nombre y email son obligatorios");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      nombre: `${form.nombre}${form.guarderia ? ` (${form.guarderia})` : ""}`,
      email: form.email.trim(),
      telefono: form.telefono.trim() || null,
      origen: "mypet_demo",
    });
    setLoading(false);
    if (error) {
      toast.error("No se pudo enviar. Intenta de nuevo.");
      return;
    }
    setDone(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(11,31,23,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 md:p-8 relative"
        style={{ background: C.bg }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 transition-colors hover:bg-black/5"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" style={{ color: C.muted }} />
        </button>

        {done ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: C.mintSoft }}>
              <CheckCircle2 className="w-7 h-7" style={{ color: C.emerald }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: C.ink }}>¡Solicitud recibida!</h3>
            <p className="text-sm" style={{ color: C.muted }}>
              Te contactaremos en menos de 24 horas para coordinar tu demo.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-xl md:text-2xl font-bold mb-1" style={{ color: C.ink }}>Solicita tu demo</h3>
            <p className="text-sm mb-5" style={{ color: C.muted }}>
              Cuéntanos de tu guardería y te mostramos MyPet en 20 minutos.
            </p>
            <form onSubmit={submit} className="space-y-3">
              {[
                { k: "nombre", label: "Nombre", type: "text", required: true },
                { k: "email", label: "Email", type: "email", required: true },
                { k: "telefono", label: "Teléfono / WhatsApp", type: "tel", required: false },
                { k: "guarderia", label: "Nombre de tu guardería", type: "text", required: false },
              ].map((f) => (
                <div key={f.k}>
                  <label className="block text-sm font-medium mb-1" style={{ color: C.ink }}>
                    {f.label} {f.required && <span style={{ color: C.emerald }}>*</span>}
                  </label>
                  <input
                    type={f.type}
                    required={f.required}
                    value={(form as any)[f.k]}
                    onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border outline-none transition"
                    style={{ borderColor: C.inputBorder, background: C.bg, color: C.ink }}
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 mt-2"
                style={{ background: C.emeraldDeep, color: C.bg }}
              >
                {loading ? "Enviando..." : "Enviar solicitud"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const MyPetSaasLanding = () => {
  const [demoOpen, setDemoOpen] = useState(false);

  // Swap favicon and document title on the SaaS host so the Mayte pink icon doesn't leak.
  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']"));
    const previous = links.map((l) => ({ el: l, href: l.href }));
    links.forEach((l) => {
      l.href = PAW_FAVICON;
      l.type = "image/svg+xml";
    });
    if (links.length === 0) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.href = PAW_FAVICON;
      document.head.appendChild(link);
    }
    return () => {
      previous.forEach(({ el, href }) => {
        el.href = href;
        el.type = "image/png";
      });
    };
  }, []);

  return (
    <main style={{ background: C.bg, color: C.ink, fontFamily: "Montserrat, system-ui, sans-serif" }}>
      <Seo
        title="MyPet — Software de gestión para guarderías y hoteles caninos"
        description="Administra peludos, reservas, finanzas e inventario en un solo lugar. MyPet es la plataforma multi-tenant para guarderías que quieren crecer."
        path="/"
        noindex
      />

      {/* Nav */}
      <header className="border-b sticky top-0 z-30" style={{ borderColor: C.border, background: C.bg }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.emerald }}>
              <PawPrint className="w-5 h-5" style={{ color: C.bg }} />
            </div>
            <span className="font-bold text-lg tracking-tight">MyPet</span>
          </div>
          <button
            onClick={() => setDemoOpen(true)}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ background: C.emeraldDeep, color: C.bg }}
          >
            Solicitar demo
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${C.mintSoft} 0%, ${C.bg} 100%)` }}>
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
              style={{ background: C.bg, color: C.emeraldDeep, border: `1px solid ${C.border}` }}
            >
              <Sparkles className="w-3.5 h-3.5" /> Plataforma multi-guardería
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5" style={{ color: C.ink }}>
              El sistema operativo de tu <span style={{ color: C.emerald }}>guardería canina</span>
            </h1>
            <p className="text-base md:text-lg mb-8" style={{ color: C.muted }}>
              Fichas de peludos, reservas, finanzas, inventario y CRM — todo conectado en una sola
              plataforma pensada para hoteles y guarderías de mascotas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setDemoOpen(true)}
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: C.emerald, color: C.bg }}
              >
                Solicitar demo
              </button>
              <a
                href="/admin"
                className="px-6 py-3 rounded-xl font-semibold text-sm border text-center"
                style={{ borderColor: C.emeraldDeep, color: C.emeraldDeep, background: C.bg }}
              >
                Ya soy cliente
              </a>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroDogs}
              alt="Guardería canina moderna con peludos felices"
              width={1280}
              height={896}
              className="rounded-2xl shadow-xl w-full h-auto object-cover"
              style={{ border: `1px solid ${C.border}` }}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20" style={{ background: C.bg }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: C.ink }}>
              Una plataforma, toda tu operación
            </h2>
            <p style={{ color: C.muted }}>
              Cada guardería con su propio branding, sus módulos activos y sus datos completamente aislados.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <Feature icon={PawPrint} title="Fichas de peludos" body="Historial, fotos, vacunas y comportamiento de cada huésped en un perfil compartible." />
            <Feature icon={Building2} title="Multi-tenant" body="Cada guardería opera en su propio espacio con colores, logo y servicios diferenciados." />
            <Feature icon={BarChart3} title="Finanzas en vivo" body="Movimientos, categorías y reportes para ver la salud del negocio sin hojas de cálculo." />
            <Feature icon={Users} title="CRM y leads" body="Captura de prospectos integrada y seguimiento del ciclo de cliente." />
            <Feature icon={ShieldCheck} title="Roles y permisos" body="Admin, colaborador y superadmin. Cada quien ve lo que le corresponde." />
            <Feature icon={CheckCircle2} title="Inventario y boutique" body="Stock, proveedores y ventas de productos sin salir de la plataforma." />
          </div>
        </div>
      </section>

      {/* Case study — Mayte Pet Hotel */}
      <section className="py-20" style={{ background: C.mintSoft }}>
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <img
            src={caseMayte}
            alt="Mayte, fundadora de Mayte Pet Hotel"
            width={1024}
            height={1024}
            loading="lazy"
            className="rounded-2xl shadow-lg w-full h-auto object-cover"
            style={{ border: `1px solid ${C.border}` }}
          />
          <div>
            <span
              className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
              style={{ background: C.bg, color: C.emeraldDeep, border: `1px solid ${C.border}` }}
            >
              Caso de éxito
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: C.ink }}>
              Mayte Pet Hotel — Bogotá
            </h2>
            <Quote className="w-8 h-8 mb-2" style={{ color: C.emerald }} />
            <p className="text-lg leading-relaxed mb-6" style={{ color: C.ink }}>
              "Pasamos de cuadernos y hojas de cálculo a tener la operación completa en un solo lugar.
              Hoy sabemos en tiempo real cuántos peludos hay, qué entró por boutique y cómo va el mes —
              todo sin perder el trato cercano que nos caracteriza."
            </p>
            <div className="mb-6">
              <p className="font-semibold" style={{ color: C.ink }}>Mayte</p>
              <p className="text-sm" style={{ color: C.muted }}>Fundadora · Mayte Pet Hotel</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { n: "+150", l: "peludos en ficha" },
                { n: "100%", l: "finanzas digitales" },
                { n: "24/7", l: "acceso al panel" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl p-3 text-center" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                  <p className="text-2xl font-bold" style={{ color: C.emeraldDeep }}>{s.n}</p>
                  <p className="text-xs" style={{ color: C.muted }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: C.bg }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: C.ink }}>
            ¿Listo para profesionalizar tu guardería?
          </h2>
          <p className="mb-8" style={{ color: C.muted }}>
            Agenda una demo de 20 minutos y te mostramos cómo MyPet se adapta a tu operación.
          </p>
          <button
            onClick={() => setDemoOpen(true)}
            className="inline-block px-8 py-3.5 rounded-xl font-semibold transition-opacity hover:opacity-90"
            style={{ background: C.emeraldDeep, color: C.bg }}
          >
            Solicitar demo
          </button>
        </div>
      </section>

      <footer className="py-8 border-t text-center text-sm" style={{ borderColor: C.border, color: C.muted }}>
        © {new Date().getFullYear()} MyPet · Software para guarderías caninas
      </footer>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </main>
  );
};

export default MyPetSaasLanding;

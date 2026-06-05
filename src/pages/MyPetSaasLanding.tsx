import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PawPrint, ShieldCheck, Sparkles, Building2, Users, BarChart3 } from "lucide-react";

// MyPet SaaS landing — palette LOCKED, independent of Mayte tenant theme.
// Colors are inline so the Mayte design tokens never bleed in.
const C = {
  bg: "#FFFFFF",
  ink: "#0B1F17",
  emeraldDeep: "#064E3B",
  emerald: "#10B981",
  mint: "#A7F3D0",
  mintSoft: "#ECFDF5",
  border: "#D1FAE5",
  muted: "#4B5563",
};

const Feature = ({ icon: Icon, title, body }: { icon: any; title: string; body: string }) => (
  <div
    className="rounded-2xl p-6 border"
    style={{ background: C.bg, borderColor: C.border }}
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
      style={{ background: C.mintSoft, color: C.emeraldDeep }}
    >
      <Icon className="w-5 h-5" />
    </div>
    <h3 className="text-lg font-semibold mb-1" style={{ color: C.ink }}>{title}</h3>
    <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{body}</p>
  </div>
);

const MyPetSaasLanding = () => {
  return (
    <main style={{ background: C.bg, color: C.ink, fontFamily: "Montserrat, system-ui, sans-serif" }}>
      <Seo
        title="MyPet — Software de gestión para guarderías y hoteles caninos"
        description="Administra peludos, reservas, finanzas e inventario en un solo lugar. MyPet es la plataforma multi-tenant para guarderías que quieren crecer."
        path="/"
        noindex
      />

      {/* Nav */}
      <header className="border-b" style={{ borderColor: C.border, background: C.bg }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: C.emerald }}
            >
              <PawPrint className="w-5 h-5" style={{ color: C.bg }} />
            </div>
            <span className="font-bold text-lg tracking-tight">MyPet</span>
          </div>
          <a
            href="/admin"
            className="text-sm font-medium px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: C.emeraldDeep, color: C.bg }}
          >
            Iniciar sesión
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${C.mintSoft} 0%, ${C.bg} 100%)` }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
            style={{ background: C.bg, color: C.emeraldDeep, border: `1px solid ${C.border}` }}
          >
            <Sparkles className="w-3.5 h-3.5" /> Plataforma multi-guardería
          </span>
          <h1
            className="text-4xl md:text-6xl font-bold tracking-tight mb-5 max-w-3xl mx-auto"
            style={{ color: C.ink }}
          >
            El sistema operativo de tu <span style={{ color: C.emerald }}>guardería canina</span>
          </h1>
          <p className="text-base md:text-lg max-w-2xl mx-auto mb-8" style={{ color: C.muted }}>
            Fichas de peludos, reservas, finanzas, inventario y CRM — todo conectado en una sola
            plataforma pensada para hoteles y guarderías de mascotas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/573154148380?text=Hola%2C%20quiero%20conocer%20MyPet%20para%20mi%20guarder%C3%ADa"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: C.emerald, color: C.bg }}
            >
              Solicitar demo
            </a>
            <a
              href="/admin"
              className="px-6 py-3 rounded-xl font-semibold text-sm border transition-colors"
              style={{ borderColor: C.emeraldDeep, color: C.emeraldDeep, background: C.bg }}
            >
              Ya soy cliente
            </a>
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

      {/* CTA */}
      <section className="py-20" style={{ background: C.mintSoft }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: C.ink }}>
            ¿Listo para profesionalizar tu guardería?
          </h2>
          <p className="mb-8" style={{ color: C.muted }}>
            Agenda una demo de 20 minutos y te mostramos cómo MyPet se adapta a tu operación.
          </p>
          <a
            href="https://wa.me/573154148380?text=Hola%2C%20quiero%20una%20demo%20de%20MyPet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3.5 rounded-xl font-semibold transition-opacity hover:opacity-90"
            style={{ background: C.emeraldDeep, color: C.bg }}
          >
            Hablar por WhatsApp
          </a>
        </div>
      </section>

      <footer className="py-8 border-t text-center text-sm" style={{ borderColor: C.border, color: C.muted }}>
        © {new Date().getFullYear()} MyPet · Software para guarderías caninas
      </footer>
    </main>
  );
};

export default MyPetSaasLanding;

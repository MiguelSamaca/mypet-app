import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PawPrint, Wallet, LogOut, ShoppingBag, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";

type Tile = {
  to: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  available: boolean;
};

const tiles: Tile[] = [
  {
    to: "/admin/peludos",
    title: "Peludos",
    desc: "Fichas, visitas, calificaciones y galería de cada huésped.",
    icon: PawPrint,
    accent: "from-primary/20 to-primary/5",
    available: true,
  },
  {
    to: "/admin/finanzas",
    title: "Finanzas y Contabilidad",
    desc: "Ingresos, gastos fijos y variables, tarifas y dashboard.",
    icon: Wallet,
    accent: "from-emerald-500/20 to-emerald-500/5",
    available: true,
  },
  {
    to: "/admin/boutique",
    title: "Boutique · Inventario",
    desc: "Proveedores, marcas, productos y entradas de inventario.",
    icon: ShoppingBag,
    accent: "from-amber-500/20 to-amber-500/5",
    available: true,
  },
  {
    to: "/recordatorio-compras",
    title: "Recordatorio de Compras",
    desc: "Registro y seguimiento de compras de clientes.",
    icon: ShoppingBag,
    accent: "from-rose-500/20 to-rose-500/5",
    available: true,
  },
  {
    to: "#",
    title: "Próximamente",
    desc: "Más módulos en camino: reservas, reportes.",
    icon: Sparkles,
    accent: "from-purple-500/20 to-purple-500/5",
    available: false,
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/admin");
        return;
      }
      setEmail(session.user.email || "");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/admin");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Panel de Administración</h1>
            <p className="text-xs text-muted-foreground">Mayte Pet Hotel · {email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Salir
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">¡Hola! ¿Qué quieres hacer hoy?</h2>
          <p className="text-muted-foreground">Elige una sección para empezar.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {tiles.map((t) => {
            const Icon = t.icon;
            const inner = (
              <Card
                className={`group relative overflow-hidden p-6 md:p-8 h-full transition-all border-2 ${
                  t.available
                    ? "hover:border-primary hover:shadow-lg cursor-pointer"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${t.accent} opacity-50 group-hover:opacity-80 transition-opacity`}
                />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-background/80 backdrop-blur flex items-center justify-center mb-4 shadow-sm">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-1">{t.title}</h3>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </div>
              </Card>
            );
            return t.available ? (
              <Link key={t.title} to={t.to}>
                {inner}
              </Link>
            ) : (
              <div key={t.title}>{inner}</div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

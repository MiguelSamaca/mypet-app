import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PawPrint } from "lucide-react";
import Seo from "@/components/Seo";

// Neutral MyPet SaaS palette — locked, independent of any tenant theme.
const C = {
  bg: "#FFFFFF",
  ink: "#0B1F17",
  emeraldDeep: "#064E3B",
  emerald: "#10B981",
  border: "#D1FAE5",
  mintSoft: "#ECFDF5",
  muted: "#4B5563",
  inputBorder: "#D1D5DB",
};

const AdminAuth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/admin/dashboard");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/admin/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Sesión iniciada");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: `linear-gradient(180deg, ${C.mintSoft} 0%, ${C.bg} 100%)`, fontFamily: "Montserrat, system-ui, sans-serif" }}
    >
      <Seo title="Acceso · MyPet" description="Panel privado MyPet. Acceso solo para personal autorizado de la guardería." path="/admin" noindex />
      <div
        className="w-full max-w-md p-8 rounded-2xl border shadow-sm"
        style={{ background: C.bg, borderColor: C.border }}
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.emerald }}>
            <PawPrint className="w-5 h-5" style={{ color: C.bg }} />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: C.ink }}>MyPet</span>
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: C.ink }}>Iniciar sesión</h1>
        <p className="text-sm mb-6" style={{ color: C.muted }}>
          Acceso para personal autorizado de tu guardería.
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: C.ink }}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border outline-none focus:ring-2 transition"
              style={{ borderColor: C.inputBorder, background: C.bg, color: C.ink }}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: C.ink }}>Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border outline-none focus:ring-2 transition"
              style={{ borderColor: C.inputBorder, background: C.bg, color: C.ink }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: C.emeraldDeep, color: C.bg }}
          >
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>
        <p className="text-xs mt-6 text-center" style={{ color: C.muted }}>
          ¿No tienes cuenta? Pide a un administrador que te invite.
        </p>
      </div>
    </div>
  );
};

export default AdminAuth;

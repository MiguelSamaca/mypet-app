import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Building2, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Seo from "@/components/Seo";

type Tenant = {
  id: string;
  nombre: string;
  slug: string | null;
  email_contacto: string | null;
  plan: string;
  estado: string;
  max_usuarios: number;
  logo_url: string | null;
  color_primario: string | null;
  fecha_creacion: string;
};

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);

type TenantModule = {
  id: string;
  tenant_id: string;
  modulo: string;
  activo: boolean;
};

const MODULES = ["finanzas", "inventario", "roles", "fichas", "crm"] as const;
const PLANS = ["basico", "profesional", "enterprise"] as const;
const ESTADOS = ["activo", "inactivo", "suspendido"] as const;

const AdminSuperadmin = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isSuper, setIsSuper] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [modules, setModules] = useState<TenantModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [openNew, setOpenNew] = useState(false);

  // form
  const [fNombre, setFNombre] = useState("");
  const [fSlug, setFSlug] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fPlan, setFPlan] = useState<string>("basico");
  const [fEstado, setFEstado] = useState<string>("activo");
  const [fMax, setFMax] = useState(5);
  const [fColor, setFColor] = useState("#D946EF");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin");
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "superadmin")
        .maybeSingle();
      if (error) console.error(error);
      const ok = !!data;
      setIsSuper(ok);
      setChecking(false);
      if (ok) loadAll();
    })();
  }, [navigate]);

  const loadAll = async () => {
    setLoading(true);
    const [t, m] = await Promise.all([
      supabase.from("tenants").select("*").order("fecha_creacion", { ascending: false }),
      supabase.from("tenant_modules").select("*"),
    ]);
    if (t.error) toast.error("Error cargando guarderías: " + t.error.message);
    else setTenants((t.data as Tenant[]) || []);
    if (m.error) toast.error("Error cargando módulos: " + m.error.message);
    else setModules((m.data as TenantModule[]) || []);
    setLoading(false);
  };

  const createTenant = async () => {
    if (!fNombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    const slug = (fSlug.trim() || slugify(fNombre));
    if (!slug) {
      toast.error("Slug inválido");
      return;
    }
    const { data, error } = await supabase
      .from("tenants")
      .insert({
        nombre: fNombre.trim(),
        slug,
        email_contacto: fEmail.trim() || null,
        plan: fPlan,
        estado: fEstado,
        max_usuarios: fMax,
        color_primario: fColor,
      })
      .select()
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    const rows = MODULES.map((modulo) => ({
      tenant_id: data.id,
      modulo,
      activo: true,
    }));
    const { error: mErr } = await supabase.from("tenant_modules").insert(rows);
    if (mErr) toast.error("Tenant creado pero falló crear módulos: " + mErr.message);
    toast.success("Guardería creada");
    setOpenNew(false);
    setFNombre(""); setFSlug(""); setFEmail(""); setFPlan("basico"); setFEstado("activo"); setFMax(5); setFColor("#D946EF");
    loadAll();
  };

  const updateTenantField = async (id: string, field: keyof Tenant, value: any) => {
    const patch = { [field]: value } as Partial<Tenant>;
    const { error } = await supabase.from("tenants").update(patch as any).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const toggleModule = async (tenantId: string, modulo: string, activo: boolean) => {
    const existing = modules.find((m) => m.tenant_id === tenantId && m.modulo === modulo);
    if (existing) {
      const { error } = await supabase
        .from("tenant_modules")
        .update({ activo })
        .eq("id", existing.id);
      if (error) return toast.error(error.message);
      setModules((prev) => prev.map((m) => (m.id === existing.id ? { ...m, activo } : m)));
    } else {
      const { data, error } = await supabase
        .from("tenant_modules")
        .insert({ tenant_id: tenantId, modulo, activo })
        .select()
        .single();
      if (error) return toast.error(error.message);
      setModules((prev) => [...prev, data as TenantModule]);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isSuper) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <ShieldAlert className="h-10 w-10 mx-auto text-destructive mb-3" />
          <h1 className="text-xl font-bold mb-2">Acceso restringido</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Solo el superadministrador puede entrar a este módulo.
          </p>
          <Button onClick={() => navigate("/admin/dashboard")}>Volver al panel</Button>
        </Card>
      </div>
    );
  }

  // Scope MyPet SaaS emerald palette ONLY to the Superadmin view by overriding
  // the design tokens on a wrapper. Other admin pages keep Mayte's pink theme.
  const mypetTheme = {
    "--background": "0 0% 100%",
    "--foreground": "158 64% 8%",
    "--card": "0 0% 100%",
    "--card-foreground": "158 64% 8%",
    "--popover": "0 0% 100%",
    "--popover-foreground": "158 64% 8%",
    "--primary": "160 84% 16%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "152 76% 95%",
    "--secondary-foreground": "160 84% 16%",
    "--muted": "152 76% 95%",
    "--muted-foreground": "215 14% 34%",
    "--accent": "160 84% 39%",
    "--accent-foreground": "0 0% 100%",
    "--destructive": "0 84% 60%",
    "--destructive-foreground": "0 0% 100%",
    "--border": "149 80% 90%",
    "--input": "149 80% 90%",
    "--ring": "160 84% 39%",
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30" style={mypetTheme}>
      <Seo title="Superadmin · MyPet" description="Administración multi-tenant MyPet" path="/superadmin" noindex />
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/dashboard")}>
              <ArrowLeft className="h-4 w-4" /> Panel
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Superadmin</h1>
              <p className="text-xs text-muted-foreground">Gestión multi-tenant de guarderías</p>
            </div>
          </div>
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4" /> Nueva guardería</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nueva guardería</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Nombre *</Label>
                  <Input value={fNombre} onChange={(e) => { setFNombre(e.target.value); if (!fSlug) setFSlug(slugify(e.target.value)); }} />
                </div>
                <div>
                  <Label>Slug (URL) *</Label>
                  <Input value={fSlug} onChange={(e) => setFSlug(slugify(e.target.value))} placeholder="huellitas" />
                  <p className="text-xs text-muted-foreground mt-1">URL pruebas: mypet-app.lovable.app/t/<b>{fSlug || "slug"}</b> · Futuro: <b>{fSlug || "slug"}</b>.mypet.com</p>
                </div>
                <div>
                  <Label>Email de contacto</Label>
                  <Input type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Plan</Label>
                    <Select value={fPlan} onValueChange={setFPlan}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PLANS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Select value={fEstado} onValueChange={setFEstado}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Máx. usuarios</Label>
                    <Input type="number" min={1} value={fMax} onChange={(e) => setFMax(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Color primario</Label>
                    <Input type="color" value={fColor} onChange={(e) => setFColor(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenNew(false)}>Cancelar</Button>
                <Button onClick={createTenant}>Crear</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Cargando…</p>}
        {!loading && tenants.length === 0 && (
          <Card className="p-8 text-center">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No hay guarderías. Crea la primera.</p>
          </Card>
        )}
        {tenants.map((t) => (
          <Card key={t.id} className="p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: t.color_primario || "#ccc" }} />
                  <h3 className="text-lg font-bold">{t.nombre}</h3>
                  <Badge variant={t.estado === "activo" ? "default" : t.estado === "suspendido" ? "destructive" : "secondary"}>
                    {t.estado}
                  </Badge>
                  <Badge variant="outline">{t.plan}</Badge>
                </div>
                {t.slug && (
                  <p className="text-xs font-mono text-primary">
                    /t/{t.slug} · {t.slug}.mypet.com
                  </p>
                )}
                {t.email_contacto && (
                  <p className="text-sm text-muted-foreground">{t.email_contacto}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Creada {new Date(t.fecha_creacion).toLocaleDateString()} · Máx {t.max_usuarios} usuarios
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Select value={t.plan} onValueChange={(v) => updateTenantField(t.id, "plan", v)}>
                    <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLANS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={t.estado} onValueChange={(v) => updateTenantField(t.id, "estado", v)}>
                    <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="md:w-72 space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Módulos</p>
                <div className="space-y-1.5">
                  {MODULES.map((mod) => {
                    const m = modules.find((x) => x.tenant_id === t.id && x.modulo === mod);
                    const activo = m ? m.activo : false;
                    return (
                      <div key={mod} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{mod}</span>
                        <Switch
                          checked={activo}
                          onCheckedChange={(v) => toggleModule(t.id, mod, v)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </main>
    </div>
  );
};

export default AdminSuperadmin;

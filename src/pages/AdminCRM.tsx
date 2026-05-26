import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Pencil, Trash2, Search, LogOut, RefreshCw, Users, Truck } from "lucide-react";
import { toast } from "sonner";
import Seo from "@/components/Seo";

interface Cliente {
  id: string; nombre: string; telefono: string | null; email: string | null;
  ciudad: string | null; notas: string | null;
}
interface Proveedor {
  id: string; nombre: string; contacto: string | null; telefono: string | null;
  email: string | null; notas: string | null;
}

const AdminCRM = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [q, setQ] = useState("");
  const [syncing, setSyncing] = useState(false);

  // cliente form
  const [openCli, setOpenCli] = useState(false);
  const [editCli, setEditCli] = useState<Cliente | null>(null);
  const [cNombre, setCNombre] = useState("");
  const [cTel, setCTel] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cCiudad, setCCiudad] = useState("");
  const [cNotas, setCNotas] = useState("");

  // proveedor form
  const [openProv, setOpenProv] = useState(false);
  const [editProv, setEditProv] = useState<Proveedor | null>(null);
  const [pNombre, setPNombre] = useState("");
  const [pContacto, setPContacto] = useState("");
  const [pTel, setPTel] = useState("");
  const [pEmail, setPEmail] = useState("");
  const [pNotas, setPNotas] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/admin"); return; }
      setAuthChecked(true);
    });
  }, [navigate]);

  useEffect(() => { if (authChecked) load(); }, [authChecked]);

  const load = async () => {
    const [cl, pv] = await Promise.all([
      supabase.from("clientes_boutique").select("*").eq("activo", true).order("nombre"),
      supabase.from("proveedores").select("*").eq("activo", true).order("nombre"),
    ]);
    if (cl.data) setClientes(cl.data as Cliente[]);
    if (pv.data) setProveedores(pv.data as Proveedor[]);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/admin"); };

  // ===== CLIENTES =====
  const resetCli = () => { setEditCli(null); setCNombre(""); setCTel(""); setCEmail(""); setCCiudad(""); setCNotas(""); };
  const openNewCli = () => { resetCli(); setOpenCli(true); };
  const openEditCli = (c: Cliente) => {
    setEditCli(c);
    setCNombre(c.nombre); setCTel(c.telefono || ""); setCEmail(c.email || "");
    setCCiudad(c.ciudad || ""); setCNotas(c.notas || "");
    setOpenCli(true);
  };
  const submitCli = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre: cNombre.trim(),
      telefono: cTel.trim() || null,
      email: cEmail.trim() || null,
      ciudad: cCiudad.trim() || null,
      notas: cNotas.trim() || null,
    };
    if (!payload.nombre) return toast.error("El nombre es obligatorio");
    if (editCli) {
      const { error } = await supabase.from("clientes_boutique").update(payload).eq("id", editCli.id);
      if (error) return toast.error(error.message);
      toast.success("Cliente actualizado");
    } else {
      const { error } = await supabase.from("clientes_boutique").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Cliente creado");
    }
    setOpenCli(false); resetCli(); load();
  };
  const removeCli = async (id: string) => {
    if (!confirm("¿Eliminar cliente?")) return;
    const { error } = await supabase.from("clientes_boutique").update({ activo: false }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Cliente eliminado"); load();
  };

  const sincronizarDuenos = async () => {
    setSyncing(true);
    try {
      const { data: perros, error } = await supabase
        .from("perros")
        .select("nombre, dueno_nombre, dueno_telefono, dueno_email")
        .not("dueno_nombre", "is", null);
      if (error) throw error;
      const { data: existentes } = await supabase.from("clientes_boutique").select("telefono,email").eq("activo", true);
      const setTel = new Set((existentes || []).map((x) => (x.telefono || "").trim()).filter(Boolean));
      const setEmail = new Set((existentes || []).map((x) => (x.email || "").trim().toLowerCase()).filter(Boolean));
      const nuevos: any[] = [];
      const seenTel = new Set<string>(); const seenEmail = new Set<string>();
      (perros || []).forEach((p: any) => {
        const n = (p.dueno_nombre || "").trim(); if (!n) return;
        const t = (p.dueno_telefono || "").trim();
        const e = (p.dueno_email || "").trim().toLowerCase();
        if (t && (setTel.has(t) || seenTel.has(t))) return;
        if (!t && e && (setEmail.has(e) || seenEmail.has(e))) return;
        if (t) seenTel.add(t); if (e) seenEmail.add(e);
        nuevos.push({ nombre: n, telefono: t || null, email: p.dueno_email || null, notas: `Dueño de ${p.nombre}` });
      });
      if (nuevos.length === 0) { toast.info("Todos los dueños ya están como clientes"); }
      else {
        const { error: insErr } = await supabase.from("clientes_boutique").insert(nuevos);
        if (insErr) throw insErr;
        toast.success(`${nuevos.length} cliente(s) importado(s)`); load();
      }
    } catch (err: any) { toast.error(err.message || "Error al sincronizar"); }
    finally { setSyncing(false); }
  };

  // ===== PROVEEDORES =====
  const resetProv = () => { setEditProv(null); setPNombre(""); setPContacto(""); setPTel(""); setPEmail(""); setPNotas(""); };
  const openNewProv = () => { resetProv(); setOpenProv(true); };
  const openEditProv = (p: Proveedor) => {
    setEditProv(p);
    setPNombre(p.nombre); setPContacto(p.contacto || ""); setPTel(p.telefono || "");
    setPEmail(p.email || ""); setPNotas(p.notas || "");
    setOpenProv(true);
  };
  const submitProv = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre: pNombre.trim(),
      contacto: pContacto.trim() || null,
      telefono: pTel.trim() || null,
      email: pEmail.trim() || null,
      notas: pNotas.trim() || null,
    };
    if (!payload.nombre) return toast.error("El nombre es obligatorio");
    if (editProv) {
      const { error } = await supabase.from("proveedores").update(payload).eq("id", editProv.id);
      if (error) return toast.error(error.message);
      toast.success("Proveedor actualizado");
    } else {
      const { error } = await supabase.from("proveedores").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Proveedor creado");
    }
    setOpenProv(false); resetProv(); load();
  };
  const removeProv = async (id: string) => {
    if (!confirm("¿Eliminar proveedor?")) return;
    const { error } = await supabase.from("proveedores").update({ activo: false }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Proveedor eliminado"); load();
  };

  const filtCli = useMemo(() => {
    const ql = q.trim().toLowerCase(); if (!ql) return clientes;
    return clientes.filter((c) =>
      c.nombre.toLowerCase().includes(ql) ||
      (c.telefono || "").toLowerCase().includes(ql) ||
      (c.email || "").toLowerCase().includes(ql)
    );
  }, [clientes, q]);
  const filtProv = useMemo(() => {
    const ql = q.trim().toLowerCase(); if (!ql) return proveedores;
    return proveedores.filter((p) =>
      p.nombre.toLowerCase().includes(ql) ||
      (p.telefono || "").toLowerCase().includes(ql) ||
      (p.email || "").toLowerCase().includes(ql)
    );
  }, [proveedores, q]);

  if (!authChecked) return null;

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Admin · CRM | Mayte Pet Hotel" description="Gestión interna de clientes y proveedores de Mayte Pet Hotel." path="/admin/crm" noindex />
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Panel</Button></Link>
            <h1 className="text-xl font-bold">👥 CRM</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4" /></Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
        </div>

        <Tabs defaultValue="clientes">
          <TabsList>
            <TabsTrigger value="clientes"><Users className="w-3 h-3 mr-1" /> Clientes ({filtCli.length})</TabsTrigger>
            <TabsTrigger value="proveedores"><Truck className="w-3 h-3 mr-1" /> Proveedores ({filtProv.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="clientes" className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={sincronizarDuenos} disabled={syncing}>
                <RefreshCw className={`w-3 h-3 mr-1 ${syncing ? "animate-spin" : ""}`} /> Sincronizar dueños de peludos
              </Button>
              <Button size="sm" onClick={openNewCli}><Plus className="w-3 h-3 mr-1" /> Nuevo cliente</Button>
            </div>
            <Card className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtCli.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nombre}</TableCell>
                      <TableCell className="text-xs">{c.telefono || "—"}</TableCell>
                      <TableCell className="text-xs">{c.email || "—"}</TableCell>
                      <TableCell className="text-xs">{c.ciudad || "—"}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button size="sm" variant="ghost" onClick={() => openEditCli(c)}><Pencil className="w-3 h-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => removeCli(c.id)}><Trash2 className="w-3 h-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtCli.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Sin clientes</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="proveedores" className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={openNewProv}><Plus className="w-3 h-3 mr-1" /> Nuevo proveedor</Button>
            </div>
            <Card className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtProv.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nombre}</TableCell>
                      <TableCell className="text-xs">{p.contacto || "—"}</TableCell>
                      <TableCell className="text-xs">{p.telefono || "—"}</TableCell>
                      <TableCell className="text-xs">{p.email || "—"}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button size="sm" variant="ghost" onClick={() => openEditProv(p)}><Pencil className="w-3 h-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => removeProv(p.id)}><Trash2 className="w-3 h-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtProv.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Sin proveedores</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={openCli} onOpenChange={(o) => { setOpenCli(o); if (!o) resetCli(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editCli ? "Editar cliente" : "Nuevo cliente"}</DialogTitle></DialogHeader>
          <form onSubmit={submitCli} className="space-y-3">
            <div><Label>Nombre *</Label><Input value={cNombre} onChange={(e) => setCNombre(e.target.value)} required maxLength={100} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Teléfono</Label><Input value={cTel} onChange={(e) => setCTel(e.target.value)} maxLength={30} /></div>
              <div><Label>Ciudad</Label><Input value={cCiudad} onChange={(e) => setCCiudad(e.target.value)} maxLength={80} /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} maxLength={255} /></div>
            <div><Label>Notas</Label><Textarea value={cNotas} onChange={(e) => setCNotas(e.target.value)} rows={2} maxLength={500} /></div>
            <Button type="submit" className="w-full">{editCli ? "Actualizar" : "Guardar"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openProv} onOpenChange={(o) => { setOpenProv(o); if (!o) resetProv(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editProv ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle></DialogHeader>
          <form onSubmit={submitProv} className="space-y-3">
            <div><Label>Nombre *</Label><Input value={pNombre} onChange={(e) => setPNombre(e.target.value)} required maxLength={100} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Contacto</Label><Input value={pContacto} onChange={(e) => setPContacto(e.target.value)} maxLength={100} /></div>
              <div><Label>Teléfono</Label><Input value={pTel} onChange={(e) => setPTel(e.target.value)} maxLength={30} /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={pEmail} onChange={(e) => setPEmail(e.target.value)} maxLength={255} /></div>
            <div><Label>Notas</Label><Textarea value={pNotas} onChange={(e) => setPNotas(e.target.value)} rows={2} maxLength={500} /></div>
            <Button type="submit" className="w-full">{editProv ? "Actualizar" : "Guardar"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCRM;

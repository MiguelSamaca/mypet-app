import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Users, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Cliente {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  ciudad: string | null;
  notas: string | null;
  fecha_creacion: string;
}

const ClientesBoutique = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [q, setQ] = useState("");
  const [nombre, setNombre] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [notas, setNotas] = useState("");
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("clientes_boutique").select("*").eq("activo", true).order("nombre");
    if (data) setClientes(data as Cliente[]);
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditing(null); setNombre(""); setTel(""); setEmail(""); setCiudad(""); setNotas("");
  };

  const openNew = () => { reset(); setOpen(true); };

  const openEdit = (c: Cliente) => {
    setEditing(c);
    setNombre(c.nombre); setTel(c.telefono || ""); setEmail(c.email || "");
    setCiudad(c.ciudad || ""); setNotas(c.notas || "");
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre: nombre.trim(),
      telefono: tel.trim() || null,
      email: email.trim() || null,
      ciudad: ciudad.trim() || null,
      notas: notas.trim() || null,
    };
    if (!payload.nombre) return toast.error("El nombre es obligatorio");
    if (editing) {
      const { error } = await supabase.from("clientes_boutique").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Cliente actualizado");
    } else {
      const { error } = await supabase.from("clientes_boutique").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Cliente creado");
    }
    setOpen(false); reset(); load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Desactivar este cliente?")) return;
    const { error } = await supabase.from("clientes_boutique").update({ activo: false }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Cliente eliminado");
    load();
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
      const seenTel = new Set<string>();
      const seenEmail = new Set<string>();
      (perros || []).forEach((p: any) => {
        const n = (p.dueno_nombre || "").trim();
        if (!n) return;
        const t = (p.dueno_telefono || "").trim();
        const e = (p.dueno_email || "").trim().toLowerCase();
        if (t && (setTel.has(t) || seenTel.has(t))) return;
        if (!t && e && (setEmail.has(e) || seenEmail.has(e))) return;
        if (t) seenTel.add(t);
        if (e) seenEmail.add(e);
        nuevos.push({
          nombre: n,
          telefono: t || null,
          email: p.dueno_email || null,
          notas: `Dueño de ${p.nombre}`,
        });
      });
      if (nuevos.length === 0) {
        toast.info("Todos los dueños ya están como clientes");
      } else {
        const { error: insErr } = await supabase.from("clientes_boutique").insert(nuevos);
        if (insErr) throw insErr;
        toast.success(`${nuevos.length} cliente(s) importado(s)`);
        load();
      }
    } catch (err: any) {
      toast.error(err.message || "Error al sincronizar");
    } finally {
      setSyncing(false);
    }
  };

  const filtrados = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return clientes;
    return clientes.filter((c) =>
      c.nombre.toLowerCase().includes(ql) ||
      (c.telefono || "").toLowerCase().includes(ql) ||
      (c.email || "").toLowerCase().includes(ql)
    );
  }, [clientes, q]);

  return (
    <Accordion type="single" collapsible className="space-y-3">
      <AccordionItem value="clientes" className="border rounded-lg px-4 bg-card">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3 text-left">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <div className="font-semibold">Clientes Boutique</div>
              <div className="text-xs text-muted-foreground">{clientes.length} cliente(s)</div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por nombre, tel o email..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
            </div>
            <Button size="sm" variant="outline" onClick={sincronizarDuenos} disabled={syncing}>
              <RefreshCw className={`w-3 h-3 mr-1 ${syncing ? "animate-spin" : ""}`} /> Sincronizar dueños
            </Button>
            <Button size="sm" onClick={openNew}>
              <Plus className="w-3 h-3 mr-1" /> Nuevo cliente
            </Button>
          </div>

          {filtrados.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground text-sm">Sin clientes.</Card>
          ) : (
            <div className="overflow-x-auto">
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
                  {filtrados.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nombre}</TableCell>
                      <TableCell className="text-xs">{c.telefono || "—"}</TableCell>
                      <TableCell className="text-xs">{c.email || "—"}</TableCell>
                      <TableCell className="text-xs">{c.ciudad || "—"}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Pencil className="w-3 h-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="w-3 h-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar cliente" : "Nuevo cliente"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div><Label>Nombre *</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={100} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Teléfono</Label><Input value={tel} onChange={(e) => setTel(e.target.value)} maxLength={30} /></div>
              <div><Label>Ciudad</Label><Input value={ciudad} onChange={(e) => setCiudad(e.target.value)} maxLength={80} /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} /></div>
            <div><Label>Notas</Label><Textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} maxLength={500} /></div>
            <Button type="submit" className="w-full">{editing ? "Actualizar" : "Guardar"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Accordion>
  );
};

export default ClientesBoutique;

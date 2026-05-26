import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Pencil, Trash2, Check, X, Search, LogOut } from "lucide-react";
import { toast } from "sonner";
import Seo from "@/components/Seo";

interface Proveedor { id: string; nombre: string; telefono: string | null; email: string | null; }
interface Marca { id: string; proveedor_id: string; nombre: string; }
interface Categoria { id: string; proveedor_id: string; nombre: string; }

const AdminBoutiqueMaestros = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [editProv, setEditProv] = useState<string>("");
  const [q, setQ] = useState("");
  const [filtroProv, setFiltroProv] = useState<string>("__all");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/admin"); return; }
      setAuthChecked(true);
    });
  }, [navigate]);

  useEffect(() => { if (authChecked) load(); }, [authChecked]);

  const load = async () => {
    const [p, m, c] = await Promise.all([
      supabase.from("proveedores").select("id,nombre,telefono,email").eq("activo", true).order("nombre"),
      supabase.from("marcas_boutique").select("id,proveedor_id,nombre").eq("activo", true).order("nombre"),
      supabase.from("categorias_boutique").select("id,proveedor_id,nombre").eq("activo", true).order("nombre"),
    ]);
    if (p.data) setProveedores(p.data as Proveedor[]);
    if (m.data) setMarcas(m.data as Marca[]);
    if (c.data) setCategorias(c.data as Categoria[]);
  };

  const provNombre = (id: string) => proveedores.find((p) => p.id === id)?.nombre || "—";

  const startEdit = (id: string, nombre: string, prov?: string) => {
    setEditId(id); setEditVal(nombre); setEditProv(prov || "");
  };
  const cancelEdit = () => { setEditId(null); setEditVal(""); setEditProv(""); };

  const saveProveedor = async (id: string) => {
    const v = editVal.trim();
    if (!v) return;
    const { error } = await supabase.from("proveedores").update({ nombre: v }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Proveedor actualizado"); cancelEdit(); load();
  };
  const saveMarca = async (id: string) => {
    const v = editVal.trim();
    if (!v) return;
    const payload: any = { nombre: v };
    if (editProv) payload.proveedor_id = editProv;
    const { error } = await supabase.from("marcas_boutique").update(payload).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Marca actualizada"); cancelEdit(); load();
  };
  const saveCategoria = async (id: string) => {
    const v = editVal.trim();
    if (!v) return;
    const payload: any = { nombre: v };
    if (editProv) payload.proveedor_id = editProv;
    const { error } = await supabase.from("categorias_boutique").update(payload).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Categoría actualizada"); cancelEdit(); load();
  };

  const removeProveedor = async (id: string) => {
    if (!confirm("¿Desactivar este proveedor?")) return;
    const { error } = await supabase.from("proveedores").update({ activo: false }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Proveedor eliminado"); load();
  };
  const removeMarca = async (id: string) => {
    if (!confirm("¿Eliminar esta marca?")) return;
    const { error } = await supabase.from("marcas_boutique").update({ activo: false }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Marca eliminada"); load();
  };
  const removeCategoria = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const { error } = await supabase.from("categorias_boutique").update({ activo: false }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Categoría eliminada"); load();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/admin"); };

  const filtrar = <T extends { nombre: string; proveedor_id?: string }>(arr: T[]) => {
    const ql = q.trim().toLowerCase();
    return arr.filter((x) => {
      if (ql && !x.nombre.toLowerCase().includes(ql)) return false;
      if (filtroProv !== "__all" && x.proveedor_id && x.proveedor_id !== filtroProv) return false;
      return true;
    });
  };

  const provFiltrados = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return proveedores.filter((p) => !ql || p.nombre.toLowerCase().includes(ql));
  }, [proveedores, q]);
  const marcasFiltradas = useMemo(() => filtrar(marcas), [marcas, q, filtroProv]);
  const categoriasFiltradas = useMemo(() => filtrar(categorias), [categorias, q, filtroProv]);

  if (!authChecked) return null;

  const renderEditCell = (id: string) => (
    <div className="flex items-center gap-1">
      <Input
        value={editVal}
        onChange={(e) => setEditVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Escape") cancelEdit(); }}
        autoFocus
        className="h-8 text-sm"
      />
    </div>
  );

  const renderProvSelect = () => (
    <Select value={editProv} onValueChange={setEditProv}>
      <SelectTrigger className="h-8 w-[160px]"><SelectValue /></SelectTrigger>
      <SelectContent>
        {proveedores.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Admin · Maestros Boutique | Mayte Pet Hotel" description="Edición de proveedores, marcas y categorías maestras de la boutique." path="/admin/boutique/maestros" noindex />
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Link to="/admin/boutique"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Boutique</Button></Link>
            <h1 className="text-xl font-bold">📋 Maestros · Boutique</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4" /></Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
          </div>
          <Select value={filtroProv} onValueChange={setFiltroProv}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filtrar proveedor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todos los proveedores</SelectItem>
              {proveedores.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="categorias">
          <TabsList>
            <TabsTrigger value="proveedores">Proveedores ({provFiltrados.length})</TabsTrigger>
            <TabsTrigger value="marcas">Marcas ({marcasFiltradas.length})</TabsTrigger>
            <TabsTrigger value="categorias">Categorías ({categoriasFiltradas.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="proveedores">
            <Card className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Nombre</TableHead><TableHead>Teléfono</TableHead><TableHead>Email</TableHead><TableHead></TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {provFiltrados.map((p) => {
                    const editing = editId === p.id;
                    return (
                      <TableRow key={p.id}>
                        <TableCell>{editing ? renderEditCell(p.id) : <span className="font-medium">{p.nombre}</span>}</TableCell>
                        <TableCell className="text-xs">{p.telefono || "—"}</TableCell>
                        <TableCell className="text-xs">{p.email || "—"}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {editing ? (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => saveProveedor(p.id)}><Check className="w-4 h-4 text-green-600" /></Button>
                              <Button size="sm" variant="ghost" onClick={cancelEdit}><X className="w-4 h-4" /></Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => startEdit(p.id, p.nombre)}><Pencil className="w-3 h-3" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => removeProveedor(p.id)}><Trash2 className="w-3 h-3" /></Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {provFiltrados.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Sin resultados</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="marcas">
            <Card className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Nombre</TableHead><TableHead>Proveedor</TableHead><TableHead></TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {marcasFiltradas.map((m) => {
                    const editing = editId === m.id;
                    return (
                      <TableRow key={m.id}>
                        <TableCell>{editing ? renderEditCell(m.id) : <span className="font-medium">{m.nombre}</span>}</TableCell>
                        <TableCell className="text-xs">{editing ? renderProvSelect() : provNombre(m.proveedor_id)}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {editing ? (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => saveMarca(m.id)}><Check className="w-4 h-4 text-green-600" /></Button>
                              <Button size="sm" variant="ghost" onClick={cancelEdit}><X className="w-4 h-4" /></Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => startEdit(m.id, m.nombre, m.proveedor_id)}><Pencil className="w-3 h-3" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => removeMarca(m.id)}><Trash2 className="w-3 h-3" /></Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {marcasFiltradas.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">Sin resultados</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="categorias">
            <Card className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Nombre</TableHead><TableHead>Proveedor</TableHead><TableHead></TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {categoriasFiltradas.map((c) => {
                    const editing = editId === c.id;
                    return (
                      <TableRow key={c.id}>
                        <TableCell>{editing ? renderEditCell(c.id) : <span className="font-medium">{c.nombre}</span>}</TableCell>
                        <TableCell className="text-xs">{editing ? renderProvSelect() : provNombre(c.proveedor_id)}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {editing ? (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => saveCategoria(c.id)}><Check className="w-4 h-4 text-green-600" /></Button>
                              <Button size="sm" variant="ghost" onClick={cancelEdit}><X className="w-4 h-4" /></Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => startEdit(c.id, c.nombre, c.proveedor_id)}><Pencil className="w-3 h-3" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => removeCategoria(c.id)}><Trash2 className="w-3 h-3" /></Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {categoriasFiltradas.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">Sin resultados</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminBoutiqueMaestros;

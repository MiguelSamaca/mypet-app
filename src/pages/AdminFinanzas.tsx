import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, LogOut, Download, Trash2, ArrowLeft, TrendingUp, TrendingDown, Wallet, Pencil } from "lucide-react";
import { toast } from "sonner";

type Tipo = "ingreso" | "gasto";
type Unidad = "HOTEL" | "TIENDA" | "PASEOS" | "OTRO";

interface Tarifa {
  id: string;
  nombre: string;
  seccion: string;
  precio_hotel: number;
  precio_manada: number;
  unidad_negocio: Unidad;
}
interface Categoria {
  id: string;
  nombre: string;
  tipo: Tipo;
  naturaleza: "fijo" | "variable" | null;
}
interface Perro { id: string; nombre: string; codigo_acceso: string; dueno_nombre: string | null }
interface Movimiento {
  id: string;
  fecha: string;
  fecha_salida: string | null;
  tipo: Tipo;
  categoria_id: string | null;
  unidad_negocio: Unidad;
  producto: string;
  cantidad: number;
  costo: number;
  ventas: number;
  cliente: string | null;
  no_venta: string | null;
  detalle: string | null;
  perro_id: string | null;
  tarifa_id: string | null;
  notas: string | null;
  categorias_finanzas?: Categoria | null;
  perros?: { nombre: string; codigo_acceso: string; dueno_nombre: string | null } | null;
}

const UNIDAD_LABEL: Record<Unidad, string> = {
  HOTEL: "MP HOTEL",
  TIENDA: "BOUTIQUE",
  PASEOS: "PASEOS",
  OTRO: "OTRO",
};

const COP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n || 0);

const AdminFinanzas = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [perros, setPerros] = useState<Perro[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [productosBoutique, setProductosBoutique] = useState<Array<{ id: string; nombre: string; precio_venta: number; costo_unitario: number; stock: number; talla: string | null; color: string | null }>>([]);
  const [clientesBoutique, setClientesBoutique] = useState<Array<{ id: string; nombre: string; telefono: string | null; email: string | null; ciudad: string | null }>>([]);
  const [fClienteBoutique, setFClienteBoutique] = useState<string>("");
  const [openNuevoCli, setOpenNuevoCli] = useState(false);
  const [nuevoCli, setNuevoCli] = useState({ nombre: "", telefono: "", email: "", ciudad: "", fecha_creacion: new Date().toISOString().slice(0, 10) });

  // filtros
  const [filtroPeriodo, setFiltroPeriodo] = useState<"mes" | "anio" | "todo">("mes");
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [filtroUnidad, setFiltroUnidad] = useState<Unidad | "TODAS">("TODAS");
  const [filtroTipo, setFiltroTipo] = useState<Tipo | "todos">("todos");

  // form nuevo movimiento
  const [openNuevo, setOpenNuevo] = useState(false);
  const [editingMov, setEditingMov] = useState<Movimiento | null>(null);
  const [fTipo, setFTipo] = useState<Tipo>("ingreso");
  const [fFecha, setFFecha] = useState(new Date().toISOString().slice(0, 10));
  const [fFechaSalida, setFFechaSalida] = useState("");
  const [fCategoria, setFCategoria] = useState<string>("");
  const [fUnidad, setFUnidad] = useState<Unidad>("HOTEL");
  const [fTarifa, setFTarifa] = useState<string>("");
  const [fProducto, setFProducto] = useState("");
  const [fCantidad, setFCantidad] = useState("1");
  const [fCosto, setFCosto] = useState("0");
  const [fVentas, setFVentas] = useState("0");
  const [fCliente, setFCliente] = useState("");
  const [fNoVenta, setFNoVenta] = useState("");
  const [fDetalle, setFDetalle] = useState("");
  const [fPerro, setFPerro] = useState<string>("");
  const [fManada, setFManada] = useState(false);
  const [fNotas, setFNotas] = useState("");
  const [fProductoBoutique, setFProductoBoutique] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/admin"); return; }
      setAuthChecked(true);
    });
  }, [navigate]);

  useEffect(() => { if (authChecked) loadAll(); }, [authChecked]);

  const loadAll = async () => {
    const [t, c, p, m, pb, cb] = await Promise.all([
      supabase.from("tarifas").select("*").eq("activo", true).order("orden"),
      supabase.from("categorias_finanzas").select("*").eq("activo", true).order("nombre"),
      supabase.from("perros").select("id,nombre,codigo_acceso,dueno_nombre").order("nombre"),
      supabase.from("movimientos").select("*, categorias_finanzas(*), perros(nombre,codigo_acceso,dueno_nombre)").order("fecha", { ascending: false }).limit(1000),
      supabase.from("productos_boutique").select("id,nombre,precio_venta,costo_unitario,stock,talla,color").eq("activo", true).order("nombre"),
      supabase.from("clientes_boutique" as any).select("id,nombre,telefono,email,ciudad").eq("activo", true).order("nombre"),
    ]);
    if (t.data) setTarifas(t.data as Tarifa[]);
    if (c.data) setCategorias(c.data as Categoria[]);
    if (p.data) setPerros(p.data as Perro[]);
    if (m.data) setMovimientos(m.data as Movimiento[]);
    if (pb.data) setProductosBoutique(pb.data as any);
    if (cb.data) setClientesBoutique(cb.data as any);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/admin"); };

  const resetForm = () => {
    setFTipo("ingreso"); setFFecha(new Date().toISOString().slice(0, 10)); setFFechaSalida("");
    setFCategoria(""); setFUnidad("HOTEL"); setFTarifa(""); setFProducto("");
    setFCantidad("1"); setFCosto("0"); setFVentas("0"); setFCliente("");
    setFNoVenta(""); setFDetalle(""); setFPerro(""); setFManada(false); setFNotas("");
    setFProductoBoutique(""); setFClienteBoutique("");
  };

  const handleClienteBoutiqueChange = (id: string) => {
    setFClienteBoutique(id);
    const c = clientesBoutique.find((x) => x.id === id);
    if (c) setFCliente(c.nombre);
  };

  const handleCrearClienteBoutique = async () => {
    if (!nuevoCli.nombre.trim()) { toast.error("El nombre es obligatorio"); return; }
    const { data, error } = await supabase.from("clientes_boutique" as any).insert({
      nombre: nuevoCli.nombre.trim(),
      telefono: nuevoCli.telefono || null,
      email: nuevoCli.email || null,
      ciudad: nuevoCli.ciudad || null,
      fecha_creacion: nuevoCli.fecha_creacion,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    toast.success("Cliente creado");
    setOpenNuevoCli(false);
    setNuevoCli({ nombre: "", telefono: "", email: "", ciudad: "", fecha_creacion: new Date().toISOString().slice(0, 10) });
    const newId = (data as any)?.id;
    await loadAll();
    if (newId) {
      setFClienteBoutique(newId);
      setFCliente(nuevoCli.nombre.trim());
    }
  };

  const handleProductoBoutiqueChange = (id: string) => {
    setFProductoBoutique(id);
    const pb = productosBoutique.find((x) => x.id === id);
    if (!pb) return;
    setFProducto(pb.nombre);
    const cant = parseFloat(fCantidad) || 1;
    setFVentas(String(pb.precio_venta * cant));
    setFCosto(String(pb.costo_unitario * cant));
  };

  const handlePerroChange = (id: string) => {
    setFPerro(id);
    const p = perros.find((x) => x.id === id);
    if (p?.dueno_nombre) setFCliente(p.dueno_nombre);
  };

  // Cuando elige tarifa: autocompleta producto + ventas
  const handleTarifaChange = (id: string) => {
    setFTarifa(id);
    const tar = tarifas.find((t) => t.id === id);
    if (!tar) return;
    setFProducto(tar.nombre);
    setFUnidad(tar.unidad_negocio);
    const precio = fManada ? tar.precio_manada : tar.precio_hotel;
    const cant = parseFloat(fCantidad) || 1;
    setFVentas(String(precio * cant));
    // Auto categoria ingreso "Hospedaje" o similar según sección
    if (fTipo === "ingreso") {
      const targetName = tar.seccion === "DIA" || tar.seccion === "MENSUALIDAD" ? "Hospedaje" : tar.seccion === "DAY CARE" ? "Pasadía" : "Otros ingresos";
      const cat = categorias.find((c) => c.nombre === targetName && c.tipo === "ingreso");
      if (cat) setFCategoria(cat.id);
    }
  };

  const handleManadaToggle = (val: boolean) => {
    setFManada(val);
    if (fTarifa) {
      const tar = tarifas.find((t) => t.id === fTarifa);
      if (tar) {
        const precio = val ? tar.precio_manada : tar.precio_hotel;
        const cant = parseFloat(fCantidad) || 1;
        setFVentas(String(precio * cant));
      }
    }
  };

  const handleCantidadChange = (v: string) => {
    setFCantidad(v);
    if (fTarifa) {
      const tar = tarifas.find((t) => t.id === fTarifa);
      if (tar) {
        const precio = fManada ? tar.precio_manada : tar.precio_hotel;
        setFVentas(String(precio * (parseFloat(v) || 0)));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      fecha: fFecha,
      fecha_salida: fFechaSalida || null,
      tipo: fTipo,
      categoria_id: fCategoria || null,
      unidad_negocio: fUnidad,
      producto: fProducto || (fCategoria ? categorias.find((c) => c.id === fCategoria)?.nombre : "") || "Movimiento",
      cantidad: parseFloat(fCantidad) || 1,
      costo: parseFloat(fCosto) || 0,
      ventas: parseFloat(fVentas) || 0,
      cliente: fCliente || null,
      no_venta: fNoVenta || null,
      detalle: fDetalle || null,
      perro_id: fPerro || null,
      tarifa_id: fTarifa || null,
      notas: fNotas || null,
      cliente_boutique_id: fClienteBoutique || null,
    };
    const { error } = await supabase.from("movimientos").insert(payload as any);
    if (error) { toast.error(error.message); return; }
    // Si es ingreso de Boutique con producto vinculado → registrar salida de inventario
    if (fTipo === "ingreso" && fUnidad === "TIENDA" && fProductoBoutique) {
      await supabase.from("movimientos_inventario").insert({
        producto_id: fProductoBoutique,
        tipo: "salida",
        cantidad: parseFloat(fCantidad) || 1,
        costo_unitario: 0,
        notas: `Venta · ${fNoVenta || fFecha}`,
      });
    }
    toast.success("Movimiento registrado");
    setOpenNuevo(false);
    resetForm();
    loadAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este movimiento?")) return;
    const { error } = await supabase.from("movimientos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Eliminado");
    loadAll();
  };

  // Filtros aplicados
  const movFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      const d = new Date(m.fecha);
      if (filtroPeriodo === "anio" && d.getFullYear() !== anio) return false;
      if (filtroPeriodo === "mes" && (d.getFullYear() !== anio || d.getMonth() + 1 !== mes)) return false;
      if (filtroUnidad !== "TODAS" && m.unidad_negocio !== filtroUnidad) return false;
      if (filtroTipo !== "todos" && m.tipo !== filtroTipo) return false;
      return true;
    });
  }, [movimientos, filtroPeriodo, anio, mes, filtroUnidad, filtroTipo]);

  // KPIs
  const kpis = useMemo(() => {
    let ingresos = 0, gastosFijos = 0, gastosVar = 0, costos = 0;
    movFiltrados.forEach((m) => {
      if (m.tipo === "ingreso") ingresos += Number(m.ventas) || 0;
      else {
        const nat = m.categorias_finanzas?.naturaleza;
        if (nat === "fijo") gastosFijos += Number(m.costo || m.ventas) || 0;
        else gastosVar += Number(m.costo || m.ventas) || 0;
      }
      costos += Number(m.costo) || 0;
    });
    const totalGastos = gastosFijos + gastosVar;
    const utilidad = ingresos - totalGastos;
    return { ingresos, gastosFijos, gastosVar, totalGastos, utilidad, costos };
  }, [movFiltrados]);

  const exportCSV = () => {
    const headers = ["Fecha", "Tipo", "Unidad", "Categoría", "Producto", "Cantidad", "Costo", "Ventas", "Cliente", "No.Venta", "Detalle", "Peludo", "Notas"];
    const rows = movFiltrados.map((m) => [
      m.fecha, m.tipo, m.unidad_negocio,
      m.categorias_finanzas?.nombre || "",
      m.producto, m.cantidad, m.costo, m.ventas,
      m.cliente || "", m.no_venta || "", m.detalle || "",
      m.perros?.nombre || "", m.notas || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `finanzas_${anio}-${String(mes).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const aniosDisponibles = useMemo(() => {
    const set = new Set<number>([new Date().getFullYear()]);
    movimientos.forEach((m) => set.add(new Date(m.fecha).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [movimientos]);

  if (!authChecked) return null;

  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const categoriasFiltro = categorias.filter((c) => {
    if (c.tipo !== fTipo) return false;
    if (fTipo === "ingreso" && fUnidad === "TIENDA") {
      const n = c.nombre.toLowerCase();
      return n.includes("tienda") || n.includes("boutique") || n.includes("producto");
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Panel</Button></Link>
            <Link to="/admin/peludos"><Button variant="ghost" size="sm">🐾 Peludos</Button></Link>
            <h1 className="text-xl font-bold">💰 Finanzas Hotel</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> CSV</Button>
            <Dialog open={openNuevo} onOpenChange={(o) => { setOpenNuevo(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Nuevo movimiento</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                <DialogHeader><DialogTitle>Registrar movimiento</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Tabs value={fTipo} onValueChange={(v) => { setFTipo(v as Tipo); setFCategoria(""); }}>
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="ingreso">💚 Ingreso</TabsTrigger>
                      <TabsTrigger value="gasto">🔻 Gasto</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Fecha {fTipo === "ingreso" && fUnidad === "HOTEL" ? "entrada" : ""} *</Label><Input type="date" value={fFecha} onChange={(e) => setFFecha(e.target.value)} required /></div>
                    <div>
                      <Label>Unidad de negocio</Label>
                      <Select value={fUnidad} onValueChange={(v) => setFUnidad(v as Unidad)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HOTEL">MP HOTEL</SelectItem>
                          <SelectItem value="TIENDA">BOUTIQUE</SelectItem>
                          <SelectItem value="OTRO">OTRO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {fTipo === "ingreso" && fUnidad === "HOTEL" && (
                    <div><Label>Fecha de salida</Label><Input type="date" value={fFechaSalida} onChange={(e) => setFFechaSalida(e.target.value)} /></div>
                  )}

                  {fTipo === "ingreso" && fUnidad === "HOTEL" && (
                    <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                      <Label className="text-xs uppercase">Tarifa del hotel (autocompleta)</Label>
                      <Select value={fTarifa} onValueChange={handleTarifaChange}>
                        <SelectTrigger><SelectValue placeholder="Selecciona tarifa..." /></SelectTrigger>
                        <SelectContent>
                          {tarifas.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              [{t.seccion}] {t.nombre} — {COP(t.precio_hotel)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={fManada} onChange={(e) => handleManadaToggle(e.target.checked)} />
                        🐶🐶 Plan Manada (precio x1.8)
                      </label>
                    </div>
                  )}

                  {fTipo === "ingreso" && fUnidad === "TIENDA" && (
                    <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                      <Label className="text-xs uppercase">Producto de Boutique (descuenta inventario)</Label>
                      {productosBoutique.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No hay productos registrados. <Link to="/admin/boutique" className="underline">Crear productos →</Link>
                        </p>
                      ) : (
                        <Select value={fProductoBoutique} onValueChange={handleProductoBoutiqueChange}>
                          <SelectTrigger><SelectValue placeholder="Selecciona producto..." /></SelectTrigger>
                          <SelectContent>
                            {productosBoutique.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.nombre}{p.talla ? ` · ${p.talla}` : ""}{p.color ? ` · ${p.color}` : ""} — {COP(p.precio_venta)} (stock: {p.stock})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}

                  <div>
                    <Label>Categoría</Label>
                    <Select value={fCategoria} onValueChange={setFCategoria}>
                      <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                      <SelectContent>
                        {categoriasFiltro.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nombre}{c.naturaleza ? ` (${c.naturaleza})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div><Label>Producto / Concepto *</Label><Input value={fProducto} onChange={(e) => setFProducto(e.target.value)} required /></div>

                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Cantidad</Label><Input type="number" step="0.01" value={fCantidad} onChange={(e) => handleCantidadChange(e.target.value)} /></div>
                    <div><Label>Costo (COP)</Label><Input type="number" step="1" value={fCosto} onChange={(e) => setFCosto(e.target.value)} /></div>
                    <div><Label>{fTipo === "ingreso" ? "Ventas" : "Valor"} (COP)</Label><Input type="number" step="1" value={fVentas} onChange={(e) => setFVentas(e.target.value)} /></div>
                  </div>

                  {fTipo === "ingreso" && fUnidad === "TIENDA" && (
                    <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase">Cliente Boutique</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setOpenNuevoCli(true)}>
                          <Plus className="w-3 h-3 mr-1" /> Nuevo cliente
                        </Button>
                      </div>
                      {clientesBoutique.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No hay clientes registrados. Crea uno para asociar la venta.</p>
                      ) : (
                        <Select value={fClienteBoutique} onValueChange={handleClienteBoutiqueChange}>
                          <SelectTrigger><SelectValue placeholder="Selecciona cliente..." /></SelectTrigger>
                          <SelectContent>
                            {clientesBoutique.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.nombre}{c.ciudad ? ` · ${c.ciudad}` : ""}{c.telefono ? ` · ${c.telefono}` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}

                  {fTipo === "ingreso" && fUnidad !== "TIENDA" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Cliente</Label><Input value={fCliente} onChange={(e) => setFCliente(e.target.value)} /></div>
                      <div><Label>Peludo (vincular estadía)</Label>
                        <Select value={fPerro} onValueChange={handlePerroChange}>
                          <SelectTrigger><SelectValue placeholder="Opcional..." /></SelectTrigger>
                          <SelectContent>
                            {perros.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>No. Venta</Label><Input value={fNoVenta} onChange={(e) => setFNoVenta(e.target.value)} /></div>
                    <div><Label>Detalle</Label><Input value={fDetalle} onChange={(e) => setFDetalle(e.target.value)} placeholder="Ej: NOV-DIC" /></div>
                  </div>

                  <div><Label>Notas internas</Label><Textarea value={fNotas} onChange={(e) => setFNotas(e.target.value)} rows={2} /></div>

                  <Button type="submit" className="w-full">Guardar movimiento</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={openNuevoCli} onOpenChange={setOpenNuevoCli}>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Nuevo cliente Boutique</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Nombre *</Label><Input value={nuevoCli.nombre} onChange={(e) => setNuevoCli({ ...nuevoCli, nombre: e.target.value })} /></div>
                  <div><Label>Teléfono</Label><Input value={nuevoCli.telefono} onChange={(e) => setNuevoCli({ ...nuevoCli, telefono: e.target.value })} /></div>
                  <div><Label>Correo</Label><Input type="email" value={nuevoCli.email} onChange={(e) => setNuevoCli({ ...nuevoCli, email: e.target.value })} /></div>
                  <div><Label>Ciudad</Label><Input value={nuevoCli.ciudad} onChange={(e) => setNuevoCli({ ...nuevoCli, ciudad: e.target.value })} /></div>
                  <div><Label>Fecha de creación</Label><Input type="date" value={nuevoCli.fecha_creacion} onChange={(e) => setNuevoCli({ ...nuevoCli, fecha_creacion: e.target.value })} /></div>
                  <Button type="button" className="w-full" onClick={handleCrearClienteBoutique}>Guardar cliente</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Filtros */}
        <Card className="p-4 flex flex-wrap gap-3 items-end">
          <div>
            <Label className="text-xs">Periodo</Label>
            <Select value={filtroPeriodo} onValueChange={(v) => setFiltroPeriodo(v as any)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mes">Mes</SelectItem>
                <SelectItem value="anio">Año</SelectItem>
                <SelectItem value="todo">Todo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filtroPeriodo !== "todo" && (
            <div>
              <Label className="text-xs">Año</Label>
              <Select value={String(anio)} onValueChange={(v) => setAnio(Number(v))}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>{aniosDisponibles.map((a) => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          {filtroPeriodo === "mes" && (
            <div>
              <Label className="text-xs">Mes</Label>
              <Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>{meses.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label className="text-xs">Unidad</Label>
            <Select value={filtroUnidad} onValueChange={(v) => setFiltroUnidad(v as any)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas</SelectItem>
                <SelectItem value="HOTEL">MP HOTEL</SelectItem>
                <SelectItem value="TIENDA">BOUTIQUE</SelectItem>
                <SelectItem value="OTRO">OTRO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as any)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ingreso">Ingresos</SelectItem>
                <SelectItem value="gasto">Gastos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase"><TrendingUp className="w-4 h-4" /> Ingresos</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{COP(kpis.ingresos)}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase"><TrendingDown className="w-4 h-4" /> Gastos fijos</div>
            <div className="text-2xl font-bold text-orange-600 mt-1">{COP(kpis.gastosFijos)}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase"><TrendingDown className="w-4 h-4" /> Gastos variables</div>
            <div className="text-2xl font-bold text-orange-600 mt-1">{COP(kpis.gastosVar)}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase"><Wallet className="w-4 h-4" /> Utilidad</div>
            <div className={`text-2xl font-bold mt-1 ${kpis.utilidad >= 0 ? "text-primary" : "text-destructive"}`}>{COP(kpis.utilidad)}</div>
          </Card>
        </div>

        {/* Tabla */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Ventas</TableHead>
                  <TableHead>Cliente / Peludo</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movFiltrados.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Sin movimientos en este periodo</TableCell></TableRow>
                )}
                {movFiltrados.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs">{m.fecha}</TableCell>
                    <TableCell>
                      <Badge variant={m.tipo === "ingreso" ? "default" : "secondary"} className={m.tipo === "ingreso" ? "bg-green-600" : "bg-orange-500"}>
                        {m.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{UNIDAD_LABEL[m.unidad_negocio] || m.unidad_negocio}</TableCell>
                    <TableCell className="font-medium">{m.producto}</TableCell>
                    <TableCell className="text-xs">{m.categorias_finanzas?.nombre || "—"}</TableCell>
                    <TableCell className="text-right text-xs">{m.costo > 0 ? COP(Number(m.costo)) : "—"}</TableCell>
                    <TableCell className="text-right font-semibold">{m.ventas > 0 ? COP(Number(m.ventas)) : "—"}</TableCell>
                    <TableCell className="text-xs">
                      {m.perros?.nombre ? <Link to={`/peludos/${m.perros.codigo_acceso}`} className="text-primary underline">🐾 {m.perros.nombre}</Link> : (m.cliente || "—")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)}><Trash2 className="w-3 h-3" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AdminFinanzas;

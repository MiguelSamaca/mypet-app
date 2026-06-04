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
import { Plus, LogOut, Download, Trash2, ArrowLeft, TrendingUp, TrendingDown, Wallet, Pencil, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Seo from "@/components/Seo";
import DashboardFinanzas from "@/components/finanzas/DashboardFinanzas";

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
  const [productosBoutique, setProductosBoutique] = useState<Array<{ id: string; nombre: string; precio_venta: number; costo_unitario: number; stock: number; talla: string | null; color: string | null; categoria_nombre: string | null }>>([]);
  const [clientesBoutique, setClientesBoutique] = useState<Array<{ id: string; nombre: string; telefono: string | null; email: string | null; ciudad: string | null }>>([]);
  const [fClienteBoutique, setFClienteBoutique] = useState<string>("");
  const [openNuevoCli, setOpenNuevoCli] = useState(false);
  const [nuevoCli, setNuevoCli] = useState({ nombre: "", telefono: "", email: "", ciudad: "", fecha_creacion: new Date().toISOString().slice(0, 10) });

  // filtros
  const [filtroPeriodo, setFiltroPeriodo] = useState<"mes" | "anio" | "todo">("todo");
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [filtroUnidad, setFiltroUnidad] = useState<Unidad | "TODAS">("TODAS");
  const [filtroTipo, setFiltroTipo] = useState<Tipo | "todos">("todos");
  const [filtroNaturalezaGasto, setFiltroNaturalezaGasto] = useState<"todos" | "fijo" | "variable">("todos");
  const [vista, setVista] = useState<"tabla" | "dashboard">("tabla");

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
  const [productoBoutiqueOpen, setProductoBoutiqueOpen] = useState(false);
  const [fPagadoMiguel, setFPagadoMiguel] = useState(false);
  // Carrito de productos para venta múltiple (mismo No. Venta)
  const [cartItems, setCartItems] = useState<Array<{ producto_boutique_id: string | null; producto: string; cantidad: number; costo: number; ventas: number; categoria_id: string | null }>>([]);

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
      supabase.from("productos_boutique").select("id,nombre,precio_venta,costo_unitario,stock,talla,color,categorias_boutique(nombre)").eq("activo", true).order("nombre"),
      supabase.from("clientes_boutique" as any).select("id,nombre,telefono,email,ciudad").eq("activo", true).order("nombre"),
    ]);
    if (t.data) setTarifas(t.data as Tarifa[]);
    if (c.data) setCategorias(c.data as Categoria[]);
    if (p.data) setPerros(p.data as Perro[]);
    if (m.data) setMovimientos(m.data as Movimiento[]);
    if (pb.data) setProductosBoutique((pb.data as any[]).map((r) => ({ ...r, categoria_nombre: r.categorias_boutique?.nombre ?? null })));
    if (cb.data) setClientesBoutique(cb.data as any);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/admin"); };

  // Próximo No. Venta consecutivo (mínimo 51)
  const nextNoVenta = useMemo(() => {
    let max = 50;
    movimientos.forEach((m) => {
      const n = parseInt(String(m.no_venta || "").replace(/\D/g, ""), 10);
      if (!isNaN(n) && n > max) max = n;
    });
    return String(max + 1).padStart(3, "0");
  }, [movimientos]);

  const resetForm = () => {
    setFTipo("ingreso"); setFFecha(new Date().toISOString().slice(0, 10)); setFFechaSalida("");
    setFCategoria(""); setFUnidad("HOTEL"); setFTarifa(""); setFProducto("");
    setFCantidad("1"); setFCosto("0"); setFVentas("0"); setFCliente("");
    setFNoVenta(""); setFDetalle(""); setFPerro(""); setFManada(false); setFNotas("");
    setFProductoBoutique(""); setFClienteBoutique(""); setFPagadoMiguel(false); setEditingMov(null);
    setCartItems([]);
  };

  // Al abrir el diálogo nuevo (no edición) e ingreso → asignar No. Venta automático
  useEffect(() => {
    if (openNuevo && !editingMov && fTipo === "ingreso" && !fNoVenta) {
      setFNoVenta(nextNoVenta);
    }
  }, [openNuevo, editingMov, fTipo, nextNoVenta, fNoVenta]);

  const openEditarMovimiento = (m: Movimiento) => {
    setEditingMov(m);
    setFTipo(m.tipo);
    setFFecha(m.fecha);
    setFFechaSalida(m.fecha_salida || "");
    setFCategoria(m.categoria_id || "");
    setFUnidad(m.unidad_negocio);
    setFTarifa(m.tarifa_id || "");
    setFProducto(m.producto || "");
    setFCantidad(String(m.cantidad ?? 1));
    setFCosto(String(m.costo ?? 0));
    setFVentas(String(m.ventas ?? 0));
    setFCliente(m.cliente || "");
    setFNoVenta(m.no_venta ? String(Number(m.no_venta)).padStart(3, "0") : "");
    setFDetalle(m.detalle || "");
    setFPerro(m.perro_id || "");
    setFManada(false);
    setFNotas(m.notas || "");
    setFProductoBoutique("");
    setFClienteBoutique((m as any).cliente_boutique_id || "");
    setFPagadoMiguel(Boolean((m as any).pagado_por_miguel));
    setOpenNuevo(true);
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
    // Limpiar tarifa de hotel para que cantidad recalcule sobre el producto boutique
    setFTarifa("");
    setFProducto(pb.nombre);
    const cant = parseFloat(fCantidad) || 1;
    if (fTipo === "gasto") {
      setFCosto(String(pb.costo_unitario * cant));
      setFVentas(String(pb.costo_unitario * cant));
    } else {
      setFVentas(String(pb.precio_venta * cant));
      setFCosto(String(pb.costo_unitario * cant));
    }
    if (pb.categoria_nombre) {
      const match = categorias.find(
        (c) => c.nombre.trim().toLowerCase() === pb.categoria_nombre!.trim().toLowerCase() &&
          (fTipo === "ingreso" ? c.tipo === "ingreso" : c.tipo === "gasto")
      );
      if (match) setFCategoria(match.id);
    }
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
    const cant = parseFloat(v) || 0;
    if (fTarifa) {
      const tar = tarifas.find((t) => t.id === fTarifa);
      if (tar) {
        const precio = fManada ? tar.precio_manada : tar.precio_hotel;
        setFVentas(String(precio * cant));
      }
    } else if (fProductoBoutique) {
      const pb = productosBoutique.find((x) => x.id === fProductoBoutique);
      if (pb) {
        if (fTipo === "gasto") {
          setFCosto(String(pb.costo_unitario * cant));
          setFVentas(String(pb.costo_unitario * cant));
        } else {
          setFVentas(String(pb.precio_venta * cant));
          setFCosto(String(pb.costo_unitario * cant));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const basePayload = {
      fecha: fFecha,
      fecha_salida: fFechaSalida || null,
      tipo: fTipo,
      unidad_negocio: fUnidad,
      cliente: fCliente || null,
      no_venta: fNoVenta ? String(Number(fNoVenta)).padStart(3, "0") : null,
      detalle: fDetalle || null,
      perro_id: fPerro || null,
      tarifa_id: fTarifa || null,
      notas: fNotas || null,
      cliente_boutique_id: fClienteBoutique || null,
      pagado_por_miguel: fTipo === "gasto" ? fPagadoMiguel : false,
    };
    const currentItem = {
      categoria_id: fCategoria || null,
      producto: fProducto || (fCategoria ? categorias.find((c) => c.id === fCategoria)?.nombre : "") || "Movimiento",
      cantidad: parseFloat(fCantidad) || 1,
      costo: parseFloat(fCosto) || 0,
      ventas: parseFloat(fVentas) || 0,
      producto_boutique_id: fProductoBoutique || null,
    };

    if (editingMov) {
      const { producto_boutique_id: _pbid, ...currentForUpdate } = currentItem;
      const { error } = await supabase.from("movimientos").update({ ...basePayload, ...currentForUpdate } as any).eq("id", editingMov.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Movimiento actualizado");
    } else {
      // Combinar carrito + item actual (si está lleno)
      const allItems = [...cartItems];
      if (currentItem.producto && currentItem.producto !== "Movimiento" || currentItem.ventas > 0 || currentItem.costo > 0) {
        allItems.push(currentItem);
      }
      if (allItems.length === 0) { toast.error("Agrega al menos un producto"); return; }

      for (const it of allItems) {
        const payload = {
          ...basePayload,
          categoria_id: it.categoria_id,
          producto: it.producto,
          cantidad: it.cantidad,
          costo: it.costo,
          ventas: it.ventas,
        };
        const { data: insertedMov, error } = await supabase.from("movimientos").insert(payload as any).select("id").single();
        if (error) { toast.error(error.message); return; }
        if (it.producto_boutique_id && (fTipo === "ingreso" || fTipo === "gasto")) {
          await supabase.from("movimientos_inventario").insert({
            producto_id: it.producto_boutique_id,
            tipo: "salida",
            cantidad: it.cantidad,
            costo_unitario: it.cantidad > 0 ? it.costo / it.cantidad : 0,
            notas: `${fTipo === "gasto" ? "Gasto" : "Venta"} · ${fNoVenta || fFecha}`,
            movimiento_id: insertedMov?.id ?? null,
          } as any);
        }
      }
      toast.success(allItems.length > 1 ? `Venta registrada con ${allItems.length} productos` : "Movimiento registrado");
    }
    setOpenNuevo(false);
    resetForm();
    loadAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este movimiento?")) return;
    // Revertir movimientos de inventario vinculados (las salidas se compensan con entradas)
    const { data: invLinks } = await (supabase as any)
      .from("movimientos_inventario")
      .select("producto_id, cantidad, costo_unitario, tipo")
      .eq("movimiento_id", id);
    if (invLinks && invLinks.length > 0) {
      const reversos = invLinks
        .filter((m: any) => m.tipo === "salida" || m.tipo === "entrada")
        .map((m: any) => ({
          producto_id: m.producto_id,
          tipo: m.tipo === "salida" ? "entrada" : "salida",
          cantidad: m.cantidad,
          costo_unitario: m.costo_unitario ?? 0,
          notas: `Reverso por eliminación de movimiento ${id}`,
        }));
      if (reversos.length > 0) {
        await supabase.from("movimientos_inventario").insert(reversos as any);
      }
    }
    const { error } = await supabase.from("movimientos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Eliminado y stock restaurado");
    loadAll();
  };

  const handleDeleteVenta = async (noVenta: string) => {
    const movsVenta = movimientos.filter((mv) => mv.no_venta === noVenta);
    if (movsVenta.length === 0) return;
    if (!confirm(`¿Eliminar TODA la venta #${noVenta}? (${movsVenta.length} productos)`)) return;
    const ids = movsVenta.map((mv) => mv.id);
    // Revertir inventario para todos
    const { data: invLinks } = await (supabase as any)
      .from("movimientos_inventario")
      .select("producto_id, cantidad, costo_unitario, tipo, movimiento_id")
      .in("movimiento_id", ids);
    if (invLinks && invLinks.length > 0) {
      const reversos = invLinks
        .filter((m: any) => m.tipo === "salida" || m.tipo === "entrada")
        .map((m: any) => ({
          producto_id: m.producto_id,
          tipo: m.tipo === "salida" ? "entrada" : "salida",
          cantidad: m.cantidad,
          costo_unitario: m.costo_unitario ?? 0,
          notas: `Reverso por eliminación de venta #${noVenta}`,
        }));
      if (reversos.length > 0) await supabase.from("movimientos_inventario").insert(reversos as any);
    }
    const { error } = await supabase.from("movimientos").delete().in("id", ids);
    if (error) { toast.error(error.message); return; }
    toast.success(`Venta #${noVenta} eliminada (${ids.length} productos)`);
    loadAll();
  };



  // Filtros aplicados
  const movFiltrados = useMemo(() => {
    const filtered = movimientos.filter((m) => {
      const [yStr, mStr] = String(m.fecha).slice(0, 10).split("-");
      const fYear = Number(yStr);
      const fMonth = Number(mStr);
      if (filtroPeriodo === "anio" && fYear !== anio) return false;
      if (filtroPeriodo === "mes" && (fYear !== anio || fMonth !== mes)) return false;

      if (filtroUnidad !== "TODAS" && m.unidad_negocio !== filtroUnidad) return false;
      if (filtroTipo !== "todos" && m.tipo !== filtroTipo) return false;
      if (filtroNaturalezaGasto !== "todos" && m.tipo === "gasto" && m.categorias_finanzas?.naturaleza !== filtroNaturalezaGasto) return false;
      if (filtroNaturalezaGasto !== "todos" && m.tipo === "ingreso") return false;
      return true;
    });
    // Ordenar: por fecha desc, luego agrupando por no_venta (desc) solo para ventas >= 51, luego id desc
    return [...filtered].sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
      const av = Number(a.no_venta) || 0;
      const bv = Number(b.no_venta) || 0;
      const aGroup = av >= 51 ? av : 0;
      const bGroup = bv >= 51 ? bv : 0;
      if (aGroup !== bGroup) return bGroup - aGroup;
      return (a.id || "") < (b.id || "") ? 1 : -1;
    });

  }, [movimientos, filtroPeriodo, anio, mes, filtroUnidad, filtroTipo, filtroNaturalezaGasto]);


  // KPIs
  const kpis = useMemo(() => {
    let ingresos = 0, gastosFijos = 0, gastosVar = 0, costoVentas = 0;
    movFiltrados.forEach((m) => {
      if (m.tipo === "ingreso") {
        ingresos += Number(m.ventas) || 0;
        costoVentas += Number(m.costo) || 0;
      } else {
        const nat = m.categorias_finanzas?.naturaleza;
        if (nat === "fijo") gastosFijos += Number(m.costo || m.ventas) || 0;
        else gastosVar += Number(m.costo || m.ventas) || 0;
      }
    });
    const totalGastos = gastosFijos + gastosVar + costoVentas;
    const utilidad = ingresos - totalGastos;
    return { ingresos, gastosFijos, gastosVar: gastosVar + costoVentas, totalGastos, utilidad, costos: costoVentas };
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
    movimientos.forEach((m) => set.add(Number(String(m.fecha).slice(0, 4))));
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
      <Seo title="Admin · Finanzas | Mayte Pet Hotel" description="Control interno de finanzas, ingresos, gastos y tarifas de Mayte Pet Hotel." path="/admin/finanzas" noindex />
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
                <DialogHeader><DialogTitle>{editingMov ? "Editar movimiento" : "Registrar movimiento"}</DialogTitle></DialogHeader>
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

                  {((fTipo === "ingreso" && fUnidad === "TIENDA") || fTipo === "gasto") && (
                    <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                      <Label className="text-xs uppercase">
                        {fTipo === "gasto" ? "Producto de inventario (autocompleta costo)" : "Producto de Boutique (descuenta inventario)"}
                      </Label>
                      {productosBoutique.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No hay productos registrados. <Link to="/admin/boutique" className="underline">Crear productos →</Link>
                        </p>
                      ) : (
                        <Popover open={productoBoutiqueOpen} onOpenChange={setProductoBoutiqueOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={productoBoutiqueOpen}
                              className="w-full justify-between font-normal"
                            >
                              {(() => {
                                const p = productosBoutique.find((x) => x.id === fProductoBoutique);
                                if (!p) return <span className="text-muted-foreground">Selecciona producto...</span>;
                                return <span className="truncate">{p.nombre}{p.talla ? ` · ${p.talla}` : ""}{p.color ? ` · ${p.color}` : ""} (stock: {p.stock})</span>;
                              })()}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command
                              filter={(value, search) => {
                                if (!search) return 1;
                                return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                              }}
                            >
                              <CommandInput placeholder="Buscar producto..." />
                              <CommandList>
                                <CommandEmpty>No se encontraron productos.</CommandEmpty>
                                <CommandGroup>
                                  {productosBoutique.map((p) => {
                                    const label = `${p.nombre}${p.talla ? ` · ${p.talla}` : ""}${p.color ? ` · ${p.color}` : ""}`;
                                    return (
                                      <CommandItem
                                        key={p.id}
                                        value={`${label} ${p.id}`}
                                        onSelect={() => {
                                          handleProductoBoutiqueChange(p.id);
                                          setProductoBoutiqueOpen(false);
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", fProductoBoutique === p.id ? "opacity-100" : "opacity-0")} />
                                        <span className="flex-1 truncate">{label}</span>
                                        <span className="ml-2 text-xs text-muted-foreground">{COP(fTipo === "gasto" ? p.costo_unitario : p.precio_venta)} · stock {p.stock}</span>
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

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

                  <div><Label>Producto / Concepto {cartItems.length === 0 ? "*" : ""}</Label><Input value={fProducto} onChange={(e) => setFProducto(e.target.value)} required={cartItems.length === 0} /></div>

                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Cantidad</Label><Input type="number" step={fTipo === "ingreso" ? "1" : "0.01"} value={fCantidad} onChange={(e) => {
                      const val = e.target.value;
                      if (fTipo === "ingreso" && val.includes(".")) return;
                      handleCantidadChange(val);
                    }} /></div>
                    <div><Label>Costo (COP)</Label><Input type="number" step="1" value={fCosto} onChange={(e) => setFCosto(e.target.value)} /></div>
                    <div>
                      <Label>{fTipo === "ingreso" ? "Ventas" : "Valor"} (COP)</Label>
                      <Input type="number" step="1" value={fVentas} onChange={(e) => setFVentas(e.target.value)} />
                      {(parseFloat(fCantidad) || 0) > 1 && (parseFloat(fVentas) || 0) > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Unitario: {COP((parseFloat(fVentas) || 0) / (parseFloat(fCantidad) || 1))}
                        </p>
                      )}
                    </div>
                  </div>

                  {fTipo === "ingreso" && (
                    <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase">Cliente</Label>
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
                      {fUnidad !== "TIENDA" && (
                        <div className="pt-2">
                          <Label className="text-xs uppercase">Peludo (vincular estadía)</Label>
                          <Select value={fPerro} onValueChange={handlePerroChange}>
                            <SelectTrigger><SelectValue placeholder="Opcional..." /></SelectTrigger>
                            <SelectContent>
                              {perros.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>No. Venta</Label><Input value={fNoVenta} onChange={(e) => setFNoVenta(e.target.value)} /></div>
                    <div><Label>Detalle</Label><Input value={fDetalle} onChange={(e) => setFDetalle(e.target.value)} placeholder="Ej: NOV-DIC" /></div>
                  </div>

                  <div><Label>Notas internas</Label><Textarea value={fNotas} onChange={(e) => setFNotas(e.target.value)} rows={2} /></div>

                  {fTipo === "gasto" && (
                    <label className="flex items-center gap-2 text-sm cursor-pointer bg-muted/30 p-3 rounded-lg">
                      <input
                        type="checkbox"
                        checked={fPagadoMiguel}
                        onChange={(e) => setFPagadoMiguel(e.target.checked)}
                        className="h-4 w-4"
                      />
                      💳 Pago por Miguel
                    </label>
                  )}

                  {fTipo === "ingreso" && !editingMov && (
                    <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase">🛒 Productos en esta venta (mismo No. {fNoVenta || "—"})</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const prod = fProducto.trim();
                            const ventas = parseFloat(fVentas) || 0;
                            if (!prod) { toast.error("Indica el producto antes de agregar"); return; }
                            if (ventas <= 0) { toast.error("Indica el valor de venta"); return; }
                            setCartItems((prev) => [...prev, {
                              producto_boutique_id: fProductoBoutique || null,
                              producto: prod,
                              cantidad: parseFloat(fCantidad) || 1,
                              costo: parseFloat(fCosto) || 0,
                              ventas,
                              categoria_id: fCategoria || null,
                            }]);
                            // Limpiar campos de producto, conservar cliente/No.Venta/fecha
                            setFProducto(""); setFProductoBoutique(""); setFCantidad("1");
                            setFCosto("0"); setFVentas("0");
                            toast.success("Producto agregado a la venta");
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" /> Agregar otro producto
                        </Button>
                      </div>
                      {cartItems.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Si la venta incluye varios productos, llena los datos arriba y haz clic en "Agregar otro producto". El último también se guarda al enviar.</p>
                      ) : (
                        <div className="space-y-1">
                          {cartItems.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-background rounded px-2 py-1">
                              <span className="truncate flex-1">{it.cantidad}× {it.producto}</span>
                              <span className="font-mono text-xs mr-2">{COP(it.ventas)}</span>
                              <Button type="button" variant="ghost" size="sm" onClick={() => setCartItems((prev) => prev.filter((_, i) => i !== idx))}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm font-semibold pt-1 border-t">
                            <span>Total carrito {(parseFloat(fVentas) || 0) > 0 ? "+ actual" : ""}:</span>
                            <span>{COP(cartItems.reduce((s, i) => s + i.ventas, 0) + (parseFloat(fVentas) || 0))}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Button type="submit" className="w-full">{editingMov ? "Actualizar movimiento" : (cartItems.length > 0 ? `Guardar venta (${cartItems.length + ((parseFloat(fVentas) || 0) > 0 ? 1 : 0)} productos)` : "Guardar movimiento")}</Button>
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
          <div>
            <Label className="text-xs">Vista</Label>
            <Tabs value={vista} onValueChange={(v) => setVista(v as any)}>
              <TabsList>
                <TabsTrigger value="tabla">📋 Tabla</TabsTrigger>
                <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Card>

        {vista === "dashboard" && (
          <DashboardFinanzas movimientos={movimientos} anio={anio} unidad={filtroUnidad} />
        )}

        {vista === "tabla" && (<>


        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card
            className={`p-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${filtroTipo === "ingreso" ? "ring-2 ring-green-500 bg-green-50" : ""}`}
            onClick={() => {
              if (filtroTipo === "ingreso") {
                setFiltroTipo("todos");
              } else {
                setFiltroTipo("ingreso");
                setFiltroNaturalezaGasto("todos");
              }
            }}
          >
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase"><TrendingUp className="w-4 h-4" /> Ingresos</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{COP(kpis.ingresos)}</div>
            {filtroTipo === "ingreso" && <Badge variant="outline" className="mt-1 text-[10px] border-green-500 text-green-600">Filtrado</Badge>}
          </Card>
          <Card
            className={`p-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${filtroNaturalezaGasto === "fijo" ? "ring-2 ring-orange-500 bg-orange-50" : ""}`}
            onClick={() => {
              if (filtroNaturalezaGasto === "fijo") {
                setFiltroNaturalezaGasto("todos");
                setFiltroTipo("todos");
              } else {
                setFiltroNaturalezaGasto("fijo");
                setFiltroTipo("gasto");
              }
            }}
          >
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase"><TrendingDown className="w-4 h-4" /> Gastos fijos</div>
            <div className="text-2xl font-bold text-orange-600 mt-1">{COP(kpis.gastosFijos)}</div>
            {filtroNaturalezaGasto === "fijo" && <Badge variant="outline" className="mt-1 text-[10px] border-orange-500 text-orange-600">Filtrado</Badge>}
          </Card>
          <Card
            className={`p-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${filtroNaturalezaGasto === "variable" ? "ring-2 ring-orange-500 bg-orange-50" : ""}`}
            onClick={() => {
              if (filtroNaturalezaGasto === "variable") {
                setFiltroNaturalezaGasto("todos");
                setFiltroTipo("todos");
              } else {
                setFiltroNaturalezaGasto("variable");
                setFiltroTipo("gasto");
              }
            }}
          >
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase"><TrendingDown className="w-4 h-4" /> Gastos variables</div>
            <div className="text-2xl font-bold text-orange-600 mt-1">{COP(kpis.gastosVar)}</div>
            {filtroNaturalezaGasto === "variable" && <Badge variant="outline" className="mt-1 text-[10px] border-orange-500 text-orange-600">Filtrado</Badge>}
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
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Ventas</TableHead>
                  <TableHead>Cliente / Peludo</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movFiltrados.length === 0 && (
                  <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">Sin movimientos en este periodo</TableCell></TableRow>
                )}
                {(() => {
                  // Contar items por No. Venta (solo a partir del consecutivo 51) para agrupar visualmente
                  const ventaCount = new Map<string, number>();
                  movFiltrados.forEach((m) => {
                    if (m.no_venta && (Number(m.no_venta) || 0) >= 51) {
                      ventaCount.set(m.no_venta, (ventaCount.get(m.no_venta) || 0) + 1);
                    }
                  });
                  return movFiltrados.map((m) => {
                    const noVentaNum = Number(m.no_venta) || 0;
                    const groupSize = m.no_venta && noVentaNum >= 51 ? (ventaCount.get(m.no_venta) || 1) : 1;
                    const isGrouped = groupSize > 1;

                    return (
                      <TableRow key={m.id} className={isGrouped ? "border-l-4 border-l-primary bg-primary/5" : ""}>
                        <TableCell className="text-xs">
                          {m.fecha}
                          {m.tipo === "ingreso" && m.no_venta && (
                            <div className="text-[10px] text-primary font-semibold mt-0.5">
                              #{String(Number(m.no_venta)).padStart(3, "0")}{groupSize > 1 ? ` (${groupSize})` : ""}
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge variant={m.tipo === "ingreso" ? "default" : "secondary"} className={m.tipo === "ingreso" ? "bg-green-600" : "bg-orange-500"}>
                            {m.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{UNIDAD_LABEL[m.unidad_negocio] || m.unidad_negocio}</TableCell>
                        <TableCell className="font-medium">{m.producto}</TableCell>
                        <TableCell className="text-center text-xs">{m.cantidad}</TableCell>
                        <TableCell className="text-xs">{m.categorias_finanzas?.nombre || "—"}</TableCell>
                        <TableCell className="text-right text-xs">{m.costo > 0 ? COP(Number(m.costo)) : "—"}</TableCell>
                        <TableCell className="text-right font-semibold">{m.ventas > 0 ? COP(Number(m.ventas)) : "—"}</TableCell>
                        <TableCell className="text-xs">
                          {m.perros?.nombre ? <Link to={`/peludos/${m.perros.codigo_acceso}`} className="text-primary underline">🐾 {m.perros.nombre}</Link> : (m.cliente || "—")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-0.5">
                            <Button variant="ghost" size="sm" onClick={() => openEditarMovimiento(m)} title="Editar"><Pencil className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)} title="Eliminar este producto"><Trash2 className="w-3 h-3" /></Button>
                            {isGrouped && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteVenta(m.no_venta!)}
                                title={`Eliminar toda la venta #${String(Number(m.no_venta)).padStart(3, "0")} (${groupSize} productos)`}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span className="text-[10px] ml-0.5">venta</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  });
                })()}
              </TableBody>
            </Table>
          </div>
          </Card>
        </>)}
      </main>
    </div>
  );
};

export default AdminFinanzas;

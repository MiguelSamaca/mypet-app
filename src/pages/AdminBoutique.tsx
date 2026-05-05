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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, ArrowLeft, Trash2, Package, Truck, Tag, Layers, LogOut, Pencil } from "lucide-react";
import { toast } from "sonner";

interface Proveedor { id: string; nombre: string; contacto: string | null; telefono: string | null; email: string | null; notas: string | null; }
interface Marca { id: string; proveedor_id: string; nombre: string; }
interface Categoria { id: string; proveedor_id: string; nombre: string; }
interface Producto {
  id: string; proveedor_id: string; marca_id: string | null; categoria_id: string | null;
  nombre: string; costo_unitario: number; precio_venta: number; stock: number; notas: string | null;
  talla: string | null; color: string | null;
}

const TALLAS = ["S", "M", "L", "XL"] as const;

const COP = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n || 0);

const AdminBoutique = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  // Dialogos
  const [openProv, setOpenProv] = useState(false);
  const [openMarca, setOpenMarca] = useState<string | null>(null); // proveedor_id
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [openProd, setOpenProd] = useState<string | null>(null);
  const [editingProd, setEditingProd] = useState<Producto | null>(null);
  const [openEntrada, setOpenEntrada] = useState<Producto | null>(null);

  // Forms
  const [pNombre, setPNombre] = useState(""); const [pContacto, setPContacto] = useState("");
  const [pTel, setPTel] = useState(""); const [pEmail, setPEmail] = useState(""); const [pNotas, setPNotas] = useState("");

  const [mNombre, setMNombre] = useState("");
  const [cNombre, setCNombre] = useState("");

  const [prodNombre, setProdNombre] = useState(""); const [prodMarca, setProdMarca] = useState("");
  const [prodCat, setProdCat] = useState(""); const [prodCosto, setProdCosto] = useState("0");
  const [prodPrecio, setProdPrecio] = useState("0"); const [prodStock, setProdStock] = useState("0");
  // Variante única: "ninguna" | "talla" | "color"
  const [prodVariante, setProdVariante] = useState<"ninguna" | "talla" | "color">("ninguna");
  const [prodTallasSel, setProdTallasSel] = useState<string[]>([]);
  const [prodColoresStr, setProdColoresStr] = useState("");

  const [entCantidad, setEntCantidad] = useState("0"); const [entCosto, setEntCosto] = useState("0");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/admin"); return; }
      setAuthChecked(true);
    });
  }, [navigate]);

  useEffect(() => { if (authChecked) loadAll(); }, [authChecked]);

  const loadAll = async () => {
    const [p, m, c, pr] = await Promise.all([
      supabase.from("proveedores").select("*").eq("activo", true).order("nombre"),
      supabase.from("marcas_boutique").select("*").eq("activo", true).order("nombre"),
      supabase.from("categorias_boutique").select("*").eq("activo", true).order("nombre"),
      supabase.from("productos_boutique").select("*").eq("activo", true).order("nombre"),
    ]);
    if (p.data) setProveedores(p.data as Proveedor[]);
    if (m.data) setMarcas(m.data as Marca[]);
    if (c.data) setCategorias(c.data as Categoria[]);
    if (pr.data) setProductos(pr.data as Producto[]);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/admin"); };

  const submitProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("proveedores").insert({
      nombre: pNombre, contacto: pContacto || null, telefono: pTel || null, email: pEmail || null, notas: pNotas || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Proveedor creado");
    setPNombre(""); setPContacto(""); setPTel(""); setPEmail(""); setPNotas("");
    setOpenProv(false); loadAll();
  };

  const submitMarca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openMarca) return;
    const { error } = await supabase.from("marcas_boutique").insert({ proveedor_id: openMarca, nombre: mNombre });
    if (error) return toast.error(error.message);
    toast.success("Marca agregada");
    setMNombre(""); setOpenMarca(null); loadAll();
  };

  const submitCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openCat) return;
    const { error } = await supabase.from("categorias_boutique").insert({ proveedor_id: openCat, nombre: cNombre });
    if (error) return toast.error(error.message);
    toast.success("Categoría agregada");
    setCNombre(""); setOpenCat(null); loadAll();
  };

  const resetProdForm = () => {
    setProdNombre(""); setProdMarca(""); setProdCat(""); setProdCosto("0"); setProdPrecio("0"); setProdStock("0");
    setProdVariante("ninguna"); setProdTallasSel([]); setProdColoresStr("");
    setEditingProd(null); setOpenProd(null);
  };

  const openEditarProducto = (p: Producto) => {
    setEditingProd(p);
    setOpenProd(p.proveedor_id);
    setProdNombre(p.nombre);
    setProdMarca(p.marca_id || "");
    setProdCat(p.categoria_id || "");
    setProdCosto(String(p.costo_unitario));
    setProdPrecio(String(p.precio_venta));
    setProdStock("0");
    setProdVariante("ninguna");
    setProdTallasSel([]);
    setProdColoresStr("");
  };

  const submitProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openProd) return;
    const costo = parseFloat(prodCosto) || 0;
    const precio = parseFloat(prodPrecio) || 0;

    // EDIT mode
    if (editingProd) {
      const { error } = await supabase.from("productos_boutique").update({
        nombre: prodNombre,
        marca_id: prodMarca || null,
        categoria_id: prodCat || null,
        costo_unitario: costo,
        precio_venta: precio,
      }).eq("id", editingProd.id);
      if (error) return toast.error(error.message);
      toast.success("Producto actualizado");
      resetProdForm(); loadAll();
      return;
    }

    // CREATE mode
    const stockInicial = parseFloat(prodStock) || 0;

    let variantes: Array<{ talla: string; color: string | null }> = [{ talla: "Talla Única", color: null }];
    if (prodVariante === "talla") {
      if (prodTallasSel.length === 0) return toast.error("Selecciona al menos una talla");
      variantes = prodTallasSel.map((t) => ({ talla: t, color: null }));
    } else if (prodVariante === "color") {
      const colores = prodColoresStr.split(",").map((c) => c.trim()).filter(Boolean);
      if (colores.length === 0) return toast.error("Indica al menos un color (separados por coma)");
      variantes = colores.map((c) => ({ talla: "Talla Única", color: c }));
    }

    const rows = variantes.map((v) => ({
      proveedor_id: openProd,
      marca_id: prodMarca || null,
      categoria_id: prodCat || null,
      nombre: prodNombre,
      talla: v.talla,
      color: v.color,
      costo_unitario: costo,
      precio_venta: precio,
      stock: 0,
    }));

    const { data, error } = await supabase.from("productos_boutique").insert(rows).select();
    if (error) return toast.error(error.message);

    if (stockInicial > 0 && data && data.length === 1) {
      await supabase.from("movimientos_inventario").insert({
        producto_id: data[0].id, tipo: "entrada", cantidad: stockInicial, costo_unitario: costo,
        notas: "Stock inicial",
      });
    } else if (stockInicial > 0 && data && data.length > 1) {
      toast.info("Producto con variantes creado. Carga el stock por variante con '+ Stock'.");
    }

    toast.success(`Producto creado (${rows.length} variante${rows.length > 1 ? "s" : ""})`);
    resetProdForm(); loadAll();
  };

  const submitEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openEntrada) return;
    const { error } = await supabase.from("movimientos_inventario").insert({
      producto_id: openEntrada.id, tipo: "entrada",
      cantidad: parseFloat(entCantidad) || 0, costo_unitario: parseFloat(entCosto) || 0,
    });
    if (error) return toast.error(error.message);
    toast.success("Inventario actualizado");
    setEntCantidad("0"); setEntCosto("0"); setOpenEntrada(null); loadAll();
  };

  const deleteProveedor = async (id: string) => {
    if (!confirm("¿Eliminar proveedor y todo lo asociado?")) return;
    await supabase.from("proveedores").delete().eq("id", id);
    loadAll();
  };
  const deleteProducto = async (id: string) => {
    if (!confirm("¿Eliminar producto?")) return;
    await supabase.from("productos_boutique").delete().eq("id", id);
    loadAll();
  };

  const productosByProv = useMemo(() => {
    const m: Record<string, Producto[]> = {};
    productos.forEach((p) => { (m[p.proveedor_id] ||= []).push(p); });
    return m;
  }, [productos]);

  if (!authChecked) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Panel</Button></Link>
            <h1 className="text-xl font-bold">🛍️ Boutique · Inventario</h1>
          </div>
          <div className="flex gap-2">
            <Dialog open={openProv} onOpenChange={setOpenProv}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Proveedor</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nuevo proveedor</DialogTitle></DialogHeader>
                <form onSubmit={submitProveedor} className="space-y-3">
                  <div><Label>Nombre *</Label><Input value={pNombre} onChange={(e) => setPNombre(e.target.value)} required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Contacto</Label><Input value={pContacto} onChange={(e) => setPContacto(e.target.value)} /></div>
                    <div><Label>Teléfono</Label><Input value={pTel} onChange={(e) => setPTel(e.target.value)} /></div>
                  </div>
                  <div><Label>Email</Label><Input type="email" value={pEmail} onChange={(e) => setPEmail(e.target.value)} /></div>
                  <div><Label>Notas</Label><Textarea value={pNotas} onChange={(e) => setPNotas(e.target.value)} rows={2} /></div>
                  <Button type="submit" className="w-full">Guardar</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        {proveedores.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            <Truck className="w-10 h-10 mx-auto mb-2 opacity-40" />
            Aún no hay proveedores. Crea el primero para empezar a registrar productos.
          </Card>
        )}

        <Accordion type="multiple" className="space-y-3">
          {proveedores.map((prov) => {
            const provMarcas = marcas.filter((m) => m.proveedor_id === prov.id);
            const provCats = categorias.filter((c) => c.proveedor_id === prov.id);
            const provProds = productosByProv[prov.id] || [];
            return (
              <AccordionItem key={prov.id} value={prov.id} className="border rounded-lg px-4 bg-card">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <Truck className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-semibold">{prov.nombre}</div>
                      <div className="text-xs text-muted-foreground">
                        {provMarcas.length} marca(s) · {provCats.length} categoría(s) · {provProds.length} producto(s)
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setOpenMarca(prov.id)}>
                      <Tag className="w-3 h-3 mr-1" /> Agregar marca
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setOpenCat(prov.id)}>
                      <Layers className="w-3 h-3 mr-1" /> Agregar categoría
                    </Button>
                    <Button size="sm" onClick={() => setOpenProd(prov.id)}>
                      <Package className="w-3 h-3 mr-1" /> Agregar producto
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteProveedor(prov.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {provMarcas.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground self-center mr-1">Marcas:</span>
                      {provMarcas.map((m) => <Badge key={m.id} variant="secondary">{m.nombre}</Badge>)}
                    </div>
                  )}
                  {provCats.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground self-center mr-1">Categorías:</span>
                      {provCats.map((c) => <Badge key={c.id} variant="outline">{c.nombre}</Badge>)}
                    </div>
                  )}

                  {provProds.length > 0 && (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Talla</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Marca</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Costo</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {provProds.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell className="font-medium">{p.nombre}</TableCell>
                              <TableCell className="text-xs">{p.talla || "—"}</TableCell>
                              <TableCell className="text-xs">{p.color || "—"}</TableCell>
                              <TableCell>{marcas.find((m) => m.id === p.marca_id)?.nombre || "—"}</TableCell>
                              <TableCell>{categorias.find((c) => c.id === p.categoria_id)?.nombre || "—"}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={p.stock <= 0 ? "destructive" : "secondary"}>{p.stock}</Badge>
                              </TableCell>
                              <TableCell className="text-right text-xs">{COP(p.costo_unitario)}</TableCell>
                              <TableCell className="text-right text-xs">{COP(p.precio_venta)}</TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                <Button size="sm" variant="outline" onClick={() => setOpenEntrada(p)}>+ Stock</Button>
                                <Button size="sm" variant="ghost" onClick={() => deleteProducto(p.id)}><Trash2 className="w-3 h-3" /></Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </main>

      {/* Dialog: Marca */}
      <Dialog open={!!openMarca} onOpenChange={(o) => !o && setOpenMarca(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva marca</DialogTitle></DialogHeader>
          <form onSubmit={submitMarca} className="space-y-3">
            <div><Label>Nombre de la marca *</Label><Input value={mNombre} onChange={(e) => setMNombre(e.target.value)} required /></div>
            <Button type="submit" className="w-full">Guardar</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Categoría */}
      <Dialog open={!!openCat} onOpenChange={(o) => !o && setOpenCat(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva categoría</DialogTitle></DialogHeader>
          <form onSubmit={submitCategoria} className="space-y-3">
            <div><Label>Nombre de la categoría *</Label><Input value={cNombre} onChange={(e) => setCNombre(e.target.value)} required /></div>
            <Button type="submit" className="w-full">Guardar</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Producto */}
      <Dialog open={!!openProd} onOpenChange={(o) => { if (!o) resetProdForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingProd ? "Editar producto" : "Nuevo producto"}</DialogTitle></DialogHeader>
          <form onSubmit={submitProducto} className="space-y-3">
            <div><Label>Nombre del producto *</Label><Input value={prodNombre} onChange={(e) => setProdNombre(e.target.value)} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Marca</Label>
                <Select value={prodMarca} onValueChange={setProdMarca}>
                  <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                  <SelectContent>
                    {marcas.filter((m) => m.proveedor_id === openProd).map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoría</Label>
                <Select value={prodCat} onValueChange={setProdCat}>
                  <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                  <SelectContent>
                    {categorias.filter((c) => c.proveedor_id === openProd).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className={`grid gap-3 ${editingProd ? "grid-cols-2" : "grid-cols-3"}`}>
              <div><Label>Costo unit.</Label><Input type="number" step="1" value={prodCosto} onChange={(e) => setProdCosto(e.target.value)} /></div>
              <div><Label>Precio venta</Label><Input type="number" step="1" value={prodPrecio} onChange={(e) => setProdPrecio(e.target.value)} /></div>
              {!editingProd && (
                <div><Label>Stock inicial</Label><Input type="number" step="1" value={prodStock} onChange={(e) => setProdStock(e.target.value)} /></div>
              )}
            </div>

            {!editingProd && (
              <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
                <Label className="text-xs uppercase">Variante (solo una)</Label>

                <Select value={prodVariante} onValueChange={(v) => { setProdVariante(v as any); setProdTallasSel([]); setProdColoresStr(""); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ninguna">Sin variante (Talla Única)</SelectItem>
                    <SelectItem value="talla">Tamaño/Talla (S, M, L, XL)</SelectItem>
                    <SelectItem value="color">Color (personalizado)</SelectItem>
                  </SelectContent>
                </Select>

                {prodVariante === "talla" && (
                  <div className="flex flex-wrap gap-2">
                    {TALLAS.map((t) => {
                      const sel = prodTallasSel.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setProdTallasSel((prev) => sel ? prev.filter((x) => x !== t) : [...prev, t])}
                          className={`px-3 py-1 rounded-md text-sm border ${sel ? "bg-primary text-primary-foreground border-primary" : "bg-background"}`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                )}

                {prodVariante === "color" && (
                  <div>
                    <Input
                      placeholder="Ej: Rosa, Azul, Negro"
                      value={prodColoresStr}
                      onChange={(e) => setProdColoresStr(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Separa los colores con coma. Se creará una variante por cada color.</p>
                  </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full">{editingProd ? "Actualizar producto" : "Guardar producto"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Entrada inventario */}
      <Dialog open={!!openEntrada} onOpenChange={(o) => !o && setOpenEntrada(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Entrada de inventario · {openEntrada?.nombre}</DialogTitle></DialogHeader>
          <form onSubmit={submitEntrada} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cantidad ingresada *</Label><Input type="number" step="1" value={entCantidad} onChange={(e) => setEntCantidad(e.target.value)} required /></div>
              <div><Label>Costo unitario</Label><Input type="number" step="1" value={entCosto} onChange={(e) => setEntCosto(e.target.value)} /></div>
            </div>
            <p className="text-xs text-muted-foreground">Stock actual: {openEntrada?.stock}</p>
            <Button type="submit" className="w-full">Registrar entrada</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBoutique;

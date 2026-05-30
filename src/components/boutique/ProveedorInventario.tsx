import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Pencil, Trash2, Search, LayoutGrid, List, Download } from "lucide-react";

interface Producto {
  id: string; proveedor_id: string; marca_id: string | null; categoria_id: string | null;
  nombre: string; costo_unitario: number; precio_venta: number; stock: number;
  talla: string | null; color: string | null; notas: string | null;
}
interface Marca { id: string; nombre: string; }
interface Categoria { id: string; nombre: string; }

const COP = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n || 0);

interface Props {
  productos: Producto[];
  marcas: Marca[];
  categorias: Categoria[];
  onEdit: (p: Producto) => void;
  onDelete: (id: string) => void;
  onEntrada: (p: Producto) => void;
  proveedorNombre: string;
}

const ProveedorInventario = ({ productos, marcas, categorias, onEdit, onDelete, onEntrada, proveedorNombre }: Props) => {
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<string>("__all");
  const [marcaFilter, setMarcaFilter] = useState<string>("__all");
  const [stockFilter, setStockFilter] = useState<"todos" | "con_stock" | "bajo" | "agotado">("todos");
  const [vista, setVista] = useState<"agrupada" | "tabla">("agrupada");

  const filtrados = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return productos.filter((p) => {
      if (ql && !p.nombre.toLowerCase().includes(ql)) return false;
      if (catFilter !== "__all" && p.categoria_id !== catFilter) return false;
      if (marcaFilter !== "__all" && p.marca_id !== marcaFilter) return false;
      if (stockFilter === "con_stock" && p.stock <= 0) return false;
      if (stockFilter === "bajo" && (p.stock <= 0 || p.stock > 2)) return false;
      if (stockFilter === "agotado" && p.stock > 0) return false;
      return true;
    });
  }, [productos, q, catFilter, marcaFilter, stockFilter]);

  const resumen = useMemo(() => {
    const skus = filtrados.length;
    const unidades = filtrados.reduce((s, p) => s + (p.stock || 0), 0);
    const valor = filtrados.reduce((s, p) => s + (p.stock || 0) * (p.costo_unitario || 0), 0);
    return { skus, unidades, valor };
  }, [filtrados]);

  const agrupado = useMemo(() => {
    const map = new Map<string, Producto[]>();
    filtrados.forEach((p) => {
      const key = p.categoria_id || "__sin__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    const arr = Array.from(map.entries()).map(([catId, items]) => ({
      catId,
      catNombre: catId === "__sin__" ? "Sin categoría" : categorias.find((c) => c.id === catId)?.nombre || "—",
      items: items.sort((a, b) => a.nombre.localeCompare(b.nombre)),
    }));
    return arr.sort((a, b) => a.catNombre.localeCompare(b.catNombre));
  }, [filtrados, categorias]);

  const exportCSV = () => {
    const rows = [
      ["Categoria", "Producto", "Talla", "Color", "Marca", "Stock", "Costo", "Precio", "Valor inventario"].join(","),
      ...filtrados.map((p) => {
        const cat = categorias.find((c) => c.id === p.categoria_id)?.nombre || "";
        const marca = marcas.find((m) => m.id === p.marca_id)?.nombre || "";
        const valor = (p.stock || 0) * (p.costo_unitario || 0);
        return [cat, `"${p.nombre.replace(/"/g, '""')}"`, p.talla || "", p.color || "", marca, p.stock, p.costo_unitario, p.precio_venta, valor].join(",");
      }),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventario_${proveedorNombre.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (productos.length === 0) return null;

  const renderAcciones = (p: Producto) => (
    <div className="flex justify-end gap-1 whitespace-nowrap">
      <Button size="sm" variant="ghost" onClick={() => onEdit(p)}><Pencil className="w-3 h-3" /></Button>
      <Button size="sm" variant="outline" onClick={() => onEntrada(p)}>+ Stock</Button>
      <Button size="sm" variant="ghost" onClick={() => onDelete(p.id)}><Trash2 className="w-3 h-3" /></Button>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <div className="text-xs text-muted-foreground">SKUs</div>
          <div className="text-lg font-bold">{resumen.skus}</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xs text-muted-foreground">Unidades</div>
          <div className="text-lg font-bold">{resumen.unidades}</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xs text-muted-foreground">Valor (costo)</div>
          <div className="text-lg font-bold">{COP(resumen.valor)}</div>
        </Card>
      </div>

      {/* Categorías clickeables como filtro */}
      {categorias.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-muted-foreground mr-1">Categorías:</span>
          <button
            type="button"
            onClick={() => setCatFilter("__all")}
            className={`px-2.5 py-0.5 rounded-full text-xs border transition-colors ${
              catFilter === "__all" ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
            }`}
          >
            Todas
          </button>
          {categorias.map((c) => {
            const sel = catFilter === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCatFilter(sel ? "__all" : c.id)}
                className={`px-2.5 py-0.5 rounded-full text-xs border transition-colors ${
                  sel ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
                }`}
              >
                {c.nombre}
              </button>
            );
          })}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar producto..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
        </div>
        {marcas.length > 0 && (
          <Select value={marcaFilter} onValueChange={setMarcaFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Marca" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todas las marcas</SelectItem>
              {marcas.map((m) => <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as typeof stockFilter)}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todo el stock</SelectItem>
            <SelectItem value="con_stock">Con stock</SelectItem>
            <SelectItem value="bajo">Stock bajo (≤2)</SelectItem>
            <SelectItem value="agotado">Agotados</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1 border rounded-md p-0.5">
          <Button
            type="button"
            size="sm"
            variant={vista === "agrupada" ? "default" : "ghost"}
            onClick={() => setVista("agrupada")}
            className="h-8"
          >
            <LayoutGrid className="w-3 h-3 mr-1" /> Por categoría
          </Button>
          <Button
            type="button"
            size="sm"
            variant={vista === "tabla" ? "default" : "ghost"}
            onClick={() => setVista("tabla")}
            className="h-8"
          >
            <List className="w-3 h-3 mr-1" /> Tabla
          </Button>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={exportCSV} className="h-9">
          <Download className="w-3 h-3 mr-1" /> CSV
        </Button>
      </div>

      {filtrados.length === 0 && (
        <Card className="p-6 text-center text-muted-foreground text-sm">Sin productos para los filtros aplicados.</Card>
      )}

      {/* Vista tabla plana */}
      {vista === "tabla" && filtrados.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Talla</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Costo</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-xs">{categorias.find((c) => c.id === p.categoria_id)?.nombre || "—"}</TableCell>
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell className="text-xs">{p.talla || "—"}</TableCell>
                  <TableCell className="text-xs">{p.color || "—"}</TableCell>
                  <TableCell className="text-right">
                    {p.stock <= 2 ? (
                      <Badge variant={p.stock <= 0 ? "destructive" : "default"}>{p.stock}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">{p.stock}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs">{COP(p.costo_unitario)}</TableCell>
                  <TableCell className="text-right text-xs">{COP(p.precio_venta)}</TableCell>
                  <TableCell className="text-right">{renderAcciones(p)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Vista agrupada por categoría */}
      {vista === "agrupada" && filtrados.length > 0 && (
        <Accordion type="multiple" defaultValue={agrupado.map((g) => g.catId)} className="space-y-2">
          {agrupado.map((g) => {
            const unidadesCat = g.items.reduce((s, p) => s + (p.stock || 0), 0);
            const valorCat = g.items.reduce((s, p) => s + (p.stock || 0) * (p.costo_unitario || 0), 0);
            return (
              <AccordionItem key={g.catId} value={g.catId} className="border rounded-md px-3 bg-muted/20">
                <AccordionTrigger className="hover:no-underline py-2">
                  <div className="flex items-center gap-3 text-left flex-wrap">
                    <span className="font-semibold text-sm">{g.catNombre}</span>
                    <span className="text-xs text-muted-foreground">
                      {g.items.length} SKUs · {unidadesCat} und · {COP(valorCat)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Talla</TableHead>
                          <TableHead>Color</TableHead>
                          <TableHead className="text-right">Stock</TableHead>
                          <TableHead className="text-right">Costo</TableHead>
                          <TableHead className="text-right">Precio</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {g.items.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.nombre}</TableCell>
                            <TableCell className="text-xs">{p.talla || "—"}</TableCell>
                            <TableCell className="text-xs">{p.color || "—"}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={p.stock <= 0 ? "destructive" : p.stock <= 2 ? "outline" : "secondary"}>{p.stock}</Badge>
                            </TableCell>
                            <TableCell className="text-right text-xs">{COP(p.costo_unitario)}</TableCell>
                            <TableCell className="text-right text-xs">{COP(p.precio_venta)}</TableCell>
                            <TableCell className="text-right">{renderAcciones(p)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};

export default ProveedorInventario;

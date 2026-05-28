import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

type Tipo = "ingreso" | "gasto";
type Unidad = "HOTEL" | "TIENDA" | "PASEOS" | "OTRO";

interface Mov {
  fecha: string;
  tipo: Tipo;
  unidad_negocio: Unidad;
  costo: number;
  ventas: number;
  categorias_finanzas?: { nombre: string; naturaleza: "fijo" | "variable" | null } | null;
}

const COP_SHORT = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
};
const COP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n || 0);

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const COLORS = ["hsl(var(--primary))", "#f59e0b", "#10b981", "#6366f1", "#ec4899", "#06b6d4"];

interface Props {
  movimientos: Mov[];
  anio: number;
  unidad: Unidad | "TODAS";
}

const DashboardFinanzas = ({ movimientos, anio, unidad }: Props) => {
  // Filtra por año y unidad (ignora mes para mostrar evolución anual)
  const datosAnio = useMemo(
    () =>
      movimientos.filter((m) => {
        const d = new Date(m.fecha);
        if (d.getFullYear() !== anio) return false;
        if (unidad !== "TODAS" && m.unidad_negocio !== unidad) return false;
        return true;
      }),
    [movimientos, anio, unidad]
  );

  // Serie mensual: ingresos, gastos, utilidad
  const serieMensual = useMemo(() => {
    const acc = MESES.map((m) => ({ mes: m, ingresos: 0, gastos: 0, utilidad: 0 }));
    datosAnio.forEach((m) => {
      const i = new Date(m.fecha).getMonth();
      if (m.tipo === "ingreso") {
        acc[i].ingresos += Number(m.ventas) || 0;
        acc[i].gastos += Number(m.costo) || 0; // costo de venta
      } else {
        acc[i].gastos += Number(m.costo || m.ventas) || 0;
      }
    });
    acc.forEach((r) => (r.utilidad = r.ingresos - r.gastos));
    return acc;
  }, [datosAnio]);

  // Totales del año
  const totales = useMemo(() => {
    return serieMensual.reduce(
      (a, r) => ({
        ingresos: a.ingresos + r.ingresos,
        gastos: a.gastos + r.gastos,
        utilidad: a.utilidad + r.utilidad,
      }),
      { ingresos: 0, gastos: 0, utilidad: 0 }
    );
  }, [serieMensual]);

  // Ingresos por unidad de negocio
  const porUnidad = useMemo(() => {
    const map = new Map<string, number>();
    datosAnio.forEach((m) => {
      if (m.tipo !== "ingreso") return;
      map.set(m.unidad_negocio, (map.get(m.unidad_negocio) || 0) + (Number(m.ventas) || 0));
    });
    return Array.from(map.entries()).map(([k, v]) => ({ name: k, value: v }));
  }, [datosAnio]);

  // Gastos por categoría (top 6)
  const porCategoria = useMemo(() => {
    const map = new Map<string, number>();
    datosAnio.forEach((m) => {
      if (m.tipo !== "gasto") return;
      const k = m.categorias_finanzas?.nombre || "Sin categoría";
      map.set(k, (map.get(k) || 0) + (Number(m.costo || m.ventas) || 0));
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([k, v]) => ({ categoria: k, total: v }));
  }, [datosAnio]);

  return (
    <Card className="p-4 space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">📊 Dashboard {anio}</h2>
          <p className="text-xs text-muted-foreground">
            Vista anual {unidad === "TODAS" ? "(todas las unidades)" : `(${unidad})`}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div><span className="text-muted-foreground">Ingresos:</span> <span className="font-bold text-green-600">{COP(totales.ingresos)}</span></div>
          <div><span className="text-muted-foreground">Gastos:</span> <span className="font-bold text-orange-600">{COP(totales.gastos)}</span></div>
          <div><span className="text-muted-foreground">Utilidad:</span> <span className={`font-bold ${totales.utilidad >= 0 ? "text-primary" : "text-destructive"}`}>{COP(totales.utilidad)}</span></div>
        </div>
      </div>

      {/* Ingresos vs Gastos mensual */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Ingresos vs Gastos por mes</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={serieMensual}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={COP_SHORT} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => COP(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" radius={[4, 4, 0, 0]} />
            <Bar dataKey="gastos" fill="#f59e0b" name="Gastos" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Utilidad mensual */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Utilidad mensual</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={serieMensual}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={COP_SHORT} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => COP(v)} />
            <Line
              type="monotone"
              dataKey="utilidad"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Utilidad"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ingresos por unidad */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Ingresos por unidad de negocio</h3>
          {porUnidad.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={porUnidad}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(e: any) => `${e.name}: ${COP_SHORT(e.value)}`}
                  labelLine={false}
                >
                  {porUnidad.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => COP(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gastos por categoría */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Top gastos por categoría</h3>
          {porCategoria.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={porCategoria} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" tickFormatter={COP_SHORT} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="categoria" tick={{ fontSize: 11 }} width={110} />
                <Tooltip formatter={(v: number) => COP(v)} />
                <Bar dataKey="total" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DashboardFinanzas;

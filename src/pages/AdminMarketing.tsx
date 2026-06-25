import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ExternalLink, TrendingUp, Users, MessageCircle, BarChart3 } from "lucide-react";
import Seo from "@/components/Seo";

type Lead = {
  id: string;
  nombre: string | null;
  email: string | null;
  telefono: string | null;
  origen: string | null;
  created_at: string;
};

type RangeKey = "today" | "7d" | "30d" | "90d" | "all";

const RANGES: { key: RangeKey; label: string; days: number | null }[] = [
  { key: "today", label: "Hoy", days: 0 },
  { key: "7d", label: "Últimos 7 días", days: 7 },
  { key: "30d", label: "Últimos 30 días", days: 30 },
  { key: "90d", label: "Últimos 90 días", days: 90 },
  { key: "all", label: "Todo", days: null },
];

const AdminMarketing = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("30d");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin");
        return;
      }
      const { data, error } = await supabase
        .from("leads")
        .select("id,nombre,email,telefono,origen,created_at")
        .order("created_at", { ascending: false });
      if (!error && data) setLeads(data as Lead[]);
      setLoading(false);
    })();
  }, [navigate]);

  const filtered = useMemo(() => {
    const r = RANGES.find((x) => x.key === range);
    if (!r || r.days === null) return leads;
    const now = new Date();
    const from = new Date(now);
    if (r.days === 0) {
      from.setHours(0, 0, 0, 0);
    } else {
      from.setDate(from.getDate() - r.days);
    }
    return leads.filter((l) => new Date(l.created_at) >= from);
  }, [leads, range]);

  const byOrigen = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((l) => {
      const k = l.origen || "desconocido";
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((l) => {
      const d = new Date(l.created_at).toISOString().slice(0, 10);
      map.set(d, (map.get(d) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const maxDay = Math.max(1, ...byDay.map(([, v]) => v));

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Marketing · Admin" description="Dashboard de marketing y conversiones" noindex />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Volver</Button>
            </Link>
            <h1 className="text-2xl font-semibold">Marketing</h1>
          </div>
          <div className="flex flex-wrap gap-1">
            {RANGES.map((r) => (
              <Button
                key={r.key}
                size="sm"
                variant={range === r.key ? "default" : "outline"}
                onClick={() => setRange(r.key)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />Leads totales</div>
            <div className="text-2xl font-semibold mt-1">{filtered.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" />Días con leads</div>
            <div className="text-2xl font-semibold mt-1">{byDay.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Origen #1</div>
            <div className="text-lg font-semibold mt-1 truncate">{byOrigen[0]?.[0] || "—"}</div>
            <div className="text-xs text-muted-foreground">{byOrigen[0]?.[1] || 0} leads</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Con teléfono</div>
            <div className="text-2xl font-semibold mt-1">{filtered.filter((l) => l.telefono).length}</div>
          </Card>
        </div>

        <Tabs defaultValue="conversiones" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="conversiones">Conversiones</TabsTrigger>
            <TabsTrigger value="trafico">Tráfico</TabsTrigger>
            <TabsTrigger value="comportamiento">Comportamiento</TabsTrigger>
            <TabsTrigger value="meta">Meta Ads</TabsTrigger>
          </TabsList>

          {/* CONVERSIONES */}
          <TabsContent value="conversiones" className="space-y-4 mt-4">
            <Card className="p-4">
              <h3 className="font-medium mb-3">Leads por origen</h3>
              {byOrigen.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin datos en este rango.</p>
              ) : (
                <div className="space-y-2">
                  {byOrigen.map(([k, v]) => (
                    <div key={k} className="flex items-center gap-3">
                      <div className="text-sm w-40 truncate">{k}</div>
                      <div className="flex-1 bg-muted rounded h-2 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(v / filtered.length) * 100}%` }} />
                      </div>
                      <div className="text-sm font-medium w-12 text-right">{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-3">Leads por día</h3>
              {byDay.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin datos.</p>
              ) : (
                <div className="space-y-1">
                  {byDay.slice(0, 30).map(([d, v]) => (
                    <div key={d} className="flex items-center gap-3">
                      <div className="text-xs w-24 text-muted-foreground">{d}</div>
                      <div className="flex-1 bg-muted rounded h-2 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(v / maxDay) * 100}%` }} />
                      </div>
                      <div className="text-xs font-medium w-8 text-right">{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-3">Últimos leads</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Origen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Cargando…</TableCell></TableRow>}
                    {!loading && filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sin leads</TableCell></TableRow>}
                    {filtered.slice(0, 50).map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString("es-CO")}</TableCell>
                        <TableCell>{l.nombre || "—"}</TableCell>
                        <TableCell className="text-xs">{l.email || "—"}</TableCell>
                        <TableCell className="text-xs">{l.telefono || "—"}</TableCell>
                        <TableCell><span className="text-xs px-2 py-0.5 rounded bg-muted">{l.origen || "—"}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* TRAFICO */}
          <TabsContent value="trafico" className="mt-4">
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium">Lovable Analytics</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Visitas, pageviews, fuentes de tráfico, dispositivos y países. Con filtros por fecha.
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Ruta: Settings (engranaje arriba a la derecha en Lovable) → More → Analytics.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* COMPORTAMIENTO */}
          <TabsContent value="comportamiento" className="mt-4 space-y-4">
            <Card className="p-6">
              <h3 className="font-medium mb-2">Microsoft Clarity</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Heatmaps, grabaciones de sesión, clics muertos y de rabia. Filtros por día/semana/mes.
              </p>
              <a href="https://clarity.microsoft.com/" target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline">
                  Abrir Clarity <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </a>
            </Card>
            <Card className="p-6">
              <h3 className="font-medium mb-2 flex items-center gap-2"><MessageCircle className="h-4 w-4" />WhatsApp</h3>
              <p className="text-sm text-muted-foreground">
                Conversiones reales vía WhatsApp (315 414 8380). Para medirlas, hay que enviar evento al hacer clic en el botón.
              </p>
            </Card>
          </TabsContent>

          {/* META ADS */}
          <TabsContent value="meta" className="mt-4">
            <Card className="p-6">
              <h3 className="font-medium mb-2">Meta Events Manager</h3>
              <p className="text-sm text-muted-foreground mb-1">Pixel: <code className="text-xs">915339354347019</code></p>
              <p className="text-sm text-muted-foreground mb-4">
                Eventos PageView, ViewContent y Lead enviados por CAPI. Verificar que estén llegando.
              </p>
              <a href="https://business.facebook.com/events_manager2" target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline">
                  Abrir Events Manager <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </a>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminMarketing;

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, LogOut, Trash2, ExternalLink, Calendar, Pencil, X, FileText, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import AudioDictado from "@/components/AudioDictado";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Perro {
  id: string;
  nombre: string;
  raza: string | null;
  codigo_acceso: string;
  foto_url: string | null;
  dueno_nombre: string | null;
  dueno_email: string | null;
  dueno_telefono: string | null;
  descripcion_especial: string | null;
}

interface Visita {
  id: string;
  perro_id: string;
  fecha_entrada: string;
  fecha_salida: string;
  comportamiento: string | null;
  actividades: string | null;
  recomendaciones: string | null;
  fotos_galeria: string[] | null;
  obediencia: number | null;
  interaccion_social: number | null;
  energia: number | null;
  consenticion: number | null;
  descanso: number | null;
  tarifa_pagada: number | null;
  notas_admin: string | null;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const fmtMoney = (n: number | null | undefined) =>
  typeof n === "number"
    ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
    : "—";

const AdminPeludos = () => {
  const navigate = useNavigate();
  const [isStaff, setIsStaff] = useState<boolean | null>(null);
  const [perros, setPerros] = useState<Perro[]>([]);
  const [visitasMap, setVisitasMap] = useState<Record<string, Visita[]>>({});
  const [loading, setLoading] = useState(true);

  // form perro
  const [perroOpen, setPerroOpen] = useState(false);
  const [pNombre, setPNombre] = useState("");
  const [pRaza, setPRaza] = useState("");
  const [pCodigo, setPCodigo] = useState("");
  const [pDuenoNombre, setPDuenoNombre] = useState("");
  const [pDuenoEmail, setPDuenoEmail] = useState("");
  const [pDuenoTel, setPDuenoTel] = useState("");
  const [pFoto, setPFoto] = useState<File | null>(null);
  const [pDescripcion, setPDescripcion] = useState("");

  // form visita
  const [visitaOpen, setVisitaOpen] = useState(false);
  const [activePerro, setActivePerro] = useState<Perro | null>(null);
  const [editingVisita, setEditingVisita] = useState<Visita | null>(null);
  const [vEntrada, setVEntrada] = useState("");
  const [vSalida, setVSalida] = useState("");
  const [vComportamiento, setVComportamiento] = useState("");
  const [vActividades, setVActividades] = useState("");
  const [vRecomendaciones, setVRecomendaciones] = useState("");
  const [vObediencia, setVObediencia] = useState<string>("");
  const [vInteraccion, setVInteraccion] = useState<string>("");
  const [vEnergia, setVEnergia] = useState<string>("");
  const [vConsenticion, setVConsenticion] = useState<string>("");
  const [vDescanso, setVDescanso] = useState<string>("");
  const [vTarifa, setVTarifa] = useState<string>("");
  const [vNotasAdmin, setVNotasAdmin] = useState("");
  const [vFotos, setVFotos] = useState<FileList | null>(null);
  const [vFotosExistentes, setVFotosExistentes] = useState<string[]>([]);

  // ficha tecnica modal
  const [fichaOpen, setFichaOpen] = useState(false);
  const [fichaPerro, setFichaPerro] = useState<Perro | null>(null);
  const [fichaPeriodo, setFichaPeriodo] = useState<"total" | "anio" | "mes">("total");

  useEffect(() => {
    document.title = "Admin · Peludos | Mayte Pet Hotel";
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/admin");
      else checkStaff(session.user.id);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/admin");
      else checkStaff(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkStaff = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const staff = !!data?.length;
    setIsStaff(staff);
    if (staff) loadData();
    else setLoading(false);
  };

  const loadData = async () => {
    setLoading(true);
    const { data: perrosData } = await supabase
      .from("perros").select("*").order("created_at", { ascending: false });
    const { data: visitasData } = await supabase
      .from("visitas").select("*").order("fecha_entrada", { ascending: false });
    setPerros(perrosData || []);
    const map: Record<string, Visita[]> = {};
    (visitasData || []).forEach((v: any) => {
      map[v.perro_id] = map[v.perro_id] || [];
      map[v.perro_id].push(v);
    });
    setVisitasMap(map);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const uploadPhoto = async (file: File, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("peludos").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("peludos").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleCreatePerro = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const codigo = pCodigo.trim() || slugify(pNombre);
      let foto_url: string | null = null;
      if (pFoto) foto_url = await uploadPhoto(pFoto, `perfil/${codigo}`);
      const { error } = await supabase.from("perros").insert({
        nombre: pNombre,
        raza: pRaza || null,
        codigo_acceso: codigo,
        foto_url,
        dueno_nombre: pDuenoNombre || null,
        dueno_email: pDuenoEmail || null,
        dueno_telefono: pDuenoTel || null,
        descripcion_especial: pDescripcion || null,
      });
      if (error) throw error;
      toast.success("Peludo registrado");
      setPerroOpen(false);
      setPNombre(""); setPRaza(""); setPCodigo(""); setPDuenoNombre("");
      setPDuenoEmail(""); setPDuenoTel(""); setPFoto(null); setPDescripcion("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Error al registrar");
    }
  };

  const resetVisitaForm = () => {
    setEditingVisita(null);
    setVEntrada(""); setVSalida(""); setVComportamiento("");
    setVActividades(""); setVRecomendaciones(""); setVFotos(null);
    setVFotosExistentes([]);
    setVObediencia(""); setVInteraccion(""); setVEnergia(""); setVConsenticion(""); setVDescanso(""); setVTarifa(""); setVNotasAdmin("");
  };

  const openNuevaVisita = (p: Perro) => {
    resetVisitaForm();
    setActivePerro(p);
    setVisitaOpen(true);
  };

  const openEditarVisita = (p: Perro, v: Visita) => {
    setActivePerro(p);
    setEditingVisita(v);
    setVEntrada(v.fecha_entrada);
    setVSalida(v.fecha_salida);
    setVComportamiento(v.comportamiento || "");
    setVActividades(v.actividades || "");
    setVRecomendaciones(v.recomendaciones || "");
    setVObediencia(v.obediencia?.toString() || "");
    setVInteraccion(v.interaccion_social?.toString() || "");
    setVEnergia(v.energia?.toString() || "");
    setVConsenticion(v.consenticion?.toString() || "");
    setVDescanso(v.descanso?.toString() || "");
    setVTarifa(v.tarifa_pagada?.toString() || "");
    setVNotasAdmin(v.notas_admin || "");
    setVFotos(null);
    setVFotosExistentes(v.fotos_galeria || []);
    setVisitaOpen(true);
  };

  const handleSaveVisita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePerro) return;
    try {
      const fotosNuevas: string[] = [];
      if (vFotos) {
        for (const f of Array.from(vFotos)) {
          fotosNuevas.push(await uploadPhoto(f, `visitas/${activePerro.codigo_acceso}`));
        }
      }
      const fotos = [...vFotosExistentes, ...fotosNuevas];

      const payload = {
        fecha_entrada: vEntrada,
        fecha_salida: vSalida,
        comportamiento: vComportamiento || null,
        actividades: vActividades || null,
        recomendaciones: vRecomendaciones || null,
        fotos_galeria: fotos,
        obediencia: vObediencia ? Number(vObediencia) : null,
        interaccion_social: vInteraccion ? Number(vInteraccion) : null,
        energia: vEnergia ? Number(vEnergia) : null,
        consenticion: vConsenticion ? Number(vConsenticion) : null,
        descanso: vDescanso ? Number(vDescanso) : null,
        tarifa_pagada: vTarifa ? Number(vTarifa) : null,
        notas_admin: vNotasAdmin || null,
      };

      if (editingVisita) {
        const { error } = await supabase.from("visitas").update(payload).eq("id", editingVisita.id);
        if (error) throw error;
        toast.success("Visita actualizada");
      } else {
        const { error } = await supabase.from("visitas").insert({ ...payload, perro_id: activePerro.id });
        if (error) throw error;
        toast.success("Visita registrada");
      }
      setVisitaOpen(false);
      resetVisitaForm();
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar visita");
    }
  };

  const handleDeletePerro = async (id: string) => {
    if (!confirm("¿Eliminar este peludo y todas sus visitas?")) return;
    await supabase.from("visitas").delete().eq("perro_id", id);
    const { error } = await supabase.from("perros").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Eliminado"); loadData(); }
  };

  const handleDeleteVisita = async (id: string) => {
    if (!confirm("¿Eliminar esta visita?")) return;
    const { error } = await supabase.from("visitas").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Visita eliminada"); loadData(); }
  };

  const openFicha = (p: Perro) => {
    setFichaPerro(p);
    setFichaPeriodo("total");
    setFichaOpen(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  if (isStaff === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Sin permisos</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tu cuenta está autenticada pero no tiene rol de staff.
          </p>
          <Button onClick={handleLogout} variant="outline">Cerrar sesión</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">🐾 Admin · Peludos</h1>
          <div className="flex gap-2">
            <Dialog open={perroOpen} onOpenChange={setPerroOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-1" /> Nuevo peludo</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Registrar peludo</DialogTitle></DialogHeader>
                <form onSubmit={handleCreatePerro} className="space-y-3">
                  <div className="flex justify-end">
                    <AudioDictado
                      modo="perfil"
                      onResult={(d) => {
                        if (d.nombre) setPNombre(d.nombre);
                        if (d.raza) setPRaza(d.raza);
                        if (d.descripcion_especial) setPDescripcion(d.descripcion_especial);
                        if (d.dueno_nombre) setPDuenoNombre(d.dueno_nombre);
                        if (d.dueno_email) setPDuenoEmail(d.dueno_email);
                        if (d.dueno_telefono) setPDuenoTel(d.dueno_telefono);
                      }}
                    />
                  </div>
                  <div><Label>Nombre *</Label><Input value={pNombre} onChange={(e) => setPNombre(e.target.value)} required /></div>
                  <div><Label>Raza</Label><Input value={pRaza} onChange={(e) => setPRaza(e.target.value)} /></div>
                  <div>
                    <Label>Descripción especial</Label>
                    <Textarea value={pDescripcion} onChange={(e) => setPDescripcion(e.target.value)} placeholder='Ej: "El perro más juguetón"' rows={2} />
                  </div>
                  <div>
                    <Label>Código de acceso (URL)</Label>
                    <Input value={pCodigo} onChange={(e) => setPCodigo(e.target.value)} placeholder={pNombre ? slugify(pNombre) : "ej: rocky-2026"} />
                  </div>
                  <div><Label>Dueño (nombre)</Label><Input value={pDuenoNombre} onChange={(e) => setPDuenoNombre(e.target.value)} /></div>
                  <div><Label>Dueño (email)</Label><Input type="email" value={pDuenoEmail} onChange={(e) => setPDuenoEmail(e.target.value)} /></div>
                  <div><Label>Dueño (teléfono)</Label><Input value={pDuenoTel} onChange={(e) => setPDuenoTel(e.target.value)} /></div>
                  <div><Label>Foto de perfil</Label><Input type="file" accept="image/*" onChange={(e) => setPFoto(e.target.files?.[0] || null)} /></div>
                  <Button type="submit" className="w-full">Registrar</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>🏠 Panel</Button>
            <Button variant="outline" onClick={() => navigate("/admin/finanzas")}>💰 Finanzas</Button>
            <Button variant="outline" onClick={handleLogout}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        {perros.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            Aún no hay peludos. Click en "Nuevo peludo" para empezar.
          </Card>
        )}
        {perros.map((p) => {
          const vs = visitasMap[p.id] || [];
          const totalPagado = vs.reduce((acc, v) => acc + (Number(v.tarifa_pagada) || 0), 0);
          return (
            <Card key={p.id} className="p-4">
              <div className="flex items-start gap-4">
                {p.foto_url && <img src={p.foto_url} alt={p.nombre} className="w-20 h-20 rounded-full object-cover" />}
                <div className="flex-1">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="font-bold text-lg">{p.nombre}</h3>
                      <p className="text-sm text-muted-foreground">{p.raza || "Sin raza especificada"}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Dueño: {p.dueno_nombre || "—"} {p.dueno_email && `· ${p.dueno_email}`}
                      </p>
                      <a href={`/peludos/${p.codigo_acceso}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1">
                        /peludos/{p.codigo_acceso} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => openFicha(p)}>
                        <FileText className="w-4 h-4 mr-1" /> Ficha
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openNuevaVisita(p)}>
                        <Calendar className="w-4 h-4 mr-1" /> Visita
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeletePerro(p.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {vs.length > 0 && (
                    <p className="text-xs text-primary font-medium mt-2">
                      💰 Total facturado: {fmtMoney(totalPagado)} · {vs.length} visita(s)
                    </p>
                  )}
                  {vs.length > 0 && (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      {vs.map((v) => (
                        <div key={v.id} className="text-sm bg-muted/40 rounded p-2 flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className="font-medium">
                              {format(new Date(v.fecha_entrada), "dd/MM/yy")} → {format(new Date(v.fecha_salida), "dd/MM/yy")}
                              {v.tarifa_pagada !== null && (
                                <span className="ml-2 text-primary">· {fmtMoney(Number(v.tarifa_pagada))}</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {v.obediencia !== null && <>🐾 Obed: {v.obediencia}/10 </>}
                              {v.interaccion_social !== null && <>· Inter: {v.interaccion_social}/10 </>}
                              {v.fotos_galeria && v.fotos_galeria.length > 0 && <>· 📷 {v.fotos_galeria.length}</>}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openEditarVisita(p, v)}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteVisita(v.id)}>
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </main>

      {/* Modal Visita */}
      <Dialog open={visitaOpen} onOpenChange={(o) => { setVisitaOpen(o); if (!o) resetVisitaForm(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVisita ? "Editar visita" : "Nueva visita"} · {activePerro?.nombre}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveVisita} className="space-y-3">
            <div className="flex justify-end">
              <AudioDictado
                modo="visita"
                onResult={(d) => {
                  if (d.comportamiento) setVComportamiento(d.comportamiento);
                  if (d.actividades) setVActividades(d.actividades);
                  if (d.recomendaciones) setVRecomendaciones(d.recomendaciones);
                  if (d.fecha_entrada) setVEntrada(d.fecha_entrada);
                  if (d.fecha_salida) setVSalida(d.fecha_salida);
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Entrada *</Label><Input type="date" value={vEntrada} onChange={(e) => setVEntrada(e.target.value)} required /></div>
              <div><Label>Salida *</Label><Input type="date" value={vSalida} onChange={(e) => setVSalida(e.target.value)} required /></div>
            </div>

            {/* Boletín */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
              <p className="text-sm font-semibold">🐾 Boletín de Calificaciones (1-10)</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Obediencia</Label>
                  <Input type="number" min={1} max={10} value={vObediencia} onChange={(e) => setVObediencia(e.target.value)} placeholder="1-10" />
                </div>
                <div>
                  <Label className="text-xs">Socialización</Label>
                  <Input type="number" min={1} max={10} value={vInteraccion} onChange={(e) => setVInteraccion(e.target.value)} placeholder="1-10" />
                </div>
                <div>
                  <Label className="text-xs">Energía</Label>
                  <Input type="number" min={1} max={10} value={vEnergia} onChange={(e) => setVEnergia(e.target.value)} placeholder="1-10" />
                </div>
                <div>
                  <Label className="text-xs">Consentición</Label>
                  <Input type="number" min={1} max={10} value={vConsenticion} onChange={(e) => setVConsenticion(e.target.value)} placeholder="1-10" />
                </div>
                <div>
                  <Label className="text-xs">Descanso</Label>
                  <Input type="number" min={1} max={10} value={vDescanso} onChange={(e) => setVDescanso(e.target.value)} placeholder="1-10" />
                </div>
              </div>
            </div>

            <div><Label>Comportamiento</Label><Textarea value={vComportamiento} onChange={(e) => setVComportamiento(e.target.value)} rows={3} /></div>
            <div><Label>Actividades</Label><Textarea value={vActividades} onChange={(e) => setVActividades(e.target.value)} rows={3} /></div>
            <div><Label>Recomendaciones</Label><Textarea value={vRecomendaciones} onChange={(e) => setVRecomendaciones(e.target.value)} rows={3} /></div>

            {/* Solo admin */}
            <div className="rounded-lg border border-dashed bg-muted/30 p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">🔒 Solo administrador</p>
              <div>
                <Label className="text-xs flex items-center gap-1"><DollarSign className="w-3 h-3" />Tarifa pagada (COP)</Label>
                <Input type="number" min={0} step="1000" value={vTarifa} onChange={(e) => setVTarifa(e.target.value)} placeholder="Ej: 150000" />
              </div>
              <div>
                <Label className="text-xs">Notas internas</Label>
                <Textarea value={vNotasAdmin} onChange={(e) => setVNotasAdmin(e.target.value)} rows={2} placeholder="Notas que no se muestran al dueño" />
              </div>
            </div>

            {vFotosExistentes.length > 0 && (
              <div>
                <Label>Fotos actuales</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {vFotosExistentes.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt="" className="w-full h-16 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => setVFotosExistentes(vFotosExistentes.filter((_, idx) => idx !== i))}
                        className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl rounded-tr p-0.5"
                        aria-label="Quitar foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>{editingVisita ? "Añadir más fotos" : "Fotos (varias)"}</Label>
              <Input type="file" accept="image/*" multiple onChange={(e) => setVFotos(e.target.files)} />
              {vFotos && <p className="text-xs text-primary mt-1">{vFotos.length} foto(s) nueva(s)</p>}
            </div>
            <Button type="submit" className="w-full">
              {editingVisita ? "Guardar cambios" : "Guardar visita"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Ficha técnica */}
      <FichaTecnicaDialog
        open={fichaOpen}
        onOpenChange={setFichaOpen}
        perro={fichaPerro}
        visitas={fichaPerro ? (visitasMap[fichaPerro.id] || []) : []}
        periodo={fichaPeriodo}
        setPeriodo={setFichaPeriodo}
      />
    </div>
  );
};

const FichaTecnicaDialog = ({
  open,
  onOpenChange,
  perro,
  visitas,
  periodo,
  setPeriodo,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  perro: Perro | null;
  visitas: Visita[];
  periodo: "total" | "anio" | "mes";
  setPeriodo: (p: "total" | "anio" | "mes") => void;
}) => {
  const ordenadas = useMemo(
    () => [...visitas].sort((a, b) => a.fecha_entrada.localeCompare(b.fecha_entrada)),
    [visitas]
  );
  const primeraVisita = ordenadas[0];

  // Agrupación por periodo
  const grupos = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    visitas.forEach((v) => {
      const d = parseISO(v.fecha_entrada);
      let key = "Total";
      if (periodo === "anio") key = format(d, "yyyy");
      else if (periodo === "mes") key = format(d, "MMM yyyy", { locale: es });
      const cur = map.get(key) || { count: 0, total: 0 };
      cur.count += 1;
      cur.total += Number(v.tarifa_pagada) || 0;
      map.set(key, cur);
    });
    if (periodo === "total") {
      map.clear();
      const total = visitas.reduce((acc, v) => acc + (Number(v.tarifa_pagada) || 0), 0);
      map.set("Total histórico", { count: visitas.length, total });
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [visitas, periodo]);

  const totalGeneral = visitas.reduce((acc, v) => acc + (Number(v.tarifa_pagada) || 0), 0);

  if (!perro) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Ficha técnica · {perro.nombre}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Datos básicos */}
          <Card className="p-4 space-y-1 text-sm">
            <p><b>Raza:</b> {perro.raza || "—"}</p>
            <p><b>Dueño:</b> {perro.dueno_nombre || "—"}</p>
            <p><b>Contacto:</b> {perro.dueno_telefono || "—"} {perro.dueno_email && `· ${perro.dueno_email}`}</p>
            <p>
              <b>Primera visita:</b>{" "}
              {primeraVisita
                ? format(parseISO(primeraVisita.fecha_entrada), "d 'de' MMMM 'de' yyyy", { locale: es })
                : "Sin visitas registradas"}
            </p>
            <p><b>Total visitas:</b> {visitas.length}</p>
            <p><b>Total facturado:</b> <span className="text-primary font-semibold">{fmtMoney(totalGeneral)}</span></p>
          </Card>

          {/* Filtro periodo */}
          <div className="flex items-center gap-2">
            <Label className="text-sm">Agrupar por:</Label>
            <Select value={periodo} onValueChange={(v) => setPeriodo(v as any)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Total</SelectItem>
                <SelectItem value="anio">Año</SelectItem>
                <SelectItem value="mes">Mes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Resumen por periodo */}
          <Card className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Periodo</th>
                  <th className="text-right py-2">Visitas</th>
                  <th className="text-right py-2">Tarifa pagada</th>
                </tr>
              </thead>
              <tbody>
                {grupos.length === 0 ? (
                  <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">Sin datos</td></tr>
                ) : (
                  grupos.map(([key, val]) => (
                    <tr key={key} className="border-b last:border-0">
                      <td className="py-2 capitalize">{key}</td>
                      <td className="text-right py-2">{val.count}</td>
                      <td className="text-right py-2 text-primary font-medium">{fmtMoney(val.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>

          {/* Detalle de visitas con tarifa */}
          <Card className="p-4">
            <p className="text-sm font-semibold mb-2">Detalle de visitas</p>
            <div className="space-y-1 text-xs">
              {ordenadas.length === 0 && <p className="text-muted-foreground">Sin visitas.</p>}
              {ordenadas.slice().reverse().map((v) => (
                <div key={v.id} className="flex justify-between border-b last:border-0 py-1">
                  <span>
                    {format(parseISO(v.fecha_entrada), "dd MMM yyyy", { locale: es })} → {format(parseISO(v.fecha_salida), "dd MMM yyyy", { locale: es })}
                  </span>
                  <span className="text-primary font-medium">{fmtMoney(v.tarifa_pagada)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPeludos;

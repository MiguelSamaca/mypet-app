import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, LogOut, Trash2, ExternalLink, Calendar, Pencil, X } from "lucide-react";
import { format } from "date-fns";
import AudioDictado from "@/components/AudioDictado";

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
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

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

  // form visita (crear o editar)
  const [visitaOpen, setVisitaOpen] = useState(false);
  const [activePerro, setActivePerro] = useState<Perro | null>(null);
  const [editingVisita, setEditingVisita] = useState<Visita | null>(null);
  const [vEntrada, setVEntrada] = useState("");
  const [vSalida, setVSalida] = useState("");
  const [vComportamiento, setVComportamiento] = useState("");
  const [vActividades, setVActividades] = useState("");
  const [vRecomendaciones, setVRecomendaciones] = useState("");
  const [vFotos, setVFotos] = useState<FileList | null>(null);
  const [vFotosExistentes, setVFotosExistentes] = useState<string[]>([]);

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
    (visitasData || []).forEach((v) => {
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

      if (editingVisita) {
        const { error } = await supabase.from("visitas").update({
          fecha_entrada: vEntrada,
          fecha_salida: vSalida,
          comportamiento: vComportamiento || null,
          actividades: vActividades || null,
          recomendaciones: vRecomendaciones || null,
          fotos_galeria: fotos,
        }).eq("id", editingVisita.id);
        if (error) throw error;
        toast.success("Visita actualizada");
      } else {
        const { error } = await supabase.from("visitas").insert({
          perro_id: activePerro.id,
          fecha_entrada: vEntrada,
          fecha_salida: vSalida,
          comportamiento: vComportamiento || null,
          actividades: vActividades || null,
          recomendaciones: vRecomendaciones || null,
          fotos_galeria: fotos,
        });
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  if (isStaff === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Sin permisos</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tu cuenta está autenticada pero no tiene rol de staff. Pídele a un admin que te asigne el rol <code>colaborador</code> o <code>admin</code> en la tabla <code>user_roles</code>.
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
                  <div><Label>Nombre *</Label><Input value={pNombre} onChange={(e) => setPNombre(e.target.value)} required /></div>
                  <div><Label>Raza</Label><Input value={pRaza} onChange={(e) => setPRaza(e.target.value)} /></div>
                  <div>
                    <Label>Descripción especial</Label>
                    <Textarea
                      value={pDescripcion}
                      onChange={(e) => setPDescripcion(e.target.value)}
                      placeholder='Ej: "El perro más juguetón que nos ha visitado"'
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Código de acceso (URL)</Label>
                    <Input value={pCodigo} onChange={(e) => setPCodigo(e.target.value)} placeholder={pNombre ? slugify(pNombre) : "ej: rocky-2026"} />
                    <p className="text-xs text-muted-foreground mt-1">Si lo dejas vacío se genera del nombre</p>
                  </div>
                  <div><Label>Dueño (nombre)</Label><Input value={pDuenoNombre} onChange={(e) => setPDuenoNombre(e.target.value)} /></div>
                  <div><Label>Dueño (email)</Label><Input type="email" value={pDuenoEmail} onChange={(e) => setPDuenoEmail(e.target.value)} /></div>
                  <div><Label>Dueño (teléfono)</Label><Input value={pDuenoTel} onChange={(e) => setPDuenoTel(e.target.value)} /></div>
                  <div><Label>Foto de perfil</Label><Input type="file" accept="image/*" onChange={(e) => setPFoto(e.target.files?.[0] || null)} /></div>
                  <Button type="submit" className="w-full">Registrar</Button>
                </form>
              </DialogContent>
            </Dialog>
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
        {perros.map((p) => (
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
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openNuevaVisita(p)}>
                      <Calendar className="w-4 h-4 mr-1" /> Visita
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeletePerro(p.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {visitasMap[p.id]?.length > 0 && (
                  <div className="mt-3 space-y-2 border-t pt-3">
                    {visitasMap[p.id].map((v) => (
                      <div key={v.id} className="text-sm bg-muted/40 rounded p-2 flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="font-medium">
                            {format(new Date(v.fecha_entrada), "dd/MM/yy")} → {format(new Date(v.fecha_salida), "dd/MM/yy")}
                          </p>
                          {v.comportamiento && <p className="text-xs"><b>Comportamiento:</b> {v.comportamiento}</p>}
                          {v.actividades && <p className="text-xs"><b>Actividades:</b> {v.actividades}</p>}
                          {v.recomendaciones && <p className="text-xs"><b>Recomendaciones:</b> {v.recomendaciones}</p>}
                          {v.fotos_galeria && v.fotos_galeria.length > 0 && (
                            <p className="text-xs text-muted-foreground">📷 {v.fotos_galeria.length} foto(s)</p>
                          )}
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
        ))}
      </main>

      <Dialog open={visitaOpen} onOpenChange={(o) => { setVisitaOpen(o); if (!o) resetVisitaForm(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVisita ? "Editar visita" : "Nueva visita"} · {activePerro?.nombre}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveVisita} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Entrada *</Label><Input type="date" value={vEntrada} onChange={(e) => setVEntrada(e.target.value)} required /></div>
              <div><Label>Salida *</Label><Input type="date" value={vSalida} onChange={(e) => setVSalida(e.target.value)} required /></div>
            </div>
            <div><Label>Comportamiento</Label><Textarea value={vComportamiento} onChange={(e) => setVComportamiento(e.target.value)} rows={3} /></div>
            <div><Label>Actividades</Label><Textarea value={vActividades} onChange={(e) => setVActividades(e.target.value)} rows={3} /></div>
            <div><Label>Recomendaciones</Label><Textarea value={vRecomendaciones} onChange={(e) => setVRecomendaciones(e.target.value)} rows={3} /></div>

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
                <p className="text-xs text-muted-foreground mt-1">Click en la X para quitar una foto.</p>
              </div>
            )}

            <div>
              <Label>{editingVisita ? "Añadir más fotos" : "Fotos (varias)"}</Label>
              <Input type="file" accept="image/*" multiple onChange={(e) => setVFotos(e.target.files)} />
              <p className="text-xs text-muted-foreground mt-1">Mantén Ctrl (o Cmd en Mac) para seleccionar varias fotos a la vez.</p>
              {vFotos && <p className="text-xs text-primary mt-1">{vFotos.length} foto(s) nueva(s) seleccionada(s)</p>}
            </div>
            <Button type="submit" className="w-full">
              {editingVisita ? "Guardar cambios" : "Guardar visita"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPeludos;

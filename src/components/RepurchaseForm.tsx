import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarHeart } from "lucide-react";

const RepurchaseForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    articulo: "",
    fecha_compra: new Date().toISOString().slice(0, 10),
    dias_duracion: "30",
    notas: "",
  });

  const handleChange = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("register-purchase", {
        body: {
          ...form,
          dias_duracion: parseInt(form.dias_duracion, 10),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "¡Compra registrada!",
        description: `Te recordaremos cerca del ${data.fecha_renovacion}.`,
      });
      setForm({
        nombre: "",
        telefono: "",
        email: "",
        articulo: "",
        fecha_compra: new Date().toISOString().slice(0, 10),
        dias_duracion: "30",
        notas: "",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al registrar";
      toast({ title: "No se pudo registrar", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="recompra" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
              <CalendarHeart className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Recordatorio de recompra
            </h2>
            <p className="text-muted-foreground">
              Registra tu compra y te avisaremos antes de que se acabe — para que tu peludo nunca se quede sin lo que necesita.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-5"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rp-nombre">Nombre *</Label>
                <Input
                  id="rp-nombre"
                  required
                  maxLength={120}
                  value={form.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rp-tel">Teléfono *</Label>
                <Input
                  id="rp-tel"
                  required
                  maxLength={30}
                  value={form.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rp-email">Correo electrónico *</Label>
              <Input
                id="rp-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rp-articulo">Artículo comprado *</Label>
              <Input
                id="rp-articulo"
                required
                maxLength={120}
                placeholder="Ej. Arena para gato 10kg"
                value={form.articulo}
                onChange={(e) => handleChange("articulo", e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rp-fecha">Fecha de compra *</Label>
                <Input
                  id="rp-fecha"
                  type="date"
                  required
                  value={form.fecha_compra}
                  onChange={(e) => handleChange("fecha_compra", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rp-dias">Duración (días) *</Label>
                <Input
                  id="rp-dias"
                  type="number"
                  min={1}
                  max={365}
                  required
                  value={form.dias_duracion}
                  onChange={(e) => handleChange("dias_duracion", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rp-notas">Notas (opcional)</Label>
              <Textarea
                id="rp-notas"
                maxLength={500}
                rows={3}
                value={form.notas}
                onChange={(e) => handleChange("notas", e.target.value)}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Guardando..." : "Registrar compra"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Te enviaremos un recordatorio por correo unos días antes de que se acabe tu producto.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default RepurchaseForm;

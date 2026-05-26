import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Heart, Sparkles, MessageCircle, Dog, PawPrint } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Seo from "@/components/Seo";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface Perro {
  id: string;
  codigo_acceso: string;
  nombre: string;
  raza: string | null;
  foto_url: string | null;
  dueno_nombre: string | null;
  notas: string | null;
  descripcion_especial: string | null;
}

interface Visita {
  id: string;
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
}

const PeludoProfile = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const [perro, setPerro] = useState<Perro | null>(null);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!codigo) return;
      const { data: pRows } = await supabase.rpc("get_perro_publico", { _codigo: codigo });
      const p = Array.isArray(pRows) ? pRows[0] : null;

      if (!p) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setPerro(p as Perro);

      const { data: v } = await supabase.rpc("get_visitas_publicas", { _codigo: codigo });

      setVisitas((v as Visita[]) || []);
      setLoading(false);
    };
    load();
  }, [codigo]);

  useEffect(() => {
    if (perro) {
      document.title = `${perro.nombre} · Mayte Pet Hotel`;
      const desc = `Historial de visitas, recomendaciones y recuerdos de ${perro.nombre} en Mayte Pet Hotel.`;
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", desc);
    }
  }, [perro]);

  const diasEstadia = useMemo(() => {
    const dias: Date[] = [];
    visitas.forEach((v) => {
      try {
        const interval = eachDayOfInterval({
          start: parseISO(v.fecha_entrada),
          end: parseISO(v.fecha_salida),
        });
        dias.push(...interval);
      } catch {}
    });
    return dias;
  }, [visitas]);

  // Promedios del boletín a partir de todas las visitas calificadas
  const boletin = useMemo(() => {
    const avg = (key: keyof Visita) => {
      const arr = visitas.map((v) => v[key]).filter((n): n is number => typeof n === "number");
      return arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;
    };
    return {
      obediencia: avg("obediencia"),
      socializacion: avg("interaccion_social"),
      energia: avg("energia"),
      consenticion: avg("consenticion"),
      descanso: avg("descanso"),
    };
  }, [visitas]);

  if (loading) {
    return (
      <main className="min-h-screen container mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (notFound || !perro) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Dog className="w-16 h-16 mx-auto text-muted-foreground" />
            <CardTitle>Peludo no encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              El código no corresponde a ningún peludo registrado.
            </p>
            <Link to="/" className="text-primary underline">Volver al inicio</Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const tieneBoletin = Object.values(boletin).some((v) => v !== null);

  return (
    <main className="min-h-screen bg-background">
      <Seo
        title={`${perro.nombre} · Ficha del peludo | Mayte Pet Hotel`}
        description={`Historial de visitas, calificaciones y galería de ${perro.nombre}${perro.raza ? ` (${perro.raza})` : ""} en Mayte Pet Hotel.`}
        path={`/peludos/${codigo}`}
        image={perro.foto_url || undefined}
        type="profile"
        noindex
      />
      {/* Hero del peludo */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start max-w-4xl mx-auto">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden bg-muted shrink-0 ring-4 ring-primary/20 shadow-xl">
              {perro.foto_url ? (
                <img
                  src={perro.foto_url}
                  alt={`Foto de ${perro.nombre}`}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Dog className="w-20 h-20 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{perro.nombre}</h1>
              {perro.raza && (
                <p className="text-lg text-muted-foreground mb-2">{perro.raza}</p>
              )}
              {perro.descripcion_especial && (
                <p className="text-base md:text-lg font-medium text-primary italic mb-3 leading-snug">
                  ✨ {perro.descripcion_especial}
                </p>
              )}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                <Badge variant="secondary" className="gap-1">
                  <Heart className="w-3 h-3" /> {visitas.length} {visitas.length === 1 ? "visita" : "visitas"}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <CalendarDays className="w-3 h-3" /> {diasEstadia.length} días con nosotros
                </Badge>
              </div>
              {perro.dueno_nombre && (
                <p className="text-sm text-muted-foreground">
                  Familia <strong>{perro.dueno_nombre}</strong>
                </p>
              )}
              {perro.notas && (
                <p className="mt-4 text-sm bg-muted/50 rounded-lg p-3 italic">
                  {perro.notas}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        {/* Boletín de Calificaciones */}
        {tieneBoletin && (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-primary" />
                Boletín de Calificaciones
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Promedio basado en todas las visitas registradas.
              </p>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <PuntajeHuellas label="Obediencia" valor={boletin.obediencia} />
              <PuntajeHuellas label="Socialización" valor={boletin.socializacion} />
              <PuntajeHuellas label="Energía" valor={boletin.energia} />
              <PuntajeHuellas label="Consentición" valor={boletin.consenticion} />
              <PuntajeHuellas label="Descanso" valor={boletin.descanso} />
            </CardContent>
          </Card>
        )}

        {/* Visitas */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Historial de visitas
          </h2>

          {visitas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Aún no hay visitas registradas.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {visitas.map((v) => (
                <Card key={v.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {format(parseISO(v.fecha_entrada), "d 'de' MMMM, yyyy", { locale: es })}
                      {v.fecha_salida !== v.fecha_entrada && (
                        <span className="text-muted-foreground font-normal">
                          {" → "}
                          {format(parseISO(v.fecha_salida), "d 'de' MMMM", { locale: es })}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="multiple" className="w-full">
                      {(v.obediencia !== null || v.interaccion_social !== null || v.energia !== null || v.consenticion !== null || v.descanso !== null) && (
                        <AccordionItem value="boletin">
                          <AccordionTrigger className="text-sm font-semibold">🐾 Boletín de Calificaciones</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                              <PuntajeHuellas label="Obediencia" valor={v.obediencia} compact />
                              <PuntajeHuellas label="Socialización" valor={v.interaccion_social} compact />
                              <PuntajeHuellas label="Energía" valor={v.energia} compact />
                              <PuntajeHuellas label="Consentición" valor={v.consenticion} compact />
                              <PuntajeHuellas label="Descanso" valor={v.descanso} compact />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                      {v.comportamiento && (
                        <AccordionItem value="comportamiento">
                          <AccordionTrigger className="text-sm font-semibold">❤️ Comportamiento</AccordionTrigger>
                          <AccordionContent>
                            <BulletBlock
                              icon={<Heart className="w-4 h-4 text-primary" />}
                              title="Comportamiento"
                              text={v.comportamiento}
                              accent="bg-primary/5 border-primary/20"
                            />
                          </AccordionContent>
                        </AccordionItem>
                      )}
                      {v.actividades && (
                        <AccordionItem value="actividades">
                          <AccordionTrigger className="text-sm font-semibold">🎾 Actividades</AccordionTrigger>
                          <AccordionContent>
                            <BulletBlock
                              icon={<Sparkles className="w-4 h-4 text-primary" />}
                              title="Actividades"
                              text={v.actividades}
                              accent="bg-secondary/40 border-secondary"
                            />
                          </AccordionContent>
                        </AccordionItem>
                      )}
                      {v.recomendaciones && (
                        <AccordionItem value="recomendaciones">
                          <AccordionTrigger className="text-sm font-semibold">💡 Recomendaciones</AccordionTrigger>
                          <AccordionContent>
                            <BulletBlock
                              icon={<MessageCircle className="w-4 h-4 text-primary" />}
                              title="Recomendaciones"
                              text={v.recomendaciones}
                              accent="bg-accent/30 border-accent"
                            />
                          </AccordionContent>
                        </AccordionItem>
                      )}
                      {v.fotos_galeria && v.fotos_galeria.length > 0 && (
                        <AccordionItem value="galeria">
                          <AccordionTrigger className="text-sm font-semibold">📸 Galería</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {v.fotos_galeria.map((url, i) => (
                                <img
                                  key={i}
                                  src={url}
                                  alt={`Foto ${i + 1} de la visita`}
                                  loading="lazy"
                                  className="aspect-square object-cover rounded-md w-full"
                                />
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
      <WhatsAppButton />
    </main>
  );
};

const PuntajeHuellas = ({
  label,
  valor,
  compact = false,
}: {
  label: string;
  valor: number | null;
  compact?: boolean;
}) => {
  if (valor === null) {
    return (
      <div>
        <p className={`font-semibold ${compact ? "text-sm" : ""}`}>{label}</p>
        <p className="text-xs text-muted-foreground">Sin calificar</p>
      </div>
    );
  }
  // 10 huellitas, llenas según el valor (redondeado)
  const llenas = Math.round(valor);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className={`font-semibold ${compact ? "text-sm" : ""}`}>{label}</p>
        <span className="text-sm font-bold text-primary">{valor}/10</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <PawPrint
            key={i}
            className={`w-4 h-4 ${i < llenas ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
          />
        ))}
      </div>
    </div>
  );
};

const BulletBlock = ({
  icon,
  title,
  text,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  accent: string;
}) => {
  const items = text
    .split(/\r?\n|(?:^|\s)[•\-*]\s+/g)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className={`rounded-xl border p-4 ${accent}`}>
      <h3 className="font-semibold flex items-center gap-2 mb-3 text-foreground">
        {icon} {title}
      </h3>
      {items.length > 1 ? (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground/80 leading-relaxed">
              <span className="text-primary mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-foreground/80 leading-relaxed">{items[0]}</p>
      )}
    </div>
  );
};

export default PeludoProfile;

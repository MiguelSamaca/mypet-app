-- Tabla de perros
CREATE TABLE public.perros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_acceso TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  raza TEXT,
  foto_url TEXT,
  dueno_nombre TEXT,
  dueno_telefono TEXT,
  dueno_email TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de visitas
CREATE TABLE public.visitas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  perro_id UUID NOT NULL REFERENCES public.perros(id) ON DELETE CASCADE,
  fecha_entrada DATE NOT NULL,
  fecha_salida DATE NOT NULL,
  comportamiento TEXT,
  actividades TEXT,
  recomendaciones TEXT,
  fotos_galeria TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_visitas_perro_id ON public.visitas(perro_id);
CREATE INDEX idx_perros_codigo ON public.perros(codigo_acceso);

-- Habilitar RLS
ALTER TABLE public.perros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;

-- Lectura pública (acceso por código único en la URL)
CREATE POLICY "Public read perros" ON public.perros FOR SELECT USING (true);
CREATE POLICY "Public read visitas" ON public.visitas FOR SELECT USING (true);

-- Sin escritura pública (solo desde panel admin de Cloud)
-- (no creamos policies de INSERT/UPDATE/DELETE)

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_perros_updated_at
  BEFORE UPDATE ON public.perros
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visitas_updated_at
  BEFORE UPDATE ON public.visitas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bucket público para fotos
INSERT INTO storage.buckets (id, name, public) VALUES ('peludos', 'peludos', true);

-- Policies del bucket
CREATE POLICY "Public read peludos" ON storage.objects FOR SELECT USING (bucket_id = 'peludos');
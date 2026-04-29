-- Módulo financiero: tarifas, categorías, movimientos

-- ENUMS
CREATE TYPE public.tipo_movimiento AS ENUM ('ingreso', 'gasto');
CREATE TYPE public.naturaleza_gasto AS ENUM ('fijo', 'variable');
CREATE TYPE public.unidad_negocio AS ENUM ('HOTEL', 'TIENDA', 'PASEOS', 'OTRO');

-- TARIFAS (servicios actuales del hotel)
CREATE TABLE public.tarifas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  seccion TEXT NOT NULL, -- DIA, DAY CARE, MENSUALIDAD, OTRO
  precio_hotel NUMERIC(12,2) NOT NULL DEFAULT 0,
  precio_manada NUMERIC(12,2) NOT NULL DEFAULT 0,
  unidad_negocio public.unidad_negocio NOT NULL DEFAULT 'HOTEL',
  activo BOOLEAN NOT NULL DEFAULT true,
  orden INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CATEGORIAS de movimientos (gastos / ingresos)
CREATE TABLE public.categorias_finanzas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  tipo public.tipo_movimiento NOT NULL,
  naturaleza public.naturaleza_gasto, -- solo para gastos
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MOVIMIENTOS (libro contable unificado)
CREATE TABLE public.movimientos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo public.tipo_movimiento NOT NULL,
  categoria_id UUID REFERENCES public.categorias_finanzas(id) ON DELETE SET NULL,
  unidad_negocio public.unidad_negocio NOT NULL DEFAULT 'HOTEL',
  producto TEXT NOT NULL,
  cantidad NUMERIC(10,2) NOT NULL DEFAULT 1,
  costo NUMERIC(12,2) NOT NULL DEFAULT 0,
  ventas NUMERIC(12,2) NOT NULL DEFAULT 0,
  cliente TEXT,
  no_venta TEXT,
  no_pro_serv TEXT,
  detalle TEXT,
  perro_id UUID REFERENCES public.perros(id) ON DELETE SET NULL,
  visita_id UUID REFERENCES public.visitas(id) ON DELETE SET NULL,
  tarifa_id UUID REFERENCES public.tarifas(id) ON DELETE SET NULL,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_movimientos_fecha ON public.movimientos(fecha DESC);
CREATE INDEX idx_movimientos_perro ON public.movimientos(perro_id);
CREATE INDEX idx_movimientos_visita ON public.movimientos(visita_id);
CREATE INDEX idx_movimientos_tipo ON public.movimientos(tipo);

-- TRIGGERS updated_at
CREATE TRIGGER trg_tarifas_updated BEFORE UPDATE ON public.tarifas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_movimientos_updated BEFORE UPDATE ON public.movimientos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.tarifas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_finanzas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos ENABLE ROW LEVEL SECURITY;

-- Tarifas: lectura pública (se podría usar en sitio), escritura solo staff
CREATE POLICY "Public read tarifas" ON public.tarifas FOR SELECT USING (true);
CREATE POLICY "Staff insert tarifas" ON public.tarifas FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Staff update tarifas" ON public.tarifas FOR UPDATE TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff delete tarifas" ON public.tarifas FOR DELETE TO authenticated USING (is_staff(auth.uid()));

-- Categorias: solo staff
CREATE POLICY "Staff read categorias" ON public.categorias_finanzas FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff insert categorias" ON public.categorias_finanzas FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Staff update categorias" ON public.categorias_finanzas FOR UPDATE TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff delete categorias" ON public.categorias_finanzas FOR DELETE TO authenticated USING (is_staff(auth.uid()));

-- Movimientos: solo staff
CREATE POLICY "Staff read movimientos" ON public.movimientos FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff insert movimientos" ON public.movimientos FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Staff update movimientos" ON public.movimientos FOR UPDATE TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff delete movimientos" ON public.movimientos FOR DELETE TO authenticated USING (is_staff(auth.uid()));

-- SEED: Tarifas vigentes (tomadas de Pricing.tsx)
INSERT INTO public.tarifas (nombre, seccion, precio_hotel, precio_manada, orden) VALUES
  ('Día Hotel 24h (1-3 Días)', 'DIA', 60000, 108000, 1),
  ('Hotel 24h de 5-10 Días', 'DIA', 54000, 97200, 2),
  ('Hotel 24h de 11-15 Días', 'DIA', 48000, 86400, 3),
  ('Hotel 24h de 16-20 Días', 'DIA', 42000, 75600, 4),
  ('Cuidado por hora (1 a 5 horas)', 'DAY CARE', 8000, 14400, 5),
  ('Pasadía (6 a 10 horas)', 'DAY CARE', 44000, 79200, 6),
  ('DAY CARE 2 Días/sem (8 al mes)', 'MENSUALIDAD', 334400, 601920, 7),
  ('DAY CARE 3 Días/sem (12 al mes)', 'MENSUALIDAD', 475200, 855360, 8),
  ('Paseo individual', 'OTRO', 15000, 27000, 9),
  ('Baño personalizado', 'OTRO', 25000, 0, 10);

-- SEED: Categorias de gastos del Excel
INSERT INTO public.categorias_finanzas (nombre, tipo, naturaleza) VALUES
  ('Luz Hotel', 'gasto', 'fijo'),
  ('Agua', 'gasto', 'fijo'),
  ('Internet', 'gasto', 'fijo'),
  ('Arriendo', 'gasto', 'fijo'),
  ('Nómina', 'gasto', 'fijo'),
  ('Transportes', 'gasto', 'variable'),
  ('Aseo Hotel', 'gasto', 'variable'),
  ('Arreglos locativos', 'gasto', 'variable'),
  ('Bolsas Popis', 'gasto', 'variable'),
  ('Alimentación', 'gasto', 'variable'),
  ('Suplementos / Probióticos', 'gasto', 'variable'),
  ('Eliminador de olores', 'gasto', 'variable'),
  ('Veterinario', 'gasto', 'variable'),
  ('Marketing', 'gasto', 'variable'),
  ('Otros gastos', 'gasto', 'variable'),
  ('Hospedaje', 'ingreso', NULL),
  ('Pasadía', 'ingreso', NULL),
  ('Paseos', 'ingreso', NULL),
  ('Baño / Servicios', 'ingreso', NULL),
  ('Tienda / Productos', 'ingreso', NULL),
  ('Otros ingresos', 'ingreso', NULL);
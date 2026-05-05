
-- Proveedores
CREATE TABLE public.proveedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  contacto text,
  telefono text,
  email text,
  notas text,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read proveedores" ON public.proveedores FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff insert proveedores" ON public.proveedores FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Staff update proveedores" ON public.proveedores FOR UPDATE TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff delete proveedores" ON public.proveedores FOR DELETE TO authenticated USING (is_staff(auth.uid()));
CREATE TRIGGER trg_proveedores_updated BEFORE UPDATE ON public.proveedores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Marcas
CREATE TABLE public.marcas_boutique (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id uuid NOT NULL REFERENCES public.proveedores(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_marcas_proveedor ON public.marcas_boutique(proveedor_id);
ALTER TABLE public.marcas_boutique ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read marcas" ON public.marcas_boutique FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff insert marcas" ON public.marcas_boutique FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Staff update marcas" ON public.marcas_boutique FOR UPDATE TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff delete marcas" ON public.marcas_boutique FOR DELETE TO authenticated USING (is_staff(auth.uid()));

-- Categorias de producto
CREATE TABLE public.categorias_boutique (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id uuid NOT NULL REFERENCES public.proveedores(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_catbout_proveedor ON public.categorias_boutique(proveedor_id);
ALTER TABLE public.categorias_boutique ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read catbout" ON public.categorias_boutique FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff insert catbout" ON public.categorias_boutique FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Staff update catbout" ON public.categorias_boutique FOR UPDATE TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff delete catbout" ON public.categorias_boutique FOR DELETE TO authenticated USING (is_staff(auth.uid()));

-- Productos
CREATE TABLE public.productos_boutique (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id uuid NOT NULL REFERENCES public.proveedores(id) ON DELETE CASCADE,
  marca_id uuid REFERENCES public.marcas_boutique(id) ON DELETE SET NULL,
  categoria_id uuid REFERENCES public.categorias_boutique(id) ON DELETE SET NULL,
  nombre text NOT NULL,
  costo_unitario numeric NOT NULL DEFAULT 0,
  precio_venta numeric NOT NULL DEFAULT 0,
  stock numeric NOT NULL DEFAULT 0,
  notas text,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_prod_proveedor ON public.productos_boutique(proveedor_id);
CREATE INDEX idx_prod_marca ON public.productos_boutique(marca_id);
CREATE INDEX idx_prod_categoria ON public.productos_boutique(categoria_id);
ALTER TABLE public.productos_boutique ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read prod" ON public.productos_boutique FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff insert prod" ON public.productos_boutique FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Staff update prod" ON public.productos_boutique FOR UPDATE TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff delete prod" ON public.productos_boutique FOR DELETE TO authenticated USING (is_staff(auth.uid()));
CREATE TRIGGER trg_prod_updated BEFORE UPDATE ON public.productos_boutique FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Movimientos de inventario (entradas/salidas)
CREATE TABLE public.movimientos_inventario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id uuid NOT NULL REFERENCES public.productos_boutique(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  tipo text NOT NULL CHECK (tipo IN ('entrada','salida','ajuste')),
  cantidad numeric NOT NULL,
  costo_unitario numeric NOT NULL DEFAULT 0,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_movinv_producto ON public.movimientos_inventario(producto_id);
ALTER TABLE public.movimientos_inventario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read movinv" ON public.movimientos_inventario FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff insert movinv" ON public.movimientos_inventario FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Staff update movinv" ON public.movimientos_inventario FOR UPDATE TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff delete movinv" ON public.movimientos_inventario FOR DELETE TO authenticated USING (is_staff(auth.uid()));

-- Trigger para actualizar stock automáticamente
CREATE OR REPLACE FUNCTION public.aplicar_movimiento_inventario()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.tipo = 'entrada' THEN
    UPDATE public.productos_boutique SET stock = stock + NEW.cantidad WHERE id = NEW.producto_id;
  ELSIF NEW.tipo = 'salida' THEN
    UPDATE public.productos_boutique SET stock = stock - NEW.cantidad WHERE id = NEW.producto_id;
  ELSIF NEW.tipo = 'ajuste' THEN
    UPDATE public.productos_boutique SET stock = NEW.cantidad WHERE id = NEW.producto_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_aplicar_movimiento_inventario
AFTER INSERT ON public.movimientos_inventario
FOR EACH ROW EXECUTE FUNCTION public.aplicar_movimiento_inventario();

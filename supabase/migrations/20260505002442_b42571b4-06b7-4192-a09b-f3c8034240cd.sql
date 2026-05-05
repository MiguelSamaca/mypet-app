
ALTER TABLE public.productos_boutique
  ADD COLUMN IF NOT EXISTS producto_padre_id UUID,
  ADD COLUMN IF NOT EXISTS talla TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT;

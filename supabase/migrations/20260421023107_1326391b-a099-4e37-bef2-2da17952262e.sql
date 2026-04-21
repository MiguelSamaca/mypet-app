CREATE TABLE public.compras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  articulo TEXT NOT NULL,
  fecha_compra DATE NOT NULL,
  dias_duracion INTEGER NOT NULL,
  fecha_renovacion DATE NOT NULL,
  shopify_synced BOOLEAN NOT NULL DEFAULT false,
  shopify_customer_id TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert compras"
ON public.compras
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "No public read access on compras"
ON public.compras
FOR SELECT
TO public
USING (false);

CREATE INDEX idx_compras_fecha_renovacion ON public.compras(fecha_renovacion);
CREATE INDEX idx_compras_email ON public.compras(email);
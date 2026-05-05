
CREATE TABLE public.clientes_boutique (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  ciudad TEXT,
  fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clientes_boutique ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read clibout" ON public.clientes_boutique FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff insert clibout" ON public.clientes_boutique FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Staff update clibout" ON public.clientes_boutique FOR UPDATE TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff delete clibout" ON public.clientes_boutique FOR DELETE TO authenticated USING (is_staff(auth.uid()));

CREATE TRIGGER update_clientes_boutique_updated_at
BEFORE UPDATE ON public.clientes_boutique
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.movimientos ADD COLUMN IF NOT EXISTS cliente_boutique_id UUID;

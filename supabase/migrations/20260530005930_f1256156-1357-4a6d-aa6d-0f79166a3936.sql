ALTER TABLE public.movimientos_inventario
ADD COLUMN IF NOT EXISTS movimiento_id uuid;

CREATE INDEX IF NOT EXISTS idx_movinv_movimiento_id
ON public.movimientos_inventario(movimiento_id);
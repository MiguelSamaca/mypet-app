
-- 1. Restrict perros and visitas to staff only
DROP POLICY IF EXISTS "Public read perros" ON public.perros;
DROP POLICY IF EXISTS "Public read visitas" ON public.visitas;

CREATE POLICY "Staff read perros" ON public.perros
  FOR SELECT TO authenticated USING (is_staff(auth.uid()));

CREATE POLICY "Staff read visitas" ON public.visitas
  FOR SELECT TO authenticated USING (is_staff(auth.uid()));

-- 2. Public access via codigo_acceso through SECURITY DEFINER RPCs that expose only safe fields
CREATE OR REPLACE FUNCTION public.get_perro_publico(_codigo text)
RETURNS TABLE (
  id uuid,
  codigo_acceso text,
  nombre text,
  raza text,
  foto_url text,
  dueno_nombre text,
  notas text,
  descripcion_especial text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, codigo_acceso, nombre, raza, foto_url, dueno_nombre, notas, descripcion_especial
  FROM public.perros
  WHERE codigo_acceso = _codigo
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_visitas_publicas(_codigo text)
RETURNS TABLE (
  id uuid,
  fecha_entrada date,
  fecha_salida date,
  comportamiento text,
  actividades text,
  recomendaciones text,
  fotos_galeria text[],
  obediencia smallint,
  interaccion_social smallint,
  energia smallint,
  consenticion smallint,
  descanso smallint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.id, v.fecha_entrada, v.fecha_salida, v.comportamiento, v.actividades,
         v.recomendaciones, v.fotos_galeria, v.obediencia, v.interaccion_social,
         v.energia, v.consenticion, v.descanso
  FROM public.visitas v
  JOIN public.perros p ON p.id = v.perro_id
  WHERE p.codigo_acceso = _codigo
  ORDER BY v.fecha_entrada DESC;
$$;

REVOKE ALL ON FUNCTION public.get_perro_publico(text) FROM public;
REVOKE ALL ON FUNCTION public.get_visitas_publicas(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_perro_publico(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_visitas_publicas(text) TO anon, authenticated;

-- 3. Restrict broad public listing on peludos storage bucket (public URLs still work)
DROP POLICY IF EXISTS "Public read peludos" ON storage.objects;

-- 4. Lock down internal trigger/helper functions
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.aplicar_movimiento_inventario() FROM public, anon, authenticated;

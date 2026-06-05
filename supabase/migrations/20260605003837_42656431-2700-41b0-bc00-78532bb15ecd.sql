ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS tenants_slug_idx ON public.tenants(slug);

CREATE OR REPLACE FUNCTION public.get_tenant_by_slug(_slug TEXT)
RETURNS TABLE(id uuid, nombre text, slug text, plan text, estado text, logo_url text, color_primario text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, nombre, slug, plan, estado, logo_url, color_primario FROM public.tenants WHERE slug = _slug LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_tenant_by_slug(TEXT) TO anon, authenticated;
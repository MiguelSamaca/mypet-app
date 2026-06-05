
-- =====================================================
-- TENANTS & TENANT_MODULES
-- =====================================================
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email_contacto text,
  plan text NOT NULL DEFAULT 'basico' CHECK (plan IN ('basico','profesional','enterprise')),
  estado text NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','inactivo','suspendido')),
  max_usuarios integer NOT NULL DEFAULT 5,
  logo_url text,
  color_primario text DEFAULT '#D946EF',
  fecha_creacion timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER tenants_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.tenant_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  modulo text NOT NULL CHECK (modulo IN ('finanzas','inventario','roles','fichas','crm')),
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, modulo)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_modules TO authenticated;
GRANT ALL ON public.tenant_modules TO service_role;
ALTER TABLE public.tenant_modules ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER tenant_modules_updated_at BEFORE UPDATE ON public.tenant_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SEED initial tenant (Mayte Pet Hotel)
-- =====================================================
INSERT INTO public.tenants (id, nombre, email_contacto, plan, estado, max_usuarios, color_primario)
VALUES ('00000000-0000-0000-0000-000000000001', 'Mayte Pet Hotel', 'hola@maytepethotel.com', 'enterprise', 'activo', 50, '#D946EF');

INSERT INTO public.tenant_modules (tenant_id, modulo) VALUES
  ('00000000-0000-0000-0000-000000000001', 'finanzas'),
  ('00000000-0000-0000-0000-000000000001', 'inventario'),
  ('00000000-0000-0000-0000-000000000001', 'roles'),
  ('00000000-0000-0000-0000-000000000001', 'fichas'),
  ('00000000-0000-0000-0000-000000000001', 'crm');

-- =====================================================
-- ADD tenant_id to user_roles (nullable: superadmin has none)
-- =====================================================
ALTER TABLE public.user_roles ADD COLUMN tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;
UPDATE public.user_roles SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE role IN ('admin','colaborador');
-- Allow multiple roles per user across tenants
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
CREATE UNIQUE INDEX user_roles_user_role_tenant_idx ON public.user_roles (user_id, role, COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000'));

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'superadmin')
$$;

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tenant_id FROM public.user_roles
  WHERE user_id = auth.uid() AND tenant_id IS NOT NULL
  ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'colaborador' THEN 2 ELSE 3 END
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.can_access_tenant(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_superadmin(auth.uid())
      OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND tenant_id = _tenant_id)
$$;

REVOKE EXECUTE ON FUNCTION public.is_superadmin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_tenant_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_access_tenant(uuid) FROM anon;

-- =====================================================
-- ADD tenant_id to all business tables + backfill + NOT NULL
-- =====================================================
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'movimientos','perros','visitas','productos_boutique','clientes_boutique',
    'proveedores','marcas_boutique','categorias_boutique','categorias_finanzas',
    'tarifas','compras','leads','movimientos_inventario'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE', tbl);
    EXECUTE format('UPDATE public.%I SET tenant_id = %L', tbl, '00000000-0000-0000-0000-000000000001');
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET NOT NULL', tbl);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET DEFAULT %L', tbl, '00000000-0000-0000-0000-000000000001');
    EXECUTE format('CREATE INDEX %I ON public.%I (tenant_id)', tbl || '_tenant_id_idx', tbl);
  END LOOP;
END $$;

-- =====================================================
-- RLS POLICIES — tenants & tenant_modules
-- =====================================================
CREATE POLICY "Superadmin manages tenants" ON public.tenants
  FOR ALL TO authenticated USING (public.is_superadmin(auth.uid())) WITH CHECK (public.is_superadmin(auth.uid()));
CREATE POLICY "Staff read own tenant" ON public.tenants
  FOR SELECT TO authenticated USING (public.can_access_tenant(id));

CREATE POLICY "Superadmin manages tenant_modules" ON public.tenant_modules
  FOR ALL TO authenticated USING (public.is_superadmin(auth.uid())) WITH CHECK (public.is_superadmin(auth.uid()));
CREATE POLICY "Staff read own tenant modules" ON public.tenant_modules
  FOR SELECT TO authenticated USING (public.can_access_tenant(tenant_id));

-- =====================================================
-- RLS POLICIES — user_roles (replace existing)
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Superadmin manages all roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_superadmin(auth.uid())) WITH CHECK (public.is_superadmin(auth.uid()));
CREATE POLICY "Tenant admin manages tenant roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (tenant_id IS NOT NULL AND public.has_role(auth.uid(), 'admin') AND tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id IS NOT NULL AND public.has_role(auth.uid(), 'admin') AND tenant_id = public.current_tenant_id());

-- =====================================================
-- REPLACE business-table policies with tenant-aware versions
-- Pattern: staff of same tenant OR superadmin
-- =====================================================
DO $$
DECLARE
  tbl text;
  pol record;
  tables text[] := ARRAY[
    'movimientos','perros','visitas','productos_boutique','clientes_boutique',
    'proveedores','marcas_boutique','categorias_boutique','categorias_finanzas',
    'tarifas','movimientos_inventario'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    -- drop existing policies on table
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=tbl LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, tbl);
    END LOOP;

    EXECUTE format($f$
      CREATE POLICY "Tenant staff select" ON public.%I FOR SELECT TO authenticated
        USING (public.is_staff(auth.uid()) AND public.can_access_tenant(tenant_id))
    $f$, tbl);
    EXECUTE format($f$
      CREATE POLICY "Tenant staff insert" ON public.%I FOR INSERT TO authenticated
        WITH CHECK (public.is_staff(auth.uid()) AND public.can_access_tenant(tenant_id))
    $f$, tbl);
    EXECUTE format($f$
      CREATE POLICY "Tenant staff update" ON public.%I FOR UPDATE TO authenticated
        USING (public.is_staff(auth.uid()) AND public.can_access_tenant(tenant_id))
        WITH CHECK (public.is_staff(auth.uid()) AND public.can_access_tenant(tenant_id))
    $f$, tbl);
    EXECUTE format($f$
      CREATE POLICY "Tenant staff delete" ON public.%I FOR DELETE TO authenticated
        USING (public.is_staff(auth.uid()) AND public.can_access_tenant(tenant_id))
    $f$, tbl);
  END LOOP;
END $$;

-- leads & compras keep public INSERT (website-facing), tighten SELECT to tenant staff
DROP POLICY IF EXISTS "No public read access" ON public.leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Tenant staff read leads" ON public.leads FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) AND public.can_access_tenant(tenant_id));
CREATE POLICY "Tenant staff update leads" ON public.leads FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()) AND public.can_access_tenant(tenant_id))
  WITH CHECK (public.is_staff(auth.uid()) AND public.can_access_tenant(tenant_id));
CREATE POLICY "Tenant staff delete leads" ON public.leads FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()) AND public.can_access_tenant(tenant_id));

DROP POLICY IF EXISTS "No public read access on compras" ON public.compras;
DROP POLICY IF EXISTS "Anyone can insert compras" ON public.compras;
CREATE POLICY "Anyone can insert compras" ON public.compras FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Tenant staff read compras" ON public.compras FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) AND public.can_access_tenant(tenant_id));
CREATE POLICY "Tenant staff update compras" ON public.compras FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()) AND public.can_access_tenant(tenant_id))
  WITH CHECK (public.is_staff(auth.uid()) AND public.can_access_tenant(tenant_id));
CREATE POLICY "Tenant staff delete compras" ON public.compras FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()) AND public.can_access_tenant(tenant_id));

-- =====================================================
-- AUTO-ASSIGN superadmin role to bootstrap email on signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_bootstrap()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email = 'miguel.samaca.samaca@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role, tenant_id)
    VALUES (NEW.id, 'superadmin', NULL)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_bootstrap ON auth.users;
CREATE TRIGGER on_auth_user_created_bootstrap
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_bootstrap();

-- If the superadmin user already exists, grant the role now
INSERT INTO public.user_roles (user_id, role, tenant_id)
SELECT id, 'superadmin', NULL FROM auth.users WHERE email = 'miguel.samaca.samaca@gmail.com'
ON CONFLICT DO NOTHING;

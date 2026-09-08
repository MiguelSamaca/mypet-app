-- Verificación de consistencia multi-tenant (Fase 0)
-- Ejecutar en Supabase → SQL Editor. Solo lectura, no modifica nada.

-- 1. Tenants existentes
select id, nombre, slug, plan, estado from public.tenants;

-- 2. Conteo de filas y distribución de tenant_id por tabla de negocio
select 'perros' as tabla, tenant_id, count(*) from public.perros group by tenant_id
union all
select 'visitas', tenant_id, count(*) from public.visitas group by tenant_id
union all
select 'movimientos', tenant_id, count(*) from public.movimientos group by tenant_id
union all
select 'productos_boutique', tenant_id, count(*) from public.productos_boutique group by tenant_id
union all
select 'clientes_boutique', tenant_id, count(*) from public.clientes_boutique group by tenant_id
union all
select 'movimientos_inventario', tenant_id, count(*) from public.movimientos_inventario group by tenant_id
union all
select 'leads', tenant_id, count(*) from public.leads group by tenant_id
union all
select 'tarifas', tenant_id, count(*) from public.tarifas group by tenant_id
union all
select 'proveedores', tenant_id, count(*) from public.proveedores group by tenant_id
union all
select 'categorias_finanzas', tenant_id, count(*) from public.categorias_finanzas group by tenant_id
union all
select 'categorias_boutique', tenant_id, count(*) from public.categorias_boutique group by tenant_id
union all
select 'marcas_boutique', tenant_id, count(*) from public.marcas_boutique group by tenant_id
union all
select 'compras', tenant_id, count(*) from public.compras group by tenant_id
order by tabla;

-- Resultado esperado: TODAS las filas con tenant_id = 00000000-0000-0000-0000-000000000001
-- (el id real del tenant Mayte Pet Hotel). Si aparece otro tenant_id o NULL,
-- esas filas necesitan corrección antes de dar de alta un segundo tenant.

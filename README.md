# MyPet — Plataforma de gestión para guarderías caninas

Plataforma multi-tenant para guarderías y hoteles caninos. Nació como la app de operación de **Mayte Pet Hotel** (Bogotá) y está evolucionando a un SaaS modular para guarderías en Colombia y LatAm, con registro de asistencia agéntico por WhatsApp como producto estrella.

## Stack

- **Frontend:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Postgres + RLS multi-tenant, Edge Functions, Storage, Auth)
- **IA:** Gemini 2.5 Flash (transcripción de audio en `transcribe-peludo`)

## Desarrollo local

```sh
npm install
npm run dev        # http://localhost:8080
```

Variables de entorno (`.env`):

```
VITE_SUPABASE_PROJECT_ID=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_URL=...
```

## Estructura

```
src/
├── pages/            # Landing pública + panel admin (Dashboard, Peludos,
│                     # Finanzas, Boutique, CRM, Marketing, Superadmin)
├── components/       # UI (shadcn) + módulos boutique/finanzas
├── integrations/     # Cliente Supabase
supabase/
├── functions/        # Edge Functions: notify-lead, register-purchase,
│                     # transcribe-peludo
└── migrations/       # Migraciones SQL
```

## Módulos

| Módulo | Descripción |
|---|---|
| Peludos | Fichas de perros + perfil público por código de acceso |
| Visitas | Estadías con actividades, fotos y calificaciones |
| Finanzas | Ingresos/egresos por unidad de negocio |
| Boutique | Inventario, proveedores, clientes, compras |
| CRM / Marketing | Clientes y leads capturados desde la landing |
| Superadmin | Gestión de tenants (guarderías) y módulos activos |

## Secretos de Edge Functions (Supabase → Settings → Edge Functions)

- `GEMINI_API_KEY` — transcripción de audio
- `SHOPIFY_STORE_URL`, `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET` — sincronización Shopify
- `META_CONVERSIONS_API_TOKEN` — Conversions API de Meta

## Multi-tenant

Cada guardería es un registro en `tenants`; el aislamiento de datos se hace con políticas RLS (`can_access_tenant`, `is_staff`, `is_superadmin`) sobre `tenant_id` en todas las tablas de negocio. Los módulos se activan por tenant en `tenant_modules`.

# CLAUDE.md — MyPet

Plataforma multi-tenant para guarderías caninas. Nació como la app de Mayte Pet Hotel (Bogotá) y está evolucionando a un SaaS modular para guarderías en Colombia/LatAm. El plan maestro por fases vive en el artifact "Plan Maestro" (memoria de Claude) — killer feature en construcción: registro de asistencia agéntico por WhatsApp.

## Comandos

```sh
npm run dev      # servidor Vite en http://localhost:8080
npm run build    # build de producción
npm run lint     # eslint
```

No hay tests configurados todavía.

## Arquitectura

- **SPA React 18 + TypeScript** (Vite, Tailwind, shadcn/ui en `src/components/ui/`).
- **Supabase es el backend completo**: Postgres con RLS, Auth, Storage (bucket público `peludos` para fotos), Edge Functions en `supabase/functions/`.
- Cliente Supabase en `src/integrations/supabase/` — los tipos se regeneran con el CLI de Supabase, no editarlos a mano.
- Rutas: landing pública en `Index.tsx`; panel admin en `src/pages/Admin*.tsx`; perfil público de perro en `PeludoProfile.tsx` (acceso por `codigo_acceso`, vía funciones `get_perro_publico` / `get_visitas_publicas`).

## Multi-tenant (crítico)

- Cada guardería = fila en `tenants`. El tenant de Mayte Pet Hotel es `00000000-0000-0000-0000-000000000001` (sí, ese UUID es el real, no un dummy).
- **Toda tabla de negocio lleva `tenant_id NOT NULL`** + políticas RLS con el patrón `is_staff(auth.uid()) AND can_access_tenant(tenant_id)`. Tabla nueva = mismo patrón, sin excepciones.
- Funciones SQL clave: `has_role`, `is_superadmin`, `current_tenant_id`, `can_access_tenant`, `get_tenant_by_slug`.
- `tenant_modules` activa módulos por guardería; `tenants` ya tiene `slug`, `logo_url`, `color_primario` para branding.
- `leads` y `compras` permiten INSERT anónimo (formularios de la landing); lectura solo staff. No replicar ese patrón en otras tablas sin razón.

## Edge Functions y secretos

| Función | Qué hace | Secretos |
|---|---|---|
| `transcribe-peludo` | Audio → JSON estructurado (visitas/perfiles) con Gemini 2.5 Flash directo | `GEMINI_API_KEY` |
| `notify-lead` | Notifica leads + Meta Conversions API | `META_CONVERSIONS_API_TOKEN`, Shopify |
| `register-purchase` | Registra compras + sincroniza Shopify | `SHOPIFY_*`, `SUPABASE_SERVICE_ROLE_KEY` |

Deploy de funciones: `supabase functions deploy <nombre>` (requiere CLI de Supabase logueado).

## Convenciones

- Idioma del dominio: **español** (perros, visitas, movimientos, papitos, peludos). Mantenerlo en tablas, campos y UI.
- Migraciones SQL en `supabase/migrations/` con timestamp; nunca cambiar el esquema solo desde el dashboard sin dejar la migración en el repo.
- `db-export/` contiene un export con datos reales de clientes — está en `.gitignore` y **jamás debe commitearse** (el repo es público).
- El `.env` solo contiene claves públicas de Supabase (`VITE_*`); los secretos viven en Supabase Edge Functions.

## Infraestructura (desde sep 2026 — fuera de Lovable)

- **Supabase**: proyecto propio `fxalcejjkftwlegocsys`, organización `MaytePetHotel`,
  región `us-east-1`. Reemplaza a `cvhzsanjnkmqzrjdgcjh`, que era un backend de
  Lovable Cloud y ya no es la fuente de verdad.
  - Conexión directa `db.<ref>.supabase.co` **no resuelve por IPv4**: usar el pooler
    `postgresql://postgres.<ref>:<pass>@aws-0-us-east-1.pooler.supabase.com:5432/postgres`.
- **Deploy**: Vercel, equipo `MAYTE` (`mayte3`), proyecto `mypet-app`.
  Vercel usa sus propias variables del panel, no el `.env` del repo.
  `vercel.json` trae los rewrites de SPA — sin ellos, recargar `/admin` da 404.
- **Storage**: bucket público `peludos` (672 archivos, 132 MB). Las fotos se
  optimizaron a máx 1600px manteniendo ruta y extensión originales, porque las URLs
  están incrustadas en `perros.foto_url` y `visitas.fotos_galeria`. Los originales
  sin optimizar (1.6 GB) están solo en el disco local, en `backup-mayte/storage/`.
- **Plan gratuito**: 1 GB de storage y 500 MB de base. Si el storage se acerca al
  límite, optimizar antes de pagar Pro.

Scripts de migración en `scripts/migracion/` (bajar storage, optimizar, subir).

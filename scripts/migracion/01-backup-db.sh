#!/usr/bin/env bash
# Respaldo completo de la BD de origen (Lovable) -> backup-mayte/
# Usa la lógica oficial del CLI de Supabase (--dry-run) ejecutada con el pg_dump nativo.
set -euo pipefail

cd "$(dirname "$0")/../.."
[ -f .env.migracion ] || { echo "ERROR: falta .env.migracion"; exit 1; }
set -a; . ./.env.migracion; set +a
[ -n "${ORIGEN_DB_URL:-}" ] || { echo "ERROR: ORIGEN_DB_URL vacío en .env.migracion"; exit 1; }

command -v pg_dump >/dev/null || { echo "ERROR: pg_dump no está en el PATH"; exit 1; }
echo "pg_dump: $(pg_dump --version)"

OUT="backup-mayte/$(date +%Y%m%d-%H%M)"
mkdir -p "$OUT"
echo "Destino: $OUT"

dump () {  # $1 = nombre, $2... = flags del CLI
  local nombre="$1"; shift
  echo "--- $nombre ---"
  npx --yes supabase@latest db dump --db-url "$ORIGEN_DB_URL" "$@" --dry-run 2>/dev/null \
    | sed -n '/^#!\/usr\/bin\/env bash/,$p' > "$OUT/.$nombre.sh"
  bash "$OUT/.$nombre.sh" > "$OUT/$nombre.sql"
  rm -f "$OUT/.$nombre.sh"
  echo "$nombre.sql -> $(wc -l < "$OUT/$nombre.sql") líneas, $(du -h "$OUT/$nombre.sql" | cut -f1)"
}

dump roles  --role-only
dump schema
dump data   --data-only --use-copy

echo
echo "Respaldo terminado en $OUT"
ls -la "$OUT"

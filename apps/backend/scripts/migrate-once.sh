#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[MIGRATION ERROR] DATABASE_URL is not set" >&2
  exit 1
fi

echo "[MIGRATION] Verifying canonical migration files..."
node ./scripts/verify-migration-integrity.mjs --files-only

# Prisma's migration engine does not reliably inherit shell PGOPTIONS. Encode
# bounded lock and statement timeouts without printing the derived URL.
MIGRATION_DATABASE_URL=$(node -e '
  try {
    const url = new URL(process.env.DATABASE_URL);
    url.searchParams.set("options", "-c lock_timeout=5s -c statement_timeout=300s");
    process.stdout.write(url.toString());
  } catch {
    process.stderr.write("[MIGRATION ERROR] DATABASE_URL is invalid\n");
    process.exit(1);
  }
')

echo "[MIGRATION] Applying canonical Prisma migrations..."
if ! DATABASE_URL="$MIGRATION_DATABASE_URL" prisma migrate deploy \
  --schema ./packages/database/prisma/schema.prisma \
  --config ./packages/database/prisma.config.js; then
  echo "[MIGRATION ERROR] prisma migrate deploy failed" >&2
  exit 1
fi

echo "[MIGRATION] Verifying migration ledger and required relations..."
node ./scripts/verify-migration-integrity.mjs

echo "[MIGRATION] Verifying database schema parity..."
node ./scripts/verify-schema-parity.mjs

echo "[MIGRATION] Verifying canonical RBAC database contract..."
node ./scripts/verify-rbac-database.mjs

echo "[MIGRATION] Canonical migration pass complete."

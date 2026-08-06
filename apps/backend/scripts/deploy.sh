#!/bin/sh
set -eu

echo "--- Starting Deployment ---"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[DEPLOY ERROR] DATABASE_URL is not set"
  exit 1
fi

echo "[DEPLOY] Verifying canonical migration files..."
node ./scripts/verify-migration-integrity.mjs --files-only

# Prisma's migration engine does not reliably inherit shell PGOPTIONS. Encode
# lock and statement timeouts into a derived URL without printing credentials.
MIGRATION_DATABASE_URL=$(node -e '
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set("options", "-c lock_timeout=5s -c statement_timeout=300s");
  process.stdout.write(url.toString());
')

echo "[DEPLOY] Applying canonical Prisma migrations..."
if ! DATABASE_URL="$MIGRATION_DATABASE_URL" prisma migrate deploy \
  --schema ./packages/database/prisma/schema.prisma \
  --config ./packages/database/prisma.config.js; then
  echo "[DEPLOY ERROR] prisma migrate deploy failed; refusing to start the application"
  exit 1
fi

echo "[DEPLOY] Verifying migration ledger and required relations..."
node ./scripts/verify-migration-integrity.mjs

echo "[DEPLOY] Starting application..."
if [ -f "apps/backend/dist/main.js" ]; then
  exec node apps/backend/dist/main.js
fi

if [ -f "apps/backend/dist/src/main.js" ]; then
  echo "[DEPLOY WARNING] Falling back to legacy dist/src/main.js path"
  exec node apps/backend/dist/src/main.js
fi

echo "[DEPLOY ERROR] No compiled main.js found in apps/backend/dist/"
exit 1

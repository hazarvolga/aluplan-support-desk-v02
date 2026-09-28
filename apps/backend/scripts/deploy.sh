#!/bin/sh
set -eu

echo "--- Starting Deployment ---"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[DEPLOY ERROR] DATABASE_URL is not set"
  exit 1
fi

if ! ./apps/backend/scripts/migrate-once.sh; then
  echo "[DEPLOY ERROR] migration pass failed; refusing to start the application"
  exit 1
fi

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

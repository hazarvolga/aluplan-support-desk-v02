#!/bin/sh
set -e

echo "--- Starting Deployment ---"

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set"
  exit 1
fi

echo "Running Prisma migrations..."
npx prisma migrate deploy \
  --schema ./packages/database/prisma/schema.prisma \
  --config ./packages/database/prisma.config.js

echo "Running Production Data Synchronization (Seeding & Recovery)..."
node packages/database/scripts/production-sync.js || echo "Warning: production-sync.js failed but continuing..."
node apps/backend/scripts/grant-admin.js || echo "Warning: grant-admin.js failed but continuing..."
node apps/backend/scripts/fix-customer-roles.js || echo "Warning: fix-customer-roles.js failed but continuing..."

echo "Starting application..."
# Prefer the canonical dist/main.js produced by `nest build`. The
# dist/src/main.js fallback is only there because older builds emitted to
# a nested path; new code (CSRF bypass paths, etc.) is NOT in that file.
# Loading the stale variant masks the new bypass and silently 403's
# /api/v1/auth/login despite the route being declared @Public.
if [ -f "apps/backend/dist/main.js" ]; then
  node apps/backend/dist/main.js
elif [ -f "apps/backend/dist/src/main.js" ]; then
  echo "WARNING: falling back to legacy dist/src/main.js path"
  node apps/backend/dist/src/main.js
else
  echo "ERROR: no compiled main.js found in apps/backend/dist/"
  exit 1
fi


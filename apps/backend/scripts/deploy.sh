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
node apps/backend/scripts/fix-customer-roles.js || echo "Warning: fix-customer-roles.js failed but continuing..."

echo "Starting application..."
node apps/backend/dist/src/main.js

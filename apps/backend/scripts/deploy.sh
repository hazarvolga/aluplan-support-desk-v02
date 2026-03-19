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

echo "Enforcing Admin Role for Admin User..."
node ./apps/backend/scripts/grant-admin.js || echo "Failed to run grant-admin script but continuing..."

echo "Starting application..."
node apps/backend/dist/src/main.js

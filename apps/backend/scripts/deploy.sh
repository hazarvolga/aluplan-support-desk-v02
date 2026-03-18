#!/bin/sh
set -e

echo "--- Starting Deployment Script (Cross-Version Stability Mode) ---"

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set"
  exit 1
fi

SCHEMA_FILE="./packages/database/prisma/schema.prisma"
TEMP_SCHEMA="/tmp/migration.prisma"

# 1. Version Bridge: Prepare schema for Prisma 6 Migration
# Prisma 7 forbids 'url' in schema when using driverAdapters, but Prisma 6 requires it for migrations.
# We surgically add 'url = env("DATABASE_URL")' to a temp schema for the migration phase.
echo "Preparing migration-ready schema (v6 compatibility)..."
sed "/provider.*=.*\"postgresql\"/a \  url = env(\"DATABASE_URL\")" "$SCHEMA_FILE" > "$TEMP_SCHEMA"

# 2. Run Prisma migrations using Prisma 6 (The Stability Layer)
echo "Running Prisma migrations using Prisma 6..."
# Using --no-install to ensure we use the pre-bundled binary in Docker
npx --no-install prisma@6.4.1 migrate deploy --schema "$TEMP_SCHEMA"

# 3. Start the application (NestJS using Prisma 7 internaaly)
echo "Starting application..."
node apps/backend/dist/src/main.js

#!/bin/sh
set -e

echo "--- Starting Deployment Script ---"

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set"
  exit 1
fi

# 1. Forge the temporary shadow schema (The DevOps Ultimate Bypass)
echo "Injecting DATABASE_URL into temporary schema..."
SCHEMA_FILE="./packages/database/prisma/schema.prisma"
TEMP_SCHEMA="/tmp/prod.prisma"

# Using sed to append the url property after the provider line
# This ensures Prisma 7 sees a hardcoded URL string and doesn't look for a config file
sed "/provider.*=.*\"postgresql\"/a \  url = \"${DATABASE_URL}\"" "$SCHEMA_FILE" > "$TEMP_SCHEMA"

echo "Temporary schema created at $TEMP_SCHEMA"

# 2. Run Prisma migrations against the forged schema
echo "Running Prisma migrations..."
npx prisma@7.4.2 migrate deploy --schema "$TEMP_SCHEMA"

# 3. Start the application
echo "Starting application..."
node apps/backend/dist/src/main.js

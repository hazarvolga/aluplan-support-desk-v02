#!/bin/bash

# Aluplan Support Desk - Local to Live Sync Tool
# This script helps export local Data & Knowledge Pool to the production environment.

set -e

echo "🚀 Aluplan Sync Tool 2.4 - Initiating Local to Live Transfer"

# Try to load local .env if available
if [ -f "apps/backend/.env" ]; then
    echo "📄 Loading credentials from apps/backend/.env"
    while IFS= read -r line || [ -n "$line" ]; do
        # Remove comments and leading/trailing whitespace
        clean_line=$(echo "$line" | sed -e 's/#.*//' -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
        # Only process lines with '='
        if [[ "$clean_line" == *"="* ]]; then
            # Export the variable, handling potential quotes
            key=$(echo "$clean_line" | cut -d '=' -f 1)
            value=$(echo "$clean_line" | cut -d '=' -f 2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            export "$key"="$value"
        fi
    done < apps/backend/.env
    # Parse DATABASE_URL if individual vars aren't set
    if [ -z "$DATABASE_USER" ] && [ -n "$DATABASE_URL" ]; then
       # Extract user:pass@host:port/db from postgresql://user:pass@host:port/db
       DB_CREDS=$(echo $DATABASE_URL | sed -e 's/postgresql:\/\///' -e 's/\/.*//')
       export DATABASE_USER=$(echo $DB_CREDS | cut -d: -f1)
       export DATABASE_PASSWORD=$(echo $DB_CREDS | cut -d: -f2 | cut -d@ -f1)
       export DATABASE_NAME=$(echo $DATABASE_URL | rev | cut -d/ -f1 | rev | cut -d? -f1)
    fi
fi

# Fallback defaults if still empty
DATABASE_USER=${DATABASE_USER:-postgres}
DATABASE_PASSWORD=${DATABASE_PASSWORD:-changeme}
DATABASE_NAME=${DATABASE_NAME:-aluplan_support}

# 1. Export Database
echo "📦 Exporting Local Database ($DATABASE_NAME)..."
# We use pg_dump to export the schema and data
# Excluding Audit logs to keep it light if needed
PGPASSWORD=$DATABASE_PASSWORD pg_dump -h localhost -U $DATABASE_USER -d $DATABASE_NAME --no-owner --no-privileges > backup_full.sql

echo "✅ Database exported to backup_full.sql"

# 2. Sync Knowledge Pool (RAG Dataset)
echo "🧠 Syncing Knowledge Pool Dataset..."
# Local dataset is in /dataset
# We rely on the Docker image copying /dataset and seed-kp.js running on start.
# This part is automated via the Dockerfile.

# 3. Instructions for Coolify
echo ""
echo "----------------------------------------------------------"
echo "🛠️  SYNC COMPLETE (LOCAL SIDE)"
echo "----------------------------------------------------------"
echo "Follow these steps to import YOUR data to Coolify:"
echo ""
echo "1. Create a Backup in Coolify (Recommended first)."
echo "2. Access your Coolify Database terminal or use 'psql':"
echo "   cat backup_full.sql | psql -h <LIVE_HOST> -U <LIVE_USER> -d <LIVE_DB>"
echo "3. Redeploy the Backend to trigger Knowledge Pool seeding."
echo "----------------------------------------------------------"

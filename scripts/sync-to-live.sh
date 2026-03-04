#!/bin/bash

# Aluplan Support Desk - Local to Live Sync Tool
# This script helps export local Data & Knowledge Pool to the production environment.

set -e

echo "🚀 Aluplan Sync Tool 2.4 - Initiating Local to Live Transfer"

# 1. Export Database
echo "📦 Exporting Local Database (PostgreSQL)..."
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

#!/bin/bash

# Aluplan Support Desk - Automated DB Backup Script
# Requires: pg_dump, date, find

# Load environment variables if .env exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

DB_URL=${DATABASE_URL}
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/aluplan_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=7

# Create backup directory if not exists
mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting database backup..."

# Extract connection info from URL or use environment variables
# Note: pg_dump handles DATABASE_URL if passed as first argument
if pg_dump "${DB_URL}" | gzip > "${BACKUP_FILE}"; then
  echo "✅ Backup successful: ${BACKUP_FILE}"
else
  echo "❌ Backup failed!"
  exit 1
fi

# Cleanup old backups
echo "[$(date)] Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "aluplan_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

echo "✨ Maintenance completed."

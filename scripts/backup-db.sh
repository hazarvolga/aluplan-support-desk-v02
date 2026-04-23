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
  
  # DR: Upload to external storage (S3) if bucket is configured
  if [ -n "$AWS_S3_BACKUP_BUCKET" ]; then
    echo "[$(date)] Uploading to S3 for Disaster Recovery..."
    if aws s3 cp "${BACKUP_FILE}" "s3://${AWS_S3_BACKUP_BUCKET}/db-backups/$(basename ${BACKUP_FILE})"; then
      echo "✅ Disaster Recovery: S3 Sync successful."
    else
      echo "⚠️ S3 Sync failed. Backup remains local only."
    fi
  fi
else
  echo "❌ Backup failed!"
  exit 1
fi

# Cleanup old backups
echo "[$(date)] Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "aluplan_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

echo "✨ Maintenance completed."

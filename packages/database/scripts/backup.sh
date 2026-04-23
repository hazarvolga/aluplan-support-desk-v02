#!/bin/bash
# Alüplan Support Desk - DR Readiness Backup Script (Phase 2)
# GAP-04: Basic backup setup before moving to WAL-G continuous archiving
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set."
  exit 1
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_$TIMESTAMP.sql"

echo "Starting Database Backup..."
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

echo "Compressing Backup..."
gzip "$BACKUP_FILE"

echo "Backup completed: ${BACKUP_FILE}.gz"

# NOTE: Future state -> WAL-G continuous archiving to S3/Minio
# aws s3 cp "${BACKUP_FILE}.gz" s3://aluplan-backups/db/

#!/usr/bin/env bash
# =============================================================================
# Disaster Recovery Drill Script — Sprint 1 Skeleton
# =============================================================================
# GAP-04 Remediation: Automated restore validation
# Usage: ./scripts/dr-drill.sh [backup-url]
# Prerequisites: docker, pg_restore, psql, aws-cli (for R2/S3)
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_URL="${1:-}"                          # Optional: direct S3/R2 URL
TEMP_DIR="$(mktemp -d -t dr-drill-XXXXXX)"
REPORT_FILE="$TEMP_DIR/dr-report.txt"
DISPOSABLE_DB="aluplan_dr_test_$(date +%s)"
POSTGRES_IMAGE="pgvector/pgvector:pg16"
CONTAINER_NAME="dr_postgres_$(date +%s)"

# ─── Colour Output ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[DR-DRILL]${NC} $*" | tee -a "$REPORT_FILE"; }
warn() { echo -e "${YELLOW}[DR-WARN]${NC} $*" | tee -a "$REPORT_FILE"; }
err()  { echo -e "${RED}[DR-ERROR]${NC} $*" | tee -a "$REPORT_FILE"; }

# ─── Cleanup Trap ───────────────────────────────────────────────────────────
cleanup() {
    warn "Cleaning up temporary resources..."
    docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# ─── Header ─────────────────────────────────────────────────────────────────
log "================================================"
log "  Aluplan DR Drill — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
log "================================================"
log "Temp dir: $TEMP_DIR"
log "Disposable DB: $DISPOSABLE_DB"

# ─── Step 1: Download Latest Backup ─────────────────────────────────────────
log "Step 1/5: Acquiring latest backup..."
if [ -z "$BACKUP_URL" ]; then
    warn "No backup URL provided. Attempting to find latest from R2..."
    # TODO: Implement R2/S3 listing logic
    # aws s3 ls s3://aluplan-backups/ --recursive | sort | tail -n 1
    err "Auto-discovery not yet implemented. Provide backup URL as argument."
    exit 1
fi

BACKUP_FILE="$TEMP_DIR/backup.sql.gz"
log "Downloading from $BACKUP_URL..."
if command -v curl &>/dev/null; then
    curl -sL "$BACKUP_URL" -o "$BACKUP_FILE"
elif command -v wget &>/dev/null; then
    wget -q "$BACKUP_URL" -O "$BACKUP_FILE"
else
    err "Neither curl nor wget available"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ] || [ ! -s "$BACKUP_FILE" ]; then
    err "Backup download failed or empty"
    exit 1
fi
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Downloaded backup: $BACKUP_SIZE"

# ─── Step 2: Spin Up Disposable Postgres ────────────────────────────────────
log "Step 2/5: Starting disposable Postgres container..."
docker run -d \
    --name "$CONTAINER_NAME" \
    -e POSTGRES_DB="$DISPOSABLE_DB" \
    -e POSTGRES_USER=dr_user \
    -e POSTGRES_PASSWORD=dr_password \
    -p "5433:5432" \
    "$POSTGRES_IMAGE" >/dev/null

# Wait for Postgres
for i in {1..30}; do
    if docker exec "$CONTAINER_NAME" pg_isready -U dr_user -d "$DISPOSABLE_DB" &>/dev/null; then
        log "Postgres ready on port 5433"
        break
    fi
    sleep 1
done

# ─── Step 3: Restore ────────────────────────────────────────────────────────
log "Step 3/5: Restoring backup..."
RESTORE_START=$(date +%s)

if file "$BACKUP_FILE" | grep -q gzip; then
    gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U dr_user -d "$DISPOSABLE_DB" >/dev/null 2>&1
else
    docker exec -i "$CONTAINER_NAME" psql -U dr_user -d "$DISPOSABLE_DB" < "$BACKUP_FILE" >/dev/null 2>&1
fi

RESTORE_END=$(date +%s)
RESTORE_TIME=$((RESTORE_END - RESTORE_START))
log "Restore completed in ${RESTORE_TIME}s"

# ─── Step 4: Sanity Checks ──────────────────────────────────────────────────
log "Step 4/5: Running sanity checks..."
SANITY_PASSED=0
SANITY_FAILED=0

check_query() {
    local name="$1"
    local query="$2"
    local expected="${3:-}"

    result=$(docker exec "$CONTAINER_NAME" psql -U dr_user -d "$DISPOSABLE_DB" -tAc "$query" 2>/dev/null || echo "ERROR")
    if [ "$result" = "ERROR" ]; then
        err "Sanity check FAILED: $name — query error"
        ((SANITY_FAILED++)) || true
        return
    fi

    if [ -n "$expected" ] && [ "$result" != "$expected" ]; then
        err "Sanity check FAILED: $name — expected '$expected', got '$result'"
        ((SANITY_FAILED++)) || true
        return
    fi

    log "Sanity check PASSED: $name = $result"
    ((SANITY_PASSED++)) || true
}

check_query "Database connectivity" "SELECT 1" "1"
check_query "Users table exists" "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='users'" "1"
check_query "Tickets table exists" "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='tickets'" "1"
check_query "pgvector extension" "SELECT COUNT(*) FROM pg_extension WHERE extname='vector'" "1"
# TODO: Add row-count thresholds after baseline is established
check_query "Users row count" "SELECT COUNT(*) FROM users"
check_query "Tickets row count" "SELECT COUNT(*) FROM tickets"
check_query "FK integrity check" "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type='FOREIGN KEY'"

# ─── Step 5: Report ─────────────────────────────────────────────────────────
log "Step 5/5: Generating report..."
{
    echo ""
    echo "================================================"
    echo "  DR DRILL REPORT"
    echo "  Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "  Backup: $BACKUP_URL"
    echo "  Restore Time: ${RESTORE_TIME}s"
    echo "  Sanity: $SANITY_PASSED passed, $SANITY_FAILED failed"
    echo "================================================"
    echo ""
    echo "RPO/RTO Notes:"
    echo "  - RPO: Depends on backup frequency (target: <24h)"
    echo "  - RTO: ${RESTORE_TIME}s (target: <1h)"
    echo ""
    echo "Next Steps:"
    echo "  [ ] Integrate with WAL-G for PITR"
    echo "  [ ] Automate via GitHub Action (.github/workflows/dr-drill.yml)"
    echo "  [ ] Add Slack webhook notification"
    echo "  [ ] Establish row-count baseline for production"
} >> "$REPORT_FILE"

log "================================================"
log "  DR Drill Complete"
log "  Sanity: $SANITY_PASSED passed, $SANITY_FAILED failed"
log "  Restore Time: ${RESTORE_TIME}s"
log "  Report: $REPORT_FILE"
log "================================================"

if [ "$SANITY_FAILED" -gt 0 ]; then
    err "DR DRILL FAILED — $SANITY_FAILED sanity checks failed"
    exit 1
fi

log "DR DRILL PASSED ✅"
exit 0

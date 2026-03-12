#!/bin/bash

# Aluplan Service Monitor
# Configuration
BACKEND_URL="http://localhost:4000/api/v1/health"
FRONTEND_URL="http://localhost:3000"
STATUS_FILE="monitoring_status.json"
LOG_FILE="monitoring.log"

log() {
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $1" | tee -a "$LOG_FILE"
}

check() {
    backend_status="down"
    frontend_status="down"
    
    # Check Backend
    if curl -s -f --max-time 3 "$BACKEND_URL" | grep -q '"status":"ok"'; then
        backend_status="up"
    fi
    
    # Check Frontend
    if curl -s -f --max-time 3 "$FRONTEND_URL" > /dev/null; then
        frontend_status="up"
    fi
    
    # Check Database for recent errors
    db_errors=0
    if [ -f ".env" ]; then
        db_url=$(grep "^DATABASE_URL=" .env | cut -d '=' -f 2- | tr -d '"')
        if [ ! -z "$db_url" ]; then
            # Check for errors in last 15 mins
            # Note: We use -t to get only the value and tr to clean non-digits
            db_errors=$(psql "$db_url" -t -c "SELECT count(*) FROM \"AuditLog\" WHERE action LIKE 'error.%' AND \"createdAt\" > NOW() - INTERVAL '15 minutes';" 2>/dev/null | tr -cd '0-9' || echo "0")
        fi
    fi

    redis_status="down"
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping 2>/dev/null | grep -q 'PONG'; then
            redis_status="up"
        fi
    fi

    # Ensure db_errors is not empty
    if [ -z "$db_errors" ]; then db_errors=0; fi

    # Update Status File
    echo "{\"backend\": \"$backend_status\", \"frontend\": \"$frontend_status\", \"redis\": \"$redis_status\", \"db_errors\": $db_errors, \"lastCheck\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "$STATUS_FILE"
    
    if [ "$backend_status" != "up" ] || [ "$frontend_status" != "up" ] || [ "$redis_status" != "up" ] || [ "$db_errors" -gt 0 ]; then
        log "⚠️ ALERT! Backend:$backend_status Frontend:$frontend_status Redis:$redis_status DB_Errors:$db_errors"
    else
        log "✅ Services healthy. (B:up, F:up, R:up, DB:0-errors)"
    fi
}

log "--- Aluplan Monitoring Started ---"
if [ "$1" == "--once" ]; then
    check
    exit 0
fi

while true; do
    check
    sleep 60
done

#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# 📦 Aluplan Support Desk — Production Database Export Utility
# ═══════════════════════════════════════════════════════════════════
# Bu script, lokal Docker ortamındaki `aluplan_support` veritabanının
# tam bir kopyasını (şema + veriler + auth + loglar + ayarlar) alarak
# uzak sunucuya (production) aktarılmaya hazır hale getirir.
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'
BOLD='\033[1m'

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_FILE="${PROJECT_DIR}/aluplan_production_ready.sql"

echo -e "${BLUE}⚡ Veritabanı yedeği alınıyor (pg_dump)...${NC}"

cd "$PROJECT_DIR"

if docker compose exec -T postgres pg_dump -U postgres -d aluplan_support -c --if-exists > "$BACKUP_FILE"; then
    echo -e "${GREEN}✅ Yedekleme başarılı! Dosya oluşturuldu:${NC}"
    echo -e "   📂 $BACKUP_FILE"
    echo ""
    echo -e "${BLUE}💡 Canlı sunucuya (Örn: Coolify/Docker) aktarmak için:${NC}"
    echo -e "   1. Bu dosyayı sunucuya kopyalayın (scp veya sftp ile)."
    echo -e "   2. Sunucuda şu komutu çalıştırarak içe aktarın:"
    echo -e "      ${BOLD}cat aluplan_production_ready.sql | docker exec -i <postgres_container_name> psql -U postgres -d aluplan_support${NC}"
else
    echo -e "${RED}❌ Yedekleme başarısız oldu. Postgres container'ının çalıştığından emin olun.${NC}"
    exit 1
fi

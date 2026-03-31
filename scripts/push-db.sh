#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# 🚀 Aluplan Support Desk — Production DB Pusher
# ═══════════════════════════════════════════════════════════════════
# Bu script, lokalinizde yer alan `aluplan_production_ready.sql`
# dosyasını doğrudan uzak (production) PostgreSQL veritabanınıza aktarır.
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'
BOLD='\033[1m'

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_FILE="${PROJECT_DIR}/aluplan_production_ready.sql"

echo -e "${BLUE}${BOLD}🚀 Aluplan Support Desk - Veritabanı Canlıya Alma Aracı${NC}\n"

# 1. Yedek dosyasını kontrol et, yoksa oluştur
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${YELLOW}⚠️  Hazır veritabanı SQL yedeği bulunamadı. Otomatik olarak oluşturuluyor...${NC}"
    bash "${PROJECT_DIR}/scripts/export-db.sh"
    echo ""
fi

# 2. Uzak veritabanı (Production) URL'sini al
REMOTE_DB_URL=${PRODUCTION_DATABASE_URL:-}

if [ -z "$REMOTE_DB_URL" ]; then
    echo -e "${YELLOW}Uzak sunucunuzun (Canlı Ortam) PostgreSQL bağlantı adresini girin.${NC}"
    echo -e "Örnek: ${BOLD}postgresql://kullanici:sifre@sunucu_ip:5432/aluplan_db${NC}"
    read -p "Bağlantı URL'si: " REMOTE_DB_URL
fi

if [ -z "$REMOTE_DB_URL" ]; then
    echo -e "\n${RED}❌ Bağlantı adresi girilmedi. İşlem iptal edildi.${NC}"
    exit 1
fi

echo -e "\n${BLUE}⏳ Uzak sunucuya bağlanılıyor ve yerel veritabanı aktarılıyor...${NC}"
echo -e "${YELLOW}Bu işlem veritabanı boyutuna ve internet hızınıza göre birkaç dakika sürebilir.${NC}\n"

# 3. Docker içindeki psql komutunu kullanarak, yerel dump dosyasını okuyup uzak veritabanına yazdır.
# Not: Yüklü psql kullanıcının ana makinesinde (Mac/Windows) olmayabileceği için her zaman var olan postgres container'ı üzerinden çalıştırılır.
if cat "$BACKUP_FILE" | docker compose -f "${PROJECT_DIR}/docker-compose.yml" exec -T postgres psql "$REMOTE_DB_URL"; then
    echo -e "\n${GREEN}${BOLD}🎉 HARİKA! Veritabanı başarıyla uzak sunucuya aktarıldı.${NC}"
    echo -e "✅ API anahtarlarınız, yetkileriniz, SLA ayarlarınız ve CRM verileriniz canlı ortama klonlandı."
    echo -e "🚀 Projeyi tek tıkla kurup deploy edebilirsiniz!"
else
    echo -e "\n${RED}❌ Aktarım sırasında bir hata oluştu.${NC}"
    echo -e "Lütfen şunları kontrol edin:"
    echo -e "  1. Uzak sunucu PostgreSQL adresi ve şifresinin doğruluğu."
    echo -e "  2. Uzak sunucunun güvenlik duvarı izinleri (Dışarıdan erişime açık mı?)."
    echo -e "  3. Eklediğiniz şifrede özel karakterler varsa URL encode edildiğinden (Örn: %20 gibi) emin olun."
    exit 1
fi

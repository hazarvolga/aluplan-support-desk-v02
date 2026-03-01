#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# 🚀 Aluplan Support Desk — Pre-flight Startup Script
# ═══════════════════════════════════════════════════════════════════
# Bu script projeyi başlatmadan önce tüm bağımlılıkları kontrol eder:
#   1. Port 3000 & 4000 zombi process temizliği
#   2. Docker Desktop kontrolü ve başlatma
#   3. Docker Compose servisleri (Postgres, Redis, Ollama)
#   4. Ollama modelleri kontrolü
#   5. Uygulama başlatma (pnpm dev)
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Colors ─────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# ── Config ─────────────────────────────────────────────────────────
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_PORT=3000
BACKEND_PORT=4000
DOCKER_WAIT_TIMEOUT=30
POSTGRES_WAIT_TIMEOUT=30
OLLAMA_MODELS=("nomic-embed-text" "llama3.2:3b")

# ── Helpers ────────────────────────────────────────────────────────
log_step()    { echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${BOLD}${BLUE}⚡ STEP $1:${NC} $2"; echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }
log_ok()      { echo -e "  ${GREEN}✅ $1${NC}"; }
log_warn()    { echo -e "  ${YELLOW}⚠️  $1${NC}"; }
log_fail()    { echo -e "  ${RED}❌ $1${NC}"; }
log_info()    { echo -e "  ${BLUE}ℹ️  $1${NC}"; }
log_action()  { echo -e "  ${YELLOW}🔧 $1${NC}"; }

# ═══════════════════════════════════════════════════════════════════
# STEP 1: Port Cleanup — Kill zombie processes on 3000 & 4000
# ═══════════════════════════════════════════════════════════════════
kill_port() {
    local port=$1
    local pids
    pids=$(lsof -ti :"$port" 2>/dev/null || true)

    if [[ -n "$pids" ]]; then
        log_warn "Port $port meşgul — PID(ler): $pids"
        log_action "Zombi process'ler sonlandırılıyor..."
        for pid in $pids; do
            kill -9 "$pid" 2>/dev/null || true
        done
        sleep 1

        # Double-check
        local remaining
        remaining=$(lsof -ti :"$port" 2>/dev/null || true)
        if [[ -n "$remaining" ]]; then
            log_warn "Port $port hâlâ meşgul! Yeni PID: $remaining"
            log_warn "Sistem bu portu otomatik olarak yeniden başlatıyor olabilir."
            log_info "Uygulama muhtemelen bir sonraki boş portu kullanacak. Devam ediliyor..."
        else
            log_ok "Port $port temizlendi."
        fi
    else
        log_ok "Port $port boş — hazır."
    fi
}

step_port_cleanup() {
    log_step "1/5" "Port Temizliği (3000 & 4000)"
    kill_port "$FRONTEND_PORT"
    kill_port "$BACKEND_PORT"
}

# ═══════════════════════════════════════════════════════════════════
# STEP 2: Docker Desktop Check
# ═══════════════════════════════════════════════════════════════════
step_docker_check() {
    log_step "2/5" "Docker Desktop Kontrolü"

    if docker info &>/dev/null; then
        log_ok "Docker daemon çalışıyor."
        return 0
    fi

    log_warn "Docker daemon çalışmıyor."
    log_action "Docker Desktop başlatılıyor..."
    open -a Docker 2>/dev/null || open -a "Docker Desktop" 2>/dev/null || {
        log_fail "Docker Desktop bulunamadı! Lütfen Docker Desktop'ı yükleyin."
        exit 1
    }

    # Wait for Docker daemon
    local elapsed=0
    while ! docker info &>/dev/null; do
        if [[ $elapsed -ge $DOCKER_WAIT_TIMEOUT ]]; then
            log_fail "Docker daemon $DOCKER_WAIT_TIMEOUT saniye içinde başlamadı!"
            exit 1
        fi
        sleep 2
        elapsed=$((elapsed + 2))
        echo -ne "  ⏳ Docker bekleniyor... (${elapsed}s/${DOCKER_WAIT_TIMEOUT}s)\r"
    done
    echo ""
    log_ok "Docker daemon hazır. (${elapsed}s)"
}

# ═══════════════════════════════════════════════════════════════════
# STEP 3: Docker Compose Services (Postgres, Redis, Ollama)
# ═══════════════════════════════════════════════════════════════════
step_docker_compose() {
    log_step "3/5" "Altyapı Servisleri (Postgres, Redis, Ollama)"

    cd "$PROJECT_DIR"

    # Check if containers are already running
    local running_count
    running_count=$(docker compose ps --status running -q 2>/dev/null | wc -l | tr -d ' ')

    if [[ "$running_count" -ge 3 ]]; then
        log_ok "Tüm altyapı servisleri zaten çalışıyor ($running_count container)."
    else
        log_action "Docker Compose servisleri başlatılıyor..."
        docker compose up -d postgres redis ollama 2>&1 | sed 's/^/  /'
        log_ok "Docker Compose servisleri başlatıldı."
    fi

    # Wait for PostgreSQL to be healthy
    log_info "PostgreSQL sağlık kontrolü bekleniyor..."
    local pg_elapsed=0
    while true; do
        if docker compose exec -T postgres pg_isready -U postgres &>/dev/null; then
            log_ok "PostgreSQL hazır."
            break
        fi
        if [[ $pg_elapsed -ge $POSTGRES_WAIT_TIMEOUT ]]; then
            log_fail "PostgreSQL $POSTGRES_WAIT_TIMEOUT saniye içinde hazır olmadı!"
            exit 1
        fi
        sleep 2
        pg_elapsed=$((pg_elapsed + 2))
        echo -ne "  ⏳ PostgreSQL bekleniyor... (${pg_elapsed}s/${POSTGRES_WAIT_TIMEOUT}s)\r"
    done
    echo ""

    # Verify Redis
    if docker compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
        log_ok "Redis hazır (PONG)."
    else
        log_warn "Redis henüz yanıt vermiyor, devam ediliyor..."
    fi
}

# ═══════════════════════════════════════════════════════════════════
# STEP 4: Ollama Model Verification
# ═══════════════════════════════════════════════════════════════════
step_ollama_models() {
    log_step "4/5" "Ollama Model Kontrolü"

    # Wait for Ollama API to be ready
    local ollama_elapsed=0
    local ollama_timeout=20
    while true; do
        if curl -sf http://localhost:11434/api/tags &>/dev/null; then
            break
        fi
        if [[ $ollama_elapsed -ge $ollama_timeout ]]; then
            log_warn "Ollama API ${ollama_timeout}s içinde yanıt vermedi. Model kontrolü atlanıyor."
            return 0
        fi
        sleep 2
        ollama_elapsed=$((ollama_elapsed + 2))
    done

    for model in "${OLLAMA_MODELS[@]}"; do
        if curl -sf http://localhost:11434/api/tags | grep -q "$model"; then
            log_ok "Model '$model' mevcut."
        else
            log_warn "Model '$model' bulunamadı."
            log_action "Model indiriliyor: $model (bu birkaç dakika sürebilir)..."
            docker compose exec -T ollama ollama pull "$model" 2>&1 | tail -3 | sed 's/^/  /'
            log_ok "Model '$model' indirildi."
        fi
    done
}

# ═══════════════════════════════════════════════════════════════════
# STEP 5: Launch Application
# ═══════════════════════════════════════════════════════════════════
step_launch() {
    log_step "5/5" "Uygulama Başlatılıyor"

    cd "$PROJECT_DIR"

    echo -e "\n${GREEN}${BOLD}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}${BOLD}  🎉 TÜM PRE-FLIGHT KONTROLLER BAŞARILI!${NC}"
    echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${BLUE}📦 PostgreSQL${NC}  → localhost:5432"
    echo -e "  ${BLUE}📮 Redis${NC}       → localhost:6379"
    echo -e "  ${BLUE}🤖 Ollama${NC}      → localhost:11434"
    echo -e "  ${BLUE}🖥️  Frontend${NC}    → http://localhost:${FRONTEND_PORT}"
    echo -e "  ${BLUE}⚙️  Backend${NC}     → http://localhost:${BACKEND_PORT}"
    echo -e "  ${BLUE}📖 Swagger${NC}     → http://localhost:${BACKEND_PORT}/api/docs"
    echo ""

    log_info "pnpm dev başlatılıyor..."
    exec pnpm dev
}

# ═══════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════
main() {
    echo -e "${BOLD}${CYAN}"
    echo "  ╔══════════════════════════════════════════════════════════╗"
    echo "  ║       🚀 ALUPLAN SUPPORT DESK — STARTUP ENGINE         ║"
    echo "  ║              Pre-flight System Check v1.0               ║"
    echo "  ╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    step_port_cleanup
    step_docker_check
    step_docker_compose
    step_ollama_models
    step_launch
}

main "$@"

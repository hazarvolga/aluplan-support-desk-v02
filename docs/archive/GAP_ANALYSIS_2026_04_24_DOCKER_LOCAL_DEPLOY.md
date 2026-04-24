# Aluplan Support Desk V02 — Docker Local Deploy Öncesi Durum Tespiti

**Tarih:** 24 Nisan 2026  
**Hazırlayan:** AI Assistant  
**Amaç:** Canlı deploy öncesi local Docker ortamında projeyi ayağa kaldırma ve tüm fonksiyonların doğru çalıştığını doğrulama

---

## 1. Executive Summary

Proje Docker ile local deploy edilmeye hazır **değil** — veritabanında kritik migration ve seed sorunları var. Database'de **2 migration başarılı**, **1 migration başarısız** (init_reset) ve **28 migration uygulanmamış** durumda. Ayrıca 0 kullanıcı, 0 department, 0 permission, sadece 1 role (ADMIN) mevcut — yani seed tam çalışmamış.

**Kritik engeller (deploy öncesi çözülmeli):**

1. 28 migration pending — tablolar partially migrated (bazı yeni kolonlar ve tablolar yok)
2. `20260219151110_init_reset` migration FAILED durumda (enum conflict)
3. Seed verisi neredeyse sıfır — 0 user, 0 department, 0 permission
4. `knowledge_sources.language` ve `customer_profiles.subscription_model` kolonları DB'de yok
5. `ai_response_cache` tablosu DB'de yok
6. `ticket_number_seq` sequence'i DB'de yok
7. `docker-compose.yml`'deki backend healthcheck `curl` kullanıyor ama Alpine imajında curl yok

---

## 2. AS-IS Analizi

### 2.1 Docker Compose Mevcut Durum

| Servis | Durum | Sorun |
|--------|-------|-------|
| `postgres` | **Running (healthy)** | ✅ pgvector, uuid-ossp, pg_stat_statements aktif |
| `redis` | **Running (healthy)** | ✅ AOF persistence aktif, 256MB maxmemory, allkeys-lru |
| `backend` | **Çalışmıyor** | Henüz build edilip başlatılmamış |
| `frontend` | **Çalışmıyor** | Henüz build edilip başlatılmamış |
| `backend-worker` | **Çalışmıyor** | Henüz build edilip başlatılmamış |

### 2.2 Database — Kritik Sorunlar

**Migration durumu:**

| Migration | Durum | Açıklama |
|-----------|-------|----------|
| `0_add_ticket_number_seq` | ✅ Applied | Ama sequence DB'de yok |
| `0_init_pg_stat_statements` | ✅ Applied | ✅ Extension aktif |
| `20260219151110_init_reset` | ❌ FAILED | `"UserStatus" already exists` |
| 28 sonraki migration | ⏳ Pending | Uygulanmadı |

**DB'de EKSİK olan yapılar:**

| Eksik | Schema'da Var mı | Risk |
|-------|-------------------|------|
| `customer_profiles.subscription_model` kolonu | ✅ | 🟡 Orta — CRM seeding bozulur |
| `knowledge_sources.language` kolonu | ✅ | 🟡 Orta — KB import bozulur |
| `ai_response_cache` tablosu | ✅ | 🔴 Yüksek — AI cache crash |
| `ticket_number_seq` sequence | ✅ (migration var) | 🔴 Yüksek — Ticket oluşturma crash |
| `idx_customer_company` index | ✅ | 🟡 Orta |
| `idx_customer_external_id` index | ✅ | 🟡 Orta |
| `idx_customer_created` index | ✅ | 🟡 Orta |
| `idx_tickets_created_at` index | ✅ | 🟠 Orta-Yüksek |
| `idx_tickets_status_created_at` index | ✅ | 🟠 Performans |
| `idx_tickets_assigned_status` index | ✅ | 🟠 Performans |
| `idx_tickets_department` index | ✅ | 🟡 Orta |
| `idx_tickets_hotinfo` (GIN) index | ✅ | 🟡 Orta |
| `idx_audit_old` (GIN) index | ✅ | 🟡 Orta |
| `idx_audit_new` (GIN) index | ✅ | 🟡 Orta |

**Seed durumu:**

- 👤 Kullanıcı: **0** (admin yok!)
- 🏢 Department: **0**
- 👥 Team: **0**
- 🔑 Permission: **0**
- ⚙️ Setting: **1** (sadece `rag.infrastructure_version`)
- 📋 Role: **1** (ADMIN — ama hiçbir kullanıcıya atanmamış)

### 2.3 NestJS Modül Yapısı

AppModule **28 feature module** içeriyor:

| Module | Purpose |
|--------|---------|
| PrismaModule | Database access |
| AuthModule | Authentication (JWT, 2FA) |
| UsersModule | User management |
| RbacModule | Role-Based Access Control |
| HealthModule | Health checks (@nestjs/terminus) |
| TicketsModule | Core ticket system |
| AttachmentsModule | File attachments (S3/R2) |
| KnowledgeBaseModule | Knowledge base articles |
| AiModule | AI/RAG interactions |
| FaqModule | FAQ management |
| EmailModule | Email (inbound/outbound) |
| NotificationsModule | User notifications |
| CustomersModule | Customer profiles |
| SettingsModule | System settings |
| MacrosModule | Pre-built responses |
| OmniChannelModule | Multi-channel (email, web, WhatsApp) |
| KnowledgePoolModule | Knowledge source ingestion/embeddings |
| ProductsModule | Product taxonomy |
| WhatsAppModule | WhatsApp integration |
| ReportsModule | Reporting/analytics |
| WebhooksModule | Webhook events |
| RedisModule | Redis connection management |
| AutomationModule | Rule-based automation |
| TeamsModule | Team management |
| BrandingModule | White-label branding |
| CrmModule | CRM integrations (Dynamics 365) |
| AnnouncementsModule | Bulk announcements |
| AnnouncementTemplatesModule | Announcement templates |
| EmailValidatorModule | Email validation |
| CommonModule | Shared utilities |
| MetricsModule | Prometheus metrics |

**Global providers:**
- `AuditLogInterceptor` (APP_INTERCEPTOR)
- `MetricsInterceptor` (APP_INTERCEPTOR)
- `ThrottlerGuard` (APP_GUARD) — 60 req/min, Redis-backed

**Infrastructure:**
- SentryModule, LoggerModule (Pino + Loki), ConfigModule (Zod validation), BullModule (Redis-backed queues with retry), ThrottlerModule (Redis-backed), EventEmitterModule, ScheduleModule

### 2.4 Frontend Rendering

- **Framework:** Next.js 15.3.3 + React 19
- **Output:** `standalone` mode
- **i18n:** next-intl
- **Security headers:** X-Frame-Options, HSTS, XSS Protection, Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, COEP
- **Sentry:** Full integration with source maps, tunnel route at `/monitoring`
- **Known issue:** `ignoreBuildErrors: true` ve `ignoreDuringBuilds: true` aktif — build hataları maskeleniyor

### 2.5 Redis Kullanımı

- **BullMQ:** Queue processing, retry (3 attempts, exponential backoff), bounded DLQ (500 max)
- **Rate Limiting:** ThrottlerGuard ile Redis-backed rate limiting
- **Cache:** SCAN-based delPattern, connection pool (generic-pool)
- **Pub/Sub:** AlertingService webhook alerts with cooldown
- **Config:** 256MB maxmemory, allkeys-lru, appendonly yes, appendfsync everysec

### 2.6 BullMQ Konfigürasyonu

- `removeOnFail: { count: 500 }` — bounded DLQ
- `removeOnComplete: { count: 1000 }` — completed job cleanup
- StalledJobRecoveryService mevcut
- QueueMonitorService event listeners mevcut (stalled, failed, completed, progress)
- Worker concurrency: varsayılan (1 process per queue)
- Monitoring UI: **eksik** (GAP)

---

## 3. TO-BE Hedef Mimari (Local Docker Deploy)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API    │────▶│   PostgreSQL     │
│   :3000 (Next)  │     │   :4000 (Nest)   │     │   :5432 (pg16)   │
└─────────────────┘     │                  │     │   + pgvector      │
                        │   ┌─────────┐   │     └─────────────────┘
                        │   │ BullMQ  │   │     ┌─────────────────┐
                        │   │ Workers │   │────▶│   Redis          │
                        │   └─────────┘   │     │   :6379          │
                        └──────────────────┘     └─────────────────┘
                        
                        ┌──────────────────┐
                        │ backend-worker    │
                        │ (WORKER_MODE=true)│
                        │ Separate process  │
                        │ Same codebase     │
                        └──────────────────┘
```

**Queue Flow:**

```
API Request → BullMQ Queue → Worker (backend-worker or in-process)
                         ↓
                    Failed Job → DLQ (max 500)
                         ↓
                    Stalled → StalledJobRecoveryService (auto-retry)
                         ↓
                    AlertingService → Webhook notification (cooldown: 5min)
```

**Cache Katmanı Tasarımı:**

```
Request → Redis Cache Check → HIT → Return cached
                            → MISS → DB Query → Cache Set (TTL) → Return
                            
Invalidation: SCAN-based delPattern (non-blocking)
Connection: generic-pool (connection pool)
```

---

## 4. GAP Tablosu — Docker Local Deploy

| # | Alan | Mevcut Durum | Hedef | Öncelik (1-5) | Tahmini Efor | Risk |
|---|------|---------------|-------|----------------|--------------|------|
| G1 | DB Migration | 2/3 applied, 28 pending, 1 failed | Tüm migration'lar applied ve verified | 🔴 5 | 2g | Yüksek — DB crash |
| G2 | DB Seed | 0 user, 0 dept, 0 perm | Admin + base departments + permissions | 🔴 5 | 1g | Yüksek — Login imkansız |
| G3 | DB Schema Sync | `language`, `subscription_model`, `ai_response_cache` eksik | Schema ile DB tam uyumlu | 🔴 5 | 1g | Yüksek — Runtime crash |
| G4 | Docker Healthcheck | Alpine'da curl yok | wget veya curl install | 🟡 3 | 0.5g | Orta — Container restart loop |
| G5 | .env Consistency | Threshold/API key tutarsızlığı | Tek authoritative .env (docker-compose.yml) | 🟡 3 | 0.5g | Orta — AI yanlış threshold |
| G6 | Migration Baseline | `init_reset` failed, manual resolve gerekli | Clean migration state | 🔴 5 | 1g | Yüksek — Deploy engeli |
| G7 | ticket_number_seq | Sequence yok DB'de | Sequence created ve linked | 🔴 5 | 0.5g | Yüksek — Ticket oluşturma crash |
| G8 | Index Gap | 6+ index missing | All indexes created | 🟡 2 | 0.5g | Düşük — Performance |
| G9 | Worker Service | Tanımlı ama WORKER_MODE handling eksik | Worker mode bootstrapped correctly | 🟡 3 | 1g | Orta |

---

## 5. BullMQ Spesifik GAP

| # | Mevcut Durum | Hedef Durum | Öncelik | Efor | Risk |
|---|---------------|-------------|---------|------|------|
| BQ1 | Worker concurrency: varsayılan (1 per queue) | Concurrency: 5-10 per queue type | 🟡 2 | 0.5g | Düşük |
| BQ2 | Retry: 3 attempts, exponential backoff | ✅ Yeterli (şu an) | — | — | — |
| BQ3 | DLQ: bounded (max 500) | ✅ Yeterli (şu an) | — | — | — |
| BQ4 | Monitoring UI: eksik | Bull Board veya custom dashboard | 🟡 3 | 3g | Orta |
| BQ5 | Stalled job recovery mevcut | ✅ StalledJobRecoveryService aktif | — | — | — |
| BQ6 | Job prioritization: default | Priority-based queue routing | 🟡 2 | 1g | Düşük |

---

## 6. Redis Spesifik GAP

| # | Mevcut Durum | Hedef Durum | Öncelik | Efor | Risk |
|---|---------------|-------------|---------|------|------|
| RD1 | Cache invalidation: SCAN-based delPattern | ✅ Non-blocking, production-safe | — | — | — |
| RD2 | TTL stratejisi: kısmen implement | Merkezi TTL config (per-cache-type) | 🟡 3 | 1g | Orta |
| RD3 | Connection pooling: generic-pool | ✅ Aktif | — | — | — |
| RD4 | Pub/Sub: AlertingService webhook | ✅ Aktif (cooldown ile) | — | — | — |
| RD5 | Bellek yönetimi: maxmemory 256MB, allkeys-lru | Production'da monitoring gerekli | 🟡 2 | 0.5g | Düşük |

---

## 7. NestJS Spesifik GAP

| # | Mevcut Durum | Hedef Durum | Öncelik | Efor | Risk |
|---|---------------|-------------|---------|------|------|
| NX1 | Guard coverage: TicketOwnerGuard, TeamScopeGuard, ThrottlerGuard, JwtAuthGuard, RolesGuard | ✅ Yeterli | — | — | — |
| NX2 | DTO validation: Zod + class-validator birlikte | Zod-only migration | 🟡 2 | 5g | Düşük |
| NX3 | Exception filter: GlobalExceptionFilter + ErrorLoggerService | ✅ Yeterli | — | — | — |
| NX4 | Test coverage: 54/54 suites, 357 tests, ~65% coverage | 80%+ coverage | 🟡 2 | 10g | Düşük |
| NX5 | 7 skipped test suites (CRM, AI PBT, embedding) | All tests passing | 🟡 3 | 3g | Orta |

---

## 8. NextJS Spesifik GAP

| # | Mevcut Durum | Hedef Durum | Öncelik | Efor | Risk |
|---|---------------|-------------|---------|------|------|
| FE1 | 70+ `'use client'` pages | RSC migration (tickets page done) | 🟡 2 | 15g | Düşük |
| FE2 | Server Actions: tickets page only | All mutations via Server Actions | 🟡 3 | 5g | Orta |
| FE3 | Test coverage: 42 tests, ~47% | 80%+ coverage | 🟡 2 | 10g | Düşük |
| FE4 | `ignoreBuildErrors: true` | strict TypeScript build | 🟡 3 | 3g | Orta |
| FE5 | Console kirliliği mevcut | Clean console output | 🟢 1 | 1g | Düşük |

---

## 9. Risk Analizi

| Risk | Olası Etki | Olasılık | Önlem |
|------|------------|----------|-------|
| Migration `init_reset` FAILED | Yeni migration'lar uygulanamaz, schema drift | 🔴 Yüksek | Manual resolve veya DB reset + sıfırdan migrate |
| Seed boş | Login yapılamaz, ticket oluşturulamaz | 🔴 Yüksek | `prisma db seed` veya `production-sync.js` çalıştır |
| `ai_response_cache` tablosu yok | AI sorgular crash eder | 🔴 Yüksek | Migration uygulanınca düzelir |
| `knowledge_sources.language` kolonu yok | KB import crash eder | 🟡 Orta | Migration uygulanınca düzelir |
| Alpine'da curl yok | Backend/frontend healthcheck fail → restart loop | 🟡 Orta | Dockerfile'a `curl` install et veya `wget` kullan |
| .env tutarsızlığı | AI threshold'ları yanlış, JWT süreleri tutarsız | 🟡 Orta | Tek .env kaynağı belirle (docker-compose.yml) |
| `production-sync.js` deleted users'ı reactivated ediyor | Unintended user recovery | 🟡 Orta | Deploy script'inde warning ile continue — dikkatli ol |
| `NEXT_INTERNAL_API_URL` frontend container'da eksik | Server Actions backend'e erişemez | 🟡 Orta | docker-compose.override.yml'e ekle |

---

## 10. Teknik Borç Listesi

| # | Borç | Etki | Öneri | Öncelik |
|---|------|------|-------|----------|
| T1 | `seed-admin.ts` role field'ı `roleId` FK ile uyumsuz | Seed crash eder | Seed script'ini `roleId` kullanacak şekilde güncelle | 🟡 3 |
| T2 | `csurf` dependency deprecated | Güvenlik riski | Zaten manuel CSRF var, dependency'yi kaldır | 🟢 1 |
| T3 | PM2 `ecosystem.config.js` port tutarsızlığı (3001/4000) | Local dev'de confusion | Docker ortamında kullanılmıyor, düşük öncelik | 🟢 1 |
| T4 | `production-sync.js` tüm deleted user'ları reactivate ediyor | Unintended recovery | Deploy script'inde `|| echo "Warning..."` ile continue ediyor | 🟡 2 |
| T5 | Multiple `.env` dosyaları (root, backend, frontend) | Config drift | Tek kaynak: docker-compose.yml environment | 🟡 3 |
| T6 | `clear-kb.ts` doğrudan `@prisma/client` kullanıyor | Production'da driver adapter gerekli | Adapter pattern'ine geçir | 🟡 2 |
| T7 | Frontend `ignoreBuildErrors: true` | Build hataları maskeleniyor | Type-safety'i artır, strict moda geçir | 🟡 3 |
| T8 | `seed-rbac.ts` line 49: `ticket.create` (dot) вместо `ticket:create` (colon) | CUSTOMER role permission hatası | Fix: `ticket.create` → `ticket:create` | 🟡 3 |

---

## 11. Sprint Bazlı Aksiyon Planı

### Sprint 1: Database Fix (Gün 1 — Kritik)

| Sıra | Aksiyon | Süre | Bağımlılık | Sorumlu |
|------|---------|------|------------|---------|
| 1.1 | DB'yi sıfırdan kur (`docker compose down -v` → `up -d postgres redis`) | 5dk | - | DevOps |
| 1.2 | Prisma migrate deploy çalıştır | 10dk | 1.1 | Backend |
| 1.3 | Migration hatası varsa manual resolve | 10dk | 1.2 | Backend |
| 1.4 | Seed çalıştır (`prisma db seed`) | 5dk | 1.2 | Backend |
| 1.5 | Schema uyumunu doğrula (28 tablo, indexler, sequence, eksik kolonlar) | 10dk | 1.4 | Backend |

### Sprint 2: Docker Build Fix (Gün 1 — Kritik)

| Sıra | Aksiyon | Süre | Bağımlılık | Sorumlu |
|------|---------|------|------------|---------|
| 2.1 | Backend Dockerfile'a curl ekle | 5dk | - | DevOps |
| 2.2 | Frontend Dockerfile'a curl ekle | 5dk | - | DevOps |
| 2.3 | docker-compose.override.yml'e `NEXT_INTERNAL_API_URL` ekle | 2dk | - | DevOps |
| 2.4 | .env tutarlılığını sağla | 10dk | - | Backend |
| 2.5 | `docker compose build` | 5-15dk | 2.1-2.4 | DevOps |
| 2.6 | `docker compose up -d` | 2dk | 2.5 | DevOps |

### Sprint 3: Fonksiyonel Test (Gün 1-2)

| Sıra | Aksiyon | Süre | Bağımlılık | Sorumlu |
|------|---------|------|------------|---------|
| 3.1 | Health check'leri doğrula (backend, frontend) | 5dk | 2.6 | QA |
| 3.2 | Auth test (login, refresh, logout) | 15dk | Sprint 1+2 | QA |
| 3.3 | Tickets CRUD test | 15dk | Sprint 1+2 | QA |
| 3.4 | Knowledge Base test | 10dk | Sprint 1+2 | QA |
| 3.5 | AI Query test | 15dk | Sprint 1+2 | QA |
| 3.6 | Email/notification test | 10dk | Sprint 1+2 | QA |
| 3.7 | Redis/BullMQ job processing test | 15dk | Sprint 1+2 | QA |
| 3.8 | pgvector embedding search test | 10dk | Sprint 1+2 | QA |

### Sprint 4: Staging Doğrulama (Gün 2-3)

| Sıra | Aksiyon | Süre | Bağımlılık | Sorumlu |
|------|---------|------|------------|---------|
| 4.1 | Coolify staging deploy | 30dk | Sprint 3 | DevOps |
| 4.2 | SSL/TLS ve domain verification | 15dk | 4.1 | DevOps |
| 4.3 | End-to-end smoke test | 30dk | 4.2 | QA |

**Toplam tahmini süre:** ~1.5-2 gün (database fix + Docker build + test)

---

## 12. Kod Önerileri — En Kritik 3 GAP

### GAP 1: Backend Dockerfile — curl ekleme

```dockerfile
# apps/backend/Dockerfile — runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl fontconfig postgresql-client curl && \
    npm install -g pnpm@9.15.4 && \
    npm install -g prisma@7.4.2
# ... rest of the stage
```

### GAP 2: Frontend Dockerfile — curl ekleme

```dockerfile
# apps/frontend/Dockerfile — runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache curl

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
# ... rest of the stage
```

### GAP 3: Migration resolve + seed script

```bash
# Database'i sıfırdan kur (en güvenli yol)
docker compose down -v
docker compose up -d postgres redis

# Migration'ları sıfırdan uygula
cd packages/database
npx prisma migrate deploy

# Hata durumunda manual resolve:
# docker exec aluplan_postgres psql -U postgres -d aluplan_support \
#   -c "UPDATE _prisma_migrations SET finished_at = NOW(), applied_steps_count = 1 \
#       WHERE migration_name = '20260219151110_init_reset';"

# Seed çalıştır
npx prisma db seed

# Schema uyumunu doğrula
npx prisma migrate status
```

---

## 13. Mevcut Database Detayları

### Uygulanan Migration'lar

| Migration Name | Status | Applied At |
|---------------|--------|------------|
| `0_add_ticket_number_seq` | ✅ Applied | 2026-04-24 09:14:28 |
| `0_init_pg_stat_statements` | ✅ Applied | 2026-04-24 09:14:28 |
| `20260219151110_init_reset` | ❌ FAILED (applied_steps_count: 0) | — |

### Mevcut Tablolar (52)

`_prisma_migrations`, `agent_skills`, `ai_interactions`, `announcement_logs`, `announcement_templates`, `announcements`, `article_feedbacks`, `attachments`, `audit_logs`, `availability_overrides`, `business_hours`, `categories`, `crm_accounts`, `crm_connections`, `crm_sync_logs`, `customer_profiles`, `departments`, `email_events`, `email_logs`, `email_preferences`, `faq_entries`, `holidays`, `inbound_email_logs`, `interaction_feedbacks`, `knowledge_article_versions`, `knowledge_articles`, `knowledge_embeddings`, `knowledge_pool_embeddings`, `knowledge_source_sync_logs`, `knowledge_sources`, `macros`, `notifications`, `permissions`, `product_categories`, `products`, `prompt_templates`, `role_permissions`, `roles`, `settings`, `shifts`, `skills`, `sla_policies`, `team_members`, `teams`, `ticket_embeddings`, `ticket_escalations`, `ticket_messages`, `ticket_rules`, `tickets`, `training_queue`, `users`, `webhooks`

### Eksik Tablolar (Schema'da var, DB'de yok)

- `ai_response_cache`

### Eksik Kolonlar (Schema'da var, DB'de yok)

- `customer_profiles.subscription_model`
- `knowledge_sources.language`

### Extension'lar

- `pgvector` v0.8.1 ✅
- `uuid-ossp` v1.1 ✅
- `pg_stat_statements` v1.10 ✅

### Mevcut Hatalar (PostgreSQL Log)

```
ERROR: relation "public.roles" does not exist — (seed sırası sorunu)
ERROR: type "UserStatus" already exists — (migration conflict)
ERROR: column knowledge_sources.language does not exist — (pending migration)
ERROR: relation "User" does not exist — (case sensitivity, Prisma client)
```

---

## 14. Docker Compose Environment Detayları

### Root `.env` vs Backend `.env` Tutarsızlıkları

| Değişken | Root `.env` | Backend `.env` | Docker Compose | Sorun |
|----------|------------|----------------|----------------|-------|
| `SIMILARITY_THRESHOLD_HIGH` | 0.75 | 0.55 | — | ⚠️ Değer tutarsız |
| `SIMILARITY_THRESHOLD_MEDIUM` | 0.70 | 0.45 | — | ⚠️ Değer tutarsız |
| `JWT_EXPIRES_IN` | 1d | 1d | 15m | ⚠️ Docker compose farklı |
| `OPENAI_API_KEY` | Farklı key | Farklı key | — | ⚠️ Farklı key'ler |
| `GROQ_API_KEY` | Farklı key | Farklı key | — | ⚠️ Farklı key'ler |
| `VECTOR_DIMENSIONS` | 1536 | — | — | ✅ |
| `ENCRYPTION_KEY` | Eşleşiyor | Eşleşiyor | — | ✅ |

**Not:** Docker Compose ortamında `environment` directive'leri `.env` dosyalarını override eder. Bu nedenle docker-compose.yml ve docker-compose.override.yml tek kaynak olarak kabul edilmelidir.

---

*Bu rapor, Aluplan Support Desk V02 projesinin Docker local deploy öncesi durum tespitini içermektedir. Tüm bulgular 24 Nisan 2026 tarihinde canlı sistemden toplanmiştir.*
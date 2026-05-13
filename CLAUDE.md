# CLAUDE.md — Aluplan Support Desk v0.2

Bu dosya Claude Code ve Claude Desktop için projeyi tanımlar.
Kod yazarken, refactor ederken veya debug ederken önce bu dosyayı oku.

---

## 1. REPO YAPISI

**Turborepo + pnpm workspace.** Dört paket:

```
aluplan-support-desk/
├── apps/
│   ├── backend/        @aluplan/backend   → NestJS 11, port 4000  (Swagger: /api/docs)
│   └── frontend/       @aluplan/frontend  → Next.js 15 App Router, port 3000
├── packages/
│   ├── database/       @aluplan/database  → Prisma 7 schema + migrations + seed
│   └── shared-schemas/ @aluplan/shared-schemas → Zod şemaları (FE+BE ortak)
└── docker-compose.yml  → Postgres 16 (pgvector) + Redis + Ollama (opsiyonel)
```

> **Kritik:** Prisma client `packages/database/client/` dizinine generate edilir,
> `node_modules/`'a değil. Pull sonrası her zaman `pnpm db:generate` çalıştır.

---

## 2. YAYGIN KOMUTLAR

```bash
# Başlangıç (önerilen)
pnpm install
pnpm start:full           # Docker compose up + dev (zombie port temizleme dahil)
pnpm dev                  # Sadece turbo dev (Docker'ı kendin başlatmışsan)

# Build / Typecheck / Lint
pnpm build
pnpm typecheck
pnpm lint

# Veritabanı
pnpm db:generate          # Prisma client yenile (şema değişiminden sonra zorunlu)
pnpm db:migrate           # prisma migrate dev
cd packages/database && pnpm db:migrate:prod   # production deploy
cd packages/database && pnpm db:seed

# Backend testleri (Jest + @swc/jest)
pnpm --filter @aluplan/backend dev
pnpm --filter @aluplan/backend test
pnpm --filter @aluplan/backend test:e2e        # ts-jest + aliases @aluplan/database
pnpm --filter @aluplan/backend test:cov        # eşik: %35 satır/statement
pnpm --filter @aluplan/backend exec jest src/ai/ai-query.service.spec.ts
pnpm --filter @aluplan/backend exec jest -t "should fall back when provider fails"

# Frontend testleri (Vitest + Playwright)
pnpm --filter @aluplan/frontend dev            # next dev --port 3000
pnpm --filter @aluplan/frontend test:unit      # vitest (jsdom), eşik: %45
pnpm --filter @aluplan/frontend test:unit:watch
pnpm --filter @aluplan/frontend test:e2e       # playwright — backend+frontend otomatik başlar
pnpm --filter @aluplan/frontend test:e2e:ui
pnpm --filter @aluplan/frontend i18n:check     # tr/en/de key parite kontrolü — FE işi bitmeden çalıştır
pnpm --filter @aluplan/frontend analyze        # ANALYZE=true next build (bundle analyzer)
```

> **Her zaman `pnpm` kullan** — `npm install` workspace'i bozar
> (`engines.pnpm: ">=9.0.0"` ile enforce edilmiş).

---

## 3. BACKEND MİMARİSİ (`apps/backend/src`)

### 3.1 ~30 Feature Modül

| Modül | Yol | Açıklama |
|-------|-----|----------|
| `ai` | `src/ai/` | RAG pipeline, embedding, caching, provider routing |
| `knowledge-base` | `src/knowledge-base/` | Admin makale CRUD, approval workflow |
| `knowledge-pool` | `src/knowledge-pool/` | Data sources: URL/file/dataset crawl & processing |
| `faq` | `src/faq/` | FAQ cron, clustering, öneri kuyruğu |
| `tickets` | `src/tickets/` | Ticket yaşam döngüsü, SLA, rule engine |
| `auth` | `src/auth/` | JWT, refresh token, strateji |
| `users` | `src/users/` | Kullanıcı CRUD |
| `customers` | `src/customers/` | Müşteri profil, hotinfo parser |
| `crm` | `src/crm/` | Dynamics365 adapter, webhook, processor |
| `email` | `src/email/` | SMTP/Gmail/Resend provider, IMAP inbound |
| `email-validator` | `src/email-validator/` | Syntax + DNS + SMTP doğrulama |
| `announcements` | `src/announcements/` | Duyuru CRUD + template |
| `notifications` | `src/notifications/` | Socket.io gateway, bildirim dağıtımı |
| `proactive-chat` | `src/proactive-chat/` | Proaktif chat session + message |
| `omni-channel` | `src/omni-channel/` | Kanal birleştirme katmanı |
| `teams` | `src/teams/` | Ekip, departman, ajan yönetimi |
| `rbac` | `src/rbac/` | Rol tabanlı erişim kontrolü + guard |
| `automation` | `src/automation/` | SLA cron, audit service |
| `reports` | `src/reports/` | Raporlama servisi |
| `macros` | `src/macros/` | Hazır cevap makroları |
| `attachments` | `src/attachments/` | Dosya ekleri (S3/GCS) |
| `products` | `src/products/` | Ürün & kategori yönetimi |
| `webhooks` | `src/webhooks/` | Dış webhook gönderimi |
| `whatsapp` | `src/whatsapp/` | WhatsApp entegrasyonu |
| `settings` | `src/settings/` | Uygulama ayarları key-value store |
| `metrics` | `src/metrics/` | Prometheus metrics |
| `health` | `src/health/` | Health check endpoint |
| `redis` | `src/redis/` | Redis servis wrapper |
| `prisma` | `src/prisma/` | PrismaService singleton |
| `common` | `src/common/` | Global guard/filter/interceptor/pipe |

### 3.2 Cross-Cutting Wiring (Kritik)

- **Logging:** `nestjs-pino` + PII redaction (şifre, auth header, `clientSecret`, `webhookSecret`). `LOKI_HOST` varsa `pino-loki` ile Loki'ye.
- **Queue:** `BullMQ` Redis-backed. Default: 3 retry, 5s exponential backoff, son 100 completed + **500 failed (DLQ)**. Bull-Board `/queues`.
- **Throttle:** Global `ThrottlerGuard` Redis-backed — 120 req/min per IP.
- **Interceptors:** `AuditLogInterceptor` + `MetricsInterceptor` her isteği karşılar (`APP_INTERCEPTOR`).
- **Güvenlik:** `helmet`, `csurf`, `XssValidationPipe`, `SsrfGuard`.
- **Observability:** Sentry (`instrument.ts`) + OpenTelemetry (`otel.ts`) — `AppModule`'dan önce yüklenir.
- **Boot pre-check:** `main.ts` Redis ve DB'ye TCP probe atar, sonra NestFactory çalışır.
- **Shutdown:** `app.enableShutdownHooks()` — SIGTERM'de BullMQ jobları drainlenir.

---

## 4. AI / RAG PIPELINE (`apps/backend/src/ai`)

Bu sistemin çekirdeği. Değişiklik yapmadan önce ilgili dosyaları birlikte oku.

### 4.1 Servis Haritası

| Servis | Görev |
|--------|-------|
| `ai-provider-router.service.ts` | Multi-provider fallback: OpenAI → Groq → Ollama (`opossum` circuit breaker) |
| `ai-provider-registry.service.ts` | Provider kaydı ve seçimi |
| `ai-query.service.ts` | RAG giriş noktası |
| `ai-query.processor.ts` | BullMQ consumer — `AI_QUEUE_RATE_MAX` / `AI_QUEUE_RATE_DURATION_MS` |
| `embedding.service.ts` | OpenAI `text-embedding-3-small` (1536-dim) veya Ollama BGE-M3 (1024-dim) — `EMBEDDING_PROVIDER` env |
| `embedding-normalizer.service.ts` | Farklı dim vektörleri karşılaştırılabilir hale getirir |
| `prompt-context-builder.service.ts` | Hybrid retrieval (semantic + keyword) + re-ranking (`RERANK_MULTIPLIER_*`) |
| `ai-semantic-cache.service.ts` | Embedding similarity-based semantic cache (exact match değil) |
| `langfuse.service.ts` | Her LLM çağrısının distributed trace (cost + latency) |
| `ai-auto-resolver.service.ts` | Düşük güvenli yanıtları `TrainingQueue`'a yollar |
| `ai-budget-monitor.service.ts` | Token/maliyet izleme |
| `ai-copilot.service.ts` | Agent ekranı için AI copilot önerileri |
| `ai-reporting.service.ts` | AI Intelligence dashboard metrikleri |
| `ticket-clustering.service.ts` | Kapanan ticketlardan cluster çıkarımı → FAQ adayı |
| `rag-maintenance.service.ts` | Vektör indeksi bakımı |
| `rag-observability.service.ts` | RAG performans izleme |

### 4.2 Feedback-to-Vector Döngüsü

```
Ticket kapanır
  └─► ticket-clustering.service.ts  (BullMQ, günlük 02:00)
        └─► Eşik: ≥5 ticket/7 gün + CSAT ≥ 4/5 + tutarlılık ≥ %70
              └─► FAQ adayı → TrainingQueue (Prisma model)
                    └─► Admin onayı → KnowledgeArticle → KnowledgePoolEmbedding
```

**İhlal edilemez kurallar:**
- `R-T1:` Admin onayı olmadan FAQ yayına alınamaz. Otomatik yayın **YASAK**.
- `R-T3:` CSAT < 3/5 olan ticket FAQ kaynağı olamaz.
- `R-T5:` Reddedilen cluster 30 gün yeniden aday üretemez.
- `R-S5:` Müşteriye yalnızca `audience = "customer"` içerik gösterilir. Bypass yok.
- `R-S7:` Her chunk'ın `source_id` + `source_type` audit log'a yazılır, değiştirilemez.
- `R-P1:` Semantic cache zorunlu — 5 dk içinde aynı sorgu cache'den yanıtlanır.

### 4.3 Güven Skoru

| Skor | Label |
|------|-------|
| > 0.85 | `high` |
| 0.60–0.85 | `medium` |
| 0.40–0.60 | `low` |
| < 0.40 | `no_match` |

### 4.4 Kaynak Güven Hiyerarşisi (Re-ranking'de baz alınır)

| Sıra | Kaynak | Ağırlık |
|------|--------|---------|
| 1 | Admin Makalesi | ★★★★★ |
| 2 | Resmi Doküman | ★★★★☆ |
| 3 | AI FAQ (Onaylı) | ★★★☆☆ |
| 4 | URL Whitelist | ★★★☆☆ |
| 5 | URL Harici | ★★☆☆☆ |
| 6 | AI FAQ (Otomatik) | ★★☆☆☆ |
| 7 | Benzer Ticketlar | ★☆☆☆☆ |

### 4.5 Property-Based Testler

`*.pbt.spec.ts` dosyaları `fast-check` kullanır. Provider logic değişiminde bunları **yeşil tut**.

---

## 5. VERİTABANI (`packages/database`)

- **PostgreSQL 16** + `vector` (pgvector) + `uuid-ossp`
- Prisma `driverAdapters` preview + `@prisma/adapter-pg`
- Client: `packages/database/client/` → import: `@aluplan/database`
- `binaryTargets: ["native", "linux-musl-openssl-3.0.x"]` (Coolify/Alpine)
- **HNSW index'leri** schema'da değil, `scripts/migrate-hnsw-indexes.sql`'da. Büyük migration sonrası yeniden çalıştır.

### Prisma Modelleri

```
# Kullanıcı & Yetki
User, Role, Permission, RolePermission, Department, Team, TeamMember
Skill, AgentSkill, Shift, AvailabilityOverride

# Ticket & Mesaj
Ticket, TicketMessage, Attachment, TicketEscalation, TicketRule
TicketEmbedding, SlaPolicy, BusinessHours, Holiday, Macro

# AI & Bilgi Bankası
KnowledgeArticle, KnowledgeArticleVersion, ArticleFeedback
KnowledgeEmbedding, KnowledgeSource, KnowledgeSourceSyncLog
KnowledgePoolEmbedding, FaqEntry, TrainingQueue
AiInteraction, AiShiftDetection, AiResponseCache, InteractionFeedback
PromptTemplate, Category

# Müşteri & CRM
CustomerProfile, CrmAccount, CrmConnection, CrmSyncLog

# Email & İletişim
EmailLog, EmailEvent, EmailPreference, InboundEmailLog
Announcement, AnnouncementLog, AnnouncementTemplate

# Chat & Diğer
ProactiveChatSession, ProactiveChatMessage
Product, ProductCategory, Setting, AuditLog, Webhook, Notification
```

---

## 6. FRONTEND MİMARİSİ (`apps/frontend/src`)

### 6.1 Route Yapısı

```
app/[locale]/
├── (auth)/          → register, reset-password, verify-email
└── (dashboard)/     → tüm kimlik doğrulamalı ekranlar
    ├── dashboard/
    ├── tickets/ + tickets/[id]/
    ├── knowledge-base/ + knowledge-base/[id]/
    ├── knowledge-pool/ + knowledge-pool/upload/
    ├── faq/ + faq-learning/
    ├── kb-approvals/
    ├── customers/ + customers/crm/ + customers/[id]/
    ├── teams/ + teams/agents/ + teams/departments/
    ├── products/
    ├── admin/
    │   ├── ai-health/           ← AI Health & Telemetry
    │   ├── ai-intelligence/     ← AI Strategic Intelligence
    │   ├── announcements/
    │   ├── email-validation/
    │   ├── emails/
    │   └── settings/
    ├── settings/
    ├── users/
    └── system-topology/
```

### 6.2 Kritik Konvansiyonlar

- **Routing:** `next-intl` — `src/i18n/routing.ts`'ten import et. `next/link` doğrudan kullanma.
- **Lokalizasyon:** `tr` (default), `en`, `de`. Her string `messages/*.json`'da paralel olmalı. `pnpm i18n:check` geçmeli.
- **State:** Zustand (`src/stores/`). TanStack Query **yok** — server data, Server Components + route handler'lardan gelir.
- **UI:** Radix UI primitives + Tailwind + shadcn stili `src/components/ui/`.
- **Toast:** `sonner` — `toast()` ile.
- **Server Actions:** `(dashboard)/actions.ts` — dashboard tree paylaşımlı hub.
- **Middleware:** `next-intl` + CSP nonce (`x-nonce` header) + auth gating.
- **Gerçek zamanlı:** Socket.io client (`src/lib/socket.ts`). SSE değil WS. Streaming AI yanıtları da WS.

---

## 7. ÇALIŞMA KONVANSİYONLARI

- **Pull sonrası:** `pnpm install && pnpm db:generate`.
- **Cross-workspace import:** `@aluplan/database`, `@aluplan/shared-schemas`.
- **`@/` alias** → `apps/frontend/src/` (Vitest + TypeScript).
- **Commit etme:** `apps/frontend/test-results/`, `apps/backend/coverage/`.
- **Backend:** TypeScript strict, DTO `class-validator`+`class-transformer`, API yanıt `{ success, data, error, meta }`, env `@nestjs/config`.
- **Frontend:** Server Components varsayılan, `"use client"` minimum, form `react-hook-form` + Zod.
- **AI değişikliklerinde:** `*.pbt.spec.ts` yeşil tut, confidence score standartlarına uy, token kullanımını `langfuse` üzerinden logla.

---

## 8. ALTYAPI & CI/CD

- **Docker Compose:** Postgres 16 pgvector + Redis (AOF, LRU 256MB) + Ollama. `pg_stat_statements` aktif, `log_min_duration_statement=500`. Dev'den önce `docker compose up -d`.
- **Socket.io:** `@socket.io/redis-adapter` multi-instance room sharing.
- **Deployment:** Coolify hedefli. Her app'in Dockerfile'ı var. `docker-compose.staging.yml` staging için.
- **CI:** `backend-test.yml`, `frontend-test.yml`, `ci.yml`, `ai-eval.yml`, `dr-drill.yml`, `semantic-release.yml`.

---

## 9. HENÜZ TAMAMLANMAMIŞ — KIRO SPEC'LER

`.kiro/specs/` altında tasarım + görev belgesi olan aktif geliştirmeler:

| Spec | Açıklama |
|------|----------|
| `ai-pipeline-optimization` | RAG performans iyileştirme |
| `announcement-notifications` | Duyuru bildirim sistemi |
| `attachment-vision-support` | Dosya eki görüntü analizi |
| `crm-only-registration` | Sadece CRM'den kayıt |
| `crm-sync-improvements` | CRM senkronizasyon iyileştirme |
| `customer-list-missing-columns` | Müşteri listesi kolon eksikleri |
| `proactive-chat` | Proaktif chat akışı |
| `rag-faq-improvements` | FAQ öğrenme döngüsü iyileştirme |

---

## 10. KRİTİK METRİKLER

| Metrik | Hedef | Kritik Eşik |
|--------|-------|-------------|
| Self-servis deflection | ≥ %40 | < %30 → kritik uyarı |
| AI yanıt doğruluğu | ≥ %85 | — |
| Ortalama yanıt süresi | < 3 sn | > 5 sn → kritik uyarı |
| Cache hit rate | > %60 | — |
| Vector DB query p99 | < 500 ms | — |
| Embedding queue depth | < 100 | > 500 → uyarı |
| Crawler error rate | < %5 | — |

---

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **aluplan-support-desk-v02** (10855 symbols, 18166 relationships, 255 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/aluplan-support-desk-v02/context` | Codebase overview, check index freshness |
| `gitnexus://repo/aluplan-support-desk-v02/clusters` | All functional areas |
| `gitnexus://repo/aluplan-support-desk-v02/processes` | All execution flows |
| `gitnexus://repo/aluplan-support-desk-v02/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

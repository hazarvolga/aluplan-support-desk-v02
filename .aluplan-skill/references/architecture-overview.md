# Architecture Overview

End-to-end mental model for the Aluplan Support Desk platform. Read this when reasoning about cross-module flows or designing features that touch more than one module.

This document complements `repository-conventions.md` — that one tells you **how** code looks; this one tells you **how the system flows**.

## 1. Repository shape

```
aluplan-support-desk/
├── apps/
│   ├── backend/        @aluplan/backend      NestJS 11
│   └── frontend/       @aluplan/frontend     Next.js 15 App Router
├── packages/
│   ├── database/       @aluplan/database     Prisma 7
│   └── shared-schemas/ @aluplan/shared-schemas  Zod
```

~30 feature modules under `apps/backend/src/`, ~25 dashboard routes under `apps/frontend/src/app/[locale]/(dashboard)/`. Single-tenant.

## 2. End-to-end flow

```
┌────────────────────────────────────────────────────────────────────┐
│ User Message  (Web / Email / WhatsApp / Proactive Chat / CRM event)│
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│ omni-channel/   Channel ingestion + normalization                   │
│ email/, whatsapp/, proactive-chat/   Channel adapters               │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│ ai/   AiQueryService.queryInternal(options)                         │
│   • language detect → query rewrite → synonym expand → HyDE         │
│   • EmbeddingService.search (vector + keyword hybrid)               │
│   • Re-rank with RAG_CONFIG.RERANK.{FACTORS, WEIGHTS}               │
│   • PromptContextBuilderService.buildContext(...)                   │
│   • buildSupportAnswerContractPrompt(...) — shared customer/agent   │
│   • AiService → provider router (OpenAI → Groq → Ollama)            │
│   • Self-check + isNoKnowledgeAnswer detection                      │
│   • Persist AiInteraction (inline telemetry)                        │
│   • Langfuse trace                                                  │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                ┌───────────────┴───────────────┐
                │                               │
   HIGH/MEDIUM confidence            LOW / NO_MATCH
                │                               │
                ▼                               ▼
   Customer self-service answer    suggestTicket: true → tickets/
   OR Admin Copilot suggestion                  │
                                                ▼
                                  ┌─────────────────────────────────┐
                                  │ tickets/   Ticket lifecycle      │
                                  │   • interactionId @unique idem   │
                                  │   • SLA, status, rule engine     │
                                  │   • hotinfoSnapshot Json (GIN)   │
                                  └─────────────────────────────────┘
                                                │
                                                ▼
                                  ┌─────────────────────────────────┐
                                  │ Async cross-module fan-out       │
                                  │   notifications/  WebSocket      │
                                  │   automation/     SLA cron       │
                                  │   crm/            activity log   │
                                  │   metrics/        Prometheus     │
                                  │   reports/        analytical     │
                                  └─────────────────────────────────┘
```

Always think in **systems**, not isolated components. A retrieval change affects confidence; a confidence change affects routing; a routing change affects how many tickets land in the queue.

## 3. Module responsibilities

| Module | Responsibility |
|---|---|
| `omni-channel/` | Channel-unification layer above email/whatsapp/proactive-chat |
| `email/` | SMTP/Gmail/Resend providers, IMAP inbound, email validator |
| `email-validator/` | Syntax + DNS + SMTP email validation |
| `whatsapp/` | WhatsApp integration |
| `proactive-chat/` | Proactive chat sessions + messages |
| `tickets/` | Ticket lifecycle, SLA cron, rule engine, escalations |
| `customers/` | Customer profiles, Hotinfo parser, CRM-linked profiles |
| `crm/` | Dynamics 365 adapter + record sync + delta sync + webhooks (ADR-008) |
| `ai/` | RAG pipeline, embedding, provider routing, semantic cache, diagnosis engine |
| `knowledge-base/` | Admin article CRUD, approval workflow |
| `knowledge-pool/` | URL/file/dataset crawl + ingestion + classification |
| `faq/` | FAQ cron, clustering, candidate queue |
| `auth/` | JWT + refresh token + strategies |
| `users/` | User CRUD |
| `rbac/` | Role-based access + guards |
| `teams/` | Department / team / agent management |
| `announcements/` | Announcement CRUD + templates |
| `notifications/` | Socket.io gateway, fan-out |
| `automation/` | SLA cron, audit service |
| `reports/` | Reporting service |
| `macros/` | Prepared response macros |
| `attachments/` | File attachments (S3/GCS) |
| `products/` | Product + category taxonomy |
| `webhooks/` | Outbound webhook delivery |
| `settings/` | Application settings key-value store |
| `metrics/` | Prometheus metrics |
| `health/` | Health check endpoints |
| `redis/` | Redis service wrapper |
| `prisma/` | PrismaService singleton |
| `common/` | Global guards, filters, interceptors, pipes, services (`PiiMaskingService`, `ErrorLoggerService`, `StorageService`, `DocumentParserService`, `AlertingService`, `DatabaseBackupService`) |
| `events/` | Event emitter wiring |
| `branding/` | Tenant-style branding (single-tenant in practice) |
| `queue-dashboard/` | Bull-Board mount at `/queues` |

## 4. Module boundary rules

- **Cross-module communication paths,** in order of preference:
  1. **Service call** — import another module's exported service. Synchronous, same request.
  2. **EventEmitter** (`@OnEvent`) — in-process, async fan-out within one Nest application.
  3. **BullMQ queue** — durable, retryable, cross-process. For slow, fallible, or fan-out work.
  4. **WebSocket** via `NotificationsGateway` — push to clients (browsers, mobile).

- **Never reach into another module's Prisma calls.** `PrismaService` is shared via `PrismaModule`, but each module owns its own model queries. AI does not write to `tickets`; tickets does not write to `ai_interactions`.
- **Repository pattern is not used.** Services call `this.prisma.<model>.<method>` directly. Do not introduce a repository layer.
- **CRM types stay inside `crm/`.** Raw Dynamics payloads, `@odata.*` system fields — none leak past `CrmService`. Other modules consume clean local types (`CrmAccount`, `CustomerProfile`).
- **AI provider details stay inside `ai/`.** Provider-specific shapes (OpenAI, Gemini, Groq, Ollama) stay behind `AiService`. Consumers see `AiQueryResult` + `AiInteraction`.

## 5. Event flow conventions

NestJS `EventEmitter2` is used for intra-process events; BullMQ for cross-process. WebSocket events for client push.

WebSocket event naming (canonical): `<DOMAIN>_<ACTION>_<OUTCOME>`, all-caps:

```
AI_QUERY_COMPLETED
AI_QUERY_FAILED
CRM_SYNC_ERROR
TICKET_CREATED
NOTIFICATION_NEW
```

BullMQ queue naming (canonical, kebab-case):

```
crm-sync
ai-query-processing
knowledge-sync
```

Payloads are object literals with the IDs needed for downstream work (`connectionId`, `logId`, `interactionId`, `jobId`). No `correlationId` envelope — identity comes from existing IDs.

## 6. Where to add a new capability

| Capability | Module |
|---|---|
| New message intake source | `omni-channel/` adapter |
| Channel-specific quirk | `email/`, `whatsapp/`, `proactive-chat/` |
| New ticket lifecycle step | `tickets/` |
| Pulling/pushing Dynamics data | `crm/` (through `CrmRecordSyncService`) |
| New CRM provider | `crm/adapters/<provider>.adapter.ts` implementing `ICrmAdapter` |
| Ingesting knowledge content | `knowledge-pool/` for raw; promote to `knowledge-base/` after validation |
| AI inference | `ai/` only |
| New AI provider | `ai/<provider>.service.ts` + register in `AiProviderRegistry` |
| Rule firing on events | `automation/` |
| Notifying someone | `notifications/` (gateway + fanout) |
| New metric | `metrics/` (collection); Bull-Board for queue ops; reports for analytics |
| New entity | Prisma model in `packages/database/prisma/schema.prisma` + migration |
| Shared FE/BE schema | `packages/shared-schemas/` (Zod) |

Cross-module features: design DTO/event contracts first, then implement inside each owning module.

## 7. Boot sequence

`apps/backend/src/main.ts`:

1. Pre-boot TCP probes on Redis + Postgres (early-fail).
2. `instrument.ts` (Sentry) and `otel.ts` (OpenTelemetry) load **before** `AppModule`.
3. `NestFactory.create(AppModule, { bufferLogs: true })`.
4. `app.enableShutdownHooks()` — drains BullMQ on SIGTERM.
5. `app.set('trust proxy', 1)` — for Coolify/Caddy.
6. Helmet + CSP + compression + cookie-parser + csurf wired.
7. `XssValidationPipe` + `SsrfGuard` globally.
8. `AuditLogInterceptor` + `MetricsInterceptor` via `APP_INTERCEPTOR`.
9. `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`).
10. Swagger at `/api/docs`.

Throttle: global `ThrottlerGuard` Redis-backed, 120 req/min per IP.

## 8. Capabilities already in place — do not re-invent

- **AI telemetry** inline on `AiInteraction` (provider, model, tokens, cost, similarity, confidence band, accept/edit).
- **Retrieval observability** via `RagObservabilityService` writing to retrieval logs.
- **AI answer contract** via `buildSupportAnswerContractPrompt` (shared customer/agent).
- **Semantic cache** via `AiSemanticCache` + `AiResponseCache` model (5-min same-query rule, R-P1).
- **Provider router with circuit breaker** (`ai-provider-router.service.ts`, `opossum`).
- **Embedding version isolation** (`embedding-version.registry.ts`, ADR-007).
- **CRM single sync path** (`CrmRecordSyncService`, ADR-008).
- **CRM field-level change log** (`CrmChangeLog`).
- **Delta sync with `deltaLink` continuation** (`CrmDeltaSyncState`).
- **FAQ feedback-to-vector loop** (`TicketClusteringService` → `TrainingQueue` → admin approval → `KnowledgeArticle`).
- **WebSocket async result delivery** (`NotificationsGateway.sendToUser`).
- **Cost governance** (`AiBudgetMonitorService`, env-driven caps).
- **Audit log persistence on every HTTP exception** via `ErrorLoggerService` from `GlobalExceptionFilter`.
- **Bull-Board operator UI** at `/queues`.
- **Langfuse distributed tracing** for every LLM call.
- **PII masking** via `PiiMaskingService`.
- **Secret encryption** via `CryptoService` (CRM secrets, etc.).
- **DR drills** via `dr-drill.yml` CI workflow.
- **Disaster recovery scripts** in `scripts/` (also `restore-runner.ts` in backend).

When proposing a feature, first check whether you're extending one of these rather than paralleling it.

## 9. High-blast-radius surfaces (AGENTS.md)

Before editing, run `gitnexus_impact({ target: "<Symbol>", direction: "upstream" })` and surface the warning to the user:

- `AiService` — provider dispatch
- `AiQueryService` — customer diagnosis + RAG
- `EmbeddingService` — vector writes
- `RagMaintenanceService` — vector index + dimension maintenance
- `NotificationsGateway` — WebSocket hub
- `CrmService` — Dynamics 365 sync
- `EmailService` — email flows
- `toast()` — frontend notification hook
- `XssValidationPipe` — global non-message string validation
- `AddMessageDto` — old plain-text compatibility
- Ticket lifecycle + AI-optional ticket creation path (ADR-003)

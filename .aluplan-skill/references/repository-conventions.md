# Repository Conventions

This is the first reference the skill loads. Read this before reading any other reference. It encodes the actual conventions of the Aluplan Support Desk codebase — extracted from real production code, not from generic best-practice templates.

The skill must distinguish between **operationally intentional complexity** (preserve) and **accidental complexity** (do not propagate). This document marks each pattern accordingly.

## 1. Truth hierarchy — read this first

When the codebase and its documentation disagree, the codebase wins. From `AGENTS.md`:

1. Code, tests, Prisma schema, migrations, and runtime config.
2. Git history and current `git status`.
3. GitNexus and Graphify outputs.
4. `.ai` memory files (operational memory — not architectural rules).
5. Root-level Markdown only when explicitly current or cross-checked against code.

**Known stale spots to watch for:**

- `CLAUDE.md` §4.3 confidence band values (`> 0.85 high, 0.60–0.85 medium, 0.40–0.60 low, < 0.40 no_match`) **disagree with `rag.config.ts`** (`HIGH: 0.85, MEDIUM: 0.70, LOW: 0.62 env-overridable`). The code is canonical. Surface this discrepancy when relevant.

When generating code or proposing changes, **verify against `packages/database/prisma/schema.prisma` and the actual service implementations** before trusting Markdown.

## 2. Repository layout (canonical)

```
aluplan-support-desk/
├── apps/
│   ├── backend/        @aluplan/backend      NestJS 11, port 4000 (Swagger: /api/docs)
│   └── frontend/       @aluplan/frontend     Next.js 15 App Router, port 3000
├── packages/
│   ├── database/       @aluplan/database     Prisma 7 schema + migrations + seed
│   └── shared-schemas/ @aluplan/shared-schemas  Zod schemas (FE+BE shared)
└── docker-compose.yml  Postgres 16 (pgvector) + Redis + Ollama (optional)
```

Turborepo + pnpm workspace. **Always `pnpm`, never `npm install`** (`engines.pnpm: ">=9.0.0"` enforced).

**Prisma client generates to `packages/database/client/`** — not `node_modules`. After every pull: `pnpm db:generate`. Import via `@aluplan/database`, never `@prisma/client` directly (AGENTS.md rule).

## 3. Single-tenant architecture (canonical)

Multi-tenancy was explored and **deliberately abandoned**. The canonical architecture is **single-tenant**.

**Transitional residue to recognize but not propagate:**
- `AiResponseCache.tenantId` field remains in the Prisma schema as leftover future-proofing.
- Any tenant-scoped abstractions encountered are residue from the abandoned direction.

**When generating new code:**
- Do not introduce new `tenantId` fields, parameters, or abstractions.
- Do not propose tenant-scoped patterns or partition strategies.
- Prefer operational simplicity targeting one production environment.

## 4. High blast radius — protected symbols (AGENTS.md)

Before editing any of these, the skill must surface an impact warning and recommend running `gitnexus_impact({target: "SymbolName", direction: "upstream"})`:

| Symbol | Why it matters |
|---|---|
| `AiService` | Dispatcher for all AI provider calls |
| `AiQueryService` | Customer diagnosis + RAG answer flow |
| `EmbeddingService` | Article, ticket, and knowledge pool vector writes |
| `RagMaintenanceService` | Vector index and embedding dimension maintenance |
| `NotificationsGateway` | WebSocket hub |
| `CrmService` | Dynamics 365 sync |
| `EmailService` | Email flows |
| `toast()` (frontend) | Notification hook |

Also protected by AGENTS.md "Avoid Breaking":
- `XssValidationPipe` global behavior for non-message strings
- `AddMessageDto` compatibility with old plain-text content
- Ticket lifecycle and AI-optional ticket creation (ADR-003)

## 5. Architectural Decision Records — ADR summary

`.ai/architecture-decisions.md` holds 8 durable decisions. Memorize these:

| ADR | Decision | Operational impact |
|---|---|---|
| **ADR-001** | Stay on pgvector before considering Qdrant | All optimization targets the current pgvector path. Qdrant is roadmap, not in-scope work. |
| **ADR-002** | Low-rate ingestion for Gemini free tier | Knowledge pool sync uses deliberate pacing. Bulk imports take longer to avoid quota fights. |
| **ADR-003** | AI diagnosis must remain optional for ticket creation | Frontend always exposes a direct ticket path. AI failure is degraded assistance, never a blocker. |
| **ADR-004** | Handle Gemini 3072-dim embeddings explicitly | Active embedding version + dimension drive vector column/index maintenance. HNSW skipped when dim exceeds pgvector compatibility. |
| **ADR-005** | Clean old RAG data before full re-import | Re-imports include pre-cleanup inspection + safe deletion criteria. |
| **ADR-006** | Do not mix embedding providers within one corpus version | Keep OpenAI as **chat fallback only**. Never embedding fallback for active Gemini `3072/v2_2` corpus. |
| **ADR-007** | Isolate embedding indexes by version and dimension | pgvector columns are unconstrained `vector`. All writes/searches isolate by `embedding_version + embedding_dim`. |
| **ADR-008** | One CRM record sync path for Dynamics writes | Full import, delta sync, and webhook all persist through `CrmRecordSyncService`. |

These are not advisory — they are constraints on what the skill is allowed to propose.

## 6. Backend conventions (canonical, from real code)

### 6.1 Module structure

NestJS, **~30 feature modules** at the same level under `apps/backend/src/`. Modules grow internal structure (`services/`, `adapters/`, `webhooks/`, `guards/`) only when complexity warrants it — small modules stay flat.

Standard module wiring (from `apps/backend/src/crm/crm.module.ts`):

```typescript
@Module({
    imports: [
        PrismaModule,
        NotificationsModule,
        BullModule.registerQueue({
            name: 'crm-sync',
            defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 50, removeOnFail: false },
        }),
    ],
    controllers: [CrmController, CrmWebhookController],
    providers: [CrmService, Dynamics365Adapter, CrmProcessor, CrmEmailValidatorService, CrmRecordSyncService, CrmDeltaSyncService],
    exports: [CrmService, CrmEmailValidatorService, CrmDeltaSyncService],
})
export class CrmModule { }
```

Conventions:
- **4-space indent.**
- `PrismaModule` re-imported per module (canonical — there is no global `PrismaModule.forRoot`).
- Queue declared inline with `BullModule.registerQueue` — no separate queue-config module.
- `exports` is selective: only what other modules consume.

### 6.2 Service shape

From `apps/backend/src/crm/crm.service.ts`:

```typescript
import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CrmProvider, SyncStatus, Prisma } from '@aluplan/database';

@Injectable()
export class CrmService {
    private readonly logger = new Logger(CrmService.name);

    constructor(
        @InjectQueue('crm-sync') private crmQueue: Queue,
        private prisma: PrismaService,
        private dynamics365: Dynamics365Adapter,
        private crypto: CryptoService,
        // ...
    ) {}
}
```

Conventions:
- `@Injectable()` + `private readonly logger = new Logger(ClassName.name);` on every service.
- Constructor uses `private` (sometimes `private readonly` — both seen; either is fine).
- Type imports come from `@aluplan/database` (Prisma client types, enums).
- HTTP exceptions are **standard NestJS** (`BadRequestException`, `NotFoundException`). **No custom `DomainError` hierarchy.**
- API response shape (CLAUDE.md §7): `{ success, data, error, meta }`.

### 6.3 Repository pattern: not used

Services call `this.prisma.<model>.<method>()` **directly**. No repository layer between service and Prisma client. This is canonical — do not introduce a repository pattern unless the user explicitly requests one.

`PrismaService` has a global soft-delete filter applied in `onModuleInit()` (AGENTS.md). To intentionally include soft-deleted rows, bypass explicitly and document why.

### 6.4 Service-scoped helpers

Helper functions tightly coupled to a single service's domain may live in the same file as a top-level function (e.g., `buildSyncDetails` in `crm.service.ts`). **Do not aggressively force these into `utils/`** — domain coupling is acceptable.

Move to `utils/` only when the helper is genuinely reusable across services.

### 6.5 DTOs

- HTTP boundaries use `class-validator` + `class-transformer` (CLAUDE.md §7).
- Internal types (inter-service, queue payloads) often use inline TypeScript `interface` declarations at the top of the consuming file — not always promoted to a `dto/` folder.
- Cross-package DTOs (frontend ↔ backend) live in `packages/shared-schemas/` as Zod schemas.

### 6.6 Error handling

```typescript
// apps/backend/src/common/filters/global-exception.filter.ts (canonical shape)
const responseBody = {
    statusCode: httpStatus,
    timestamp: new Date().toISOString(),
    path: httpAdapter.getRequestUrl(request),
    message: typeof message === 'object' ? (message as any).message : message,
    error: typeof message === 'object' ? (message as any).error : null,
};
```

Every exception is persisted to `AuditLog` via `ErrorLoggerService.logError({ action: 'api_exception', ... })`. Failure to log does not crash the response.

### 6.7 Configuration

- All env vars validated at boot via `apps/backend/src/config/env-validation.schema.ts` (Zod).
- Required boot secrets (AGENTS.md): `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, `ADMIN_BYPASS_EMAILS`.
- Per-domain runtime config lives in `apps/backend/src/config/` (`rag.config.ts`, `redis.config.ts`, `configuration.ts`).
- Process env access outside `config/` is rare — should go through `ConfigService` or the typed config constants.

### 6.8 Logging (canonical, observed)

`nestjs-pino` is the global logger. PII redaction (password, auth header, `clientSecret`, `webhookSecret`) is handled at the formatter level — services don't redact manually.

**Service-level log style is human-readable string + emoji + interpolation:**

```typescript
this.logger.log(`🚀 Starting background CRM sync for connection: ${connectionId} (Job: ${job.id})`);
this.logger.error(`❌ Background CRM sync failed: ${error.message}`, error.stack);
this.logger.warn(`CRM contact sync skipped for protected admin email: ${email}`);
```

Structured `event` field-style logging is **not** the convention here. Pino's formatter produces structured JSON downstream, but services write conversational strings.

Loki shipping via `pino-loki` is conditional on `LOKI_HOST` env var.

### 6.9 Boot sequence

`apps/backend/src/main.ts`:

1. Pre-boot TCP probes on Redis and Postgres (early-fail).
2. `instrument.ts` (Sentry) and `otel.ts` (OpenTelemetry) load **before** `AppModule`.
3. `NestFactory.create(AppModule, { bufferLogs: true })`.
4. `app.enableShutdownHooks()` — drains BullMQ jobs on SIGTERM.
5. `app.set('trust proxy', 1)` — for Coolify/Caddy.
6. `helmet`, `compression`, `cookieParser`, `csurf`, `XssValidationPipe`, `SsrfGuard` wired globally.
7. `AuditLogInterceptor` + `MetricsInterceptor` registered via `APP_INTERCEPTOR`.

Throttle is global: `ThrottlerGuard` Redis-backed, 120 req/min per IP.

## 7. Prisma conventions (canonical)

### 7.1 Model skeleton

```prisma
model Ticket {
    id            String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    ticketNumber  String       @unique @map("ticket_number") @db.VarChar(20)
    interactionId String?      @unique @map("interaction_id") @db.Uuid
    subject       String
    status        TicketStatus @default(NEW)
    deletedAt     DateTime?    @map("deleted_at")
    createdAt     DateTime     @default(now()) @map("created_at")
    updatedAt     DateTime     @updatedAt @map("updated_at")

    @@index([status, createdAt], map: "idx_tickets_status_created_at")
    @@index([hotinfoSnapshot], map: "idx_tickets_hotinfo", type: Gin)
    @@map("tickets")
}
```

Conventions:
- **UUID primary keys** via `gen_random_uuid()`.
- **Snake_case columns** with `@map`; camelCase in the model. **Snake_case table names** with `@@map`.
- **Soft delete is universal:** `deletedAt DateTime? @map("deleted_at")` on every durable model. Global filter in `PrismaService.onModuleInit()`.
- **Audit fields universal:** `createdAt DateTime @default(now()) @map("created_at")` + `updatedAt DateTime @updatedAt @map("updated_at")`.
- **External IDs are nullable + unique:** `externalAccountId String? @unique @map("external_account_id") @db.VarChar(255)` — null for non-CRM-verified, unique when set.
- **Explicit VarChar lengths:** `@db.VarChar(20)` (codes), `@db.VarChar(50)` (short strings), `@db.VarChar(100)` (slugs), `@db.VarChar(255)` (names, URLs).
- **JSON columns:** `Json?` + `@@index([col], type: Gin)` when queryable.
- **Compound indexes** with explicit `map`: `@@index([status, createdAt], map: "idx_tickets_status_created_at")`.
- **Decimal for money/scores:** `@db.Decimal(10, 6)` (cost), `@db.Decimal(5, 4)` (similarity). Not `Float`.

**Known transitional inconsistency:** `CrmAccount.account_number` is declared without `@map`, breaking the snake_case → camelCase convention. Treat this as residue, not a pattern to copy.

### 7.2 Vector columns

```prisma
model KnowledgeEmbedding {
    id               String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    embedding        Unsupported("vector")
    embeddingVersion String                @default("v1") @map("embedding_version") @db.VarChar(10)
    embeddingDim     Int                   @default(1536) @map("embedding_dim")
    migratedAt       DateTime?             @map("migrated_at")
}
```

- Vector type is `Unsupported("vector")` (Prisma doesn't natively model `pgvector`).
- **No dimension constraint on the column** (ADR-007). All writes/searches isolate by `embedding_version + embedding_dim`.
- HNSW indexes live in `scripts/migrate-hnsw-indexes.sql`, **not in the Prisma schema**. Re-run after large migrations.
- Currently active production index: `v2_2 / 3072` (Gemini).

### 7.3 Idempotency through schema

State-changing operations get idempotency from `@unique` constraints on business keys, not from a separate processed-jobs table:

- `Ticket.interactionId @unique` — one AI interaction yields at most one ticket. Repeated ticket creation from the same interaction returns `{ alreadyCreated: true }` with the existing ticket.
- `CrmAccount.externalAccountId @unique`, `CustomerProfile.externalContactId @unique` — CRM upserts are safe to retry.
- `AiResponseCache.queryHash @unique` — cache writes deduplicate.

## 8. BullMQ workers (canonical)

### 8.1 Worker skeleton

From `apps/backend/src/crm/crm.processor.ts` and `apps/backend/src/ai/ai-query.processor.ts`:

```typescript
@Processor('ai-query-processing', {
    concurrency: 2,
    limiter: {
        max: parseInt(process.env.AI_QUEUE_RATE_MAX ?? '15', 10),
        duration: parseInt(process.env.AI_QUEUE_RATE_DURATION_MS ?? '60000', 10),
    },
})
export class AiQueryProcessor extends WorkerHost {
    private readonly logger = new Logger(AiQueryProcessor.name);

    constructor(
        private readonly aiQueryService: AiQueryService,
        private readonly notifications: NotificationsGateway,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { options, jobId } = job.data;
        this.logger.log(`⚙️ Background AI Processing: ${jobId} (User: ${options.userId})`);
        try {
            const response = await this.aiQueryService.queryInternal(options);
            if (options.userId) {
                this.notifications.sendToUser(options.userId, 'AI_QUERY_COMPLETED', { jobId, result });
            }
            return result;
        } catch (error) {
            this.logger.error(`❌ AI Job Failed: ${jobId} - ${error.message}`);
            if (job.data.options?.userId) {
                this.notifications.sendToUser(job.data.options.userId, 'AI_QUERY_FAILED', { jobId, error: error.message });
            }
            throw error;
        }
    }
}
```

Conventions:
- `@Processor('queue-name', { concurrency, limiter })` — concurrency and rate limit declared inline on the processor.
- `extends WorkerHost`, constructor-injected dependencies.
- `Job<any, any, string>` — payload type is **`any`** in practice. (This is canonical convention even though it's loose typing; do not over-engineer to strong-typed payloads unless the user asks.)
- `@OnWorkerEvent('completed' | 'failed')` for lifecycle hooks.
- **Logs are emoji'd strings, not structured `event` JSON.**
- **No `correlationId` field in payloads.** Identity comes from existing IDs (`connectionId`, `logId`, `jobId`, `interactionId`).
- **Idempotency is business-level**, enforced by `@unique` constraints (see §7.3).

### 8.2 Queue defaults

The canonical default options block (see `crm.module.ts`):

```typescript
defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 50,   // or 100 — both seen
    removeOnFail: false,     // DLQ kept in Bull-Board
}
```

Variations are intentional per queue (e.g., AI queue tightens concurrency and adds `limiter`; knowledge-sync uses env-tunable rate limits per ADR-002).

### 8.3 Async result delivery via WebSocket

For long-running async work, the worker delivers completion to the client through `NotificationsGateway`:

```typescript
this.notifications.sendToUser(userId, 'AI_QUERY_COMPLETED', { jobId, result });
this.notifications.sendToUser(userId, 'AI_QUERY_FAILED', { jobId, error: error.message });
```

Event name convention: `<DOMAIN>_<ACTION>_<OUTCOME>`, all-caps. The frontend subscribes via Socket.io.

## 9. AI / RAG conventions (canonical)

### 9.1 Single source of truth for RAG parameters

`apps/backend/src/config/rag.config.ts` is canonical. **Do not hardcode thresholds, chunk sizes, cache TTLs, or rerank factors elsewhere.** Always import from `RAG_CONFIG`.

Headline numbers (subject to env override):

| Setting | Value | Notes |
|---|---|---|
| `SIMILARITY.HIGH` | `0.85` | Score ≥ → HIGH confidence band |
| `SIMILARITY.MEDIUM` | `0.70` | Score ≥ → MEDIUM |
| `SIMILARITY.LOW` | `0.62` (env-overridable) | Below → LOW |
| `SIMILARITY.FLOOR` | `0.45` | Absolute floor — never return below |
| `CACHE.DEFAULT_TTL` | `3600s` (1h) | env `AI_CACHE_TTL` |
| `CACHE.VERSION` | `'v9'` | Bump → global cache invalidation |
| `RERANK.FACTORS.ARTICLE` | `1.30` | KB article boost |
| `RERANK.FACTORS.FAQ` | `1.35` | FAQ boost |
| `RERANK.FACTORS.DOCUMENT` | `1.15` | Document boost |
| `RERANK.FACTORS.URL` | `0.60` | URL whitelist penalty |
| `RERANK.FACTORS.TICKET` | `0.50` | Ticket-derived penalty |
| `RERANK.WEIGHTS.SEMANTIC` | `0.70` | Semantic blend |
| `RERANK.WEIGHTS.RECENCY` | `0.15` | Recency blend |
| `RERANK.WEIGHTS.RATING` | `0.15` | Rating blend |
| `SEARCH.DEFAULT_LIMIT` | `5` | Final K |
| `SEARCH.PRE_RERANK_LIMIT` | `20` | Rerank pool |
| `EMBEDDING.DEFAULT_VERSION` | `'v1'` (but Settings DB override is `v2_2` active) | ADR-007 isolation |
| `EMBEDDING.GEMINI_DIM` | `3072` | Active production |
| `EMBEDDING.OPENAI_DIM` | `1536` | Chat fallback only (ADR-006) |
| `EMBEDDING.OLLAMA_DIM` | `768` | Local fallback |

### 9.2 Confidence bands — two-shape reality

| Layer | Shape | Source |
|---|---|---|
| Prisma `ConfidenceBand` enum | 3 levels: `HIGH`, `MEDIUM`, `LOW` | `@aluplan/database` |
| Runtime `LocalConfidenceBand` | 4 levels: `HIGH`, `MEDIUM`, `LOW`, `NO_MATCH` | `apps/backend/src/ai/ai-query.service.ts` |

The 4-level runtime type is **intentionally not propagated to the Prisma enum yet** (canonical). `NO_MATCH` is a runtime signal for routing decisions; persistence collapses it down to `LOW` or nothing.

### 9.3 The MASTER_DIAGNOSIS_PROMPT lives inline

The master diagnosis prompt is declared inline in `apps/backend/src/ai/ai-query.service.ts` (within a 2672-line service file). This is **intentional**:
- Prompt versioning happens through normal Git diffs.
- Service co-location keeps prompt + dispatch logic reviewable together.
- **Do not propose moving prompts to a generic `prompts/` folder** unless the user gives an explicit operational reason.

Shared prompt builder lives in `apps/backend/src/ai/ai-answer-contract.ts`. The customer-facing `AiQueryService` and the admin-facing `AiCopilotService` both call `buildSupportAnswerContractPrompt(...)` to enforce the no-drift contract.

### 9.4 Provider routing and embedding isolation

- Chat fallback chain: OpenAI → Groq → Ollama (with `opossum` circuit breaker in `ai-provider-router.service.ts`).
- **Embedding fallback is forbidden** (ADR-006). When Gemini embedding quota is exhausted, ingestion pauses/fails clearly — it never silently falls back to OpenAI embeddings within the same `embedding_version`.

## 10. CRM (Dynamics 365) conventions (canonical)

### 10.1 Single sync path (ADR-008)

`CrmRecordSyncService.upsertAccountFromDynamics()` and `upsertContactFromDynamics()` are the **only** persistence path. Full import, delta sync (`*/5 * * * *`), and webhooks all route through these methods.

```typescript
const account = await this.prisma.crmAccount.upsert({
    where: { externalAccountId: externalId },
    update: next,
    create: { ...next, externalAccountId: externalId },
});
```

Pattern: business-key upsert on `externalAccountId` (Dynamics GUID). No separate idempotency table.

### 10.2 Raw payload preserved

`CrmAccount.rawCrmPayload Json?` stores the **complete** Dynamics payload. **Do not sanitize before storage** — the raw snapshot is intentional for replay, debugging, and field mapping changes.

### 10.3 Field mapping is config-driven

```typescript
const mappings = (config?.syncSettings?.accountMapping || {}) as Record<string, string>;
const externalId = this.resolveField(data, 'externalAccountId', mappings, 'accountid');
```

Field name resolution layers: explicit mapping config → fallback Dynamics field name(s). Helper methods `resolveField`, `resolveFirstField`, `limitString`, `asNullableString` handle Dynamics' inconsistent field naming (e.g., `new_clientidfrilo` vs `new_clientid_frilo`).

### 10.4 Placeholder emails

When a Dynamics contact lacks an email: `no-email-${contactId}@internal.aluplan`. The `isPlaceholderEmail` flag is preserved on the customer profile.

### 10.5 Protected admin emails

`ADMIN_BYPASS_EMAILS` env var holds comma-separated admin emails that are **never** mutated by CRM sync. Sync skips them with a warning log.

### 10.6 Secret encryption

CRM connection secrets (`clientSecret`, `webhookSecret`) are encrypted at rest using `CryptoService.encrypt()` / `.decrypt()`. Workers decrypt only when about to make outbound calls.

### 10.7 Field-level change log

Every changed field writes to `CrmChangeLog`:

```prisma
model CrmChangeLog {
    entityType    String   @db.VarChar(32)    // 'account' | 'contact'
    entityId      String   @db.VarChar(255)   // Dynamics GUID
    localRecordId String?  @db.Uuid           // local mirror id
    fieldName     String   @db.VarChar(100)
    oldValue      String?
    newValue      String?
    source        String   @default("DELTA_SYNC")   // 'FULL_IMPORT' | 'DELTA_SYNC' | 'WEBHOOK'
    status        String   @default("SUCCESS")
    changedAt     DateTime @default(now())
}
```

Granular audit — not just "row updated", but which fields changed and by which sync path.

## 11. Frontend conventions (canonical, from CLAUDE.md §6 and code)

- **Routing:** `next-intl` — import from `src/i18n/routing.ts`, **not** `next/link` directly.
- **Locales:** `tr` (default), `en`, `de`. Every string parallel in `messages/{tr,en,de}.json`. `pnpm i18n:check` must pass.
- **State:** Zustand in `src/stores/`. **TanStack Query is NOT used** — server data flows from Server Components and route handlers.
- **UI:** Radix UI primitives + Tailwind + shadcn-style `src/components/ui/`.
- **Toast:** `sonner` (`toast()` from `sonner`).
- **Server Actions:** `(dashboard)/actions.ts` — shared dashboard tree hub.
- **Middleware:** `next-intl` middleware + CSP nonce (`x-nonce` header) + auth gating.
- **Real-time:** Socket.io client (`src/lib/socket.ts`). **Not SSE.** Streaming AI responses also use WebSocket.
- **Forms:** `react-hook-form` + Zod.
- **`@/` alias** → `apps/frontend/src/` (Vitest + TypeScript).
- **German translations have known gaps** (AGENTS.md) — run `pnpm i18n:check` before broad UI text changes.

## 12. Testing conventions (canonical)

- **Backend:** Jest + `@swc/jest`. Co-located `*.spec.ts`. Coverage threshold: **35%** line/statement.
- **Backend integration:** ts-jest, alias `@aluplan/database`. Need real Postgres + Redis.
- **Frontend unit:** Vitest (jsdom). Threshold: **45%**.
- **Frontend E2E:** Playwright. Backend + frontend start automatically.
- **Property-based:** `fast-check`. Naming `*.pbt.spec.ts`. Property files annotate intent at the top.
- **AI no-drift tests:** `expect(prompt).toContain('exact phrase')` — guards prompt regressions.

Test module setup uses `Test.createTestingModule({ providers: [{ provide: X, useValue: mockX }] })`. Mock Prisma shape mirrors the client (`mockPrisma.aiInteraction.create.mockResolvedValue(...)`). Mock queues via `getQueueToken('queue-name')`.

Must-pass tests for RAG/AI changes (AGENTS.md):

```bash
pnpm --filter @aluplan/backend test -- \
    ai-query.service.spec.ts \
    embedding.service.spec.ts \
    embedding-version.registry.spec.ts \
    rag-maintenance.service.spec.ts \
    gemini.service.spec.ts \
    llm-api.service.spec.ts
pnpm --filter @aluplan/backend typecheck
pnpm --filter @aluplan/frontend typecheck
```

## 13. Observability conventions (canonical)

- **Logger:** `nestjs-pino` global. PII redaction at formatter level.
- **Sentry:** `instrument.ts` loaded **before** `AppModule`.
- **OpenTelemetry:** `otel.ts` loaded **before** `AppModule`. `OTEL_EXPORTER_OTLP_ENDPOINT` env-driven.
- **Loki:** optional, via `LOKI_HOST` + `pino-loki`.
- **Langfuse:** every LLM call gets a distributed trace (cost + latency).
- **Bull-Board:** `/queues` route exposes BullMQ state to operators.
- **Prometheus metrics:** `apps/backend/src/metrics/` module.

**Audit scope is selective and intentional.** `AuditLogInterceptor` only persists `POST/PATCH/DELETE` requests to URLs containing `/admin`, `/settings`, or `/users`. Other traffic is **not** audited — this is by design (performance + storage).

## 14. Infrastructure & CI/CD

- **Docker Compose dev stack:** Postgres 16 (pgvector) + Redis (AOF, LRU 256MB) + Ollama (optional). `pg_stat_statements` enabled, `log_min_duration_statement=500`.
- **Socket.io:** `@socket.io/redis-adapter` for multi-instance room sharing.
- **Deployment:** Coolify-targeted. Each app has its own Dockerfile. `docker-compose.staging.yml` for staging.
- **CI workflows:** `backend-test.yml`, `frontend-test.yml`, `ci.yml`, `ai-eval.yml`, `dr-drill.yml`, `semantic-release.yml`.

## 15. Meta-tooling — engineering culture, not just tools

The repository expects engineering agents (human or AI) to use these tools as part of normal workflow:

### 15.1 GitNexus (code intelligence)

- `gitnexus_impact({ target: "SymbolName", direction: "upstream" })` — **required before editing any high-blast-radius symbol** (see §4).
- `gitnexus_detect_changes()` — **required before committing product code** to verify only expected symbols changed.
- `gitnexus_query({ query: "concept" })` — find execution flows when exploring unfamiliar code (preferred over grep).
- `gitnexus_context({ name: "SymbolName" })` — full caller/callee/flow context for a symbol.
- `gitnexus_rename` — never rename symbols with find-and-replace.

If GitNexus warns "index stale," run `npx gitnexus analyze` first.

### 15.2 Graphify (knowledge graph)

Graph data lives in `graphify-out/`. Read `graphify-out/GRAPH_REPORT.md` first for architecture questions; navigate from `graphify-out/wiki/index.md` if it exists.

```bash
graphify query "<question>"
graphify path "<A>" "<B>"
graphify explain "<concept>"
graphify update .
```

### 15.3 `.ai` operational memory

Files under `.ai/`:
- `bootstrap.txt` — agent boot context
- `current-focus.md` — active objective (operational memory; not canonical architecture)
- `session-summary.md` — implementation history
- `architecture-decisions.md` — durable ADRs (these **are** canonical)
- `rag-quality/`, `product-flow/`, `summaries/` — domain-specific working sets

**Write to** `session-summary.md` after significant work; update `current-focus.md` when the active objective changes; update `architecture-decisions.md` when a durable technical decision changes.

### 15.4 Commit hygiene (AGENTS.md)

- Keep docs/memory, regression tests, product code, DB/config, generated graph output, and tooling files in **separate commits**.
- Run `git diff --name-only` and a focused test set before committing.
- Run `gitnexus detect_changes` before product commits when available.
- Do not commit generated `packages/database/client/` unless Prisma generation intentionally changed tracked output.
- `apps/backend/openapi.json` is regenerated separately — don't mix it into product commits unintentionally.

## 16. Operationally intentional complexity — preserve

The following are **deliberate architectural complexity**, not accidental. The skill must preserve them when proposing changes:

- **Queue orchestration** across ~6+ queues (`crm-sync`, `ai-query-processing`, `knowledge-sync`, etc.) — chosen for failure isolation.
- **Async AI workflows** with WebSocket result delivery — chosen for UX during slow LLM calls.
- **Retrieval layering** (filter cascade → keyword → vector → merge → rerank → context compression) — chosen for quality, not over-engineering.
- **CRM synchronization** across three paths (full / delta / webhook) all reconciled to `CrmRecordSyncService` (ADR-008).
- **Observability systems** (Pino + Sentry + OpenTelemetry + Langfuse + Loki + Bull-Board + Prometheus) — chosen for production accountability.
- **Provider routing** with circuit breakers (`opossum`) — chosen for cost and quota resilience.
- **Cost governance** (`AI_GLOBAL_DAILY_CAP`, `AI_USER_DAILY_QUOTA`, embed-budget guard, semantic cache) — chosen because Gemini free tier is real.
- **Diagnostic escalation logic** (confidence bands → routing → training queue → admin approval) — chosen because R-T1, R-T3, R-T5 forbid uncontrolled FAQ promotion.

## 17. Accidental complexity — do not propagate

Patterns the skill recognizes but **does not generate**:

- `forwardRef` imports that aren't used (e.g., `crm.module.ts:1`) — residue.
- `(this.service as any).privateMethod(...)` type-cast accesses to private methods (e.g., `crm.processor.ts:41`) — transitional workaround.
- `Job<any, any, string>` payload types in workers — currently canonical but loose; do not strengthen unless asked.
- `CrmAccount.account_number` missing `@map` — transitional inconsistency.
- `AiResponseCache.tenantId` — multi-tenant residue from abandoned direction.

When editing existing files that contain these, **cleanup suggestions are allowed** but never as a massive unsolicited refactor — surface the option, let the user decide.

## 18. Default response stance

When the user asks for code or a design proposal in this repo:

1. **Read the relevant references on demand** — don't preload everything.
2. **Check the truth hierarchy** if docs and code disagree.
3. **Surface high-blast-radius warnings** with the recommended `gitnexus_impact` call.
4. **Preserve intentional complexity** from §16. Don't simplify queue orchestration, retrieval layering, or observability into generic SaaS abstractions.
5. **Refuse to propagate accidental complexity** from §17.
6. **Stay single-tenant** — never introduce tenant abstractions.
7. **Respect ADRs** — they are constraints, not suggestions.
8. **Match real conventions** — 4-space indent, snake_case columns + camelCase models, emoji'd logs, NestJS standard exceptions, no repository layer, business-key idempotency.
9. **Generate Turkish explanations** when responding to the user; English for all code, identifiers, file paths, log keys, ADR codes.

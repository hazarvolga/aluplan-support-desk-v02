# Production Reliability

Read this when proposing infrastructure changes, deployment strategies, security hardening, or disaster recovery. The canonical setup targets **Coolify on ARM64** (Oracle Cloud).

## 1. Infrastructure stack

| Component | Config | Notes |
|---|---|---|
| **Postgres 16** | pgvector enabled, `pg_stat_statements`, `log_min_duration_statement=500` | Single instance (single-tenant) |
| **Redis** | AOF persistence, LRU eviction 256MB | BullMQ, semantic cache, Socket.io adapter, throttle |
| **Ollama** | Optional local LLM | Fallback provider — not primary |
| **Coolify** | Container orchestration | Target deployment platform |
| **Cloudflare** | DNS + proxy | CDN, DDoS mitigation |

Docker Compose for local dev (`docker-compose.yml`), staging (`docker-compose.staging.yml`). Each app (`backend`, `frontend`) has its own Dockerfile.

## 2. Boot sequence — fail-fast

`apps/backend/src/main.ts`:

1. **Pre-boot TCP probes** on Redis and Postgres. If either is unreachable, the process logs the failure and the container restarts (Coolify health check catches it).
2. `instrument.ts` (Sentry) and `otel.ts` (OpenTelemetry) load **before** `AppModule`.
3. `NestFactory.create(AppModule, { bufferLogs: true })`.
4. `app.enableShutdownHooks()` — SIGTERM drains BullMQ jobs before exit.
5. Env validation via Zod (`env-validation.schema.ts`) — missing required vars → process exits immediately.

**Required boot secrets** (AGENTS.md): `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, `ADMIN_BYPASS_EMAILS`.

## 3. Security hardening

### 3.1 HTTP layer

- `helmet` — CSP, CORP, COOP, COEP headers.
- CSP nonce via middleware (frontend `x-nonce` header).
- `csurf` — CSRF protection.
- `compression` — response compression.
- `cookieParser` — secure cookie handling.
- `trust proxy: 1` — required behind Coolify/Caddy reverse proxy.

### 3.2 Input validation

- `XssValidationPipe` — global, blocks `<script>`, `onerror`, `javascript:` in non-message strings. **High blast radius** (AGENTS.md).
- `SsrfGuard` — prevents server-side request forgery in outbound calls.
- `ValidationPipe` global with `whitelist`, `forbidNonWhitelisted`, `transform`.

### 3.3 Secrets

- CRM secrets (`clientSecret`, `webhookSecret`) encrypted at rest via `CryptoService`.
- `ENCRYPTION_KEY` validated at boot: `z.string().min(32).max(64)`.
- Pino auto-redacts `password`, `authorization`, `clientSecret`, `webhookSecret` from logs.
- `ADMIN_BYPASS_EMAILS` protects admin accounts from CRM sync overwrites.

### 3.4 Rate limiting

`ThrottlerGuard` Redis-backed, 120 req/min per IP (global). AI query queue has its own rate limiter (`AI_QUEUE_RATE_MAX: 15` per `AI_QUEUE_RATE_DURATION_MS: 60000`).

### 3.5 CORS

`ALLOWED_ORIGINS` env — must be explicit in production. Wildcard `*` is rejected by env validation.

## 4. Graceful shutdown

`app.enableShutdownHooks()` ensures:
1. BullMQ workers finish active jobs (or release locks).
2. WebSocket connections are closed.
3. Prisma client disconnects.
4. Process exits cleanly.

Workers should not hold uncommitted state mid-job. Use Prisma transactions for multi-write operations so partial completion rolls back on SIGTERM.

## 5. Health probes

- `GET /health/live` — process alive (no dependency check).
- `GET /health/ready` — Postgres + Redis reachable.

Coolify uses these for container restarts and rolling deploys. Must be **fast and side-effect-free**.

## 6. Cache strategy

### 6.1 Semantic cache (`AiResponseCache`)

- TTL: `RAG_CONFIG.CACHE.DEFAULT_TTL` (3600s = 1h, env `AI_CACHE_TTL`).
- Version key: `RAG_CONFIG.CACHE.VERSION` (currently `'v9'`).
- **Bump the version → global invalidation.** No need to delete rows manually.
- R-P1: same query within 5 minutes must serve from cache.

### 6.2 Redis cache

- BullMQ job metadata.
- Socket.io adapter rooms.
- Throttle counters.
- Session/token blacklist.

Redis config: AOF persistence, LRU eviction at 256MB.

## 7. Embedding lifecycle

When activating a new embedding version:

1. Add to `EmbeddingVersionRegistry`.
2. Dual-write: new embeddings go to both old and new version.
3. Validate retrieval quality on the new version.
4. Flip the Settings DB active version.
5. **Wait `RAG_CONFIG.EMBEDDING.CLEANUP_DELAY_MS` (24h)** before deleting old embeddings.
6. This is never a hot swap — 24h gives rollback window.

HNSW indexes live in `scripts/migrate-hnsw-indexes.sql` (not Prisma schema). Re-run after large embedding migrations.

## 8. Cost governance — production safety nets

```
AI_GLOBAL_DAILY_CAP                         hard global cap
AI_USER_DAILY_QUOTA                         per-user cap
KNOWLEDGE_SYNC_EMBED_BUDGET_GUARD: true     embedding cost guard
KNOWLEDGE_SYNC_DAILY_EMBED_USD_CAP          daily embedding cap
AI_PROVIDER_QUOTA_COOLDOWN_MS               circuit-breaker cooldown
```

When budget exceeded:
- Ingestion **stops** (clear log line, not silent skip).
- Chat degrades to cheaper providers via circuit-breaker fallback.
- Operators alerted via `NotificationsGateway`.

Cost per call recorded on `AiInteraction.estimatedCost @db.Decimal(10, 6)`.

## 9. Provider resilience

Chat fallback: OpenAI → Groq → Ollama, via `opossum` circuit breaker (`ai-provider-router.service.ts`).

Embedding: **no fallback** (ADR-006). Gemini quota exhaustion pauses ingestion.

Circuit breaker lifecycle:
1. Active provider fails → circuit opens.
2. Fallback provider used → logged on `AiInteraction.provider`.
3. After `cooldown_ms` → circuit half-opens, trials the original provider.
4. Persistent fallback (>N minutes) → operator alert.

## 10. Deployment

### 10.1 Coolify

Each app has its own Dockerfile. Coolify handles:
- Rolling deploys with health check gates.
- Environment variable management.
- Container restart on crash.

### 10.2 CI/CD

| Workflow | Purpose |
|---|---|
| `ci.yml` | Combined test gate |
| `backend-test.yml` | Backend unit + integration |
| `frontend-test.yml` | Frontend unit + E2E |
| `ai-eval.yml` | RAG acceptance evaluation |
| `semantic-release.yml` | Versioning + changelog |
| `dr-drill.yml` | Disaster recovery drills |

### 10.3 Commit hygiene (AGENTS.md)

Separate commits for:
- Documentation/memory
- Regression tests
- Product code
- DB/config changes
- Generated graph output
- Tooling files

Run `git diff --name-only` and focused test set before committing. Run `gitnexus detect_changes` before product commits when available.

Do not commit: generated `packages/database/client/` (unless Prisma generation intentionally changed), `apps/backend/openapi.json` mixed into product commits.

## 11. Disaster recovery

- `apps/backend/src/common/services/database-backup.service.ts` — backup orchestration.
- `scripts/` — restore runners (`restore-runner.ts`).
- `dr-drill.yml` — CI workflow for DR drills.
- Postgres WAL archiving + point-in-time recovery (when configured).

Regular DR drills are expected — the `dr-drill.yml` workflow exists for this purpose.

## 12. Socket.io — multi-instance

`@socket.io/redis-adapter` enables room sharing across backend replicas. `NotificationsGateway.sendToUser(userId, event, data)` works correctly when multiple backend instances are running.

When scaling to multiple replicas:
- Redis adapter handles room state.
- BullMQ jobs are distributed across replicas (Redis-backed coordination).
- Prisma connections need pooling awareness (connection limit per replica).

## 13. Monitoring topology

```
Frontend (Next.js 15)
    ↓  [CSP nonce, Sentry browser SDK]
    
Backend (NestJS 11)
    ├── Pino → stdout → [Loki if LOKI_HOST]
    ├── Sentry (instrument.ts)
    ├── OpenTelemetry (otel.ts) → OTLP exporter
    ├── Langfuse (per-LLM-call traces)
    ├── Prometheus (/metrics)
    ├── Bull-Board (/queues)
    └── AuditLog (DB)

Postgres 16 (pgvector)
    ├── pg_stat_statements
    └── log_min_duration_statement=500

Redis
    └── AOF, LRU 256MB
```

## 14. Anti-patterns

- Deploying without health check gates (Coolify should gate on `/health/ready`).
- Wildcard `ALLOWED_ORIGINS` in production.
- Hot-swapping embedding versions without the 24h cleanup delay.
- Disabling `KNOWLEDGE_SYNC_EMBED_BUDGET_GUARD` in production.
- Running Prisma migrations without backup.
- Committing secrets to the repository.
- Scaling replicas without Redis adapter for Socket.io.
- Skipping `pnpm db:generate` after pulling schema changes.
- Bypassing env validation by reading `process.env` directly.

## 15. When in doubt

- Prefer **fail-fast boot** (TCP probes + env validation) over silent degradation.
- Prefer **graceful shutdown** (`enableShutdownHooks`) over hard kill.
- Prefer **cache version bump** over manual cache row deletion.
- Prefer **24h embedding cleanup delay** over immediate deletion.
- Prefer **circuit breaker fallback** over retry storms.
- Prefer **env-driven configuration** over code-level conditionals.
- Prefer **DR drills** over untested recovery plans.

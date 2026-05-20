# Observability & Operations

Read this when adding logging, metrics, tracing, alerting, or debugging production behavior. The canonical implementations span multiple modules.

## 1. Logging — nestjs-pino, emoji strings

`nestjs-pino` is the global logger. Loaded in `main.ts` via `app.useLogger(app.get(PinoLogger))`.

**Service-level convention is human-readable string + emoji + interpolation:**

```typescript
this.logger.log(`🚀 Starting background CRM sync for connection: ${connectionId} (Job: ${job.id})`);
this.logger.warn(`CRM contact sync skipped for protected admin email: ${email}`);
this.logger.error(`❌ Background CRM sync failed: ${error.message}`, error.stack);
```

**Structured `event` field JSON is NOT the convention.** Pino's formatter produces structured JSON downstream, but service code writes conversational strings. Follow the existing style.

### 1.1 PII redaction

Automatic at the formatter level for: `password`, `authorization` header, `clientSecret`, `webhookSecret`. Do not redact manually in service code — it's already handled.

**Do not log:** decrypted secrets (even at `debug`), full Dynamics raw payloads, full retrieval passages, customer PII beyond what's operationally necessary.

### 1.2 Loki

Optional shipping via `pino-loki`, conditional on `LOKI_HOST` env. When Loki is down, logs still go to stdout (Pino transport is additive, not blocking).

### 1.3 Log levels

| Level | Use |
|---|---|
| `debug` | Local dev only — never in production hot paths |
| `log` | Durable events: request received, job completed, sync started |
| `warn` | Recoverable degradations: provider fallback, record skipped with reason |
| `error` | Failures needing operator attention, always with `error.stack` |

## 2. Sentry

`apps/backend/src/instrument.ts` loads **before** `AppModule`. `SentryExceptionFilter` (`apps/backend/src/common/filters/sentry-exception.filter.ts`) captures unhandled exceptions.

When Sentry is configured (`SENTRY_DSN` env), every unhandled exception gets:
- Stack trace
- Request context (method, URL, user ID)
- Environment tag

`GlobalExceptionFilter` and `SentryExceptionFilter` coexist — global handles the HTTP response shape; Sentry captures for remote alerting.

## 3. OpenTelemetry

`apps/backend/src/otel.ts` loads **before** `AppModule`. Exports traces to `OTEL_EXPORTER_OTLP_ENDPOINT` (env-driven). When not configured, OTel is a no-op.

Trace context propagates through:
- HTTP requests (automatic via OTel HTTP instrumentation)
- Prisma queries (via OTel Prisma instrumentation when enabled)
- BullMQ jobs (manual — workers inherit trace context from the enqueue call when wired)

## 4. Langfuse — LLM-specific tracing

Every LLM call gets a Langfuse trace (`apps/backend/src/ai/langfuse.service.ts`):

- Provider, model, input/output tokens, cost, latency
- Trace linked to `AiInteraction.id`
- Enables retrieval quality debugging: "this answer used gpt-4o-mini, cost $0.002, took 3.2s, confidence MEDIUM"

**On top of** the inline `AiInteraction` columns — Langfuse serves AI engineering investigation; inline columns serve operator dashboards.

When adding a new LLM call site, wire through `AiService.dispatch(...)` so the central router records Langfuse telemetry uniformly. Direct provider client calls bypass Langfuse.

## 5. Prometheus metrics

`apps/backend/src/metrics/` module. `MetricsInterceptor` records request duration and status codes. `MetricsService` exposes custom gauges and counters.

Key metrics the codebase already tracks:
- Request duration histograms
- AI query count by confidence band
- Cache hit/miss ratio
- Queue depth and processing time
- Provider fallback counts

Metrics endpoint at `/metrics` (standard Prometheus scrape target).

When adding a new operationally significant flow, add a counter or histogram to `MetricsService` — don't invent a parallel metrics path.

## 6. Bull-Board

Mounted at `/queues`. Exposes all BullMQ queues: active, waiting, completed, failed, delayed jobs.

Operator workflows:
- **Triage DLQ:** inspect failed job payload (sanitized), identify root cause, re-queue or discard.
- **Monitor throughput:** active + waiting counts during bulk operations.
- **Verify rate limiting:** check that AI queue respects `AI_QUEUE_RATE_MAX`.

## 7. Audit log

Two audit surfaces:

### 7.1 HTTP audit (selective)

`AuditLogInterceptor` writes to `AuditLog` for **mutating admin actions only**:
- Methods: `POST`, `PATCH`, `DELETE`
- URLs containing: `/admin`, `/settings`, `/users`
- Authenticated users only

This is intentional — not all traffic is audited (performance + storage).

### 7.2 Exception audit (all)

`GlobalExceptionFilter` persists **every** exception to `AuditLog` via `ErrorLoggerService.logError({ action: 'api_exception', ... })`:

```typescript
await this.errorLogger.logError({
    action: 'api_exception',
    message: responseBody.message,
    error: exception,
    actorId: request.user?.id,
    entityType: 'API',
    metadata: { path, method, statusCode },
});
```

Failure to log does not crash the response.

### 7.3 Domain-specific audit

- `CrmChangeLog` — field-level CRM change history (see `crm-dynamics365-rules.md`).
- `RagObservabilityService` — retrieval cascade log (query → results → rerank → final selection).
- `AiInteraction` — per-query telemetry (provider, tokens, cost, confidence).
- R-S7: `source_id` + `source_type` per chunk → immutable audit trail.

## 8. Retrieval observability — `RagObservabilityService`

Every AI query logs its retrieval cascade:
- Query text and detected language
- Embedding search results (pre-rerank)
- Rerank scores and factors applied
- Final selection (post-rerank)
- Confidence band assignment
- Cache hit/miss

**Without this log, retrieval regressions are unfixable.** Treat it as a first-class artifact. When modifying retrieval logic, ensure the observability service still captures the full cascade.

## 9. Health checks

`apps/backend/src/health/`:
- `GET /health/live` — process is alive (no dependency checks)
- `GET /health/ready` — Postgres + Redis reachable

Used by Coolify container probes. Must remain fast and side-effect-free.

## 10. Alerting

`apps/backend/src/common/services/alerting.service.ts` — centralized alert dispatch. Currently supports:
- `NotificationsGateway` — real-time WebSocket alerts to operators
- Sentry — exception capture
- Log-level escalation — `error` level triggers Loki/Sentry attention

When CRM delta sync fails per-connection, it emits via `NotificationsGateway.emitCrmSyncError(...)` so the operator UI can show it. AI provider degradation should follow the same pattern.

## 11. Database backup

`apps/backend/src/common/services/database-backup.service.ts` handles backup orchestration. `scripts/` contains restore runners. DR drills via `dr-drill.yml` CI workflow.

## 12. Operational runbooks — where things live

| Concern | Where to look |
|---|---|
| "Why did this AI answer score LOW?" | `RagObservabilityService` retrieval log + `AiInteraction` row + Langfuse trace |
| "Why did CRM sync fail?" | `CrmSyncLog` row (status ERROR, errorMessage) + Bull-Board `/queues` (failed job payload) |
| "Which field changed on this customer?" | `CrmChangeLog` filtered by `entityId` |
| "Is the AI budget exhausted?" | `AiBudgetMonitorService` + `AiInteraction.estimatedCost` aggregate |
| "Is embedding ingestion stuck?" | Bull-Board knowledge-sync queue + `KNOWLEDGE_SYNC_EMBED_BUDGET_GUARD` status |
| "Which provider is active?" | `AiInteraction.provider` recent rows + Langfuse dashboard |
| "What's the cache hit rate?" | `MetricsService` cache counters + `AiResponseCache` row count vs. `AiInteraction` count |

## 13. Anti-patterns

- Adding structured `event` JSON fields to service-level logs (not the convention — use string + emoji).
- Manual PII redaction in service code (handled globally by pino formatter).
- Creating a parallel metrics path instead of using `MetricsService`.
- Logging full Dynamics raw payloads (huge, potentially PII-laden).
- Skipping `RagObservabilityService` when modifying retrieval (makes regressions invisible).
- Health check endpoints that mutate state or take > 200ms.
- Alerting via email from service code (use `NotificationsGateway` or `AlertingService`).

## 14. When in doubt

- Prefer **emoji string logs** matching existing convention over structured event JSON.
- Prefer **`MetricsService` counters** over ad-hoc logging for operational signals.
- Prefer **`RagObservabilityService`** for retrieval debugging over general-purpose logging.
- Prefer **Langfuse** for LLM cost/quality investigation over custom dashboards.
- Prefer **Bull-Board** for queue triage over custom admin endpoints.
- Prefer **`NotificationsGateway`** for operator alerts over email-based alerting.

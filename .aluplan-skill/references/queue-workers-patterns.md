# Queue & Worker Patterns (BullMQ)

Read this before designing or modifying any queue, worker, or background job. The canonical implementations live in:

- `apps/backend/src/crm/crm.processor.ts` (71 lines)
- `apps/backend/src/ai/ai-query.processor.ts` (64 lines)
- `apps/backend/src/crm/crm.module.ts` (queue declaration)

Bull-Board operator UI is mounted at `/queues`.

## 1. Queue declaration — inline in the module

The canonical pattern declares queues **inside the consuming module's `imports`**, not in a separate queue config module:

```typescript
// apps/backend/src/crm/crm.module.ts
@Module({
    imports: [
        BullModule.registerQueue({
            name: 'crm-sync',
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
                removeOnComplete: 50,
                removeOnFail: false,    // DLQ retention in Bull-Board
            },
        }),
    ],
    // ...
})
```

Defaults to memorize:

| Setting | Value | Notes |
|---|---|---|
| `attempts` | `3` | Generous enough for transient blips |
| `backoff` | `{ type: 'exponential', delay: 2000 }` | 2s, 4s, 8s |
| `removeOnComplete` | `50` (or `100`) | Both seen — pick by queue volume |
| `removeOnFail` | `false` | Failed jobs **retained** in Bull-Board for triage |

Variations per queue are expected — AI tightens concurrency and adds `limiter`; knowledge-sync respects ADR-002 rate caps.

## 2. Worker skeleton

From `crm.processor.ts`:

```typescript
@Processor('crm-sync')
export class CrmProcessor extends WorkerHost {
    private readonly logger = new Logger(CrmProcessor.name);

    constructor(
        private readonly crmService: CrmService,
        private readonly prisma: PrismaService,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { connectionId, logId } = job.data;
        this.logger.log(`🚀 Starting background CRM sync for connection: ${connectionId} (Job: ${job.id})`);

        try {
            const connection = await this.prisma.crmConnection.findUnique({ where: { id: connectionId } });
            if (!connection) throw new Error(`CRM connection ${connectionId} not found`);

            // ... decrypt secrets, call into service
            return { status: 'completed', connectionId };
        } catch (error) {
            this.logger.error(`❌ Background CRM sync failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(`✅ CRM Sync Job ${job.id} completed`);
    }

    @OnWorkerEvent('failed')
    async onFailed(job: Job, error: Error) {
        this.logger.error(`❌ CRM Sync Job ${job.id} failed: ${error.message}`);
        if (job.data.logId) {
            await this.prisma.crmSyncLog.update({
                where: { id: job.data.logId },
                data: { status: SyncStatus.ERROR, errorMessage: error.message, completedAt: new Date() },
            });
        }
    }
}
```

Conventions:
- `@Processor('queue-name')` with optional config.
- `extends WorkerHost`, constructor-injected dependencies.
- `async process(job: Job<any, any, string>)` — **payload type is `any` in practice.** Do not over-engineer typed payloads unless the user asks.
- `@OnWorkerEvent('completed' | 'failed')` for lifecycle hooks.
- Emoji'd string logs (no structured `event` JSON at service level).
- Failure handler often updates a related DB row (e.g., `CrmSyncLog` to `ERROR`) so the operator UI shows the outcome.

## 3. Rate limiting and concurrency

From `ai-query.processor.ts`:

```typescript
@Processor('ai-query-processing', {
    concurrency: 2,
    limiter: {
        max: parseInt(process.env.AI_QUEUE_RATE_MAX ?? '15', 10),
        duration: parseInt(process.env.AI_QUEUE_RATE_DURATION_MS ?? '60000', 10),
    },
})
export class AiQueryProcessor extends WorkerHost { ... }
```

- **Concurrency declared inline** on the processor decorator.
- **Rate limiter inline** — env-tunable. Default: 15 jobs per 60 seconds.
- Tune per dependency limits (Dataverse throttles, Gemini quota), not CPU.

For knowledge sync, ADR-002 mandates low-rate ingestion: `KNOWLEDGE_SYNC_RATE_MAX`, `KNOWLEDGE_SYNC_RATE_DURATION_MS`, `KNOWLEDGE_SYNC_QUEUE_CONCURRENCY`, `KNOWLEDGE_SYNC_BULK_DELAY_MS`, `KNOWLEDGE_SYNC_EMBED_DELAY_MS` all configure this.

## 4. Idempotency through the schema, not the queue

The canonical idempotency mechanism is **business-key uniqueness** at the database level, not a `processed_jobs` table or a `jobId` dedupe:

- `Ticket.interactionId @unique` — one AI interaction → at most one ticket.
- `CrmAccount.externalAccountId @unique` / `CustomerProfile.externalContactId @unique` — CRM upserts safe to retry.
- `AiResponseCache.queryHash @unique` — cache writes deduplicate.
- `CrmDeltaSyncState @@unique([connectionId, entityType])` — one delta cursor per (connection, entity).

When designing a new worker:
1. Identify the business key.
2. Add `@unique` in the Prisma schema.
3. Use Prisma `upsert` over that key inside the worker.
4. Result: retry is safe by construction.

Do **not** invent a `processed_jobs` table. This pattern is foreign to the codebase.

## 5. Payload contracts

Payloads are object literals with the IDs needed for processing. No `correlationId` envelope, no required `BaseJobPayload`. Identity comes from existing IDs:

```typescript
// CRM
{ connectionId, logId }

// AI query
{ options: AiQueryOptions, jobId }    // jobId here is a custom string, separate from BullMQ's job.id
```

Validate at the worker entry point if the payload could be malformed (e.g., from external sources). For internal enqueues from trusted controllers/services, validation may be light.

## 6. Async result delivery via WebSocket

For long-running async work that the client is waiting on, the worker delivers completion through `NotificationsGateway.sendToUser(userId, eventName, data)`:

```typescript
// ai-query.processor.ts
async process(job: Job<any, any, string>): Promise<any> {
    const { options, jobId } = job.data;
    try {
        const response = await this.aiQueryService.queryInternal(options);
        if (options.userId) {
            this.notifications.sendToUser(options.userId, 'AI_QUERY_COMPLETED', { jobId, result });
        }
        return result;
    } catch (error) {
        if (job.data.options?.userId) {
            this.notifications.sendToUser(job.data.options.userId, 'AI_QUERY_FAILED', { jobId, error: error.message });
        }
        throw error;
    }
}
```

Event naming convention: `<DOMAIN>_<ACTION>_<OUTCOME>`, all-caps.

The Socket.io adapter is `@socket.io/redis-adapter` for multi-instance room sharing — `sendToUser` works across backend replicas.

## 7. Cron jobs — live on services, not workers

Scheduled work uses `@nestjs/schedule` `@Cron` on the **service**, not a worker:

```typescript
// apps/backend/src/crm/services/crm-delta-sync.service.ts
@Cron(process.env.CRM_DELTA_SYNC_INTERVAL || '*/5 * * * *')
async runScheduledDeltaSync() {
    const connections = await this.prisma.crmConnection.findMany({ where: { isActive: true, deletedAt: null } });
    for (const connection of connections) {
        try { await this.runDeltaSync(connection.id); }
        catch (error) {
            this.logger.error(`CRM delta sync failed for connection ${connection.id}: ${error.message}`, error.stack);
            await this.notifications.emitCrmSyncError({ connectionId: connection.id, message: error.message });
        }
    }
}
```

Cron expressions are env-overridable. The service handles errors per-iteration so one bad connection doesn't break the whole schedule.

## 8. DLQ — `removeOnFail: false`

Failed jobs are **retained** in BullMQ's failed state by setting `removeOnFail: false`. Bull-Board at `/queues` exposes them for operator triage:

- Inspect with sanitized payload (Pino redacts secrets in logs; payload UI inherits pino redaction where applicable).
- Re-queue after fixing root cause — idempotency makes this safe.
- Discard with a logged reason.

A DLQ that grows unbounded is an unowned failure. Alert via `NotificationsGateway` and/or Prometheus metrics from the `metrics/` module.

## 9. Stalled job recovery

BullMQ marks a job stalled when its lock expires (worker crashed, OOM, network partition). The platform relies on BullMQ's defaults:
- `stalledInterval` — default 30s.
- `maxStalledCount` — default 1 (typical).

Because idempotency is enforced at the schema level (§4), **stalled retries are safe by construction**. A worker that breaks idempotency on retry would cause duplicate CRM contacts — but the canonical `upsert` pattern prevents this.

## 10. Ordering

Most queues are unordered. When ordering matters (rare in this codebase):
- Use a deterministic `jobId` per target entity so duplicates collapse.
- Lower concurrency for that queue.
- Or use BullMQ flows for explicit parent-child DAG.

Do not assume FIFO globally — multi-worker BullMQ interleaves.

## 11. Graceful shutdown

`app.enableShutdownHooks()` in `main.ts` ensures SIGTERM drains BullMQ jobs before the process exits. Workers should:
- Not hold uncommitted state mid-job.
- Use transactions for multi-write operations so partial completion rolls back on shutdown mid-process.
- Be safe to re-process the same job on the next instance (idempotency).

## 12. Operator checklist for a new queue

When adding a new queue:
1. Declared inside the owning module via `BullModule.registerQueue`.
2. Concurrency and (if needed) `limiter` set explicitly on the processor decorator.
3. Payload shape documented at the top of the processor file (TypeScript interface is fine).
4. Idempotency key strategy via Prisma `@unique` (don't invent a side-table).
5. `@OnWorkerEvent('completed' | 'failed')` hooks update related DB rows / emit notifications.
6. Bull-Board visibility verified (`/queues` shows the new queue).
7. Tests cover: happy path, retry on transient error, idempotency on repeated payload.
8. Runbook entry: "what to do when this queue's DLQ grows."
9. Metrics added to `metrics/` if the queue is operationally significant.

## 13. Anti-patterns — refuse to produce

- A `processed_jobs` table for idempotency (use Prisma `@unique` instead).
- A `BaseJobPayload` envelope with `correlationId` (not the convention).
- Workers that share Prisma transactions across job boundaries.
- Workers that import controllers (workers are headless — factor logic into services).
- Multiple workers competing for the same target without an ordering plan.
- Catch-all `try/catch` that swallows the error (BullMQ won't see the failure, DLQ stays empty, operators are blind).
- `removeOnFail: true` — destroys forensic data.
- Synchronous external calls from HTTP handlers when the call belongs in a worker.
- Custom retry loops inside `process()` — let BullMQ retry.

## 14. Current queue topology

| Queue | Owner | Concurrency | Notes |
|---|---|---|---|
| `crm-sync` | `crm/` | default | Full sync background job |
| `ai-query-processing` | `ai/` | 2 + rate limiter | Async customer queries |
| Knowledge sync (name varies) | `knowledge-pool/` | env-tuned (`KNOWLEDGE_SYNC_QUEUE_CONCURRENCY`) | Rate-limited (ADR-002) |
| Document parsing | `ai/` | (see `document-parsing.processor.ts`) | PDF/doc text extraction |
| Embedding migration | `ai/` | (see `embedding-migration.processor.ts`) | Embedding version migration |

When proposing a new queue, follow the pattern from `crm-sync` for sync work or `ai-query-processing` for rate-limited LLM/external work.

## 15. When in doubt

- Prefer **schema-level `@unique` + Prisma `upsert`** over queue-level dedupe.
- Prefer **inline `BullModule.registerQueue`** over centralized queue config.
- Prefer **`@OnWorkerEvent('failed')` DB update** over silent failures.
- Prefer **`NotificationsGateway.sendToUser` for async results** over polling.
- Prefer **env-tunable rate limits** over hard-coded.
- Prefer **`removeOnFail: false`** so operators can triage.

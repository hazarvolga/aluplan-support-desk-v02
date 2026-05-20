# Backend Development Rules

Read this when writing or modifying code under `apps/backend/`. The repository conventions catalog (`repository-conventions.md`) is the high-level reference; this document drills into NestJS-specific patterns the skill must follow.

## 1. Module file

Per the canonical template (see `crm.module.ts`):

```typescript
@Module({
    imports: [
        PrismaModule,
        NotificationsModule,
        BullModule.registerQueue({
            name: 'crm-sync',
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
                removeOnComplete: 50,
                removeOnFail: false,
            },
        }),
    ],
    controllers: [CrmController, CrmWebhookController],
    providers: [
        CrmService,
        Dynamics365Adapter,
        CrmProcessor,
        CrmRecordSyncService,
        CrmDeltaSyncService,
    ],
    exports: [CrmService, CrmDeltaSyncService],
})
export class CrmModule {}
```

Rules:
- **4-space indent.**
- Re-import `PrismaModule` per module (canonical — no global Prisma module).
- `BullModule.registerQueue` declared inline. No separate queue config file.
- `exports` is selective — only what other modules consume.
- Two controllers when there's a distinct webhook surface (regular API vs. inbound webhooks).
- **Do not** import `forwardRef` unless an actual circular dependency exists. The `forwardRef` import in `crm.module.ts:1` is accidental residue — do not propagate.

Small modules stay flat (no `services/` / `adapters/` subfolders). Modules grow internal structure only when complexity warrants it.

## 2. Service shape

```typescript
import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma, CrmProvider, SyncStatus } from '@aluplan/database';

@Injectable()
export class CrmService {
    private readonly logger = new Logger(CrmService.name);
    private adapters: Map<CrmProvider, ICrmAdapter> = new Map();

    constructor(
        @InjectQueue('crm-sync') private crmQueue: Queue,
        private prisma: PrismaService,
        private dynamics365: Dynamics365Adapter,
        private crypto: CryptoService,
    ) {}

    async syncConnection(connectionId: string): Promise<void> {
        this.logger.log(`🚀 Starting sync for connection ${connectionId}`);
        // ...
    }
}
```

Conventions:
- `@Injectable()` + `private readonly logger = new Logger(ClassName.name);` on every service.
- Constructor `private` (sometimes `private readonly`). Both are accepted; do not force conversion.
- Prisma types come from `@aluplan/database`, not `@prisma/client` directly (AGENTS.md rule).
- HTTP exceptions are standard NestJS — `BadRequestException`, `NotFoundException`, etc. **No custom `DomainError` hierarchy.** Do not introduce one.
- API response shape (CLAUDE.md §7): `{ success, data, error, meta }` — the controllers wrap service results.
- Services are stateless except where the codebase already keeps a map/cache as a field (e.g., `CrmService.adapters` map). Reuse the same field-style state only when it has clear lifecycle semantics.

## 3. Prisma usage

- **Services call `this.prisma.<model>.<method>(...)` directly.** No repository pattern.
- **`PrismaService` has a global soft-delete filter** applied in `onModuleInit()` for read queries (AGENTS.md). To include soft-deleted rows, bypass intentionally and comment why.
- **`PrismaService.onModuleInit()` stays free of DDL.** Schema repair belongs in migrations.
- **Transactions** for multi-write operations:

  ```typescript
  return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { ... } });
      const profile = await tx.customerProfile.create({ data: { userId: user.id, ... } });
      // pass `tx` to any helper that participates
      return profile;
  });
  ```

- **Upserts on business keys** for idempotency:

  ```typescript
  await this.prisma.crmAccount.upsert({
      where: { externalAccountId },
      update: next,
      create: { ...next, externalAccountId },
  });
  ```

- **Pagination is cursor-based** for any list that can grow. Offset pagination is acceptable only in admin tooling.
- **Indexes are part of the schema change**, not a follow-up. When you add a query, add the supporting `@@index([...])`.

## 4. DTOs and shared schemas

- HTTP boundary DTOs use `class-validator` + `class-transformer`.
- Validation pipe is global: `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, `transform`.
- Internal types (inter-service, queue payloads) often declare inline TypeScript `interface` at the top of the consuming file. **Do not over-engineer** these into separate `dto/` folders unless the module is already structured that way.
- Cross-package DTOs (frontend ↔ backend) live in `packages/shared-schemas/` as Zod schemas. Use these when the type is consumed by Next.js components / server actions.

## 5. Error handling

```typescript
// Global filter handles translation
const responseBody = {
    statusCode: httpStatus,
    timestamp: new Date().toISOString(),
    path: httpAdapter.getRequestUrl(request),
    message: typeof message === 'object' ? (message as any).message : message,
    error: typeof message === 'object' ? (message as any).error : null,
};
```

Every exception:
1. Is translated to this response shape via `GlobalExceptionFilter`.
2. Is persisted to `AuditLog` via `ErrorLoggerService.logError({ action: 'api_exception', ... })`.
3. Logger failure does not crash the response — defensive.

When raising errors in service code, use standard NestJS HttpException subclasses with a clear message:

```typescript
throw new NotFoundException(`Ticket ${ticketId} not found`);
throw new BadRequestException('externalAccountId is required');
```

## 6. Logging

Canonical style: **human-readable string + emoji + interpolation**:

```typescript
this.logger.log(`🚀 Starting background CRM sync for connection: ${connectionId} (Job: ${job.id})`);
this.logger.warn(`CRM contact sync skipped for protected admin email: ${email}`);
this.logger.error(`❌ Background CRM sync failed: ${error.message}`, error.stack);
```

- `nestjs-pino` global formatter produces structured JSON downstream. PII redaction (password, auth header, `clientSecret`, `webhookSecret`) is automatic — do not redact manually.
- Service code does not need to add `correlationId` fields; the request scope handles correlation.
- Loki shipping is conditional on `LOKI_HOST` env (`pino-loki`).

Levels:
- `debug` — local dev only
- `log` — durable events (request received, job completed, sync started)
- `warn` — recoverable degradations (provider fallback, skip with reason)
- `error` — failures needing attention

**Do not log:** secrets, full Dynamics raw payloads (huge), full retrieval passages, customer PII in cleartext beyond what's necessary for the operation.

## 7. Configuration

- Boot validation via Zod in `apps/backend/src/config/env-validation.schema.ts`. Process exits early on missing/malformed env.
- Required boot secrets (AGENTS.md): `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, `ADMIN_BYPASS_EMAILS`.
- Production: `ALLOWED_ORIGINS` must be explicit and safe.
- Domain config files in `apps/backend/src/config/`: `rag.config.ts`, `redis.config.ts`, `configuration.ts`.
- `process.env` access outside `config/` is rare — should go through `ConfigService` (`@nestjs/config`) or the typed config constants.

## 8. Cross-cutting wiring (canonical)

`apps/backend/src/main.ts` and `app.module.ts` set up:

- **Logging:** `nestjs-pino` global with redaction.
- **Throttling:** `ThrottlerGuard` Redis-backed, 120 req/min per IP.
- **Interceptors via `APP_INTERCEPTOR`:** `AuditLogInterceptor`, `MetricsInterceptor`.
- **Security:** `helmet`, `csurf`, `XssValidationPipe`, `SsrfGuard`.
- **Observability:** Sentry (`instrument.ts`) + OpenTelemetry (`otel.ts`) loaded **before** `AppModule`.
- **Boot pre-check:** TCP probe on Redis + Postgres.
- **Shutdown:** `app.enableShutdownHooks()` — BullMQ drained on SIGTERM.

When proposing a new global interceptor / filter / guard, register via `APP_INTERCEPTOR` / `APP_FILTER` / `APP_GUARD` in `app.module.ts`. Do not bolt onto `main.ts` directly.

## 9. Audit log scope (selective and intentional)

`AuditLogInterceptor` writes to `AuditLog` only for:

- `POST`, `PATCH`, `DELETE` methods.
- URLs containing `/admin`, `/settings`, or `/users`.
- Authenticated users (`request.user` present).

This is **intentional and canonical** — not all traffic should be audited (performance + storage). Do not propose broadening this scope without an explicit reason.

Per-domain audit (e.g., `CrmChangeLog`, `AuditLog` for API exceptions) lives separately and uses its own writers.

## 10. EventEmitter

```typescript
import { OnEvent } from '@nestjs/event-emitter';

@OnEvent('ticket.created')
async onTicketCreated(payload: { ticketId: string; userId: string }) {
    // ...
}
```

Used for in-process fan-out. For cross-process or durable fan-out, use BullMQ.

## 11. Cron jobs

```typescript
import { Cron } from '@nestjs/schedule';

@Cron(process.env.CRM_DELTA_SYNC_INTERVAL || '*/5 * * * *')
async runScheduledDeltaSync() { ... }
```

Cron lives **on the service**, not in a separate scheduler module. Env-overridable cron expressions are common.

Active cron jobs include:
- `CRM_SYNC_INTERVAL` — full CRM sync, default `'0 0 * * *'`
- `CRM_DELTA_SYNC_INTERVAL` — delta sync, default `'*/5 * * * *'`
- Ticket clustering — daily 02:00 (FAQ candidate generation)
- SLA breach detection — `automation/` module

## 12. Health checks

`apps/backend/src/health/`:
- `GET /health/live` — process is alive
- `GET /health/ready` — dependencies (Postgres, Redis, etc.) reachable

Used by Coolify container probes. Fast and side-effect-free.

## 13. Helper functions — service-scoped is acceptable

Helpers tightly coupled to a single service domain may live at the top of the service file (e.g., `buildSyncDetails` at the top of `crm.service.ts`). **Do not aggressively force these into `utils/`** — coupling is acceptable.

Move to a shared `utils/` only when the helper is genuinely reusable across services.

## 14. Code smells the skill recognizes but does not generate

Per option (iii) — surface cleanup options when editing existing files, but never propagate into new code:

- **Unused `forwardRef` imports** (e.g., `crm.module.ts:1`).
- **`(service as any).privateMethod(...)` type-cast access** to private methods (e.g., `crm.processor.ts:41`). Transitional workaround.
- **`Job<any, any, string>` payload types** — currently canonical convention but loose. Do not strengthen unless asked.
- **Missing `@map` on snake_case columns** (e.g., `CrmAccount.account_number`). Treat as residue.
- **Tenant fields** (e.g., `AiResponseCache.tenantId`) — multi-tenancy abandoned, residue only.

## 15. Anti-patterns

- Introducing a `DomainError` hierarchy when standard NestJS exceptions work.
- Adding a repository layer between services and Prisma.
- Reaching across modules to another module's Prisma calls.
- Catching `Error` and returning silently.
- Returning Prisma models directly from controllers (wrap in `{ success, data, ... }`).
- `// eslint-disable` to silence a real type error.
- `any` types except where canonical (worker payloads, raw Dynamics payloads).
- Importing `@prisma/client` directly — always `@aluplan/database`.
- Hard-coding env values — use `ConfigService` or the typed config constants.
- Introducing a global Prisma module — current convention re-imports `PrismaModule` per consumer.
- Introducing new tenant-aware abstractions (multi-tenancy is abandoned).

## 16. When in doubt

- Match the existing module's structure rather than imposing a new one.
- Choose the existing pattern over a "better" one unless the user asks for refactor.
- Surface cleanup options for accidental complexity; don't impose them.
- Run `pnpm typecheck` before declaring done; honor `strict: true`.
- Run the focused test set from AGENTS.md before declaring AI/RAG changes done.

# Implementation Plan: CRM Real-Time Sync

## Overview

Transform the existing one-way manual CRM sync into an event-driven, real-time architecture. This plan adds webhook registration, event logging, delta sync, retry queue, and delete handling — all without breaking the existing `triggerSync` / `syncAccounts` / `syncContacts` flows.

Stack: NestJS backend (`apps/backend`), Prisma 7 (`packages/database`), BullMQ + Redis, Jest + @swc/jest, fast-check for PBT (`*.pbt.spec.ts`). Import from `@aluplan/database`, never `@prisma/client`.

---

## Tasks

- [ ] 1. Add Prisma models for webhook infrastructure
  - Add `WebhookRegistration` model to `packages/database/prisma/schema.prisma` with fields: `id`, `connectionId`, `entityType` (enum: `account|contact`), `webhookUrl`, `externalWebhookId`, `status` (enum: `active|inactive|failed`), `createdAt`, `lastVerifiedAt`, `deletedAt`; add `@@index([connectionId, entityType])` and `@@index([status])`; add `onDelete: Cascade` relation to `CrmConnection`
  - Add `WebhookEventLog` model with fields: `id`, `connectionId`, `entityType`, `entityId`, `eventType` (enum: `create|update|delete`), `payload` (Json), `receivedAt`, `processedAt`, `status` (enum: `pending|success|failed|retrying|dead_letter`), `errorMessage`, `retryCount` (default 0), `deletedAt`; add `@@index([connectionId, entityType])`, `@@index([status, receivedAt])`, `@@index([entityId])`; add `onDelete: Cascade` relation to `CrmConnection`
  - Add `DeltaSyncState` model with fields: `id`, `connectionId`, `entityType`, `lastSyncAt`, `nextSyncToken`, `createdAt`, `updatedAt`; add `@@unique([connectionId, entityType])` and `@@index([connectionId])`; add `onDelete: Cascade` relation to `CrmConnection`
  - Run `pnpm db:generate` to regenerate the Prisma client after schema changes
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11_

- [ ] 2. Implement WebhookEventLoggerService
  - [ ] 2.1 Create `apps/backend/src/crm/services/webhook-event-logger.service.ts`
    - Implement `logIncomingEvent(event: IncomingWebhookEvent): Promise<WebhookEventLog>` — persists a `WebhookEventLog` record with `status = 'pending'`, `retryCount = 0`, and PII-masked payload; must complete before returning
    - Implement `logProcessingResult(eventId: string, result: 'success' | 'failed', errorMessage?: string): Promise<void>` — updates `status` and sets `processedAt` on success
    - Implement `updateRetryStatus(eventId: string, retryCount: number): Promise<void>` — sets `status = 'retrying'` and increments `retryCount`
    - Implement `markDeadLetter(eventId: string): Promise<void>` — sets `status = 'dead_letter'`
    - Validate `retryCount` is in range 0–5 before any write; throw a validation error if out of range
    - Import `PrismaService` from `../../prisma/prisma.service`; import types from `@aluplan/database`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 2.2 Write property test for PII masking in event logger
    - **Property 8: PII Fields Are Masked in All Stored Payloads**
    - **Validates: Requirements 3.6, 10.1**
    - File: `apps/backend/src/crm/services/webhook-event-logger.service.pbt.spec.ts`
    - Use `fc.record({ emailaddress1: fc.emailAddress(), telephone1: fc.string() })` to generate payloads; assert stored payload never contains original email or phone values

  - [ ]* 2.3 Write property test for retryCount validation
    - **Property 13: Retry Count Monotonically Increases by One Per Attempt**
    - **Validates: Requirements 6.2, 3.7, 3.8**
    - File: `apps/backend/src/crm/services/webhook-event-logger.service.pbt.spec.ts`
    - Use `fc.integer({ min: 0, max: 5 })` to generate valid counts; use `fc.integer({ min: 6, max: 100 })` for invalid counts; assert writes with out-of-range values are rejected

- [ ] 3. Implement DeleteHandlerService
  - [ ] 3.1 Create `apps/backend/src/crm/services/delete-handler.service.ts`
    - Implement `handleAccountDelete(externalAccountId: string, tx?: PrismaTransactionClient): Promise<void>` — sets `deletedAt = new Date()` on the matching `CrmAccount`; if record not found, return silently (idempotent)
    - Implement `handleContactDelete(externalContactId: string, tx?: PrismaTransactionClient): Promise<void>` — sets `deletedAt = new Date()` on the matching `CustomerProfile`; if `User.passwordHash === 'CRM_SYNCED'` AND email not in `ADMIN_BYPASS_EMAILS`, also sets `User.status = 'INACTIVE'`; wraps all writes in a single transaction; if record not found, return silently
    - Read `ADMIN_BYPASS_EMAILS` from `process.env.ADMIN_BYPASS_EMAILS`, split by comma, trim, lowercase for comparison
    - If delete payload is missing `accountid` or `contactid`, log a warning and return without error
    - Import `PrismaService` from `../../prisma/prisma.service`; import types from `@aluplan/database`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 3.2 Write property test for soft-delete idempotency
    - **Property 18: Soft-Delete Is Idempotent**
    - **Validates: Requirements 5.1, 5.2, 5.6**
    - File: `apps/backend/src/crm/services/delete-handler.service.pbt.spec.ts`
    - Use `fc.uuid()` to generate random external IDs that do not exist in DB; assert `handleAccountDelete` and `handleContactDelete` complete without throwing for any non-existent ID

  - [ ]* 3.3 Write property test for admin bypass on delete
    - **Property 19: Only CRM-Synced Users Are Deactivated on Contact Delete**
    - **Validates: Requirements 5.3, 5.4, 5.5**
    - File: `apps/backend/src/crm/services/delete-handler.service.pbt.spec.ts`
    - Generate users with varying `passwordHash` values and emails; assert only users with `passwordHash = 'CRM_SYNCED'` and email not in bypass list have `status` changed to `'INACTIVE'`

- [ ] 4. Checkpoint — Core services compile and unit tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement WebhookRegistrationService
  - [ ] 5.1 Create `apps/backend/src/crm/services/webhook-registration.service.ts`
    - Implement `registerWebhooksForConnection(connectionId: string): Promise<WebhookRegistration[]>` — iterates over `['account', 'contact']`, checks for existing active `WebhookRegistration` per entity type, calls `verifyWebhookHealth` if one exists; if healthy, reuses it; if unhealthy, deletes from Dynamics 365 and marks `status = 'inactive'`, then registers a new one
    - Implement `registerWebhook(connectionId: string, entityType: 'account' | 'contact'): Promise<WebhookRegistration>` — calls Dynamics 365 `POST /api/data/v9.2/serviceendpoints` with the webhook URL; on success, persists `WebhookRegistration` with `status = 'active'`; on Dynamics 365 API error, does NOT persist a DB record and rolls back any already-created service endpoint in the same call
    - Implement `verifyWebhookHealth(config: any, externalWebhookId: string): Promise<boolean>` — issues a GET probe to the Dynamics 365 service endpoint API with a 5-second timeout; returns `true` on 2xx, `false` otherwise
    - Implement `unregisterWebhook(connectionId: string, webhookId: string): Promise<void>` — deletes from Dynamics 365 and marks DB record `status = 'inactive'`
    - Webhook URL must always be HTTPS; read base URL from `ConfigService` (`WEBHOOK_BASE_URL` env var)
    - Decrypt `CrmConnection.webhookSecret` and `clientSecret` via `CryptoService` before calling Dynamics 365
    - Import from `@aluplan/database`; inject `PrismaService`, `CryptoService`, `ConfigService`, `HttpService` (or `axios`)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 5.2 Write property test for webhook registration record count
    - **Property 1: Webhook Registration Produces Exactly Two Records**
    - **Validates: Requirements 1.1, 1.2, 1.6, 1.7**
    - File: `apps/backend/src/crm/services/webhook-registration.service.pbt.spec.ts`
    - Mock Dynamics 365 API to return success; use `fc.uuid()` for connectionId; assert exactly 2 `WebhookRegistration` records are created, one per entity type, both with `status = 'active'` and HTTPS `webhookUrl`

  - [ ]* 5.3 Write property test for idempotent registration
    - **Property 2: Webhook Registration Is Idempotent for Healthy Webhooks**
    - **Validates: Requirements 1.3**
    - File: `apps/backend/src/crm/services/webhook-registration.service.pbt.spec.ts`
    - Pre-seed two healthy `WebhookRegistration` records; call `registerWebhooksForConnection` again; assert total record count in DB is still 2 and records are unchanged

  - [ ]* 5.4 Write property test for no orphan records on API failure
    - **Property 3: Failed Dynamics 365 API Calls Leave No Orphan Records**
    - **Validates: Requirements 1.5**
    - File: `apps/backend/src/crm/services/webhook-registration.service.pbt.spec.ts`
    - Mock Dynamics 365 API to throw on the second entity type; assert DB `WebhookRegistration` count is unchanged after the failed call

- [ ] 6. Implement WebhookRetryProcessor
  - [ ] 6.1 Create `apps/backend/src/crm/processors/webhook-retry.processor.ts`
    - Decorate with `@Processor('webhook-retry')` (BullMQ)
    - Implement `process(job: Job<{ eventLogId: string }>): Promise<void>` — fetches `WebhookEventLog` by `eventLogId`; if `retryCount >= 5`, calls `markDeadLetter` and returns; otherwise calls `updateRetryStatus` to increment `retryCount` and set `status = 'retrying'`; re-invokes `CrmService.processDynamics365Webhook` with the stored payload; on success calls `logProcessingResult('success')`; on failure calls `logProcessingResult('failed', error.message)` and enqueues another retry job with delay `Math.pow(2, retryCount) * 1000` ms if `retryCount < 5`
    - Register the `webhook-retry` BullMQ queue in `CrmModule` using `BullModule.registerQueue({ name: 'webhook-retry' })` — keep it isolated from the existing `crm-sync` queue
    - Inject `WebhookEventLoggerService`, `CrmService`, and `@InjectQueue('webhook-retry') retryQueue: Queue`
    - Import from `@aluplan/database`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 6.2 Write property test for exponential backoff delay
    - **Property 12: Exponential Backoff Delay Is Correctly Computed**
    - **Validates: Requirements 6.1, 6.7**
    - File: `apps/backend/src/crm/processors/webhook-retry.processor.pbt.spec.ts`
    - Use `fc.integer({ min: 0, max: 4 })` to generate retry counts `n`; assert computed delay equals `Math.pow(2, n) * 1000` for each value; assert delay for `n=4` is exactly 16000 ms

  - [ ]* 6.3 Write property test for dead-letter terminal state
    - **Property 7: Dead-Letter State Is Terminal**
    - **Validates: Requirements 3.5, 6.5**
    - File: `apps/backend/src/crm/processors/webhook-retry.processor.pbt.spec.ts`
    - Seed a `WebhookEventLog` with `retryCount = 5`; invoke processor; assert `status = 'dead_letter'` and no new job is enqueued in `webhook-retry` queue

- [ ] 7. Implement DeltaSyncEngine
  - [ ] 7.1 Create `apps/backend/src/crm/services/delta-sync-engine.service.ts`
    - Implement `runDeltaSync(connectionId: string): Promise<{ account: DeltaSyncResult; contact: DeltaSyncResult }>` — processes both `account` and `contact` entity types sequentially
    - Implement `syncDelta(connectionId: string, entityType: 'account' | 'contact'): Promise<DeltaSyncResult>` — reads `DeltaSyncState.lastSyncAt` for the connection/entity pair; if no record exists, fetches all records without a `modifiedon` filter; otherwise appends `$filter=modifiedon gt <lastSyncAt ISO string>` to the OData URL; follows all `@odata.nextLink` pages until exhausted; for each record: if `statecode === 1` routes to `DeleteHandlerService`; if `statecode === 0` routes to upsert (reuse `syncSingleAccount` / `syncSingleContact` logic from `CrmService`); if `statecode` is any other value, increments `errorCount`, logs a warning, and continues; updates `DeltaSyncState.lastSyncAt` to the sync start time only if no fatal error occurred; returns `DeltaSyncResult` with `totalFetched`, `successCount`, `errorCount`, `syncedAt`
    - Implement `getLastSyncTimestamp(connectionId: string, entityType: 'account' | 'contact'): Promise<Date | null>`
    - Implement `updateLastSyncTimestamp(connectionId: string, entityType: 'account' | 'contact', timestamp: Date): Promise<void>` — uses `upsert` to maintain the `@@unique([connectionId, entityType])` constraint
    - Decrypt connection secrets via `CryptoService` before calling Dynamics 365 API
    - Import from `@aluplan/database`; inject `PrismaService`, `CryptoService`, `DeleteHandlerService`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 7.12_

  - [ ]* 7.2 Write property test for delta sync URL filter
    - **Property 14: Delta Sync URL Contains Correct modifiedon Filter**
    - **Validates: Requirements 7.4**
    - File: `apps/backend/src/crm/services/delta-sync-engine.service.pbt.spec.ts`
    - Use `fc.date()` to generate arbitrary `lastSyncAt` timestamps; assert the constructed OData URL contains `modifiedon gt <timestamp.toISOString()>` for both `account` and `contact` entity types

  - [ ]* 7.3 Write property test for statecode routing
    - **Property 16: Delta Sync Routes Records Correctly by statecode**
    - **Validates: Requirements 7.6, 7.7**
    - File: `apps/backend/src/crm/services/delta-sync-engine.service.pbt.spec.ts`
    - Use `fc.array(fc.record({ statecode: fc.oneof(fc.constant(0), fc.constant(1)) }))` to generate record batches; assert every `statecode = 1` record is routed to `DeleteHandlerService` and every `statecode = 0` record is routed to upsert; assert no record is routed to both

  - [ ]* 7.4 Write property test for lastSyncAt update guard
    - **Property 17: lastSyncAt Is Updated Only on Full Success**
    - **Validates: Requirements 7.8, 7.9**
    - File: `apps/backend/src/crm/services/delta-sync-engine.service.pbt.spec.ts`
    - Mock Dynamics 365 API to throw mid-pagination; assert `DeltaSyncState.lastSyncAt` is not updated after the failed run

  - [ ]* 7.5 Write property test for DeltaSyncState unique constraint
    - **Property 21: DeltaSyncState Unique Constraint Is Preserved**
    - **Validates: Requirements 9.9**
    - File: `apps/backend/src/crm/services/delta-sync-engine.service.pbt.spec.ts`
    - Run `updateLastSyncTimestamp` multiple times for the same `(connectionId, entityType)` pair with `fc.date()` timestamps; assert exactly one `DeltaSyncState` record exists for that pair after each run

- [ ] 8. Checkpoint — Delta sync and retry queue compile and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Extend CrmWebhookGuard with active connection check
  - [ ] 9.1 Update `apps/backend/src/crm/guards/crm-webhook.guard.ts`
    - Add `where: { isActive: true, deletedAt: null }` to the `crmConnection.findFirst` query so that only active connections with a configured `webhookSecret` are accepted
    - Return HTTP 401 if no active connection with a `webhookSecret` is found (requirement 2.5 — already partially implemented, ensure `deletedAt: null` filter is present given the global soft-delete filter)
    - No other changes to the guard; existing `x-api-key` comparison logic stays intact
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 9.2 Write property test for webhook guard authentication
    - **Property 4: Missing or Mismatched API Key Always Produces 401**
    - **Validates: Requirements 2.2, 2.4, 2.5**
    - File: `apps/backend/src/crm/guards/crm-webhook.guard.pbt.spec.ts`
    - Use `fc.string()` to generate arbitrary API key values; assert that any value not equal to the decrypted `webhookSecret` (including empty string and absent header) causes the guard to throw `UnauthorizedException`; assert that the correct key passes

- [ ] 10. Wire new services into CrmWebhookController
  - [ ] 10.1 Update `apps/backend/src/crm/webhooks/crm-webhook.controller.ts`
    - Inject `WebhookEventLoggerService`, `DeleteHandlerService`, and `@InjectQueue('webhook-retry') retryQueue: Queue`
    - In `handleDynamics365Webhook`: (1) call `webhookEventLogger.logIncomingEvent(event)` to persist the log record before any processing; (2) call `crmService.processDynamics365Webhook(payload)` for `create`/`update` events or `deleteHandler.handleAccountDelete` / `deleteHandler.handleContactDelete` for `delete` events based on `payload.eventType`; (3) on success call `webhookEventLogger.logProcessingResult(eventLog.id, 'success')`; (4) on failure call `webhookEventLogger.logProcessingResult(eventLog.id, 'failed', error.message)` and enqueue a retry job in `webhook-retry` with delay `1000` ms (first attempt, `retryCount = 0`)
    - Return HTTP 200 for all handled business outcomes (missing email, admin bypass, validation failure)
    - Return HTTP 500 only for unhandled exceptions so Dynamics 365 triggers its own retry
    - Validate inbound payload structure; ignore unexpected fields without throwing
    - _Requirements: 3.1, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 5.1, 5.2_

  - [ ]* 10.2 Write property test for log-before-process ordering
    - **Property 5: Every Authenticated Webhook Creates a Log Record Before Processing**
    - **Validates: Requirements 3.1**
    - File: `apps/backend/src/crm/webhooks/crm-webhook.controller.pbt.spec.ts`
    - Use `fc.record({ entity: fc.constantFrom('account', 'contact'), eventType: fc.constantFrom('create', 'update', 'delete') })` to generate payloads; mock `CrmService` to record call order; assert `logIncomingEvent` is always called before any upsert or delete operation

  - [ ]* 10.3 Write property test for log status reflecting outcome
    - **Property 6: Log Status Reflects Final Processing Outcome**
    - **Validates: Requirements 3.2, 3.3**
    - File: `apps/backend/src/crm/webhooks/crm-webhook.controller.pbt.spec.ts`
    - Generate payloads that succeed and payloads that throw; assert `status = 'success'` with non-null `processedAt` on success; assert `status = 'failed'` with non-null `errorMessage` on failure

  - [ ]* 10.4 Write property test for upsert idempotency
    - **Property 9: Account and Contact Upserts Are Idempotent**
    - **Validates: Requirements 4.1, 4.2**
    - File: `apps/backend/src/crm/webhooks/crm-webhook.controller.pbt.spec.ts`
    - Use `fc.record({ accountid: fc.uuid(), name: fc.string() })` for account payloads; process the same payload twice; assert final DB state is identical after both calls

  - [ ]* 10.5 Write property test for admin bypass on webhook events
    - **Property 10: Admin Emails Are Never Modified by Webhook Events**
    - **Validates: Requirements 4.4, 5.4, 10.2**
    - File: `apps/backend/src/crm/webhooks/crm-webhook.controller.pbt.spec.ts`
    - Use `fc.emailAddress()` to generate emails; add them to `ADMIN_BYPASS_EMAILS`; send create, update, and delete events for those emails; assert `User.role`, `User.status`, and `User.passwordHash` are unchanged after each event

  - [ ]* 10.6 Write property test for new CRM-synced user credentials
    - **Property 11: New CRM-Synced Users Always Have Correct Credentials and Role**
    - **Validates: Requirements 4.5**
    - File: `apps/backend/src/crm/webhooks/crm-webhook.controller.pbt.spec.ts`
    - Use `fc.record({ emailaddress1: fc.emailAddress(), contactid: fc.uuid() })` to generate contact payloads for emails that do not yet exist in DB; assert created `User` has `passwordHash = 'CRM_SYNCED'` and role name `'CUSTOMER'`

  - [ ]* 10.7 Write property test for extra fields not causing errors
    - **Property 20: Inbound Payloads with Extra Fields Do Not Cause Errors**
    - **Validates: Requirements 10.5**
    - File: `apps/backend/src/crm/webhooks/crm-webhook.controller.pbt.spec.ts`
    - Use `fc.dictionary(fc.string(), fc.jsonValue())` to generate random extra fields; merge with valid payloads; assert controller returns HTTP 200 and does not throw

- [ ] 11. Add webhook registration endpoint to CrmController
  - [ ] 11.1 Update `apps/backend/src/crm/crm.controller.ts` (or create if not present)
    - Add `POST /crm/connections/:id/webhooks/register` endpoint that calls `webhookRegistrationService.registerWebhooksForConnection(id)` and returns both `WebhookRegistration` records
    - Add `DELETE /crm/connections/:id/webhooks/:webhookId` endpoint that calls `webhookRegistrationService.unregisterWebhook(id, webhookId)`
    - Protect both endpoints with the existing admin RBAC guard
    - _Requirements: 1.1, 1.7_

- [ ] 12. Add scheduled delta sync job
  - [ ] 12.1 Create `apps/backend/src/crm/jobs/delta-sync.job.ts`
    - Decorate with `@Injectable()`; inject `DeltaSyncEngineService` and `PrismaService`
    - Implement `handleDeltaSync()` decorated with `@Cron(CronExpression.EVERY_15_MINUTES)` from `@nestjs/schedule`
    - Fetch all active `CrmConnection` records (`isActive: true`, `deletedAt: null`); for each connection call `deltaSyncEngine.runDeltaSync(connection.id)`; log results and errors per connection without halting other connections
    - Register `ScheduleModule.forRoot()` in `CrmModule` if not already present in `AppModule`
    - _Requirements: 7.1, 7.11_

- [ ] 13. Register all new providers in CrmModule
  - [ ] 13.1 Update `apps/backend/src/crm/crm.module.ts`
    - Add to `providers`: `WebhookRegistrationService`, `WebhookEventLoggerService`, `DeltaSyncEngineService`, `DeleteHandlerService`, `WebhookRetryProcessor`, `DeltaSyncJob`
    - Add `BullModule.registerQueue({ name: 'webhook-retry' })` to `imports` — keep isolated from existing `crm-sync` queue
    - Add `ScheduleModule.forRoot()` to `imports` if not already present at app level
    - Export `WebhookRegistrationService`, `DeltaSyncEngineService` for use by other modules if needed
    - Verify existing `crm-sync` queue registration and `CrmProcessor` are untouched
    - _Requirements: 6.6, 7.1, 8.1, 8.2, 8.3_

- [ ] 14. Verify backward compatibility with existing manual sync
  - [ ] 14.1 Write unit tests for existing `CrmService` methods
    - File: `apps/backend/src/crm/crm.service.spec.ts`
    - Assert `triggerSync` still enqueues a job on the `crm-sync` queue with the same payload shape as before
    - Assert `processDynamics365Webhook` still routes `account` payloads to `syncSingleAccount` and `contact` payloads to `syncSingleContact`
    - Assert `executeSyncProcess` calls `syncAccounts` then `syncContacts` in that order
    - Assert the `webhook-retry` queue is never touched by any existing `CrmService` method
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 15. Final checkpoint — All tests pass, no regressions
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The global Prisma soft-delete filter (`deletedAt: null`) is active — all `findMany/findFirst/findUnique` calls automatically exclude soft-deleted records; bypass explicitly only when querying deleted records
- Import from `@aluplan/database`, never from `@prisma/client` directly
- PBT files must be named `*.pbt.spec.ts` and use `fast-check`
- The `webhook-retry` BullMQ queue must remain isolated from the existing `crm-sync` queue at all times
- `ADMIN_BYPASS_EMAILS` is a required env var — add to `apps/backend/src/config/env-validation.schema.ts` (Zod) if not already present
- `WEBHOOK_BASE_URL` must be added to the Zod env schema for `WebhookRegistrationService`

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.2", "3.3", "5.1"] },
    { "id": 3, "tasks": ["5.2", "5.3", "5.4", "6.1", "9.1"] },
    { "id": 4, "tasks": ["6.2", "6.3", "7.1", "9.2"] },
    { "id": 5, "tasks": ["7.2", "7.3", "7.4", "7.5", "10.1"] },
    { "id": 6, "tasks": ["10.2", "10.3", "10.4", "10.5", "10.6", "10.7", "11.1"] },
    { "id": 7, "tasks": ["12.1", "13.1"] },
    { "id": 8, "tasks": ["14.1"] }
  ]
}
```

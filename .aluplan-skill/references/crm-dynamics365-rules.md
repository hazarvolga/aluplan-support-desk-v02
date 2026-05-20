# CRM Rules — Microsoft Dynamics 365 Sales Hub & Dataverse

Read this before designing or modifying anything under `apps/backend/src/crm/`, or any code that touches Dynamics 365, accounts, contacts, or CRM sync. The canonical implementation lives in `crm.service.ts` (922 lines), `services/crm-record-sync.service.ts` (439 lines), `services/crm-delta-sync.service.ts` (276 lines), `adapters/dynamics365.adapter.ts` (745 lines), and `crm.processor.ts` (71 lines).

## 1. ADR-008 — one sync path

`CrmRecordSyncService.upsertAccountFromDynamics()` and `upsertContactFromDynamics()` are the **only** persistence path for CRM data. Full import, delta sync, and webhooks all reconcile here.

```
Full import   ┐
Delta sync     ├──► CrmRecordSyncService.upsertAccountFromDynamics(data, config, { source })
Webhook       ┘                        .upsertContactFromDynamics(data, config, { source })
                                       │
                                       ▼
                            CrmAccount / CustomerProfile + CrmChangeLog
```

**Never persist CRM data through any other path.** If you need to add a new sync trigger, add it as a caller of these methods, not as a parallel writer.

The `source` parameter (`'FULL_IMPORT' | 'DELTA_SYNC' | 'WEBHOOK'`) is recorded in `CrmChangeLog` so operators can attribute any field change to its sync trigger.

## 2. Idempotent upsert pattern

```typescript
// apps/backend/src/crm/services/crm-record-sync.service.ts (canonical)
const account = await this.prisma.crmAccount.upsert({
    where: { externalAccountId: externalId },
    update: next,
    create: { ...next, externalAccountId: externalId },
});
```

Idempotency is achieved by:
1. Business-key uniqueness: `CrmAccount.externalAccountId @unique`, `CustomerProfile.externalContactId @unique`.
2. Prisma `upsert` over that key.

There is **no separate `crm_write_log` or `processed_jobs` table** for idempotency. The schema is the source of truth.

For multi-step contact creation (which requires creating a `User`, `CustomerProfile`, optionally linking to a `CrmAccount`, and recording change history), wrap in a Prisma transaction:

```typescript
return this.prisma.$transaction(async (tx) => {
    // role lookup, user upsert, profile upsert, account link, change log writes
});
```

## 3. Field mapping is config-driven

```typescript
const mappings = (config?.syncSettings?.accountMapping || {}) as Record<string, string>;
const externalId = this.resolveField(data, 'externalAccountId', mappings, 'accountid');
```

Field name resolution layers:
1. Caller-supplied mapping from `CrmConnection.syncSettings.accountMapping` / `contactMapping`.
2. Hardcoded fallback Dynamics field name.

Helpers (`resolveField`, `resolveFirstField`, `limitString`, `asNullableString`) handle Dynamics' inconsistent field naming across deployments — e.g., `new_clientidfrilo` vs `new_clientid_frilo` vs `new_friloclientid` vs `new_frilo_clientid` vs `new_friloid` all resolve to `clientIdFrilo`.

When adding a new mapped field, follow the same layering: support a config override, then try a list of known Dynamics field names in priority order.

## 4. Raw payload is preserved, not sanitized

```prisma
model CrmAccount {
    // ...
    rawCrmPayload Json?  @map("raw_crm_payload")
    // ...
}
```

The **complete** Dynamics payload is stored in `rawCrmPayload`. **Do not sanitize before storage.** The raw snapshot is intentional for:
- Replay when adding new mapped fields (re-process without re-fetching from Dynamics).
- Debugging discrepancies between the local mirror and Dynamics.
- Field mapping changes that need to be applied to historical data.

Sanitization happens at the **boundary where data leaves the platform** (e.g., API responses to non-admin users) via `PiiMaskingService`, not at write time.

## 5. Secrets are encrypted at rest

```prisma
model CrmConnection {
    clientSecret  String?  @map("client_secret")     // encrypted
    webhookSecret String?  @map("webhook_secret")    // encrypted
    // ...
}
```

`CryptoService.encrypt()` is applied before persistence. Workers decrypt **only** at the moment of an outbound call:

```typescript
// apps/backend/src/crm/crm.processor.ts
const decryptedConnection = {
    ...connection,
    clientSecret: connection.clientSecret ? this.crmService.decryptSecret(connection.clientSecret) : null,
};
```

`pino` redacts `clientSecret` and `webhookSecret` automatically in log output. **Do not log decrypted values anywhere.**

`ENCRYPTION_KEY` is a required boot secret (AGENTS.md), validated by `env-validation.schema.ts` (`z.string().min(32).max(64)` — Hex or Raw).

## 6. Placeholder emails for missing contact emails

```typescript
// apps/backend/src/crm/services/crm-record-sync.service.ts
if (!email) {
    email = `no-email-${contactId}@internal.aluplan`;
    isPlaceholderEmail = true;
}
```

Dynamics contacts without an email get a synthetic placeholder so the platform's unique-email constraint doesn't reject them. The `isPlaceholderEmail` flag is preserved on the linked `CustomerProfile` so downstream consumers (email sending, notifications) can avoid emailing the placeholder.

## 7. Admin email protection

```typescript
const adminEmails = (process.env.ADMIN_BYPASS_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

if (adminEmails.includes(String(email).toLowerCase())) {
    this.logger.warn(`CRM contact sync skipped for protected admin email: ${email}`);
    return null;
}
```

`ADMIN_BYPASS_EMAILS` is a **required** env var (AGENTS.md, `env-validation.schema.ts`: `z.string().min(1, "ADMIN_BYPASS_EMAILS is required for security")`). Sync silently skips any contact whose email matches a protected admin.

When adding a new admin, update the env var **before** the next sync runs — otherwise the admin's `User` row could be partially overwritten with CRM data.

## 8. Field-level change log

Every changed field writes a row to `CrmChangeLog`:

```prisma
model CrmChangeLog {
    entityType    String   @db.VarChar(32)       // 'account' | 'contact'
    entityId      String   @db.VarChar(255)      // Dynamics GUID
    localRecordId String?  @db.Uuid              // local mirror id
    fieldName     String   @db.VarChar(100)
    oldValue      String?
    newValue      String?
    source        String   @default("DELTA_SYNC")    // 'FULL_IMPORT' | 'DELTA_SYNC' | 'WEBHOOK'
    status        String   @default("SUCCESS")
    changedAt     DateTime @default(now())
}
```

This is **granular audit**, not just "row updated." Operators can answer:
- "When did this customer's company name change in Dynamics?"
- "Did this change come from the nightly full import or from a webhook?"
- "Which fields changed in the last delta sync?"

The `CrmDeltaSyncService.getRecentChanges()` method exposes this log to operators.

## 9. Sync topology

### 9.1 Full sync (background job)

Enqueued through `crm.controller.ts` (operator-triggered) into the `crm-sync` BullMQ queue:

```typescript
// apps/backend/src/crm/crm.module.ts
BullModule.registerQueue({
    name: 'crm-sync',
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 50,
        removeOnFail: false,    // DLQ kept in Bull-Board
    },
}),
```

The processor (`crm.processor.ts`) decrypts secrets, calls `executeSyncProcess(...)`, and on failure updates the `CrmSyncLog` row to `ERROR` so the operator UI shows the result.

Cron schedule: `CRM_SYNC_INTERVAL` env, default `'0 0 * * *'` (daily at midnight).

### 9.2 Delta sync (scheduled service)

```typescript
// apps/backend/src/crm/services/crm-delta-sync.service.ts
@Cron(process.env.CRM_DELTA_SYNC_INTERVAL || '*/5 * * * *')
async runScheduledDeltaSync() {
    const connections = await this.prisma.crmConnection.findMany({
        where: { provider: CrmProvider.DYNAMICS_365, isActive: true, deletedAt: null },
    });
    for (const connection of connections) {
        try { await this.runDeltaSync(connection.id); }
        catch (error) {
            this.logger.error(`CRM delta sync failed for connection ${connection.id}: ${error.message}`, error.stack);
            await this.notifications.emitCrmSyncError({ connectionId: connection.id, message: error.message });
        }
    }
}
```

Every 5 minutes (default), the service:
1. Loads active connections.
2. For each, calls `runDeltaSync(connectionId)`.
3. On per-connection error, logs and emits to `NotificationsGateway` — the operator UI alerts.

Delta state is persisted in `CrmDeltaSyncState`:

```prisma
model CrmDeltaSyncState {
    connectionId         String   @map("connection_id") @db.Uuid
    entityType           String   @db.VarChar(32)     // 'account' | 'contact'
    deltaLink            String?  @map("delta_link")  // Dataverse delta token
    lastSuccessfulSyncAt DateTime? @map("last_successful_sync_at")
    lastError            String?  @map("last_error")
    @@unique([connectionId, entityType])
}
```

`deltaLink` is Dataverse's delta token (continuation cursor). The next sync resumes from where the last successful sync stopped — Dataverse handles the "what changed since" computation server-side.

### 9.3 Webhook sync

`CrmWebhookController` receives Dataverse webhooks, verifies the signature against `CrmConnection.webhookSecret`, and routes each notification through `CrmRecordSyncService` with `source: 'WEBHOOK'`.

## 10. Adapter pattern

```typescript
// apps/backend/src/crm/adapters/crm-adapter.interface.ts
export interface ICrmAdapter {
    // common methods all CRM providers must implement
}

// apps/backend/src/crm/adapters/dynamics365.adapter.ts
export class Dynamics365Adapter implements ICrmAdapter {
    fetchAccounts(config): Promise<any[]>;
    fetchContacts(config): Promise<any[]>;
    // ...
}
```

`CrmService` keeps a `Map<CrmProvider, ICrmAdapter>` and dispatches based on `CrmConnection.provider`. Currently only Dynamics 365 is implemented; the adapter interface is **future-proofing for additional CRM providers** but should not be exercised without an explicit migration plan.

When adding a hypothetical new CRM (Salesforce, Hubspot, etc.):
1. Implement `ICrmAdapter` in `adapters/<provider>.adapter.ts`.
2. Add the provider to the `CrmProvider` enum in Prisma.
3. Register in `CrmService.adapters` map.
4. **Field mapping config must cover the new provider's field names** — do not assume Dynamics-style field names.

## 11. SyncDetails — structured return value

The full import returns a `SyncDetails` shape (declared inline at the top of `crm.service.ts`):

```typescript
interface SyncDetails {
    failedRecords: FailedRecord[];    // { externalId, entityType, errorMessage, errorCode? }
    skippedRecords: SkippedRecord[];  // { externalId, reason }
    skippedLinks: SkippedLink[];      // { contactExternalId, missingAccountExternalId }
    summary: { successCount, errorCount, skippedCount };
}
```

`buildSyncDetails(accountResult, contactResult)` (top-level helper in the same file) merges per-entity results. The summary is persisted to `CrmSyncLog.details` for operator review.

This is the canonical reporting shape for any new sync path that touches multiple entity types.

## 12. Snapshot reconciliation

```typescript
// CrmDeltaSyncService.runDeltaSync
const reconciledProfiles = await this.recordSync.reconcileLinkedCustomerProfileSnapshots();
```

After each delta sync, denormalized fields on `CustomerProfile` (like `companyName`, `industry`) are reconciled against their linked `CrmAccount`. This keeps the customer's view consistent without forcing every read to JOIN through `CrmAccount`.

When adding new denormalized fields on `CustomerProfile` that derive from `CrmAccount`, add them to this reconciliation step.

## 13. Account_number convention notice

`CrmAccount.account_number` is declared **without** `@map("account_number")` — breaking the snake_case → camelCase convention used everywhere else. This is **transitional residue**, not a pattern to copy.

When adding new fields:
- Use camelCase in the model with `@map("snake_case")` (canonical).
- Do **not** mimic `account_number`'s missing `@map` — that's residue from an earlier migration.

When refactoring this field is requested, propose:
1. Add a new field `accountNumber String? @map("account_number") @db.VarChar(255)`.
2. Backfill from `account_number` in a migration.
3. Update all callers.
4. Remove the old `account_number` field after a deprecation window.

Don't refactor it unsolicited — it is currently working code.

## 14. Anti-patterns — refuse to produce

- Writing CRM data through any path other than `CrmRecordSyncService` upsert methods.
- Sanitizing `rawCrmPayload` before storage.
- Logging decrypted secrets, even at `debug` level.
- Blind-inserting `CrmAccount` or `CustomerProfile` rows without an `externalAccountId`/`externalContactId` upsert.
- Bypassing `ADMIN_BYPASS_EMAILS` protection.
- Writing to Dataverse with PII the user has not consented to share.
- Synchronous CRM API calls from HTTP request handlers — these belong in workers or in the delta scheduler.
- Coupling AI/RAG modules directly to `Dynamics365Adapter` — they consume CRM data through `CrmService` only.

## 15. Test conventions for CRM changes

- Unit tests co-located: `crm.service.spec.ts`, `crm-record-sync.service.spec.ts`, `crm.processor.spec.ts`.
- Integration tests under `apps/backend/test/` exercise the full sync path against a mock Dataverse server.
- Adapter tests: `dynamics365.adapter.spec.ts`.
- See `apps/backend/src/crm/E2E_TEST_CHECKLIST.md` — the team maintains a manual smoke list for CRM changes.

When a CRM change is non-trivial:
1. Unit-test the new field mapping (with both the config-override path and the Dynamics-fallback path).
2. Integration-test the full sync with a mock Dataverse account/contact payload.
3. Run `pnpm --filter @aluplan/backend test -- crm-record-sync.service.spec.ts crm.service.spec.ts`.
4. Walk the E2E checklist if the change touches webhook ingestion or operator UI.

## 16. When in doubt

- Prefer **business-key upsert** over insert-with-catch.
- Prefer **`CrmRecordSyncService`** over a new persistence path.
- Prefer **delta sync** (`*/5min` server-driven) over polling, and **webhooks** over delta when low-latency matters.
- Prefer **persisting `rawCrmPayload`** so future field mapping changes don't require re-fetching from Dataverse.
- Prefer **emitting via `NotificationsGateway`** for sync errors that operators need to see.

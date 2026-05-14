# Requirements Document

## Introduction

This document defines the requirements for the CRM Real-Time Sync feature, which transforms the existing one-way manual sync system (Dynamics 365 → local DB) into an event-driven, real-time architecture. The system registers webhooks in Dynamics 365, processes incoming create/update/delete events in real time, fills gaps with a scheduled delta sync, retries failed webhook deliveries with exponential backoff, soft-deletes removed records, and maintains a full audit trail of all webhook events — all without breaking the existing manual sync capability.

## Glossary

- **Webhook_Registration_Service**: The service responsible for registering, verifying, and removing webhook endpoints in Dynamics 365.
- **Webhook_Event_Logger**: The service responsible for persisting incoming webhook events and their processing outcomes to the audit log.
- **Delta_Sync_Engine**: The service responsible for fetching only records modified since the last successful sync using the `modifiedon` OData filter.
- **Webhook_Retry_Processor**: The BullMQ-based processor responsible for re-processing failed webhook events with exponential backoff.
- **Delete_Handler**: The service responsible for soft-deleting or deactivating local records when Dynamics 365 sends a delete or deactivate event.
- **CrmWebhookController**: The NestJS controller that receives inbound webhook POST requests from Dynamics 365.
- **CrmWebhookGuard**: The NestJS guard that validates the `x-api-key` header on inbound webhook requests.
- **WebhookRegistration**: The Prisma model that tracks registered webhooks per CRM connection and entity type.
- **WebhookEventLog**: The Prisma model that stores the audit trail for all incoming webhook events.
- **DeltaSyncState**: The Prisma model that tracks the last successful sync timestamp per CRM connection and entity type.
- **CrmConnection**: The existing Prisma model representing a configured Dynamics 365 connection, including the encrypted `webhookSecret`.
- **CustomerProfile**: The existing Prisma model representing a synced CRM contact in the local database.
- **CrmAccount**: The existing Prisma model representing a synced CRM account in the local database.
- **ADMIN_BYPASS_EMAILS**: An environment variable containing a comma-separated list of email addresses that must never be modified by CRM webhook events.
- **Soft-delete**: Setting `deletedAt` to the current timestamp on a record rather than physically removing it, compatible with the global Prisma soft-delete filter.
- **Dead_Letter**: The terminal state of a webhook event that has exhausted all retry attempts (`retryCount >= 5`).
- **MAX_RETRY_COUNT**: The maximum number of retry attempts for a failed webhook event, fixed at 5.
- **Exponential_Backoff**: A retry delay strategy where the delay for retry `n` is `2^n * 1000` milliseconds (1 s, 2 s, 4 s, 8 s, 16 s).

---

## Requirements

### Requirement 1: Webhook Registration

**User Story:** As a system administrator, I want to register webhooks in Dynamics 365 for account and contact entities, so that the system is automatically notified of changes in real time.

#### Acceptance Criteria

1. WHEN an administrator triggers webhook registration for a CRM connection, THE Webhook_Registration_Service SHALL register one service endpoint in Dynamics 365 for the `account` entity type and one for the `contact` entity type.
2. WHEN a webhook is successfully registered in Dynamics 365, THE Webhook_Registration_Service SHALL persist a `WebhookRegistration` record with `status = 'active'`, the external Dynamics 365 webhook ID, and the webhook URL.
3. WHEN webhook registration is triggered and a `WebhookRegistration` record already exists with `status = 'active'` for the same connection and entity type, THE Webhook_Registration_Service SHALL verify the health of the existing webhook by issuing a reachability probe to the Dynamics 365 service endpoint API with a 5-second timeout; a 2xx response indicates healthy, any other outcome indicates unhealthy.
4. WHEN an existing webhook fails the health check, THE Webhook_Registration_Service SHALL delete the unhealthy webhook from Dynamics 365, mark the existing `WebhookRegistration` record as `status = 'inactive'`, and register a new webhook.
5. WHEN the Dynamics 365 API returns an error during webhook registration for either entity type, THE Webhook_Registration_Service SHALL not persist a `WebhookRegistration` record for the failed entity type, SHALL roll back any Dynamics 365 service endpoint already created in the same registration call, and SHALL return the error to the caller.
6. THE Webhook_Registration_Service SHALL use only HTTPS URLs as the webhook endpoint URL.
7. WHEN webhook registration completes successfully for both entity types, THE Webhook_Registration_Service SHALL return both `WebhookRegistration` records to the caller.

---

### Requirement 2: Inbound Webhook Authentication

**User Story:** As a security engineer, I want all inbound webhook requests from Dynamics 365 to be authenticated, so that only legitimate events are processed.

#### Acceptance Criteria

1. WHEN a POST request arrives at `/crm/webhooks/dynamics365`, THE CrmWebhookGuard SHALL extract the `x-api-key` header from the request.
2. IF the `x-api-key` header is absent, THEN THE CrmWebhookGuard SHALL return HTTP 401 Unauthorized and reject the request.
3. WHEN the `x-api-key` header is present, THE CrmWebhookGuard SHALL retrieve the active `CrmConnection` for the Dynamics 365 provider and decrypt its `webhookSecret`.
4. IF the decrypted `webhookSecret` does not match the value in the `x-api-key` header, THEN THE CrmWebhookGuard SHALL return HTTP 401 Unauthorized and reject the request.
5. IF no active `CrmConnection` with a configured `webhookSecret` exists, THEN THE CrmWebhookGuard SHALL return HTTP 401 Unauthorized and reject the request.
6. WHEN the `x-api-key` header matches the decrypted `webhookSecret`, THE CrmWebhookGuard SHALL allow the request to proceed to the controller without sending any HTTP response until the controller completes processing.

---

### Requirement 3: Webhook Event Logging

**User Story:** As a system operator, I want every inbound webhook event to be logged before processing, so that I have a complete audit trail for debugging and compliance.

#### Acceptance Criteria

1. WHEN a webhook request passes authentication, THE Webhook_Event_Logger SHALL persist a `WebhookEventLog` record with `status = 'pending'`, the entity type, entity ID, event type, PII-masked payload, and `receivedAt` timestamp; this persistence SHALL complete before the event is passed to the processing pipeline.
2. WHEN webhook processing completes successfully, THE Webhook_Event_Logger SHALL update the `WebhookEventLog` record to `status = 'success'` and set `processedAt` to the current timestamp.
3. WHEN webhook processing fails, THE Webhook_Event_Logger SHALL update the `WebhookEventLog` record to `status = 'failed'` and record an error message indicating the failure reason in `errorMessage`.
4. WHILE a webhook event is enqueued and waiting for a retry job to begin, THE Webhook_Event_Logger SHALL keep the `WebhookEventLog` record at `status = 'failed'`.
5. WHEN a retry job begins processing a webhook event, THE Webhook_Event_Logger SHALL update the `WebhookEventLog` record to `status = 'retrying'`.
6. WHEN a webhook event reaches `retryCount >= 5`, THE Webhook_Event_Logger SHALL update the `WebhookEventLog` record to `status = 'dead_letter'`.
7. THE Webhook_Event_Logger SHALL mask the following PII fields in the stored `payload` before persisting the `WebhookEventLog` record: email addresses, phone numbers, and any field whose key name contains `password`, `token`, or `secret` (case-insensitive); masked values SHALL be replaced with a fixed redaction marker (e.g., `[REDACTED]`) and SHALL NOT be reversible.
8. IF a write to `WebhookEventLog` is attempted with a `retryCount` value outside the range 0–5 inclusive, THEN THE system SHALL reject the write and return a validation error.

---

### Requirement 4: Real-Time Webhook Processing — Create and Update Events

**User Story:** As a support agent, I want the local database to reflect Dynamics 365 account and contact changes immediately, so that I always work with up-to-date customer data.

#### Acceptance Criteria

1. WHEN a webhook event with `eventType = 'create'` or `eventType = 'update'` is received for an `account` entity, THE CrmWebhookController SHALL upsert the corresponding `CrmAccount` record using the external account ID as the unique key.
2. WHEN a webhook event with `eventType = 'create'` or `eventType = 'update'` is received for a `contact` entity, THE CrmWebhookController SHALL upsert the corresponding `CustomerProfile` and associated `User` record using the external contact ID and email address as keys.
3. IF a contact webhook payload does not contain an email address, THEN THE CrmWebhookController SHALL skip processing for that event, log a warning, and return HTTP 200.
4. WHEN a contact webhook payload contains an email address that matches an entry in `ADMIN_BYPASS_EMAILS`, THE CrmWebhookController SHALL skip all processing for that event — including all field updates — without modifying any user or profile data.
5. WHEN a contact upsert creates a new `User` record, THE CrmWebhookController SHALL set `passwordHash = 'CRM_SYNCED'` and assign the `CUSTOMER` role. WHEN a contact upsert updates an existing `User` record, THE CrmWebhookController SHALL NOT modify the existing `User.passwordHash` or `User.roleId`.
6. WHEN webhook processing completes without error, THE CrmWebhookController SHALL return HTTP 200 to Dynamics 365.
7. WHEN webhook processing throws an unhandled exception, THE CrmWebhookController SHALL return HTTP 500 to Dynamics 365 so that Dynamics 365 can trigger its own retry mechanism.
8. WHEN webhook processing encounters a handled business outcome — including a missing email address, an admin bypass match, or a validation failure — THE CrmWebhookController SHALL return HTTP 200 to Dynamics 365.

---

### Requirement 5: Real-Time Webhook Processing — Delete Events

**User Story:** As a data integrity manager, I want records deleted in Dynamics 365 to be soft-deleted locally, so that the local database stays consistent without losing historical data.

#### Acceptance Criteria

1. WHEN a webhook event with `eventType = 'delete'` is received for an `account` entity, THE Delete_Handler SHALL set `deletedAt = NOW()` on the corresponding `CrmAccount` record.
2. WHEN a webhook event with `eventType = 'delete'` is received for a `contact` entity, THE Delete_Handler SHALL set `deletedAt = NOW()` on the corresponding `CustomerProfile` record.
3. WHEN a contact delete event is processed AND the associated `User` has `passwordHash = 'CRM_SYNCED'` AND the `User`'s email is NOT in `ADMIN_BYPASS_EMAILS`, THEN THE Delete_Handler SHALL set `User.status = 'INACTIVE'`.
4. WHEN a contact delete event is processed AND the associated `User`'s email is in `ADMIN_BYPASS_EMAILS`, THEN THE Delete_Handler SHALL NOT modify the `User` record regardless of `passwordHash` value.
5. WHEN a contact delete event is processed AND the associated `User`'s email is not in `ADMIN_BYPASS_EMAILS` AND `passwordHash != 'CRM_SYNCED'`, THEN THE Delete_Handler SHALL NOT modify the `User` record.
6. IF the `CustomerProfile`, `CrmAccount`, linked `User`, or any other local record referenced by a delete event does not exist in the local database, THEN THE Delete_Handler SHALL complete without error (idempotent behaviour), regardless of which record type is missing.
7. THE Delete_Handler SHALL perform all soft-delete operations — including the `User.status = 'INACTIVE'` write — within a single database transaction.
8. IF a delete event payload does not contain the entity identifier required to perform the lookup (e.g., `accountid` for accounts, `contactid` for contacts), THEN THE Delete_Handler SHALL log a warning and return without error.

---

### Requirement 6: Webhook Retry Queue

**User Story:** As a system operator, I want failed webhook events to be automatically retried with exponential backoff, so that transient failures do not result in permanent data loss.

#### Acceptance Criteria

1. WHEN webhook processing fails and `retryCount < MAX_RETRY_COUNT`, THE Webhook_Retry_Processor SHALL enqueue a retry job in the BullMQ `webhook-retry` queue with a delay of `2^retryCount * 1000` milliseconds.
2. WHEN a retry job is processed, THE Webhook_Retry_Processor SHALL increment `WebhookEventLog.retryCount` by 1 before attempting reprocessing.
3. WHEN a retry attempt succeeds, THE Webhook_Retry_Processor SHALL update `WebhookEventLog.status = 'success'` and set `processedAt` to the current timestamp.
4. WHEN a retry attempt fails and `retryCount < MAX_RETRY_COUNT`, THE Webhook_Retry_Processor SHALL enqueue another retry job with the updated exponential backoff delay.
5. WHEN `retryCount >= MAX_RETRY_COUNT` and processing still fails, THE Webhook_Retry_Processor SHALL set `WebhookEventLog.status = 'dead_letter'` and SHALL NOT enqueue further retry jobs.
6. THE Webhook_Retry_Processor SHALL use the BullMQ `webhook-retry` queue, separate from the existing `crm-sync` queue.
7. THE maximum retry delay SHALL be `2^4 * 1000 = 16000` milliseconds (16 seconds) for the fifth and final retry attempt.

---

### Requirement 7: Delta Sync Engine

**User Story:** As a system operator, I want the system to periodically fetch only records changed since the last sync, so that any webhook gaps are filled without performing a full re-import.

#### Acceptance Criteria

1. THE Delta_Sync_Engine SHALL run as a scheduled job every 15 minutes.
2. WHEN a delta sync is triggered and a `DeltaSyncState` record exists for the given connection and entity type, THE Delta_Sync_Engine SHALL read the `lastSyncAt` timestamp from that record.
3. IF a `DeltaSyncState` record does not exist for a connection and entity type, THEN THE Delta_Sync_Engine SHALL treat the sync as starting from the beginning and SHALL NOT apply a `modifiedon` filter to the Dynamics 365 query.
4. WHEN fetching changed records, THE Delta_Sync_Engine SHALL apply an OData `$filter=modifiedon gt <lastSyncAt>` query to the Dynamics 365 API.
5. WHEN the Dynamics 365 API returns a paginated response, THE Delta_Sync_Engine SHALL follow all `@odata.nextLink` URLs until all changed records are retrieved.
6. WHEN a fetched record has `statecode = 1` (inactive/deactivated), THE Delta_Sync_Engine SHALL invoke the Delete_Handler to soft-delete the corresponding local record.
7. WHEN a fetched record has `statecode = 0` (active), THE Delta_Sync_Engine SHALL upsert the corresponding local record.
8. WHEN all pages of a delta sync batch are retrieved and processed without a fatal error (where a fatal error is defined as an unrecoverable error that prevents further page fetching or halts the entire run), THE Delta_Sync_Engine SHALL update `DeltaSyncState.lastSyncAt` to the timestamp at which the sync started. Per-record failures that increment `errorCount` SHALL NOT block the `lastSyncAt` update as long as all pages were retrieved.
9. IF the Dynamics 365 API becomes unavailable at any point during a delta sync — including mid-pagination — THEN THE Delta_Sync_Engine SHALL not update `DeltaSyncState.lastSyncAt`, ensuring the same time range is retried on the next scheduled run.
10. WHEN a delta sync completes, THE Delta_Sync_Engine SHALL return a `DeltaSyncResult` containing `totalFetched`, `successCount`, `errorCount`, and `syncedAt`.
11. THE Delta_Sync_Engine SHALL process both `account` and `contact` entity types in each scheduled run.
12. WHEN a fetched record has a `statecode` value other than `0` or `1`, THE Delta_Sync_Engine SHALL skip that record, increment `errorCount`, and log a warning without halting the run.

---

### Requirement 8: Backward Compatibility with Manual Sync

**User Story:** As a system administrator, I want the existing manual sync (`syncAccounts` / `syncContacts`) to continue working unchanged, so that I can still trigger a full re-import when needed.

#### Acceptance Criteria

1. THE CrmService SHALL continue to expose the existing `triggerSync` method that enqueues a full sync job on the `crm-sync` BullMQ queue.
2. WHEN a full sync job is executed, THE CrmService SHALL call `syncAccounts` and `syncContacts` on the Dynamics 365 adapter in the same order and with the same behaviour as before this feature was introduced.
3. THE addition of the `webhook-retry` queue SHALL not affect the processing or configuration of the existing `crm-sync` queue. The feature MAY be deployed as long as the two queues remain isolated, even if other backward compatibility aspects require separate remediation.
4. THE WebhookRegistration, WebhookEventLog, and DeltaSyncState models SHALL be additive schema changes that do not alter existing Prisma models (`CrmConnection`, `CrmAccount`, `CustomerProfile`, `CrmSyncLog`). New tables MAY reference existing tables via foreign keys but SHALL NOT modify existing table definitions.

---

### Requirement 9: Data Models

**User Story:** As a backend developer, I want well-defined database models for webhook registrations, event logs, and delta sync state, so that the system has a reliable persistence layer for the new real-time sync components.

#### Acceptance Criteria

1. THE WebhookRegistration model SHALL have fields: `id`, `connectionId`, `entityType`, `webhookUrl`, `externalWebhookId`, `status`, `createdAt`, `lastVerifiedAt`, `deletedAt`, and a relation to `CrmConnection`.
2. THE WebhookRegistration model SHALL enforce that `entityType` is one of `'account'` or `'contact'`.
3. THE WebhookRegistration model SHALL enforce that `status` is one of `'active'`, `'inactive'`, or `'failed'`.
4. THE WebhookRegistration model SHALL enforce that `webhookUrl` is a valid HTTPS URL.
5. THE WebhookEventLog model SHALL have fields: `id`, `connectionId`, `entityType`, `entityId`, `eventType`, `payload`, `receivedAt`, `processedAt`, `status`, `errorMessage`, `retryCount`, `deletedAt`, and a relation to `CrmConnection`.
6. THE WebhookEventLog model SHALL enforce that `eventType` is one of `'create'`, `'update'`, or `'delete'`.
7. THE WebhookEventLog model SHALL enforce that `status` is one of `'pending'`, `'success'`, `'failed'`, `'retrying'`, or `'dead_letter'`.
8. THE DeltaSyncState model SHALL have fields: `id`, `connectionId`, `entityType`, `lastSyncAt`, `nextSyncToken`, `createdAt`, `updatedAt`, and a relation to `CrmConnection`.
9. THE DeltaSyncState model SHALL enforce a unique constraint on `(connectionId, entityType)` so that only one state record exists per entity type per connection.
10. THE DeltaSyncState model SHALL enforce that `entityType` is one of `'account'` or `'contact'`.
11. WHEN a `CrmConnection` is deleted, THE system SHALL cascade-delete all associated `WebhookRegistration`, `WebhookEventLog`, and `DeltaSyncState` records in a single all-or-nothing operation. Cascade deletion SHALL only be triggered by deletion of the `CrmConnection` itself, not by webhooks failing permanently or connections becoming inactive.

---

### Requirement 10: Security and PII Protection

**User Story:** As a compliance officer, I want webhook payloads to be stored with PII masked and admin accounts to be protected from CRM-driven changes, so that the system meets data protection and security requirements.

#### Acceptance Criteria

1. THE Webhook_Event_Logger SHALL apply PII masking to all sensitive fields (including but not limited to email addresses and phone numbers) in the webhook payload before persisting the `WebhookEventLog` record.
2. WHEN any webhook event references an email address present in `ADMIN_BYPASS_EMAILS`, THE system SHALL process the event but SHALL NOT modify the corresponding `User` record's role, status, or password hash. Other non-protected fields on the `CustomerProfile` MAY be updated.
3. THE `webhookSecret` stored in `CrmConnection` SHALL remain encrypted at rest using the existing `CryptoService` and SHALL only be decrypted transiently during request authentication.
4. WHEN the `webhookSecret` in `CrmConnection` is rotated, THE Webhook_Registration_Service SHALL update the Dynamics 365 webhook configuration to use the new secret. IF the Dynamics 365 update fails, THEN THE Webhook_Registration_Service SHALL abort the rotation and keep the existing secret unchanged.
5. THE system SHALL validate the structure of all inbound webhook payloads and ignore unexpected fields without throwing an error.

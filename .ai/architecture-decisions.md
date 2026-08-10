# Architecture Decisions

Durable project decisions live here. Keep each ADR short: context, decision, reason,
and consequence. Use session summaries for implementation history.

## ADR-001 - Stay On pgvector Before Considering Qdrant

- Date: 2026-05-13
- Status: Accepted
- Context: The RAG stack currently uses PostgreSQL + pgvector. Qdrant may become attractive for larger scale, but switching now would add a large refactor before the current pipeline is stable.
- Decision: Do not migrate to Qdrant yet. First stabilize the existing pgvector pipeline, re-import clean data, then measure data volume, latency, recall, and operational pain.
- Consequence: Optimization work should target the current pgvector path. Qdrant research remains a future option, not current implementation scope.

## ADR-002 - Use Low-Rate Ingestion For Gemini Free Tier

- Date: 2026-05-13
- Status: Accepted
- Context: Gemini free-tier quotas can return 429/RESOURCE_EXHAUSTED during bulk sync, reranking, embedding, or generation.
- Decision: Knowledge pool sync and bulk import should use low-rate ingestion with deliberate pacing and bounded waits.
- Consequence: Imports may take longer, but the system should avoid quota fights, long UI spinners, and partial indexing failures.

## ADR-003 - AI Diagnosis Must Remain Optional For Ticket Creation

- Date: 2026-05-13
- Status: Accepted
- Context: Customers may want to open a ticket directly, and AI diagnosis can be delayed by provider quota or retrieval uncertainty.
- Decision: AI-assisted diagnosis is optional. Ticket creation must not require a successful AI answer.
- Consequence: Frontend flows should always expose a direct ticket path and treat AI failures as degraded assistance, not a blocker.

## ADR-004 - Handle Gemini 3072-Dim Embeddings Explicitly

- Date: 2026-05-13
- Status: Accepted
- Context: New Gemini embedding models can produce 3072-dimensional vectors. pgvector HNSW index support for the plain `vector` type is limited for high dimensions.
- Decision: The active embedding version and dimension must drive vector column/index maintenance. HNSW should be skipped or removed when the active dimension exceeds pgvector HNSW compatibility, while exact search remains available.
- Consequence: Any embedding model change requires checking schema dimensions, existing rows, index behavior, and re-import strategy before production use.

## ADR-005 - Clean Old RAG Data Before Full Re-Import

- Date: 2026-05-13
- Status: Accepted
- Context: The RAG system was revised significantly, and stale embeddings or old source records can pollute new retrieval results.
- Decision: Before uploading the full document set again, inspect and clean old RAG/knowledge-pool data that belongs to previous pipeline versions.
- Consequence: Re-import work must include pre-cleanup inspection, safe deletion criteria, and verification that new documents are truly parsed, embedded, and searchable.

## ADR-006 - Do Not Mix Embedding Providers Within One Corpus Version

- Date: 2026-05-14
- Status: Accepted
- Context: During PDF Batch 003, OpenAI embedding fallback produced same-dimension vectors for a Gemini-indexed corpus, but retrieval quality was corrupted because the embedding spaces were different.
- Decision: Keep OpenAI as chat fallback only. Do not use OpenAI as embedding fallback for the active Gemini `3072/v2_2` corpus unless a new embedding version and full re-embedding plan are created.
- Consequence: Gemini embedding quota exhaustion should fail or pause ingestion clearly. It must not silently fall back to a different embedding model space inside the same `embedding_version`.

## ADR-007 - Isolate Embedding Indexes By Version And Dimension

- Date: 2026-05-17
- Status: Accepted
- Context: The product must keep the higher-quality Gemini embedding path, but production still had fixed `vector(1536)` columns that rejected Gemini `3072` vectors. Normalizing all providers into one shared vector space is not a reliable professional solution because providers produce different semantic spaces.
- Decision: Use embedding index isolation. pgvector columns are stored as unconstrained `vector`, while all writes/searches are isolated by active `embedding_version + embedding_dim`. Gemini `v2_2 / 3072` remains the active embedding index. Other providers require their own embedding version and reindex before activation.
- Consequence: Provider changes become explicit index lifecycle events instead of silent fallback. PostgreSQL remains the near-term production store; Qdrant migration is a roadmap item to benchmark later, not a pre-delivery change.

## ADR-008 - Use One CRM Record Sync Path For Dynamics Writes

- Date: 2026-05-19
- Status: Accepted
- Context: Dynamics full sync, delta sync, and webhook sync had drifted into separate persistence paths, so the same CRM record could produce different local fields depending on how it arrived.
- Decision: Dynamics full import should fetch raw account/contact payloads from the adapter, then persist through `CrmRecordSyncService`, the same shared path used by delta and webhook sync.
- Consequence: New CRM field mapping, raw payload snapshots, placeholder-email repair, account linking, and change logs must be implemented once in `CrmRecordSyncService` instead of duplicated in the adapter.

## ADR-009 - Customer/Admin AI Parity Requires Shared Retrieval Acceptance

- Date: 2026-05-26
- Status: Accepted
- Context: Customer ticket-opening AI and admin ANN drafts shared prompt/answer contract logic, but customer query flow could still return `NO_MATCH` before reaching the shared synthesis path. Live ticket SUP-00136 exposed this: customer AI rejected usable context while admin ANN produced a useful draft.
- Decision: Retrieval-context acceptance for support answers belongs in `SupportAnswerOrchestrator`, not as separate threshold logic in customer query flows.
- Consequence: Future customer/admin AI quality fixes must update the shared orchestrator decision and its regressions before adding route-specific prompt patches.

## ADR-010 - Production Data Shadowing Is One-Way And Sanitized

- Date: 2026-08-05
- Status: Accepted
- Context: GAP remediation needs realistic production-like data to validate authorization, migration history, RAG quality, and support workflows, but the live Aluplan system is already operational and must not be exposed to accidental writes, migrations, queue replays, or external integration calls during development.
- Decision: Production data may be copied only one-way from production to local through read-only dumps. Local development must never point `DATABASE_URL` at the production IP. Production Prisma migration/restore/reset/resolve commands are forbidden outside an explicit maintenance window and separate operator decision. Local shadow restores must sanitize CRM/webhook secrets, refresh-token hashes, and secret/token/API-key settings before being used by the app. Production Redis is not copied into the local shadow; local Redis remains empty/ephemeral.
- Consequence: Realistic local testing can use a sanitized Postgres shadow while preventing production data loss, external CRM/mail/WhatsApp/R2 calls, and BullMQ/session/cache replay. Migration-history investigations such as BULGU-10 should use the shadow `_prisma_migrations` table first, not production.

## ADR-011 - Applied Migration History Is Immutable And Promotion Is Shadow-Gated

- Date: 2026-08-06
- Status: Accepted
- Context: A historical migration was mutated after production application, so production stayed healthy while fresh installs failed with P3018. The production-shadow ledger also contains one explicit `manual-psql-fix` marker.
- Decision: Applied migration files must match a versioned full-file SHA-256 manifest and must not be edited after application. Known non-SHA ledger markers require a named, narrow ledger-only verifier exception. The file manifest must pass before any CI deploy. Every new database migration must then pass a fresh PG17 deploy and a sanitized production-shadow clone integrity check before production promotion.
- Consequence: CI blocks on fresh deploy, status, canonical checksum/ledger consistency, orphan detection, and required foundational relations. Passing these local gates does not authorize production deployment; production migration remains a separate maintenance-window decision. Full schema drift outside the targeted migration remains a separate remediation phase.

## ADR-012 - Schema Parity Uses An Additive Compatibility Union

- Date: 2026-08-06
- Status: Accepted
- Context: Fresh migration output, the production-derived shadow, and `schema.prisma` had different indexes, constraints, compatibility columns/enums, defaults, and vector-index declarations. Applying Prisma's raw drift output would have removed production integrity/performance objects and created misleading B-tree indexes named as HNSW.
- Decision: Converge fresh and production-derived schemas through an additive compatibility union. Preserve production-proven unique/index/FK objects, retain harmless historical fresh-install compatibility types/columns, forbid DROP and data mutation in the parity migration, and allowlist only the partial FAQ embedding index that Prisma cannot model. HNSW lifecycle stays under `RagMaintenanceService`, not Prisma.
- Consequence: Every future schema migration must pass canonical checksum, fresh PG17, migrated shadow-clone parity, and data-fingerprint gates. The comparator is local/clone-only. Production promotion remains a separate, explicitly approved maintenance-window operation with lock/time preflight.

## ADR-013 - Session Revocation Is Database-Durable

- Date: 2026-08-06
- Status: Accepted
- Context: Redis timestamp invalidation alone could fail after a password change, and refresh rotation could race with password reset and recreate a usable session.
- Decision: Bind access and refresh JWTs to `users.session_version`. Password reset and admin force logout increment that version in the same durable database update that clears refresh state. Refresh rotation uses a conditional update over the prior hash and session version. Redis revocation markers remain best-effort compatibility and latency helpers, not the security boundary.
- Consequence: Authenticated requests perform a lightweight user state/version lookup. Legacy tokens without the claim are treated as version `0`, so rollout is compatible until a user's version is incremented. Password reset remains successful if Redis is temporarily unavailable while all older tokens are still rejected by the database version check.

## ADR-014 - Prisma Migration Timeouts Travel In The Connection URL

- Date: 2026-08-06
- Status: Accepted
- Context: A disposable PostgreSQL 17 lock test showed that the Prisma migration engine did not inherit shell `PGOPTIONS`; it waited for the lock and then applied migrations. The same test with PostgreSQL `options` encoded in `DATABASE_URL` exited non-zero in 5.946 seconds under a confirmed `AccessExclusiveLock`.
- Decision: One-shot and application-gated Prisma migration commands must derive a non-logged migration URL that sets `lock_timeout=5s` and `statement_timeout=300s` through its `options` query parameter. Migration failure must prevent application startup.
- Consequence: Faz 8 must use the runbook's derived migration URL and must not treat shell `PGOPTIONS` as a safety control. This is local disposable-clone evidence only and does not authorize a production migration.

## ADR-015 - Separate AI Interaction Evidence From FAQ Publication

- Date: 2026-08-06
- Status: Accepted
- Context: FAQ approval candidates and pre-ticket customer AI interactions have different purposes and privacy boundaries. The former is an editorial publication workflow; the latter is sensitive operational evidence of what a customer asked and what the system displayed.
- Decision: Keep FAQ approval and AI interaction history as separate surfaces and permissions. Store FAQ provenance as normalized source relations. Interaction-derived FAQ candidates use the stored answer but remain pending human review. AI-history responses are allowlisted, audited and restricted to administrator-class roles; ticket traces additionally require ticket access.
- Consequence: Future learning-pipeline work must not mix raw customer interactions into the publication queue or expose them through public FAQ permissions. Provenance additions must be transactional, legacy source identities must not be inferred, and new history consumers must use the dedicated audited endpoint.

## ADR-016 - Production Boot Is Migration-Only And Fail-Closed

- Date: 2026-08-06
- Status: Accepted
- Context: The container boot path previously mixed schema repair, manual migration-ledger edits, admin/role recovery, test-account creation, and broad user reactivation with normal API startup. A missing migration-manifest update also allowed local feature work to diverge from the blocking CI contract.
- Decision: All production entrypoints delegate to one executable script that verifies canonical migration files, runs only `prisma migrate deploy` with connection-URL lock/statement timeouts, verifies the resulting ledger/required relations, and starts the API only after success. Seed, bootstrap, synchronization, recovery, and direct DDL are explicit maintenance operations with separate opt-ins and must never be normal boot side effects. Manifest updates are explicit, append-only, and refuse changed history; CI remains read-only.
- Consequence: Restarting or deploying the API cannot silently reactivate users, reset credentials, create test accounts, repair roles, or rewrite migration history. Any migration or verification failure prevents application start. Docker image build/runtime smoke and destructive maintenance acceptance remain separate release gates and do not authorize production activity.

## ADR-017 - RBAC Catalog Is Canonical And SUPPORT_AGENT Is Least-Privilege

- Date: 2026-08-07
- Status: Accepted
- Context: Controller decorators referenced permissions missing from the database catalog, role spellings mixed hyphens and underscores, and the planned Görev Merkezi needs one staff role spanning ticket, FAQ, knowledge-review, reporting, and AI-history workflows without administrative or destructive authority.
- Decision: Keep a versioned machine-readable RBAC catalog, validate controller decorators through the TypeScript AST, verify the catalog and exact role mappings against a freshly migrated database in CI, and normalize role case plus hyphen/underscore aliases at the guard boundary. `SUPPORT_AGENT` receives exactly the approved 16 permissions and explicitly excludes wildcard, settings, user-management, administrative-SLA, and knowledge-delete permissions.
- Consequence: New roles or permissions must update the canonical contract and pass both source and database checks. Migrations may add missing catalog entries but must not silently remove existing privileges or assign users. Production role assignment and migration remain separate operator-approved actions.

## ADR-018 - Review Center Is A Read-Only Authorization-Scoped Projection

- Date: 2026-08-07
- Status: Accepted
- Context: Support staff must find pending operational and editorial work without memorizing several routes, but a central summary can become a cross-domain count leak or a new authorization boundary if it queries every queue and merely hides links in the frontend.
- Decision: The Review Center is a read-only orchestration projection. Its backend queries only queues authorized by the caller's effective role/permissions, omits unauthorized categories entirely, excludes audit-only AI history from action totals, and returns no-cache responses. The frontend renders only backend-returned categories and must not infer authorization from menu visibility. Existing domain endpoints remain the authority for each action.
- Consequence: Adding a new Review Center queue requires an explicit permission/role gate, a stable destination filter, tests proving unauthorized queries do not run, and separate action-versus-audit classification. The center must never approve, assign, publish or mutate work itself; changes to underlying domain authorization remain separate decisions.

## ADR-019 - Client Capabilities Must Have A Real Backend Contract

- Date: 2026-08-07
- Status: Accepted
- Context: Product taxonomy work exposed three pre-existing client/server gaps: a stale CRM route and request shape, MFA controls with no backend security model, and an unreachable MJML block editor. The CRM path also accepted an overly broad outbound target and secret-setting writes could return plaintext or ciphertext.
- Decision: Do not expose an interactive client capability until its authenticated backend contract exists. Remove dormant MFA and MJML block-editor surfaces instead of adding unsafe stubs. Keep transactional file-backed email templates (`source/save/preview`) separate from database-backed announcements. Dynamics egress is restricted to a trusted HTTPS `*.dynamics.com` origin with redirects disabled and OData continuation links pinned to the same origin. Secret-setting write responses are always masked. A blocking AST/OpenAPI route-level check detects unknown central-client routes and unapproved dashboard network calls.
- Consequence: Reintroducing MFA requires a separately approved end-to-end security design including secret storage, recovery, re-authentication, throttling and audit. A future visual email block editor needs an explicit DTO/persistence contract and must not merge transactional templates with announcements. The route checker proves method/path parity only; payload semantics still require DTO/OpenAPI types and focused tests.

## ADR-020 - Production Inventory Is Prepared Offline And Executed Only By Separate Approval

- Date: 2026-08-10
- Status: Accepted
- Context: Release approval still requires live migration-ledger, S3-compatible object, Redis/BullMQ and cron/repeatable-job evidence. Combining preparation with live credentials or execution would make a local review command capable of touching production and would blur the boundary between reviewed tooling and authorized observation.
- Decision: A.1.4 is split into two gates. The preparation contract is network-incapable, imports no database/cloud/Redis clients, rejects `--execute`, accepts no credential or endpoint argument and writes only no-clobber mode-`0600` evidence under `.private-data`. It freezes nine queue names, nine source cron declarations, four repeatable jobs, exact PostgreSQL statement allowlists and R2/Redis read-operation allowlists. Any real production collector or invocation requires a later, separate user approval and least-privilege short-lived credentials.
- Consequence: Passing local preparation tests cannot be cited as live inventory or production GO. The first production observation remains read-only and private/redacted; object bodies, writes, queue mutation, migrations, seeds and deployment stay forbidden. Runtime singleton and DB-to-object parity claims require actual approved production evidence.

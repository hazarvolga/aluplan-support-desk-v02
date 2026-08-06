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

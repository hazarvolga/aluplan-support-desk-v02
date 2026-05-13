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

# Current Focus

## Active Work

- Stabilize the RAG and embedding pipeline before another full document import.
- Keep Gemini free-tier usage quota-safe with low-rate ingestion and bounded sync diagnosis.
- Improve Turkish fallback relevance so customer-facing AI answers match the user's language and intent.
- Verify Hotinfo/system signals are actually used during customer diagnosis answers.
- Separate uncommitted RAG/provider/test changes from unrelated agent/spec/tooling noise before committing.

## Avoid Breaking

- `AiService` provider dispatch, retry, and fallback behavior.
- `AiQueryService` sync diagnosis and async query flows.
- `EmbeddingService` knowledge pool, ticket, and article embedding writes.
- `RagMaintenanceService` vector dimension and index maintenance behavior.
- `NotificationsGateway` and WebSocket connection flows.
- Ticket lifecycle and AI-optional ticket creation.

## Known Risks

- Gemini quota/rate limits can stall model-backed reranking or final answer generation if not bounded.
- Gemini 3072-dim embeddings affect pgvector column dimensions and HNSW index compatibility.
- Root-level Markdown and imported agent instructions may be stale or duplicated.
- `graphify` CLI was previously unavailable in PATH, so graph updates may need environment repair.
- Current working tree contains unrelated `.agents`, `.kiro`, and documentation/tooling noise.

## Next Recommended Step

Audit the uncommitted RAG changes as a separate unit, verify database/vector assumptions, then commit only the coherent product-code changes. Keep `.agents`, `.kiro`, and `AGENTS.md` cleanup as separate follow-up work unless the user explicitly asks to include them.

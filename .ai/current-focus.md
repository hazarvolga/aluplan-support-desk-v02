# Current Focus

## Active Work

- Build the PDF-first RAG dataset import path without polluting the knowledge pool with generated MD duplicates.
- Keep `dataset/` as the clean import surface and `.archive/rag-incoming/pdf/` as the raw PDF inbox.
- Preserve Gemini/LLMAPI + pgvector and low-rate ingestion while importing in small validated batches.
- Ensure Knowledge Pool sources carry useful `metadata.category` values so the admin UI does not show everything as `General`.
- Track Turkish retrieval quality: targeted Turkish license-transfer queries work, but broader Turkish wording can still retrieve nearby EN license-server content.

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
- Generated MD files from old PDF conversion flows can duplicate or distort canonical PDF sources.
- Broad semantic queries can retrieve adjacent license/server documents unless language/category boosting is tightened.
- `graphify` CLI was previously unavailable in PATH, so graph updates may need environment repair.
- `apps/backend/openapi.json` is modified separately; do not mix it into RAG import commits unless intentionally regenerated.

## Next Recommended Step

Commit the scanner classifier/test change separately, then continue with 5-file PDF support batches from `.archive/rag-staging/pdf-first/ready/manifest-ready.json`. After each batch, verify sync `SUCCESS`, embeddings `3072/v2_2`, admin UI category, and one language-specific search query.

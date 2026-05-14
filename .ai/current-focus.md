# Current Focus

## Active Work

- Build the PDF-first RAG dataset import path without polluting the knowledge pool with generated MD duplicates.
- Keep `dataset/` as the clean import surface and `.archive/rag-incoming/pdf/` as the raw PDF inbox.
- Preserve Gemini/LLMAPI + pgvector and low-rate ingestion while importing in small validated batches.
- Ensure Knowledge Pool sources carry useful `metadata.category` values from both dataset scan and UI upload.
- Continue controlled 5-file PDF support batches now that Batch 001 and Batch 002 completed successfully.
- Keep title-specific retrieval boosting in place so near-duplicate FAQ topics rank by the most specific PDF title, not only vector similarity.

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
- Legacy sources with `General` category can still appear after correctly categorized sources until old metadata is cleaned or reclassified.
- Similar multilingual FAQ topics can still tie at capped similarity `1.000`; inspect rank order and source metadata, not only displayed similarity.
- `graphify` CLI was previously unavailable in PATH, so graph updates may need environment repair.
- `apps/backend/openapi.json` is modified separately; do not mix it into RAG import commits unless intentionally regenerated.

## Next Recommended Step

Continue with PDF Batch 003 from `.archive/rag-staging/pdf-first/ready/manifest-ready.json`. Use the same sequential sync pattern, then verify sync `SUCCESS`, embeddings `3072/v2_2`, admin UI category, and one language-specific search query. Keep watching Gemini quota events during each batch.

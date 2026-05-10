# RAG Embedding Abstraction Layer (Option C)

Introduce a provider-independent, version-aware embedding architecture that allows seamless switching between embedding models (e.g., OpenAI text-embedding-3-small to Gemini embedding-2-001) without downtime or data loss.

## User Review Required

> [!IMPORTANT]
> This plan involves a database schema migration that makes the `vector` type dimensionless. While the current dataset is reportedly empty (as per `rag-final-plan.md`), this operation should be performed with caution in production environments.

> [!WARNING]
> Switching providers will trigger a full re-indexing of all published articles and knowledge pool content. This will consume LLM API tokens and may take time depending on the corpus size.

## Open Questions

- Should we implement a "Dry Run" mode for migrations to estimate token costs before starting?
- Is there a preference for the BullMQ queue configuration (concurrency, priority)?
- Do we want to keep `AiResponseCache` during migration, or just flush it completely? (Flushing is recommended since it's just a cache).

## Proposed Changes

### Database Layer

#### [MODIFY] [schema.prisma](file:///Users/hazarekiz/Projects/aluplan-support-desk-V02/packages/database/prisma/schema.prisma)
- Update `KnowledgeEmbedding`, `KnowledgePoolEmbedding`, `TicketEmbedding`, and `FaqEntry` models.
- Ensure `embedding`, `queryEmbedding`, and `questionEmbedding` types are dimensionless `Unsupported("vector")`.
- Add `embeddingVersion` (v1, v2, etc.), `embeddingDim`, and `migratedAt` fields to all embedding models.
- Add indexes for `embeddingVersion`.

#### [NEW] [20260510000001_embedding_abstraction_layer.sql](file:///Users/hazarekiz/Projects/aluplan-support-desk-V02/packages/database/prisma/migrations/20260510000001_embedding_abstraction_layer/migration.sql)
- SQL migration to apply schema changes.
- Drop/Recreate HNSW indexes.
- Initialize `settings` with default versioning keys.

---

### Backend Logic

#### [MODIFY] [rag.config.ts](file:///Users/hazarekiz/Projects/aluplan-support-desk-V02/apps/backend/src/config/rag.config.ts)
- Add `EMBEDDING` configuration block for versioning constants (default version, dimensions, cleanup delay).

#### [NEW] [embedding-version-registry.service.ts](file:///Users/hazarekiz/Projects/aluplan-support-desk-V02/apps/backend/src/ai/embedding-version-registry.service.ts)
- Manage active/pending embedding versions using the `Settings` database.
- Logic for incrementing versions (v1 -> v2).

#### [NEW] [embedding-migration.processor.ts](file:///Users/hazarekiz/Projects/aluplan-support-desk-V02/apps/backend/src/ai/embedding-migration.processor.ts)
- BullMQ worker to handle background re-indexing of the entire corpus when the provider changes.
- Progress tracking via Redis.

#### [MODIFY] [embedding.service.ts](file:///Users/hazarekiz/Projects/aluplan-support-desk-V02/apps/backend/src/ai/embedding.service.ts)
- Update `indexArticle`, `indexPoolContent`, and `indexTicket` to be version-aware.
- Update `search` SQL to filter by `embedding_version` instead of `model_name`.

#### [MODIFY] [faq.service.ts](file:///Users/hazarekiz/Projects/aluplan-support-desk-V02/apps/backend/src/faq/faq.service.ts)
- Update `processPatterns` SQL query to filter by the `activeVersion` to ensure semantic deduplication compares vectors of the same dimension and model.

#### [MODIFY] [settings.service.ts](file:///Users/hazarekiz/Projects/aluplan-support-desk-V02/apps/backend/src/settings/settings.service.ts)
- Inject `EventEmitter2` from `@nestjs/event-emitter`.
- Add event emitter for `ai.embed_provider` or `ai.llmapi.embed_model` changes.

#### [MODIFY] [ai-semantic-cache.service.ts](file:///Users/hazarekiz/Projects/aluplan-support-desk-V02/apps/backend/src/ai/ai-semantic-cache.service.ts)
- Remove hardcoded `1536` dimension, use dynamic active dimension.
- Flush `AiResponseCache` completely when provider change event is emitted.

#### [MODIFY] [ai.module.ts](file:///Users/hazarekiz/Projects/aluplan-support-desk-V02/apps/backend/src/ai/ai.module.ts)
- Register new services and BullMQ queue for migration.

#### [MODIFY] [rag-observability.service.ts](file:///Users/hazarekiz/Projects/aluplan-support-desk-V02/apps/backend/src/ai/rag-observability.service.ts)
- Add `getMigrationStatus()` to monitor background progress.

---

### Infrastructure

#### [MODIFY] [.env](file:///Users/hazarekiz/Projects/aluplan-support-desk-V02/.env)
- Update to Gemini-specific embedding configurations as the new target.

## Verification Plan

### Automated Tests
- `pnpm --filter @aluplan/backend test`: Run all backend unit tests.
- New unit tests for `EmbeddingVersionRegistry` and `EmbeddingMigrationProcessor`.
- Integration test for `EmbeddingService.search()` with multiple versions in DB.

### Manual Verification
1. Change `ai.embed_provider` in settings/env.
2. Monitor BullMQ queue for `migrate-embeddings` job.
3. Verify Redis progress keys.
4. Confirm `rag.embedding_active_version` updates upon completion.
5. Perform semantic search and ensure results are returned from the new version.

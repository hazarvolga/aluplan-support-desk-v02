-- Enable embedding index isolation across providers/models/dimensions.
--
-- pgvector columns with a fixed typmod such as vector(1536) reject Gemini's
-- 3072-dimensional embeddings before the application can isolate by
-- embedding_version + embedding_dim. Unconstrained vector columns allow
-- multiple isolated embedding versions to coexist in the same table while
-- application queries filter to the active version/dimension before scoring.

DROP INDEX IF EXISTS "knowledge_embeddings_vector_hnsw_idx";
DROP INDEX IF EXISTS "knowledge_pool_embeddings_vector_hnsw_idx";
DROP INDEX IF EXISTS "ticket_embeddings_vector_hnsw_idx";

ALTER TABLE "knowledge_embeddings"
  ALTER COLUMN "embedding" TYPE vector USING "embedding"::vector;

ALTER TABLE "knowledge_pool_embeddings"
  ALTER COLUMN "embedding" TYPE vector USING "embedding"::vector;

ALTER TABLE "ticket_embeddings"
  ALTER COLUMN "embedding" TYPE vector USING "embedding"::vector;

ALTER TABLE "faq_entries"
  ALTER COLUMN "question_embedding" TYPE vector USING "question_embedding"::vector;

ALTER TABLE "ai_response_cache"
  ALTER COLUMN "query_embedding" TYPE vector USING "query_embedding"::vector;

CREATE INDEX IF NOT EXISTS "idx_ke_embedding_version_dim"
  ON "knowledge_embeddings" ("embedding_version", "embedding_dim");

CREATE INDEX IF NOT EXISTS "idx_kpe_embedding_version_dim"
  ON "knowledge_pool_embeddings" ("embedding_version", "embedding_dim");

CREATE INDEX IF NOT EXISTS "idx_ticket_embeddings_version_dim"
  ON "ticket_embeddings" ("embedding_version", "embedding_dim");

CREATE INDEX IF NOT EXISTS "idx_faq_entries_embedding_version_dim"
  ON "faq_entries" ("embedding_version", "embedding_dim")
  WHERE "question_embedding" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_ai_response_cache_embedding_version_dim"
  ON "ai_response_cache" ("embedding_version", "embedding_dim");

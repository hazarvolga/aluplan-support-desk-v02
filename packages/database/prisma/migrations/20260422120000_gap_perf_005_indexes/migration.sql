-- 1. B-Tree Performance Indexes
CREATE INDEX IF NOT EXISTS "idx_tickets_status_created_at" ON "tickets"("status", "created_at");
CREATE INDEX IF NOT EXISTS "idx_tickets_assigned_status" ON "tickets"("assigned_to", "status");
CREATE INDEX IF NOT EXISTS "idx_ai_interactions_created_confidence" ON "ai_interactions"("created_at" DESC, "confidence_band");

-- 2. HNSW Vector Index Optimization (pgvector specific)
-- Drop existing default HNSW vector indexes to rebuild them with tuned parameters (m=16, ef_construction=64)
DROP INDEX IF EXISTS "knowledge_embeddings_vector_hnsw_idx";
CREATE INDEX "knowledge_embeddings_vector_hnsw_idx" ON "knowledge_embeddings" USING hnsw ("embedding" vector_cosine_ops) WITH (m = 16, ef_construction = 64);

DROP INDEX IF EXISTS "knowledge_pool_embeddings_vector_hnsw_idx";
CREATE INDEX "knowledge_pool_embeddings_vector_hnsw_idx" ON "knowledge_pool_embeddings" USING hnsw ("embedding" vector_cosine_ops) WITH (m = 16, ef_construction = 64);

DROP INDEX IF EXISTS "ticket_embeddings_vector_hnsw_idx";
CREATE INDEX "ticket_embeddings_vector_hnsw_idx" ON "ticket_embeddings" USING hnsw ("embedding" vector_cosine_ops) WITH (m = 16, ef_construction = 64);

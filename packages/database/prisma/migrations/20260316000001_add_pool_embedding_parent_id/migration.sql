-- Add parent_id column to knowledge_pool_embeddings for hierarchical chunking
ALTER TABLE "knowledge_pool_embeddings" ADD COLUMN "parent_id" UUID REFERENCES "knowledge_pool_embeddings"("id") ON DELETE SET NULL;

-- Index for parent_id lookups
CREATE INDEX "idx_kpe_parent" ON "knowledge_pool_embeddings"("parent_id");

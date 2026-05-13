-- Align semantic cache with embedding versioning runtime writes.
ALTER TABLE "ai_response_cache" ADD COLUMN IF NOT EXISTS "embedding_dim" INTEGER NOT NULL DEFAULT 1536;

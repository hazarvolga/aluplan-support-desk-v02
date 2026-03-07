-- Comprehensive sync for knowledge_articles table
-- Adds all columns that are present in schema.prisma but missing or diverged in DB

ALTER TABLE "knowledge_articles" 
  ADD COLUMN IF NOT EXISTS "original_id" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "is_internal" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "is_auto_imported" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "trust_score" DECIMAL(5,4) NOT NULL DEFAULT 0.9500,
  ADD COLUMN IF NOT EXISTS "feedback_weight" DECIMAL(5,4) NOT NULL DEFAULT 1.0000,
  ADD COLUMN IF NOT EXISTS "age_weight" DECIMAL(5,4) NOT NULL DEFAULT 1.0000,
  ADD COLUMN IF NOT EXISTS "language" VARCHAR(10) NOT NULL DEFAULT 'tr',
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT '{}';

-- Index cleanup if they were missing (matches schema.prisma)
CREATE INDEX IF NOT EXISTS "idx_ka_status" ON "knowledge_articles"("status");
CREATE INDEX IF NOT EXISTS "idx_ka_approved" ON "knowledge_articles"("approved");
CREATE INDEX IF NOT EXISTS "idx_ka_category" ON "knowledge_articles"("category_id");

-- AlterTable
ALTER TABLE "knowledge_articles" ADD COLUMN IF NOT EXISTS "source" VARCHAR(50) DEFAULT 'internal';

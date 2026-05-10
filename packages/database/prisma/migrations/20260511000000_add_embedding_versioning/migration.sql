-- AlterTable
ALTER TABLE "ai_response_cache" ADD COLUMN "embedding_version" VARCHAR(10);

-- AlterTable
ALTER TABLE "faq_entries" ADD COLUMN "embedding_dim" INTEGER NOT NULL DEFAULT 1536,
ADD COLUMN "embedding_version" VARCHAR(10) NOT NULL DEFAULT 'v1',
ADD COLUMN "migrated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "knowledge_embeddings" DROP COLUMN "model_name",
ADD COLUMN "embedding_dim" INTEGER NOT NULL DEFAULT 1536,
ADD COLUMN "embedding_version" VARCHAR(10) NOT NULL DEFAULT 'v1',
ADD COLUMN "migrated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "knowledge_pool_embeddings" DROP COLUMN "model_name",
ADD COLUMN "embedding_dim" INTEGER NOT NULL DEFAULT 1536,
ADD COLUMN "embedding_version" VARCHAR(10) NOT NULL DEFAULT 'v1',
ADD COLUMN "migrated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ticket_embeddings" DROP COLUMN "model_name",
ADD COLUMN "embedding_dim" INTEGER NOT NULL DEFAULT 1536,
ADD COLUMN "embedding_version" VARCHAR(10) NOT NULL DEFAULT 'v1',
ADD COLUMN "migrated_at" TIMESTAMP(3);

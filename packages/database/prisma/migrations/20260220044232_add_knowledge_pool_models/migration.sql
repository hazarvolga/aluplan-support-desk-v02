-- CreateEnum
CREATE TYPE "KnowledgeSourceType" AS ENUM ('URL', 'FILE_PDF', 'FILE_TXT', 'FILE_MD', 'FILE_CSV');

-- CreateEnum
CREATE TYPE "KnowledgeSourceStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'SYNCING', 'FAILED');

-- CreateTable
CREATE TABLE "knowledge_sources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "KnowledgeSourceType" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "url" TEXT,
    "file_name" VARCHAR(255),
    "file_path" TEXT,
    "status" "KnowledgeSourceStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_synced_at" TIMESTAMP(3),
    "last_etag" VARCHAR(255),
    "last_hash" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_source_sync_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "source_id" UUID NOT NULL,
    "sync_started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sync_finished_at" TIMESTAMP(3),
    "status" VARCHAR(50) NOT NULL,
    "error" TEXT,
    "chunks_processed" INTEGER NOT NULL DEFAULT 0,
    "new_hash" VARCHAR(255),

    CONSTRAINT "knowledge_source_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_pool_embeddings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "source_id" UUID NOT NULL,
    "embedding" vector(768) NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "model_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_pool_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_kpe_source" ON "knowledge_pool_embeddings"("source_id");

-- AddForeignKey
ALTER TABLE "knowledge_source_sync_logs" ADD CONSTRAINT "knowledge_source_sync_logs_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "knowledge_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_pool_embeddings" ADD CONSTRAINT "knowledge_pool_embeddings_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "knowledge_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

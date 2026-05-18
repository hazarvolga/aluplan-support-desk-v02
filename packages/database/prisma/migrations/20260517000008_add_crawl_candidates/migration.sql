-- Create crawl candidate staging table for controlled crawler ingestion
CREATE TYPE "CrawlCandidateFormat" AS ENUM ('KNOWLEDGE_ARTICLE', 'PDF');
CREATE TYPE "CrawlCandidateStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'IMPORTED', 'SKIPPED_DUPLICATE', 'REJECTED', 'FAILED');

CREATE TABLE "crawl_candidates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "source" VARCHAR(100) NOT NULL,
    "source_url" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "format" "CrawlCandidateFormat" NOT NULL,
    "status" "CrawlCandidateStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "language" VARCHAR(10),
    "category_slug" VARCHAR(100),
    "content_hash" VARCHAR(255),
    "crawl_filter" VARCHAR(100),
    "rejection_reason" TEXT,
    "metadata" JSONB,
    "imported_source_id" UUID,
    "imported_at" TIMESTAMP(3),
    "crawled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crawl_candidates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "crawl_candidates_source_url_key" ON "crawl_candidates"("source_url");
CREATE INDEX "idx_crawl_candidates_source_status" ON "crawl_candidates"("source", "status");
CREATE INDEX "idx_crawl_candidates_format" ON "crawl_candidates"("format");
CREATE INDEX "idx_crawl_candidates_content_hash" ON "crawl_candidates"("content_hash");

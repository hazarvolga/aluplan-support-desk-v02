-- Claim approved candidates atomically before import side effects.
BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

ALTER TYPE "CrawlCandidateStatus" ADD VALUE IF NOT EXISTS 'IMPORTING' AFTER 'APPROVED';

ALTER TABLE "crawl_candidates" ADD COLUMN IF NOT EXISTS "import_started_at" TIMESTAMP(3);

COMMIT;

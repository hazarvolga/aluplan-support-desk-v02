-- Add durable, rate-limited Learn Now crawl run state without changing existing candidates.
BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

CREATE TYPE "LearnNowCrawlRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED');

CREATE TABLE "learnnow_crawl_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" "LearnNowCrawlRunStatus" NOT NULL DEFAULT 'QUEUED',
    "active_key" VARCHAR(50),
    "search" VARCHAR(255),
    "formats" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "max_candidates" INTEGER NOT NULL DEFAULT 5,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "processed_count" INTEGER NOT NULL DEFAULT 0,
    "inserted_count" INTEGER NOT NULL DEFAULT 0,
    "skipped_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "checkpoint" JSONB,
    "last_error" TEXT,
    "started_at" TIMESTAMP(3),
    "paused_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learnnow_crawl_runs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "learnnow_crawl_runs_max_candidates_check" CHECK ("max_candidates" BETWEEN 1 AND 5),
    CONSTRAINT "learnnow_crawl_runs_counts_check" CHECK (
        "attempt_count" >= 0 AND "processed_count" >= 0 AND "inserted_count" >= 0 AND "skipped_count" >= 0 AND "failed_count" >= 0
    )
);

CREATE INDEX "idx_learnnow_crawl_runs_status_created" ON "learnnow_crawl_runs"("status", "created_at");
CREATE INDEX "idx_learnnow_crawl_runs_created" ON "learnnow_crawl_runs"("created_at" DESC);
CREATE UNIQUE INDEX "learnnow_crawl_runs_active_key_key" ON "learnnow_crawl_runs"("active_key");

CREATE TABLE "learnnow_crawl_daily_budgets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "budget_date" DATE NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learnnow_crawl_daily_budgets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "learnnow_crawl_daily_budgets_attempt_count_check" CHECK ("attempt_count" >= 0)
);

CREATE UNIQUE INDEX "learnnow_crawl_daily_budgets_budget_date_key" ON "learnnow_crawl_daily_budgets"("budget_date");

COMMIT;

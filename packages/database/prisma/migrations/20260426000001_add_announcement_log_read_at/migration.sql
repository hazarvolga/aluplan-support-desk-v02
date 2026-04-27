-- Migration: add_announcement_log_read_at
-- Adds nullable readAt field and composite index to announcement_logs table

ALTER TABLE "announcement_logs" ADD COLUMN "read_at" TIMESTAMPTZ;

CREATE INDEX "idx_announcement_logs_customer_read" ON "announcement_logs"("customer_id", "read_at");

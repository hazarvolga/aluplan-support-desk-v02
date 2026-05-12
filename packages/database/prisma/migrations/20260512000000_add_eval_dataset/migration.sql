-- Migration: Add EvalDataset model for offline RAG evaluation
-- Feature: ai-pipeline-optimization (GAP-H4)

CREATE TABLE "eval_datasets" (
    "id"                  UUID         NOT NULL DEFAULT gen_random_uuid(),
    "query"               TEXT         NOT NULL,
    "relevant_chunk_ids"  TEXT[]       NOT NULL DEFAULT '{}',
    "tenant_id"           TEXT         NOT NULL,
    "created_by"          TEXT         NOT NULL,
    "notes"               TEXT,
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eval_datasets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_eval_dataset_tenant" ON "eval_datasets"("tenant_id");

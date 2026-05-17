-- Align faq_entries with the Prisma schema and RAG queries.
-- Some production databases were created before FAQ soft-delete support,
-- while current retrieval filters require faq_entries.deleted_at.

ALTER TABLE "faq_entries"
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "idx_faq_entries_deleted_at"
  ON "faq_entries" ("deleted_at");

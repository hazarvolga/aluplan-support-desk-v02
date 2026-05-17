-- Align macros with Prisma soft-delete model.
-- Production drift existed because Macro.deletedAt was present in schema,
-- but the live macros table was missing the backing column.
ALTER TABLE "macros"
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "idx_macros_deleted_at"
  ON "macros" ("deleted_at");

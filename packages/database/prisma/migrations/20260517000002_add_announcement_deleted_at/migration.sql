ALTER TABLE "announcements"
ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

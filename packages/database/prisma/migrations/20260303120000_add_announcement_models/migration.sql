-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('BROADCAST', 'TRIGGER', 'LIFECYCLE');

-- CreateEnum (only if not already exists from prior migration)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AnnouncementChannel') THEN
        CREATE TYPE "AnnouncementChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'IN_APP', 'SMS');
    END IF;
END $$;

-- CreateTable: announcements
CREATE TABLE "announcements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "content_mjml" TEXT NOT NULL,
    "target_criteria" JSONB NOT NULL,
    "status" "AnnouncementStatus" NOT NULL DEFAULT 'DRAFT',
    "type" "AnnouncementType" NOT NULL DEFAULT 'BROADCAST',
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable: announcement_logs
CREATE TABLE "announcement_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "announcement_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "error" TEXT,
    "email_log_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: announcement_templates
CREATE TABLE "announcement_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "topic" VARCHAR(100),
    "subject" VARCHAR(255),
    "content_mjml" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,

    CONSTRAINT "announcement_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "announcement_templates_name_key" ON "announcement_templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_logs_email_log_id_key" ON "announcement_logs"("email_log_id");

-- AddForeignKey: announcements.created_by -> users.id
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: announcement_logs.announcement_id -> announcements.id
ALTER TABLE "announcement_logs" ADD CONSTRAINT "announcement_logs_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: announcement_logs.customer_id -> customer_profiles.id
ALTER TABLE "announcement_logs" ADD CONSTRAINT "announcement_logs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: announcement_logs.email_log_id -> email_logs.id
ALTER TABLE "announcement_logs" ADD CONSTRAINT "announcement_logs_email_log_id_fkey" FOREIGN KEY ("email_log_id") REFERENCES "email_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: announcement_templates.created_by -> users.id
ALTER TABLE "announcement_templates" ADD CONSTRAINT "announcement_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

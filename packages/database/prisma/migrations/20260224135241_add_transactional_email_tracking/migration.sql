-- CreateTable
CREATE TABLE "email_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipient_email" VARCHAR(255) NOT NULL,
    "subject" TEXT NOT NULL,
    "template_name" VARCHAR(100) NOT NULL,
    "provider" "MailProvider" NOT NULL DEFAULT 'RESEND',
    "message_id" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email_log_id" UUID NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "email_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "email_type" VARCHAR(100) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_logs_message_id_key" ON "email_logs"("message_id");

-- CreateIndex
CREATE INDEX "idx_email_logs_recipient" ON "email_logs"("recipient_email");

-- CreateIndex
CREATE INDEX "idx_email_logs_template" ON "email_logs"("template_name");

-- CreateIndex
CREATE INDEX "idx_email_events_log" ON "email_events"("email_log_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_preferences_user_id_email_type_key" ON "email_preferences"("user_id", "email_type");

-- AddForeignKey
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_email_log_id_fkey" FOREIGN KEY ("email_log_id") REFERENCES "email_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_preferences" ADD CONSTRAINT "email_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

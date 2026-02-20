-- CreateTable
CREATE TABLE "macros" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "macros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbound_email_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "message_id" VARCHAR(255) NOT NULL,
    "from" VARCHAR(255) NOT NULL,
    "subject" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "ticket_id" UUID,
    "error" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inbound_email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inbound_email_logs_message_id_key" ON "inbound_email_logs"("message_id");

-- AddForeignKey
ALTER TABLE "macros" ADD CONSTRAINT "macros_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

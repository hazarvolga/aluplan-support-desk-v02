-- AlterTable
ALTER TABLE "tickets" ADD COLUMN "sla_warning_sent_at" TIMESTAMP(3);
ALTER TABLE "tickets" ADD COLUMN "sla_response_due" TIMESTAMP(3);
ALTER TABLE "tickets" ADD COLUMN "sla_resolve_due" TIMESTAMP(3);
ALTER TABLE "tickets" ADD COLUMN "sla_responded_at" TIMESTAMP(3);
ALTER TABLE "tickets" ADD COLUMN "sla_solved_at" TIMESTAMP(3);
ALTER TABLE "tickets" ADD COLUMN "is_sla_breached" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "tickets" ADD COLUMN "escalated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "tickets" ADD COLUMN "escalation_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "tickets" ADD COLUMN "resolved_at" TIMESTAMP(3);
ALTER TABLE "tickets" ADD COLUMN "closed_at" TIMESTAMP(3);
ALTER TABLE "tickets" ADD COLUMN "satisfaction_score" INTEGER;
ALTER TABLE "tickets" ADD COLUMN "satisfaction_comment" TEXT;
ALTER TABLE "tickets" ADD COLUMN "knowledge_base_added" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "tickets" ADD COLUMN "parent_id" UUID;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "idx_tickets_sla" ON "tickets"("is_sla_breached");

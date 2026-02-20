-- AlterEnum
ALTER TYPE "TicketStatus" ADD VALUE 'PENDING_CUSTOMER_REVIEW';

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "knowledge_base_added" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "satisfaction_comment" TEXT,
ADD COLUMN     "satisfaction_score" INTEGER;

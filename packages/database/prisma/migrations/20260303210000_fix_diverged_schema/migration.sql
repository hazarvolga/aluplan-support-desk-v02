-- AlterEnum
ALTER TYPE "AgentStatus" ADD VALUE 'DND';

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN "department_id" UUID;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

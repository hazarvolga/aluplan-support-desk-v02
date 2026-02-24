/*
  Warnings:

  - The values [DND] on the enum `AgentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AgentStatus_new" AS ENUM ('ONLINE', 'AWAY', 'OFFLINE');
ALTER TABLE "public"."users" ALTER COLUMN "agent_status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "agent_status" TYPE "AgentStatus_new" USING ("agent_status"::text::"AgentStatus_new");
ALTER TYPE "AgentStatus" RENAME TO "AgentStatus_old";
ALTER TYPE "AgentStatus_new" RENAME TO "AgentStatus";
DROP TYPE "public"."AgentStatus_old";
ALTER TABLE "users" ALTER COLUMN "agent_status" SET DEFAULT 'OFFLINE';
COMMIT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "agent_status" SET DEFAULT 'OFFLINE';

-- CreateEnum
CREATE TYPE "ChatStatus" AS ENUM ('NORMAL', 'REQUESTED', 'LIVE');

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN "chat_status" "ChatStatus" NOT NULL DEFAULT 'NORMAL';

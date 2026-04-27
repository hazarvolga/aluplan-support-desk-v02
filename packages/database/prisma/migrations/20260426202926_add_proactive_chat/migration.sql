-- CreateEnum
CREATE TYPE "ProactiveChatStatus" AS ENUM ('PENDING', 'ACTIVE', 'ENDED', 'DECLINED', 'MISSED');

-- CreateEnum
CREATE TYPE "ProactiveChatInitiatorType" AS ENUM ('AGENT', 'CUSTOMER');

-- AlterTable: Add isVip to customer_profiles
ALTER TABLE "customer_profiles" ADD COLUMN "is_vip" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: proactive_chat_sessions
CREATE TABLE "proactive_chat_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "agent_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "status" "ProactiveChatStatus" NOT NULL DEFAULT 'PENDING',
    "initiator_type" "ProactiveChatInitiatorType" NOT NULL DEFAULT 'AGENT',
    "converted_ticket_id" UUID,
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proactive_chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: proactive_chat_messages
CREATE TABLE "proactive_chat_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proactive_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_pcs_agent_status" ON "proactive_chat_sessions"("agent_id", "status");

-- CreateIndex
CREATE INDEX "idx_pcs_customer_status" ON "proactive_chat_sessions"("customer_id", "status");

-- CreateIndex
CREATE INDEX "idx_pcs_status" ON "proactive_chat_sessions"("status");

-- CreateIndex
CREATE INDEX "idx_pcm_session_created" ON "proactive_chat_messages"("session_id", "created_at");

-- AddForeignKey
ALTER TABLE "proactive_chat_sessions" ADD CONSTRAINT "proactive_chat_sessions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proactive_chat_sessions" ADD CONSTRAINT "proactive_chat_sessions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proactive_chat_messages" ADD CONSTRAINT "proactive_chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "proactive_chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proactive_chat_messages" ADD CONSTRAINT "proactive_chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

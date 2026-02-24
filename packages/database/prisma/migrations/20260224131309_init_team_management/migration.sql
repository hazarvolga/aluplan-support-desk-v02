/*
  Warnings:

  - Added the required column `content` to the `knowledge_embeddings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ticket_messages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('ONLINE', 'AWAY', 'DND');

-- CreateEnum
CREATE TYPE "RoutingLogic" AS ENUM ('MANUAL', 'ROUND_ROBIN', 'SKILL_BASED');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "RuleTrigger" AS ENUM ('TICKET_CREATED', 'MESSAGE_ADDED');

-- AlterEnum
ALTER TYPE "KnowledgeSourceStatus" ADD VALUE 'PENDING_REVIEW';

-- AlterEnum
ALTER TYPE "TicketStatus" ADD VALUE 'DRAFT';

-- AlterTable
ALTER TABLE "ai_interactions" ADD COLUMN     "edited_response" TEXT,
ADD COLUMN     "estimated_cost" DECIMAL(10,6),
ADD COLUMN     "input_tokens" INTEGER,
ADD COLUMN     "is_accepted" BOOLEAN,
ADD COLUMN     "output_tokens" INTEGER,
ADD COLUMN     "total_tokens" INTEGER;

-- AlterTable
ALTER TABLE "faq_entries" ADD COLUMN     "feedback_weight" DECIMAL(5,4) NOT NULL DEFAULT 1.0,
ADD COLUMN     "is_internal" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "trust_score" DECIMAL(5,4) NOT NULL DEFAULT 0.75;

-- AlterTable
ALTER TABLE "knowledge_articles" ADD COLUMN     "age_weight" DECIMAL(5,4) NOT NULL DEFAULT 1.0,
ADD COLUMN     "feedback_weight" DECIMAL(5,4) NOT NULL DEFAULT 1.0,
ADD COLUMN     "is_auto_imported" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_internal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trust_score" DECIMAL(5,4) NOT NULL DEFAULT 0.95;

-- AlterTable
ALTER TABLE "knowledge_embeddings" ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "parent_id" UUID,
ADD COLUMN     "sequence" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "knowledge_sources" ADD COLUMN     "trust_score" DECIMAL(5,4) NOT NULL DEFAULT 0.85;

-- AlterTable
ALTER TABLE "ticket_messages" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "sentiment" "Sentiment",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "parent_id" UUID;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_agent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_active_tickets" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "org_id" UUID,
ADD COLUMN     "refresh_token_hash" TEXT,
ADD COLUMN     "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC';

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "domain" VARCHAR(255),
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "department_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "routing_logic" "RoutingLogic" NOT NULL DEFAULT 'MANUAL',
    "first_response_sla_minutes" INTEGER,
    "resolution_sla_minutes" INTEGER,
    "business_hours_only" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "user_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "role_in_team" VARCHAR(50) NOT NULL DEFAULT 'Agent',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("user_id","team_id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_skills" (
    "user_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "proficiency" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_skills_pkey" PRIMARY KEY ("user_id","skill_id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "status" "AgentStatus" NOT NULL DEFAULT 'ONLINE',
    "schedule_json" JSONB,
    "auto_assign_enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompt_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "trigger_on" "RuleTrigger" NOT NULL DEFAULT 'TICKET_CREATED',
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhooks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[],
    "secret" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_domain_key" ON "organizations"("domain");

-- CreateIndex
CREATE INDEX "shifts_user_id_idx" ON "shifts"("user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_user_read" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_templates_name_key" ON "prompt_templates"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_skills" ADD CONSTRAINT "agent_skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_skills" ADD CONSTRAINT "agent_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - The primary key for the `agent_skills` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `org_id` on the `departments` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `departments` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to drop the column `auto_assign_enabled` on the `shifts` table. All the data in the column will be lost.
  - You are about to drop the column `schedule_json` on the `shifts` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `shifts` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `shifts` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `skills` table. All the data in the column will be lost.
  - The primary key for the `team_members` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `team_members` table. All the data in the column will be lost.
  - You are about to drop the column `role_in_team` on the `team_members` table. All the data in the column will be lost.
  - You are about to drop the column `business_hours_only` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `first_response_sla_minutes` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `resolution_sla_minutes` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `routing_logic` on the `teams` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `teams` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to drop the column `is_agent` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `organizations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_roles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,skill_id]` on the table `agent_skills` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `departments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `skills` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,team_id]` on the table `team_members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `teams` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `departments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `day_of_week` to the `shifts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `shifts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `shifts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssignmentStrategy" AS ENUM ('MANUAL', 'ROUND_ROBIN', 'SKILL_BASED');

-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('ADMIN', 'DEPARTMENT_MANAGER', 'TEAM_LEAD', 'SENIOR_AGENT', 'AGENT', 'VIEWER');

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_org_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_assigned_by_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_org_id_fkey";

-- DropIndex
DROP INDEX "shifts_user_id_idx";

-- AlterTable
ALTER TABLE "agent_skills" DROP CONSTRAINT "agent_skills_pkey",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "proficiency" SET DEFAULT 3,
ADD CONSTRAINT "agent_skills_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "departments" DROP COLUMN "org_id",
ADD COLUMN     "color" VARCHAR(7),
ADD COLUMN     "icon" VARCHAR(50),
ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" VARCHAR(100) NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "shifts" DROP COLUMN "auto_assign_enabled",
DROP COLUMN "schedule_json",
DROP COLUMN "status",
DROP COLUMN "updated_at",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "day_of_week" SMALLINT NOT NULL,
ADD COLUMN     "end_time" TEXT NOT NULL,
ADD COLUMN     "start_time" TEXT NOT NULL,
ADD COLUMN     "timezone" VARCHAR(100);

-- AlterTable
ALTER TABLE "skills" DROP COLUMN "org_id";

-- AlterTable
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_pkey",
DROP COLUMN "created_at",
DROP COLUMN "role_in_team",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role_override" "SystemRole",
ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "business_hours_only",
DROP COLUMN "first_response_sla_minutes",
DROP COLUMN "resolution_sla_minutes",
DROP COLUMN "routing_logic",
ADD COLUMN     "assignment_strategy" "AssignmentStrategy" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "auto_assignment_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" VARCHAR(100) NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_agent",
DROP COLUMN "org_id",
ADD COLUMN     "agent_status" "AgentStatus" NOT NULL DEFAULT 'DND',
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "language" VARCHAR(10) NOT NULL DEFAULT 'tr',
ADD COLUMN     "role" "SystemRole" NOT NULL DEFAULT 'AGENT',
ADD COLUMN     "title" VARCHAR(100);

-- DropTable
DROP TABLE "organizations";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "role_permissions";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "user_roles";

-- DropEnum
DROP TYPE "RoutingLogic";

-- CreateTable
CREATE TABLE "availability_overrides" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "is_available" BOOLEAN NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "availability_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sla_policies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "department_id" UUID NOT NULL,
    "priority" "TicketPriority" NOT NULL,
    "first_response_minutes" INTEGER NOT NULL,
    "resolution_minutes" INTEGER NOT NULL,
    "business_hours_only" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sla_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agent_skills_user_id_skill_id_key" ON "agent_skills"("user_id", "skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_slug_key" ON "departments"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_user_id_team_id_key" ON "team_members"("user_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_slug_key" ON "teams"("slug");

-- AddForeignKey
ALTER TABLE "availability_overrides" ADD CONSTRAINT "availability_overrides_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sla_policies" ADD CONSTRAINT "sla_policies_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

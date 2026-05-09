-- GAP-07: Formal migration for ghost columns previously patched at runtime
-- Replaces onModuleInit() $executeRawUnsafe ALTER TABLE anti-pattern
-- Safe to re-run: uses ADD COLUMN IF NOT EXISTS

-- Section A: Core Metrics & Embeddings
ALTER TABLE "ai_interactions" ADD COLUMN IF NOT EXISTS "provider" TEXT;
ALTER TABLE "ai_interactions" ADD COLUMN IF NOT EXISTS "model" TEXT;
ALTER TABLE "knowledge_pool_embeddings" ADD COLUMN IF NOT EXISTS "parent_id" UUID;
ALTER TABLE "knowledge_embeddings" ADD COLUMN IF NOT EXISTS "parent_id" UUID;

-- Section B: Soft-delete column for all soft-delete eligible models
ALTER TABLE "users"              ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "departments"        ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "teams"              ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "customer_profiles"  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "knowledge_articles" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "tickets"            ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "ticket_messages"    ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "attachments"        ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "categories"         ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "products"           ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "product_categories" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "crm_connections"    ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

-- Section C: Specialized model repairs
ALTER TABLE "products"           ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true;
ALTER TABLE "product_categories" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true;

ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "is_archived"            BOOLEAN DEFAULT false;
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "auto_assignment_enabled" BOOLEAN DEFAULT false;
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "assignment_strategy"     TEXT    DEFAULT 'MANUAL';

ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "color"       TEXT;
ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "icon"        TEXT;
ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "is_default"  BOOLEAN DEFAULT false;
ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "is_active"   BOOLEAN DEFAULT true;
ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "is_archived" BOOLEAN DEFAULT false;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "agent_status"      TEXT    DEFAULT 'DND';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "max_active_tickets" INTEGER DEFAULT 5;

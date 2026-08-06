-- Align fresh installs and production-derived databases without deleting data or
-- dropping production-owned indexes/constraints. Existing correct objects are
-- preserved; incompatible critical objects fail fast for operator review.

BEGIN;

-- Fail quickly instead of waiting behind production locks. Production execution
-- still requires the separately approved Faz 8 maintenance window.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '5min';

ALTER TYPE "AgentStatus" ADD VALUE IF NOT EXISTS 'OFFLINE';

DO $$ BEGIN
    CREATE TYPE "AnnouncementChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'IN_APP', 'SMS');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "ai_interactions"
    ADD COLUMN IF NOT EXISTS "channel" "CommunicationChannel" NOT NULL DEFAULT 'WEB';

DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'ai_interactions'
          AND column_name = 'provider'
          AND (
              data_type <> 'character varying'
              OR character_maximum_length IS DISTINCT FROM 50
          )
    ) THEN
        IF EXISTS (SELECT 1 FROM "ai_interactions" WHERE length("provider") > 50) THEN
            RAISE EXCEPTION 'ai_interactions.provider contains values longer than 50 characters';
        END IF;
        ALTER TABLE "ai_interactions"
            ALTER COLUMN "provider" TYPE VARCHAR(50) USING "provider"::VARCHAR(50);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'ai_interactions'
          AND column_name = 'model'
          AND (
              data_type <> 'character varying'
              OR character_maximum_length IS DISTINCT FROM 100
          )
    ) THEN
        IF EXISTS (SELECT 1 FROM "ai_interactions" WHERE length("model") > 100) THEN
            RAISE EXCEPTION 'ai_interactions.model contains values longer than 100 characters';
        END IF;
        ALTER TABLE "ai_interactions"
            ALTER COLUMN "model" TYPE VARCHAR(100) USING "model"::VARCHAR(100);
    END IF;
END $$;

ALTER TABLE "crm_accounts"
    ADD COLUMN IF NOT EXISTS "customer_no" VARCHAR(50);

ALTER TABLE "customer_profiles"
    ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "knowledge_sources"
    ADD COLUMN IF NOT EXISTS "language" VARCHAR(10) NOT NULL DEFAULT 'tr';

ALTER TABLE "users"
    ALTER COLUMN "agent_status" SET DEFAULT 'DND';

DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM "crm_connections"
        GROUP BY "provider" HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'crm_connections.provider contains duplicates';
    END IF;
    IF EXISTS (
        SELECT 1 FROM "departments"
        GROUP BY "slug" HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'departments.slug contains duplicates';
    END IF;
    IF EXISTS (
        SELECT 1 FROM "knowledge_articles"
        GROUP BY "slug" HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'knowledge_articles.slug contains duplicates';
    END IF;
    IF EXISTS (
        SELECT 1 FROM "teams"
        GROUP BY "slug" HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'teams.slug contains duplicates';
    END IF;
    IF EXISTS (
        SELECT 1
        FROM "knowledge_pool_embeddings" child
        LEFT JOIN "knowledge_pool_embeddings" parent ON parent."id" = child."parent_id"
        WHERE child."parent_id" IS NOT NULL AND parent."id" IS NULL
    ) THEN
        RAISE EXCEPTION 'knowledge_pool_embeddings contains orphan parent_id values';
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "crm_connections_provider_key"
    ON "crm_connections"("provider");
CREATE UNIQUE INDEX IF NOT EXISTS "departments_slug_key"
    ON "departments"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "knowledge_articles_slug_key"
    ON "knowledge_articles"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "teams_slug_key"
    ON "teams"("slug");

CREATE INDEX IF NOT EXISTS "idx_ai_health_events_created_type"
    ON "ai_health_events"("created_at" DESC, "event_type");
CREATE INDEX IF NOT EXISTS "idx_ai_response_cache_embedding_version_dim"
    ON "ai_response_cache"("embedding_version", "embedding_dim");
CREATE INDEX IF NOT EXISTS "idx_faq_entries_deleted_at"
    ON "faq_entries"("deleted_at");
CREATE INDEX IF NOT EXISTS "idx_ke_embedding_version_dim"
    ON "knowledge_embeddings"("embedding_version", "embedding_dim");
CREATE INDEX IF NOT EXISTS "idx_kpe_embedding_version_dim"
    ON "knowledge_pool_embeddings"("embedding_version", "embedding_dim");
CREATE INDEX IF NOT EXISTS "idx_kpe_parent"
    ON "knowledge_pool_embeddings"("parent_id");
CREATE INDEX IF NOT EXISTS "idx_macros_deleted_at"
    ON "macros"("deleted_at");
CREATE INDEX IF NOT EXISTS "idx_ticket_embeddings_version_dim"
    ON "ticket_embeddings"("embedding_version", "embedding_dim");

CREATE INDEX IF NOT EXISTS "idx_ai_context"
    ON "ai_interactions" USING GIN ("user_context");
CREATE INDEX IF NOT EXISTS "idx_audit_old"
    ON "audit_logs" USING GIN ("old_value");
CREATE INDEX IF NOT EXISTS "idx_audit_new"
    ON "audit_logs" USING GIN ("new_value");
CREATE INDEX IF NOT EXISTS "idx_customer_company"
    ON "customer_profiles"("company_name");
CREATE INDEX IF NOT EXISTS "idx_customer_external_id"
    ON "customer_profiles"("external_contact_id");
CREATE INDEX IF NOT EXISTS "idx_customer_created"
    ON "customer_profiles"("created_at");
CREATE INDEX IF NOT EXISTS "idx_ks_metadata"
    ON "knowledge_sources" USING GIN ("metadata");
CREATE INDEX IF NOT EXISTS "idx_ticket_msg_metadata"
    ON "ticket_messages" USING GIN ("metadata");
CREATE INDEX IF NOT EXISTS "idx_rule_conditions"
    ON "ticket_rules" USING GIN ("conditions");
CREATE INDEX IF NOT EXISTS "idx_rule_actions"
    ON "ticket_rules" USING GIN ("actions");
CREATE INDEX IF NOT EXISTS "idx_tickets_created_at"
    ON "tickets"("created_at");
CREATE INDEX IF NOT EXISTS "idx_tickets_department"
    ON "tickets"("department_id");
CREATE INDEX IF NOT EXISTS "idx_tickets_hotinfo"
    ON "tickets" USING GIN ("hotinfo_snapshot");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'knowledge_pool_embeddings_parent_id_fkey'
          AND conrelid = 'public.knowledge_pool_embeddings'::regclass
    ) THEN
        ALTER TABLE "knowledge_pool_embeddings"
            ADD CONSTRAINT "knowledge_pool_embeddings_parent_id_fkey"
            FOREIGN KEY ("parent_id")
            REFERENCES "knowledge_pool_embeddings"("id")
            ON DELETE SET NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF (
        SELECT pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE conname = 'knowledge_pool_embeddings_parent_id_fkey'
          AND conrelid = 'public.knowledge_pool_embeddings'::regclass
    ) IS DISTINCT FROM
        'FOREIGN KEY (parent_id) REFERENCES knowledge_pool_embeddings(id) ON DELETE SET NULL'
    THEN
        RAISE EXCEPTION 'knowledge_pool_embeddings_parent_id_fkey is incompatible';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public' AND indexname = 'idx_faq_entries_embedding_version_dim'
          AND indexdef LIKE '%(embedding_version, embedding_dim)%'
          AND indexdef LIKE '%WHERE (question_embedding IS NOT NULL)%'
    ) THEN
        RAISE EXCEPTION 'ADR-007 partial FAQ embedding isolation index is missing or incompatible';
    END IF;
END $$;

COMMIT;

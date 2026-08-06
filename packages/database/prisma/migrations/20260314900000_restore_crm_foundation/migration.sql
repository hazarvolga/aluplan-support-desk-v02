-- Restore foundational objects omitted from the historical incremental chain.
-- Every statement is idempotent so existing production-derived databases remain unchanged.

BEGIN;

DO $$ BEGIN
    CREATE TYPE "CrmProvider" AS ENUM (
        'DYNAMICS_365',
        'SALESFORCE',
        'HUBSPOT',
        'CUSTOM_WEBHOOK'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "SyncStatus" AS ENUM (
        'IDLE',
        'SYNCING',
        'SUCCESS',
        'ERROR'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    IF (
        SELECT array_agg(enumlabel ORDER BY enumsortorder)
        FROM pg_enum
        WHERE enumtypid = 'public."CrmProvider"'::regtype
    ) IS DISTINCT FROM ARRAY[
        'DYNAMICS_365',
        'SALESFORCE',
        'HUBSPOT',
        'CUSTOM_WEBHOOK'
    ]::name[] THEN
        RAISE EXCEPTION 'CrmProvider enum values are incompatible';
    END IF;

    IF (
        SELECT array_agg(enumlabel ORDER BY enumsortorder)
        FROM pg_enum
        WHERE enumtypid = 'public."SyncStatus"'::regtype
    ) IS DISTINCT FROM ARRAY[
        'IDLE',
        'SYNCING',
        'SUCCESS',
        'ERROR'
    ]::name[] THEN
        RAISE EXCEPTION 'SyncStatus enum values are incompatible';
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "group" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id")
);

ALTER TABLE "users"
    ADD COLUMN IF NOT EXISTS "role_id" UUID;

CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_key"
    ON "roles"("name");

CREATE UNIQUE INDEX IF NOT EXISTS "permissions_name_key"
    ON "permissions"("name");

DO $$ BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'role'
    ) THEN
        INSERT INTO "roles" (
            "name",
            "description",
            "is_system",
            "updated_at"
        )
        SELECT DISTINCT
            "role"::text,
            'Migrated from the legacy users.role enum',
            true,
            CURRENT_TIMESTAMP
        FROM "users"
        ON CONFLICT ("name") DO NOTHING;

        UPDATE "users" AS users
        SET "role_id" = roles."id"
        FROM "roles" AS roles
        WHERE users."role_id" IS NULL
          AND roles."name" = users."role"::text;

        IF EXISTS (
            SELECT 1
            FROM "users"
            WHERE "role_id" IS NULL
        ) THEN
            RAISE EXCEPTION 'Legacy users.role values could not be mapped to roles';
        END IF;

        ALTER TABLE "users" DROP COLUMN "role";
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'role_permissions_role_id_fkey'
          AND conrelid = 'public.role_permissions'::regclass
    ) THEN
        ALTER TABLE "role_permissions"
            ADD CONSTRAINT "role_permissions_role_id_fkey"
            FOREIGN KEY ("role_id")
            REFERENCES "roles"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'role_permissions_permission_id_fkey'
          AND conrelid = 'public.role_permissions'::regclass
    ) THEN
        ALTER TABLE "role_permissions"
            ADD CONSTRAINT "role_permissions_permission_id_fkey"
            FOREIGN KEY ("permission_id")
            REFERENCES "permissions"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_role_id_fkey'
          AND conrelid = 'public.users'::regclass
    ) THEN
        ALTER TABLE "users"
            ADD CONSTRAINT "users_role_id_fkey"
            FOREIGN KEY ("role_id")
            REFERENCES "roles"("id")
            ON DELETE SET NULL
            ON UPDATE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "crm_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "industry" VARCHAR(255),
    "website" VARCHAR(255),
    "address" TEXT,
    "external_account_id" VARCHAR(255),
    "crm_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" "CrmProvider" NOT NULL,
    "tenant_id" VARCHAR(255),
    "client_id" VARCHAR(255),
    "client_secret" TEXT,
    "webhook_secret" TEXT,
    "instance_url" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sync_settings" JSONB,
    "last_sync_at" TIMESTAMP(3),
    "sync_status" "SyncStatus" NOT NULL DEFAULT 'IDLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_connections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_sync_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "connection_id" UUID NOT NULL,
    "status" "SyncStatus" NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "total_records" INTEGER NOT NULL DEFAULT 0,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "details" JSONB,

    CONSTRAINT "crm_sync_logs_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "customer_profiles"
    ADD COLUMN IF NOT EXISTS "account_id" UUID;

CREATE UNIQUE INDEX IF NOT EXISTS "crm_accounts_external_account_id_key"
    ON "crm_accounts"("external_account_id");

CREATE UNIQUE INDEX IF NOT EXISTS "crm_connections_provider_key"
    ON "crm_connections"("provider");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'customer_profiles_account_id_fkey'
          AND conrelid = 'public.customer_profiles'::regclass
    ) THEN
        ALTER TABLE "customer_profiles"
            ADD CONSTRAINT "customer_profiles_account_id_fkey"
            FOREIGN KEY ("account_id")
            REFERENCES "crm_accounts"("id")
            ON DELETE SET NULL
            ON UPDATE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ai_response_cache" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "query_hash" TEXT NOT NULL,
    "query_embedding" vector,
    "response" JSONB NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID,
    "confidence" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_response_cache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ai_response_cache_query_hash_key"
    ON "ai_response_cache"("query_hash");

CREATE INDEX IF NOT EXISTS "idx_cache_hash"
    ON "ai_response_cache"("query_hash");

CREATE INDEX IF NOT EXISTS "idx_cache_tenant"
    ON "ai_response_cache"("tenant_id");

CREATE INDEX IF NOT EXISTS "idx_cache_expires"
    ON "ai_response_cache"("expires_at");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'crm_accounts'
          AND column_name = 'external_account_id'
          AND data_type = 'character varying'
    ) THEN
        RAISE EXCEPTION 'crm_accounts.external_account_id is missing or incompatible';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'crm_connections'
          AND column_name = 'provider'
          AND udt_name = 'CrmProvider'
    ) THEN
        RAISE EXCEPTION 'crm_connections.provider is missing or incompatible';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'ai_response_cache'
          AND column_name = 'query_hash'
          AND data_type = 'text'
    ) THEN
        RAISE EXCEPTION 'ai_response_cache.query_hash is missing or incompatible';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'role_id'
          AND udt_name = 'uuid'
    ) THEN
        RAISE EXCEPTION 'users.role_id is missing or incompatible';
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'crm_sync_logs_connection_id_fkey'
          AND conrelid = 'public.crm_sync_logs'::regclass
    ) THEN
        ALTER TABLE "crm_sync_logs"
            ADD CONSTRAINT "crm_sync_logs_connection_id_fkey"
            FOREIGN KEY ("connection_id")
            REFERENCES "crm_connections"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF (
        SELECT pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE conname = 'role_permissions_role_id_fkey'
          AND conrelid = 'public.role_permissions'::regclass
    ) IS DISTINCT FROM
        'FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE'
    THEN
        RAISE EXCEPTION 'role_permissions_role_id_fkey is incompatible';
    END IF;

    IF (
        SELECT pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE conname = 'role_permissions_permission_id_fkey'
          AND conrelid = 'public.role_permissions'::regclass
    ) IS DISTINCT FROM
        'FOREIGN KEY (permission_id) REFERENCES permissions(id) ON UPDATE CASCADE ON DELETE CASCADE'
    THEN
        RAISE EXCEPTION 'role_permissions_permission_id_fkey is incompatible';
    END IF;

    IF (
        SELECT pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE conname = 'users_role_id_fkey'
          AND conrelid = 'public.users'::regclass
    ) IS DISTINCT FROM
        'FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE SET NULL'
    THEN
        RAISE EXCEPTION 'users_role_id_fkey is incompatible';
    END IF;

    IF (
        SELECT pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE conname = 'customer_profiles_account_id_fkey'
          AND conrelid = 'public.customer_profiles'::regclass
    ) IS DISTINCT FROM
        'FOREIGN KEY (account_id) REFERENCES crm_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL'
    THEN
        RAISE EXCEPTION 'customer_profiles_account_id_fkey is incompatible';
    END IF;

    IF (
        SELECT pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE conname = 'crm_sync_logs_connection_id_fkey'
          AND conrelid = 'public.crm_sync_logs'::regclass
    ) IS DISTINCT FROM
        'FOREIGN KEY (connection_id) REFERENCES crm_connections(id) ON UPDATE CASCADE ON DELETE CASCADE'
    THEN
        RAISE EXCEPTION 'crm_sync_logs_connection_id_fkey is incompatible';
    END IF;
END $$;

COMMIT;

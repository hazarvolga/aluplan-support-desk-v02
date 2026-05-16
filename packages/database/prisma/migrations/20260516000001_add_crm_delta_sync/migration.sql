-- CRM delta sync state for Dataverse change tracking.
CREATE TABLE IF NOT EXISTS "crm_delta_sync_states" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "connection_id" UUID NOT NULL,
    "entity_type" VARCHAR(32) NOT NULL,
    "delta_link" TEXT,
    "last_successful_sync_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_delta_sync_states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "crm_delta_sync_states_connection_entity_key"
    ON "crm_delta_sync_states"("connection_id", "entity_type");

CREATE INDEX IF NOT EXISTS "idx_crm_delta_sync_states_connection"
    ON "crm_delta_sync_states"("connection_id");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'crm_delta_sync_states_connection_id_fkey'
    ) THEN
        ALTER TABLE "crm_delta_sync_states"
            ADD CONSTRAINT "crm_delta_sync_states_connection_id_fkey"
            FOREIGN KEY ("connection_id") REFERENCES "crm_connections"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CRM change history visible to admins.
CREATE TABLE IF NOT EXISTS "crm_change_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "connection_id" UUID,
    "entity_type" VARCHAR(32) NOT NULL,
    "entity_id" VARCHAR(255) NOT NULL,
    "local_record_id" UUID,
    "field_name" VARCHAR(100) NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "source" VARCHAR(50) NOT NULL DEFAULT 'DELTA_SYNC',
    "status" VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_change_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_crm_change_logs_entity"
    ON "crm_change_logs"("entity_type", "entity_id");

CREATE INDEX IF NOT EXISTS "idx_crm_change_logs_changed_at"
    ON "crm_change_logs"("changed_at");

CREATE INDEX IF NOT EXISTS "idx_crm_change_logs_connection"
    ON "crm_change_logs"("connection_id");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'crm_change_logs_connection_id_fkey'
    ) THEN
        ALTER TABLE "crm_change_logs"
            ADD CONSTRAINT "crm_change_logs_connection_id_fkey"
            FOREIGN KEY ("connection_id") REFERENCES "crm_connections"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

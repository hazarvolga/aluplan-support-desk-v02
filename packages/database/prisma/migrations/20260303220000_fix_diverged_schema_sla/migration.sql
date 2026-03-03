-- AlterTable Idempotent Check to prevent P3018 (Column already exists) errors during deployments
DO $$
BEGIN
    BEGIN
        ALTER TABLE "tickets" ADD COLUMN "sla_warning_sent_at" TIMESTAMP(3);
    EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column sla_warning_sent_at already exists in tickets.';
    END;

    BEGIN
        ALTER TABLE "tickets" ADD COLUMN "sla_response_due" TIMESTAMP(3);
    EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column sla_response_due already exists in tickets.';
    END;

    BEGIN
        ALTER TABLE "tickets" ADD COLUMN "sla_resolve_due" TIMESTAMP(3);
    EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column sla_resolve_due already exists in tickets.';
    END;

    BEGIN
        ALTER TABLE "tickets" ADD COLUMN "sla_responded_at" TIMESTAMP(3);
    EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column sla_responded_at already exists in tickets.';
    END;

    BEGIN
        ALTER TABLE "tickets" ADD COLUMN "sla_solved_at" TIMESTAMP(3);
    EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column sla_solved_at already exists in tickets.';
    END;

    BEGIN
        ALTER TABLE "tickets" ADD COLUMN "is_sla_breached" BOOLEAN NOT NULL DEFAULT false;
    EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column is_sla_breached already exists in tickets.';
    END;

    BEGIN
        ALTER TABLE "tickets" ADD COLUMN "escalated" BOOLEAN NOT NULL DEFAULT false;
    EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column escalated already exists in tickets.';
    END;

    BEGIN
        ALTER TABLE "tickets" ADD COLUMN "escalation_count" INTEGER NOT NULL DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column escalation_count already exists in tickets.';
    END;

    BEGIN
        ALTER TABLE "tickets" ADD COLUMN "resolved_at" TIMESTAMP(3);
    EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column resolved_at already exists in tickets.';
    END;

    BEGIN
        ALTER TABLE "tickets" ADD COLUMN "closed_at" TIMESTAMP(3);
    EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column closed_at already exists in tickets.';
    END;

    BEGIN
        ALTER TABLE "tickets" ADD COLUMN "satisfaction_score" INTEGER;
    EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column satisfaction_score already exists in tickets.';
    END;

    BEGIN
        ALTER TABLE "tickets" ADD COLUMN "satisfaction_comment" TEXT;
    EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column satisfaction_comment already exists in tickets.';
    END;

    BEGIN
        ALTER TABLE "tickets" ADD COLUMN "knowledge_base_added" BOOLEAN NOT NULL DEFAULT false;
    EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column knowledge_base_added already exists in tickets.';
    END;

    BEGIN
        ALTER TABLE "tickets" ADD COLUMN "parent_id" UUID;
    EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column parent_id already exists in tickets.';
    END;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tickets_parent_id_fkey') THEN
        ALTER TABLE "tickets" ADD CONSTRAINT "tickets_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_class c
        JOIN   pg_namespace n ON n.oid = c.relnamespace
        WHERE  c.relname = 'idx_tickets_sla'
    ) THEN
        CREATE INDEX "idx_tickets_sla" ON "tickets"("is_sla_breached");
    END IF;
END $$;

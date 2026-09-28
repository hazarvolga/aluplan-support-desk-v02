-- Additive provenance model for FAQ candidates. Existing FAQ rows remain untouched
-- because their original source identifiers cannot be reconstructed reliably.
CREATE TYPE "FaqEntrySourceType" AS ENUM ('TICKET', 'AI_INTERACTION');

CREATE TABLE "faq_entry_sources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "faq_entry_id" UUID NOT NULL,
    "source_type" "FaqEntrySourceType" NOT NULL,
    "ticket_id" UUID,
    "interaction_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "faq_entry_sources_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "faq_entry_sources_exactly_one_source_check" CHECK (
        ("source_type" = 'TICKET' AND "ticket_id" IS NOT NULL AND "interaction_id" IS NULL)
        OR
        ("source_type" = 'AI_INTERACTION' AND "interaction_id" IS NOT NULL AND "ticket_id" IS NULL)
    )
);

CREATE UNIQUE INDEX "uq_faq_entry_sources_ticket"
    ON "faq_entry_sources"("faq_entry_id", "ticket_id");
CREATE UNIQUE INDEX "uq_faq_entry_sources_interaction"
    ON "faq_entry_sources"("faq_entry_id", "interaction_id");
CREATE INDEX "idx_faq_entry_sources_ticket" ON "faq_entry_sources"("ticket_id");
CREATE INDEX "idx_faq_entry_sources_interaction" ON "faq_entry_sources"("interaction_id");
CREATE INDEX "idx_faq_entry_sources_deleted_at" ON "faq_entry_sources"("deleted_at");

ALTER TABLE "faq_entry_sources"
    ADD CONSTRAINT "faq_entry_sources_faq_entry_id_fkey"
    FOREIGN KEY ("faq_entry_id") REFERENCES "faq_entries"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "faq_entry_sources"
    ADD CONSTRAINT "faq_entry_sources_ticket_id_fkey"
    FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "faq_entry_sources"
    ADD CONSTRAINT "faq_entry_sources_interaction_id_fkey"
    FOREIGN KEY ("interaction_id") REFERENCES "ai_interactions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep review and sensitive AI-history permissions separate from public FAQ read.
INSERT INTO "permissions" ("id", "name", "description", "group", "created_at")
SELECT gen_random_uuid(), permission_name, permission_description, 'KNOWLEDGE', CURRENT_TIMESTAMP
FROM (VALUES
    ('faq:review', 'Review internal FAQ candidates and provenance'),
    ('ai-interactions:read', 'View customer AI interaction history')
) AS required_permissions(permission_name, permission_description)
WHERE NOT EXISTS (
    SELECT 1 FROM "permissions" existing
    WHERE existing."name" = required_permissions.permission_name
);

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT role_row."id", permission_row."id"
FROM "roles" role_row
CROSS JOIN "permissions" permission_row
WHERE UPPER(REPLACE(role_row."name", '-', '_')) IN ('ADMIN', 'SUPER_ADMIN', 'SUPERUSER')
  AND permission_row."name" IN ('faq:review', 'ai-interactions:read')
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

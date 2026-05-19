ALTER TABLE "crm_accounts"
  ADD COLUMN IF NOT EXISTS "service_address" TEXT,
  ADD COLUMN IF NOT EXISTS "phone" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "fax" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "client_id_frilo" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "license_manager_name" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "raw_crm_payload" JSONB;

UPDATE "crm_accounts"
SET "service_address" = "address"
WHERE "service_address" IS NULL
  AND "address" IS NOT NULL;

ALTER TABLE "customer_profiles"
  ADD COLUMN IF NOT EXISTS "fax" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "mobile_phone" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "address" TEXT,
  ADD COLUMN IF NOT EXISTS "primary_time_zone" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "preferred_contact_method" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "raw_crm_payload" JSONB;

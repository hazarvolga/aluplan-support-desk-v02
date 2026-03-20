-- UpdateTable
ALTER TABLE "crm_accounts" ADD COLUMN IF NOT EXISTS "account_number" VARCHAR(255);

-- Migration logic to sync customer_no to account_number if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='crm_accounts' AND column_name='customer_no') THEN
        UPDATE "crm_accounts" SET "account_number" = "customer_no" WHERE "account_number" IS NULL;
    END IF;
END $$;

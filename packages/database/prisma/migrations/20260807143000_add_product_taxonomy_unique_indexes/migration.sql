BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- Product names and per-product category names are part of the AI routing
-- vocabulary. Fail closed if an existing active taxonomy contains normalized
-- duplicates; an operator must review those rows instead of silently merging
-- or deleting business data.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "products"
        WHERE "deleted_at" IS NULL AND "is_active" = TRUE
        GROUP BY LOWER(BTRIM("name"))
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Active products contain normalized duplicate names';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "product_categories"
        WHERE "deleted_at" IS NULL AND "is_active" = TRUE
        GROUP BY "product_id", LOWER(BTRIM("name"))
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Active product categories contain normalized duplicate names';
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "products_active_normalized_name_key"
    ON "products" (LOWER(BTRIM("name")))
    WHERE "deleted_at" IS NULL AND "is_active" = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS "product_categories_active_product_normalized_name_key"
    ON "product_categories" ("product_id", LOWER(BTRIM("name")))
    WHERE "deleted_at" IS NULL AND "is_active" = TRUE;

COMMIT;

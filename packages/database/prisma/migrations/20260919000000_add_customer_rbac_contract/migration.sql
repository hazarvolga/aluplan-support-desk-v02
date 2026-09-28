BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- CUSTOMER authorization comes from database grants. Preserve the existing
-- customer workflow policy without restoring legacy token fallback permissions.
-- Published public FAQ access does not require a FAQ permission.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "roles"
        WHERE UPPER(REPLACE(BTRIM("name"), '-', '_')) = 'CUSTOMER'
          AND "name" <> 'CUSTOMER'
    ) THEN
        RAISE EXCEPTION 'A non-canonical CUSTOMER role alias already exists';
    END IF;

    -- Never silently remove a custom privilege or accept a wider customer role.
    IF EXISTS (
        SELECT 1
        FROM "role_permissions" role_permission
        JOIN "roles" role_row ON role_row."id" = role_permission."role_id"
        JOIN "permissions" permission_row ON permission_row."id" = role_permission."permission_id"
        WHERE role_row."name" = 'CUSTOMER'
          AND permission_row."name" NOT IN (
              'kb:read',
              'ticket:create',
              'ticket:read',
              'ticket:update'
          )
    ) THEN
        RAISE EXCEPTION 'Existing CUSTOMER role has permissions outside the approved matrix';
    END IF;
END $$;

-- Fresh databases may have no customer users or role yet. Existing role rows,
-- including identity, description, system flag and timestamps, remain unchanged.
INSERT INTO "roles" (
    "id",
    "name",
    "description",
    "is_system",
    "created_at",
    "updated_at"
)
VALUES (
    gen_random_uuid(),
    'CUSTOMER',
    'Customer self-service support role',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT role_row."id", permission_row."id"
FROM "roles" role_row
CROSS JOIN "permissions" permission_row
WHERE role_row."name" = 'CUSTOMER'
  AND permission_row."name" IN (
      'kb:read',
      'ticket:create',
      'ticket:read',
      'ticket:update'
  )
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- Missing catalog entries or an unexpected final mapping abort all additions.
DO $$
DECLARE
    assigned_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO assigned_count
    FROM "role_permissions" role_permission
    JOIN "roles" role_row ON role_row."id" = role_permission."role_id"
    WHERE role_row."name" = 'CUSTOMER';

    IF assigned_count <> 4 THEN
        RAISE EXCEPTION 'CUSTOMER permission count mismatch: expected 4, got %', assigned_count;
    END IF;
END $$;

COMMIT;

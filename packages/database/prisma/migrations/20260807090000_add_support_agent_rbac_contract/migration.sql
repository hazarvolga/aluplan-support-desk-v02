BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- Materialize the complete canonical permission catalog required by controller
-- decorators. Existing permission metadata is preserved to keep this migration
-- additive and safe for already-running installations.
INSERT INTO "permissions" ("id", "name", "description", "group", "created_at")
SELECT gen_random_uuid(), permission_name, permission_description, permission_group, CURRENT_TIMESTAMP
FROM (VALUES
    ('*', 'Unrestricted system access', 'ADMIN'),
    ('admin:settings', 'Manage administrative policies such as SLA settings', 'ADMIN'),
    ('ai-interactions:read', 'View customer AI interaction history', 'KNOWLEDGE'),
    ('faq:manage', 'Edit, approve, or dismiss FAQ candidates', 'KNOWLEDGE'),
    ('faq:read', 'Read published FAQ content', 'KNOWLEDGE'),
    ('faq:review', 'Review internal FAQ candidates and provenance', 'KNOWLEDGE'),
    ('kb:approve', 'Approve or reject knowledge articles', 'KNOWLEDGE'),
    ('kb:create', 'Create knowledge articles', 'KNOWLEDGE'),
    ('kb:delete', 'Archive or delete knowledge articles', 'KNOWLEDGE'),
    ('kb:read', 'Read knowledge articles', 'KNOWLEDGE'),
    ('kb:submit_review', 'Submit knowledge articles for review', 'KNOWLEDGE'),
    ('kb:update', 'Update knowledge articles', 'KNOWLEDGE'),
    ('reports:read', 'View operational reports and analytics', 'REPORTS'),
    ('settings:read', 'Read system settings', 'ADMIN'),
    ('settings:write', 'Update system settings', 'ADMIN'),
    ('ticket:assign', 'Assign tickets to support staff', 'TICKETS'),
    ('ticket:close', 'Close resolved tickets', 'TICKETS'),
    ('ticket:create', 'Create tickets', 'TICKETS'),
    ('ticket:escalate', 'Escalate tickets', 'TICKETS'),
    ('ticket:read', 'Read tickets', 'TICKETS'),
    ('ticket:update', 'Update ticket details and status', 'TICKETS'),
    ('users:manage', 'Manage users and roles', 'ADMIN')
) AS required_permissions(permission_name, permission_description, permission_group)
ON CONFLICT ("name") DO NOTHING;

-- A differently formatted alias would create two effective SUPPORT_AGENT roles.
-- Fail closed and require an explicit operator decision instead of merging users.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "roles"
        WHERE UPPER(REPLACE(BTRIM("name"), '-', '_')) = 'SUPPORT_AGENT'
          AND "name" <> 'SUPPORT_AGENT'
    ) THEN
        RAISE EXCEPTION 'A non-canonical SUPPORT_AGENT role alias already exists';
    END IF;
END $$;

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
    'SUPPORT_AGENT',
    'Least-privilege support and editorial operations role',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("name") DO UPDATE
SET "description" = EXCLUDED."description",
    "is_system" = TRUE,
    "updated_at" = CURRENT_TIMESTAMP;

-- Never silently remove an existing privilege. If a pre-existing role is wider
-- than the approved matrix, stop deployment so an operator can investigate.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "role_permissions" role_permission
        JOIN "roles" role_row ON role_row."id" = role_permission."role_id"
        JOIN "permissions" permission_row ON permission_row."id" = role_permission."permission_id"
        WHERE role_row."name" = 'SUPPORT_AGENT'
          AND permission_row."name" NOT IN (
              'ai-interactions:read',
              'faq:manage',
              'faq:read',
              'faq:review',
              'kb:approve',
              'kb:create',
              'kb:read',
              'kb:submit_review',
              'kb:update',
              'reports:read',
              'ticket:assign',
              'ticket:close',
              'ticket:create',
              'ticket:escalate',
              'ticket:read',
              'ticket:update'
          )
    ) THEN
        RAISE EXCEPTION 'Existing SUPPORT_AGENT role has permissions outside the approved matrix';
    END IF;
END $$;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT role_row."id", permission_row."id"
FROM "roles" role_row
CROSS JOIN "permissions" permission_row
WHERE role_row."name" = 'SUPPORT_AGENT'
  AND permission_row."name" IN (
      'ai-interactions:read',
      'faq:manage',
      'faq:read',
      'faq:review',
      'kb:approve',
      'kb:create',
      'kb:read',
      'kb:submit_review',
      'kb:update',
      'reports:read',
      'ticket:assign',
      'ticket:close',
      'ticket:create',
      'ticket:escalate',
      'ticket:read',
      'ticket:update'
  )
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- The canonical role is exact: all 16 approved permissions and nothing else.
DO $$
DECLARE
    assigned_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO assigned_count
    FROM "role_permissions" role_permission
    JOIN "roles" role_row ON role_row."id" = role_permission."role_id"
    WHERE role_row."name" = 'SUPPORT_AGENT';

    IF assigned_count <> 16 THEN
        RAISE EXCEPTION 'SUPPORT_AGENT permission count mismatch: expected 16, got %', assigned_count;
    END IF;
END $$;

COMMIT;

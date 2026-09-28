-- Preserve the existing FAQ approval contract for reviewer roles without
-- widening access to the separate AI interaction history permission.
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT role_row."id", permission_row."id"
FROM "roles" role_row
CROSS JOIN "permissions" permission_row
WHERE UPPER(REPLACE(role_row."name", '-', '_')) IN ('SUPPORT_MANAGER', 'KB_EDITOR')
  AND permission_row."name" = 'faq:review'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

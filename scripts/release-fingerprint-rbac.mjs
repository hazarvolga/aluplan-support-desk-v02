// Keep RBAC reads sequential: node-postgres supports one active query per
// Client, and overlapping calls can emit warnings that would corrupt the
// machine-readable release evidence stream.
export async function queryRbacRows(client) {
    const roles = await client.query(`
        SELECT md5(name) AS "keyDigest", md5(to_jsonb(role_row)::text) AS "rowDigest",
               md5((to_jsonb(role_row) - ARRAY['description', 'is_system', 'updated_at']::text[])::text) AS "stableRowDigest",
               UPPER(REPLACE(BTRIM(name), '-', '_')) = 'SUPPORT_AGENT' AS mutable
        FROM public.roles AS role_row
        ORDER BY md5(name)
    `);
    const permissions = await client.query(`
        SELECT md5(name) AS "keyDigest", md5(to_jsonb(permission_row)::text) AS "rowDigest"
        FROM public.permissions AS permission_row
        ORDER BY md5(name)
    `);
    const assignments = await client.query(`
        SELECT md5(role_row.name || chr(31) || permission_row.name) AS "keyDigest",
               md5(UPPER(REPLACE(BTRIM(role_row.name), '-', '_'))) AS "normalizedRoleDigest",
               md5(permission_row.name) AS "permissionDigest",
               md5(to_jsonb(role_permission)::text) AS "rowDigest"
        FROM public.role_permissions AS role_permission
        JOIN public.roles AS role_row ON role_row.id = role_permission.role_id
        JOIN public.permissions AS permission_row ON permission_row.id = role_permission.permission_id
        ORDER BY 1
    `);

    return { roles, permissions, assignments };
}

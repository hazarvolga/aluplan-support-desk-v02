type DatabaseRoleAuthority = {
    name: string;
    permissions: Array<{ permission: { name: string } }>;
};

export function normalizeSessionRole(role: string): string {
    return role.trim().toUpperCase().replace(/-/g, '_');
}

/** Database assignments are authoritative; missing mappings never imply default grants. */
export function resolveSessionAuthority(
    role: DatabaseRoleAuthority | null | undefined,
): { role: string; permissions: string[] } | null {
    if (!role || typeof role.name !== 'string' || !role.name.trim() || !Array.isArray(role.permissions)) {
        return null;
    }

    const permissions = Array.from(role.permissions, mapping => mapping?.permission?.name);
    if (permissions.some(name => typeof name !== 'string' || !name.trim())) {
        return null;
    }

    return { role: role.name, permissions };
}

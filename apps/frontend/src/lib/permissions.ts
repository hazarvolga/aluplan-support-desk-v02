/**
 * Centralized Permission Constants
 * Strategy: Map required permissions to roles as a primary check, 
 * but keep it generic enough for potential multi-permission systems.
 */

export const PERMISSIONS = {
    // Ticket Permissions
    TICKET_CREATE: ['customer', 'admin', 'super-admin', 'agent'],
    TICKET_VIEW_ALL: ['admin', 'super-admin', 'department-manager', 'team-lead'],
    TICKET_ASSIGN: ['admin', 'super-admin', 'department-manager', 'team-lead'],
    TICKET_DELETE: ['super-admin'],

    // KB Permissions
    KB_MANAGE: ['admin', 'super-admin', 'department-manager'],

    // CRM Permissions
    CRM_SYNC_TRIGGER: ['admin', 'super-admin'],
    CRM_CONFIG_MANAGE: ['super-admin'],

    // Admin Permissions
    USER_MANAGE: ['admin', 'super-admin'],
    SETTINGS_MANAGE: ['super-admin'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Checks if a user role has the required permission.
 */
export function hasPermission(role: string | undefined | null, permission: Permission): boolean {
    if (!role) return false;
    const allowedRoles = PERMISSIONS[permission] as readonly string[];
    return allowedRoles.includes(role);
}

/**
 * Hook-style helper for UI components (example logic)
 */
export function usePermission(user: { role?: { name: string } } | null) {
    const roleName = user?.role?.name;

    return {
        can: (permission: Permission) => hasPermission(roleName, permission),
        isSuperAdmin: roleName === 'super-admin',
        isAdmin: roleName === 'admin' || roleName === 'super-admin',
        isAgent: roleName !== 'customer' && roleName !== undefined,
    };
}

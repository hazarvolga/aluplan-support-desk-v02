import { hasPermission, usePermission, PERMISSIONS } from './permissions';

describe('permissions', () => {
    describe('hasPermission', () => {
        it('returns false for null role', () => {
            expect(hasPermission(null, 'TICKET_CREATE')).toBe(false);
        });

        it('returns false for undefined role', () => {
            expect(hasPermission(undefined, 'TICKET_CREATE')).toBe(false);
        });

        it('allows customer to create tickets', () => {
            expect(hasPermission('customer', 'TICKET_CREATE')).toBe(true);
        });

        it('allows admin to view all tickets', () => {
            expect(hasPermission('admin', 'TICKET_VIEW_ALL')).toBe(true);
        });

        it('allows super-admin to delete tickets', () => {
            expect(hasPermission('super-admin', 'TICKET_DELETE')).toBe(true);
        });

        it('does not allow customer to view all tickets', () => {
            expect(hasPermission('customer', 'TICKET_VIEW_ALL')).toBe(false);
        });

        it('does not allow customer to manage KB', () => {
            expect(hasPermission('customer', 'KB_MANAGE')).toBe(false);
        });

        it('allows admin to manage KB', () => {
            expect(hasPermission('admin', 'KB_MANAGE')).toBe(true);
        });

        it('allows admin to trigger CRM sync', () => {
            expect(hasPermission('admin', 'CRM_SYNC_TRIGGER')).toBe(true);
        });

        it('does not allow agent to manage CRM config', () => {
            expect(hasPermission('agent', 'CRM_CONFIG_MANAGE')).toBe(false);
        });

        it('allows super-admin to manage settings', () => {
            expect(hasPermission('super-admin', 'SETTINGS_MANAGE')).toBe(true);
        });

        it('allows department-manager to assign tickets', () => {
            expect(hasPermission('department-manager', 'TICKET_ASSIGN')).toBe(true);
        });

        it('allows team-lead to assign tickets', () => {
            expect(hasPermission('team-lead', 'TICKET_ASSIGN')).toBe(true);
        });
    });

    describe('usePermission', () => {
        it('returns correct permissions for super-admin', () => {
            const user = { role: { name: 'super-admin' } };
            const perms = usePermission(user);

            expect(perms.can('TICKET_DELETE')).toBe(true);
            expect(perms.can('SETTINGS_MANAGE')).toBe(true);
            expect(perms.isSuperAdmin).toBe(true);
            expect(perms.isAdmin).toBe(true);
        });

        it('returns correct permissions for admin', () => {
            const user = { role: { name: 'admin' } };
            const perms = usePermission(user);

            expect(perms.can('TICKET_VIEW_ALL')).toBe(true);
            expect(perms.can('KB_MANAGE')).toBe(true);
            expect(perms.isSuperAdmin).toBe(false);
            expect(perms.isAdmin).toBe(true);
        });

        it('returns correct permissions for agent', () => {
            const user = { role: { name: 'agent' } };
            const perms = usePermission(user);

            expect(perms.can('TICKET_CREATE')).toBe(true);
            expect(perms.can('TICKET_VIEW_ALL')).toBe(false);
            expect(perms.isAgent).toBe(true);
            expect(perms.isAdmin).toBe(false);
        });

        it('returns correct permissions for customer', () => {
            const user = { role: { name: 'customer' } };
            const perms = usePermission(user);

            expect(perms.can('TICKET_CREATE')).toBe(true);
            expect(perms.can('TICKET_VIEW_ALL')).toBe(false);
            expect(perms.isAgent).toBe(false);
            expect(perms.isAdmin).toBe(false);
        });

        it('returns false for null user', () => {
            const perms = usePermission(null);

            expect(perms.can('TICKET_CREATE')).toBe(false);
            expect(perms.isAgent).toBe(false);
        });
    });

    describe('PERMISSIONS constant', () => {
        it('TICKET_CREATE has correct roles', () => {
            expect(PERMISSIONS.TICKET_CREATE).toContain('customer');
            expect(PERMISSIONS.TICKET_CREATE).toContain('admin');
        });

        it('TICKET_DELETE is restricted to super-admin', () => {
            expect(PERMISSIONS.TICKET_DELETE).toEqual(['super-admin']);
        });
    });
});
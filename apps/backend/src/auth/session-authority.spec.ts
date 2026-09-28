import { normalizeSessionRole, resolveSessionAuthority } from './session-authority';

describe('session authority', () => {
    it('normalizes role aliases for comparison without redefining authority', () => {
        expect(normalizeSessionRole(' super-admin ')).toBe('SUPER_ADMIN');
        expect(normalizeSessionRole('Team-Lead')).toBe('TEAM_LEAD');
    });

    it('preserves the database role and explicitly mapped permission names', () => {
        const role = { name: 'team-lead', permissions: [{ permission: { name: 'ticket:read' } }] };
        expect(resolveSessionAuthority(role)).toEqual({ role: 'team-lead', permissions: ['ticket:read'] });
        expect(role.permissions).toEqual([{ permission: { name: 'ticket:read' } }]);
    });

    it('accepts an explicitly empty ADMIN mapping without granting a wildcard', () => {
        expect(resolveSessionAuthority({ name: 'ADMIN', permissions: [] })).toEqual({ role: 'ADMIN', permissions: [] });
    });

    it.each([
        null, undefined, {}, { name: '', permissions: [] }, { name: ' ', permissions: [] },
        { name: 12, permissions: [] }, { name: 'ADMIN' }, { name: 'ADMIN', permissions: null },
        { name: 'ADMIN', permissions: {} }, { name: 'ADMIN', permissions: [null] },
        { name: 'ADMIN', permissions: new Array(1) },
        { name: 'ADMIN', permissions: [{}] }, { name: 'ADMIN', permissions: [{ permission: null }] },
        { name: 'ADMIN', permissions: [{ permission: {} }] },
        { name: 'ADMIN', permissions: [{ permission: { name: '' } }] },
        { name: 'ADMIN', permissions: [{ permission: { name: ' ' } }] },
        { name: 'ADMIN', permissions: [{ permission: { name: 17 } }] },
    ])('fails closed for missing or malformed database authority: %p', input => {
        expect(resolveSessionAuthority(input as Parameters<typeof resolveSessionAuthority>[0])).toBeNull();
    });
});

import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RbacGuard } from './rbac.guard';
import { ROLES_KEY, PERMISSIONS_KEY } from './decorators/rbac.decorators';

/**
 * Regression tests for RbacGuard.
 *
 * Covers the historical bug surfaced in commit 82d301c
 * (security(tickets): fix data isolation bypass caused by role case-sensitivity)
 * — the guard MUST compare roles case-insensitively so that a user with
 * role "admin" still passes a `@Roles('ADMIN')` decorator and vice versa.
 */
describe('RbacGuard', () => {
    let guard: RbacGuard;
    let reflector: Reflector;

    beforeEach(() => {
        reflector = new Reflector();
        guard = new RbacGuard(reflector);
    });

    function makeContext(user: any): ExecutionContext {
        return {
            switchToHttp: () => ({
                getRequest: () => ({ user }),
            }),
            getHandler: () => () => undefined,
            getClass: () => class TestClass {},
        } as unknown as ExecutionContext;
    }

    function setRequiredRoles(roles: string[] | undefined) {
        jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
            if (key === ROLES_KEY) return roles as any;
            return undefined as any;
        });
    }

    function setRequiredPermissions(perms: string[] | undefined, roles: string[] = []) {
        jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
            if (key === ROLES_KEY) return roles as any;
            if (key === PERMISSIONS_KEY) return perms as any;
            return undefined as any;
        });
    }

    it('allows the request when no role or permission is required', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined as any);
        expect(guard.canActivate(makeContext({ role: 'CUSTOMER' }))).toBe(true);
    });

    it('throws ForbiddenException when no user is on the request', () => {
        setRequiredRoles(['ADMIN']);
        expect(() => guard.canActivate(makeContext(null))).toThrow(ForbiddenException);
    });

    describe('role matching is case-insensitive (regression: 82d301c)', () => {
        it.each([
            ['admin', 'ADMIN'],
            ['Admin', 'ADMIN'],
            ['ADMIN', 'admin'],
            ['ADMIN', 'Admin'],
        ])('user role "%s" satisfies required role "%s"', (userRole, requiredRole) => {
            setRequiredRoles([requiredRole]);
            expect(guard.canActivate(makeContext({ role: userRole }))).toBe(true);
        });

        it('accepts role on user.role.name (object form)', () => {
            setRequiredRoles(['ADMIN']);
            expect(guard.canActivate(makeContext({ role: { name: 'admin' } }))).toBe(true);
        });

        it.each([
            ['SUPPORT_MANAGER', 'support-manager'],
            ['department-manager', 'DEPARTMENT_MANAGER'],
            [{ name: 'support_agent' }, 'SUPPORT-AGENT'],
        ])(
            'normalizes underscore and hyphen aliases between user role %p and required role %s',
            (userRole, requiredRole) => {
                setRequiredRoles([requiredRole]);
                expect(guard.canActivate(makeContext({ role: userRole }))).toBe(true);
            },
        );

        it('rejects when role does not match and no wildcard permission', () => {
            setRequiredRoles(['ADMIN']);
            expect(() =>
                guard.canActivate(makeContext({ role: 'CUSTOMER', permissions: [] })),
            ).toThrow(/Requires role: ADMIN/);
        });

        it('lets a wildcard permission bypass the role mismatch', () => {
            setRequiredRoles(['ADMIN']);
            expect(
                guard.canActivate(makeContext({ role: 'AGENT', permissions: ['*'] })),
            ).toBe(true);
        });
    });

    describe('permission matching', () => {
        it('passes when the user has every required permission', () => {
            setRequiredPermissions(['tickets:read', 'tickets:write']);
            expect(
                guard.canActivate(
                    makeContext({ permissions: ['tickets:read', 'tickets:write', 'extra'] }),
                ),
            ).toBe(true);
        });

        it('rejects when a required permission is missing', () => {
            setRequiredPermissions(['tickets:write']);
            expect(() =>
                guard.canActivate(makeContext({ permissions: ['tickets:read'] })),
            ).toThrow(/Requires permission: tickets:write/);
        });

        it('grants access for "*" wildcard', () => {
            setRequiredPermissions(['anything:goes']);
            expect(guard.canActivate(makeContext({ permissions: ['*'] }))).toBe(true);
        });

        it('grants access for "admin" wildcard', () => {
            setRequiredPermissions(['anything:goes']);
            expect(guard.canActivate(makeContext({ permissions: ['admin'] }))).toBe(true);
        });
    });
});

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, PERMISSIONS_KEY } from './decorators/rbac.decorators';

type UserRole = string | { name: string } | null;

interface AuthUser {
    role: UserRole;
    permissions?: string[];
    sub?: string;
}

@Injectable()
export class RbacGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    private normalizeRoleName(roleName: string): string {
        return roleName.trim().replace(/-/g, '_').toUpperCase();
    }

    private getRoleName(role: UserRole): string | null {
        if (!role) return null;
        if (typeof role === 'string') return this.normalizeRoleName(role);
        if (typeof role === 'object' && 'name' in role) {
            return this.normalizeRoleName(role.name);
        }
        return null;
    }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // If no RBAC restriction, allow
        if (!requiredRoles?.length && !requiredPermissions?.length) return true;

        const { user } = context.switchToHttp().getRequest() as { user?: AuthUser };
        if (!user) throw new ForbiddenException('No user context');

        // Role check
        if (requiredRoles?.length) {
            const userRole = this.getRoleName(user.role);

            const hasRole = requiredRoles.some(
                (role) => this.normalizeRoleName(role) === userRole,
            );
            if (!hasRole && !user.permissions?.includes('*')) {
                throw new ForbiddenException(`Requires role: ${requiredRoles.join(' | ')}`);
            }
        }

        // Permission check
        if (requiredPermissions?.length) {
            const userPermissions = user.permissions || [];
            if (userPermissions.includes('*') || userPermissions.includes('admin')) return true;

            const hasPermission = requiredPermissions.every((perm) =>
                userPermissions.includes(perm),
            );
            if (!hasPermission) {
                throw new ForbiddenException(`Requires permission: ${requiredPermissions.join(', ')}`);
            }
        }

        return true;
    }
}

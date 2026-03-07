import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, PERMISSIONS_KEY } from './decorators/rbac.decorators';

@Injectable()
export class RbacGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

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

        const { user } = context.switchToHttp().getRequest();
        if (!user) throw new ForbiddenException('No user context');

        // Role check
        if (requiredRoles?.length) {
            const userRoleName = (user.role as any)?.name || user.role;
            const userRole = typeof userRoleName === 'string' ? userRoleName.toUpperCase() : null;

            const hasRole = requiredRoles.some(role => role.toUpperCase() === userRole);
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

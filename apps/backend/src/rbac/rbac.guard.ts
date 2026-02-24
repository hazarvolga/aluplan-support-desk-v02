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
            const hasRole = requiredRoles.includes(user.role);
            if (!hasRole) {
                throw new ForbiddenException(`Requires role: ${requiredRoles.join(' | ')}`);
            }
        }

        // Permission check
        if (requiredPermissions?.length) {
            if (user.permissions?.includes('*')) return true;

            const hasPermission = requiredPermissions.every((perm) =>
                user.permissions?.includes(perm),
            );
            if (!hasPermission) {
                throw new ForbiddenException(`Requires permission: ${requiredPermissions.join(', ')}`);
            }
        }

        return true;
    }
}

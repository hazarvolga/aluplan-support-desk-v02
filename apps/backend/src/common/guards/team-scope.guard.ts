import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * TeamScopeGuard — Resource-level access control for team endpoints.
 *
 * Allows access if the requesting user is:
 * 1. A member of the team being accessed
 * 2. An ADMIN or DEPARTMENT_MANAGER (management bypass)
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard, RbacGuard, TeamScopeGuard)
 *   @Get(':id')
 *   getTeam(@Param('id') id: string) { ... }
 */
@Injectable()
export class TeamScopeGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const teamId = request.params?.id;

        if (!user) throw new ForbiddenException('No user context');
        if (!teamId) throw new ForbiddenException('No team identifier in route');

        const userRole = (typeof user.role === 'string' ? user.role : user.role?.name)?.toUpperCase();

        // Management bypass
        if (userRole === 'ADMIN' || userRole === 'DEPARTMENT_MANAGER') {
            return true;
        }

        const userId = user.sub || user.id;

        const membership = await this.prisma.teamMember.findUnique({
            where: {
                userId_teamId: {
                    userId,
                    teamId,
                },
            },
        });

        if (!membership) {
            throw new ForbiddenException('You are not a member of this team');
        }

        return true;
    }
}

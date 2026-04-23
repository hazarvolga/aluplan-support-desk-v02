import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * TicketOwnerGuard — Resource-level access control for individual tickets.
 *
 * Allows access if the requesting user is:
 * 1. The ticket creator (requester)
 * 2. The ticket assignee
 * 3. An ADMIN or DEPARTMENT_MANAGER (management bypass)
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard, RbacGuard, TicketOwnerGuard)
 *   @Get(':id')
 *   findOne(@Param('id') id: string) { ... }
 */
@Injectable()
export class TicketOwnerGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const ticketId = request.params?.id;

        if (!user) throw new ForbiddenException('No user context');
        if (!ticketId) throw new ForbiddenException('No ticket identifier in route');

        const userRole = (typeof user.role === 'string' ? user.role : user.role?.name)?.toUpperCase();

        // Management bypass — admins and department managers can access any ticket
        if (userRole === 'ADMIN' || userRole === 'DEPARTMENT_MANAGER') {
            return true;
        }

        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            select: { userId: true, assignedTo: true },
        });

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        const isOwner = ticket.userId === user.sub || ticket.userId === user.id;
        const isAssignee = ticket.assignedTo === user.sub || ticket.assignedTo === user.id;

        if (!isOwner && !isAssignee) {
            throw new ForbiddenException('You do not have access to this ticket');
        }

        return true;
    }
}

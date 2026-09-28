import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type TicketRequester = {
    id?: string;
    sub?: string;
    role?: string | { name?: string | null } | null;
};

const STAFF_ROLES = new Set([
    'ADMIN',
    'SUPER_ADMIN',
    'SUPERUSER',
    'DEPARTMENT_MANAGER',
    'TEAM_LEAD',
    'SENIOR_AGENT',
    'AGENT',
    'SUPPORT_AGENT',
    'SUPPORT_MANAGER',
]);

@Injectable()
export class TicketAccessService {
    constructor(private readonly prisma: PrismaService) {}

    async canManageTicket(requester: TicketRequester | undefined, ticketId: string): Promise<boolean> {
        if (!this.isStaffRequester(requester)) return false;
        return this.canAccessTicket(requester, ticketId);
    }

    async canManageTickets(requester: TicketRequester | undefined, ticketIds: string[]): Promise<boolean> {
        if (!this.isStaffRequester(requester)) return false;
        if (!Array.isArray(ticketIds) || !ticketIds.length || new Set(ticketIds).size !== ticketIds.length) return false;
        const count = await this.prisma.ticket.count({ where: { id: { in: ticketIds }, deletedAt: null } });
        return count === ticketIds.length;
    }

    private isStaffRequester(requester: TicketRequester | undefined): boolean {
        const requesterId = requester?.id ?? requester?.sub;
        return typeof requesterId === 'string' && Boolean(requesterId.trim())
            && STAFF_ROLES.has(this.normalizeRole(requester?.role));
    }

    async canAccessTicket(requester: TicketRequester | undefined, ticketId: string): Promise<boolean> {
        const requesterId = requester?.id ?? requester?.sub;
        if (!requesterId) return false;

        const ticket = await this.prisma.ticket.findFirst({
            where: { id: ticketId, deletedAt: null },
            select: { userId: true },
        });
        if (!ticket) return false;

        const role = this.normalizeRole(requester?.role);
        if (STAFF_ROLES.has(role)) return true;

        return (role === 'CUSTOMER' || role === 'VIEWER') && ticket.userId === requesterId;
    }

    private normalizeRole(role: TicketRequester['role']): string {
        const value = typeof role === 'string' ? role : role?.name;
        return typeof value === 'string' ? value.trim().toUpperCase().replace(/-/g, '_') : '';
    }
}

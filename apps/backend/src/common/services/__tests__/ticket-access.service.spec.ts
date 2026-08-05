import { TicketAccessService } from '../ticket-access.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { mockPrismaService } from '../../../test/mock.utils';

describe('TicketAccessService', () => {
    const service = new TicketAccessService(mockPrismaService as PrismaService);

    beforeEach(() => jest.clearAllMocks());

    it.each(['CUSTOMER', 'VIEWER'])('allows %s only for their own ticket', async (role) => {
        mockPrismaService.ticket.findFirst.mockResolvedValue({ userId: 'owner-1' });

        await expect(service.canAccessTicket({ id: 'owner-1', role }, 'ticket-1')).resolves.toBe(true);
        await expect(service.canAccessTicket({ id: 'other-user', role }, 'ticket-1')).resolves.toBe(false);
    });

    it.each(['ADMIN', 'SUPER-ADMIN', 'SUPERUSER', 'DEPARTMENT_MANAGER', 'TEAM_LEAD', 'SENIOR_AGENT', 'AGENT', 'SUPPORT_AGENT', 'SUPPORT-MANAGER'])(
        'allows recognized staff role %s',
        async (role) => {
            mockPrismaService.ticket.findFirst.mockResolvedValue({ userId: 'owner-1' });

            await expect(service.canAccessTicket({ id: 'staff-1', role }, 'ticket-1')).resolves.toBe(true);
        },
    );

    it('fails closed for a missing or unknown role', async () => {
        mockPrismaService.ticket.findFirst.mockResolvedValue({ userId: 'owner-1' });

        await expect(service.canAccessTicket({ id: 'user-1' }, 'ticket-1')).resolves.toBe(false);
        await expect(service.canAccessTicket({ id: 'user-1', role: 'PARTNER' }, 'ticket-1')).resolves.toBe(false);
    });

    it('accepts the JWT subject claim as the requester identity', async () => {
        mockPrismaService.ticket.findFirst.mockResolvedValue({ userId: 'owner-1' });

        await expect(service.canAccessTicket({ sub: 'owner-1', role: 'CUSTOMER' }, 'ticket-1')).resolves.toBe(true);
    });

    it('denies access when the ticket does not exist', async () => {
        mockPrismaService.ticket.findFirst.mockResolvedValue(null);

        await expect(service.canAccessTicket({ id: 'user-1', role: 'ADMIN' }, 'missing')).resolves.toBe(false);
    });
});

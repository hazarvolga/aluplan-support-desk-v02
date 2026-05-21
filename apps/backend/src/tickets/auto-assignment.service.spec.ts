import { Test, TestingModule } from '@nestjs/testing';
import { AutoAssignmentService } from './auto-assignment.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AutoAssignmentService', () => {
    let service: AutoAssignmentService;
    let prisma: { ticket: { findUnique: jest.Mock; update: jest.Mock; groupBy: jest.Mock }; user: { findMany: jest.Mock } };

    const mockTicket = {
        id: 'ticket-123',
        ticketNumber: 'SUP-00001',
        subject: 'Test Ticket',
        assignedTo: null,
        status: 'NEW',
        departmentId: 'department-1',
    };

    beforeEach(async () => {
        prisma = {
            ticket: {
                findUnique: jest.fn().mockResolvedValue(mockTicket),
                update: jest.fn().mockResolvedValue({ ...mockTicket, assignedTo: 'user-2' }),
                groupBy: jest.fn().mockResolvedValue([]),
            },
            user: {
                findMany: jest.fn().mockResolvedValue([{ id: 'user-1' }, { id: 'user-2' }]),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AutoAssignmentService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<AutoAssignmentService>(AutoAssignmentService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should not assign if already assigned', async () => {
        const assignedTicket = { ...mockTicket, assignedTo: 'user-1' };
        prisma.ticket.findUnique.mockResolvedValueOnce(assignedTicket);

        await service.handleTicketCreated(assignedTicket as any);

        expect(prisma.ticket.update).not.toHaveBeenCalled();
    });

    it('should leave tickets without department unassigned for manual triage', async () => {
        const ticketWithoutDepartment = { ...mockTicket, departmentId: null };
        prisma.ticket.findUnique.mockResolvedValueOnce(ticketWithoutDepartment);

        await service.handleTicketCreated(ticketWithoutDepartment as any);

        expect(prisma.user.findMany).not.toHaveBeenCalled();
        expect(prisma.ticket.update).not.toHaveBeenCalled();
    });

    it('should only find active members from auto-assignment teams in the ticket department', async () => {
        await service.handleTicketCreated(mockTicket as any);

        expect(prisma.user.findMany).toHaveBeenCalledWith({
            where: {
                role: { name: { not: 'CUSTOMER', mode: 'insensitive' } },
                status: 'ACTIVE',
                deletedAt: null,
                teamMembers: {
                    some: {
                        team: {
                            departmentId: 'department-1',
                            isArchived: false,
                            deletedAt: null,
                            autoAssignmentEnabled: true,
                        },
                    },
                },
            },
            select: { id: true }
        });
    });

    it('should not fall back to global agents when the department has no auto-assignment agents', async () => {
        prisma.user.findMany.mockResolvedValueOnce([]);

        await service.handleTicketCreated(mockTicket as any);

        expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
        expect(prisma.ticket.update).not.toHaveBeenCalled();
    });
});

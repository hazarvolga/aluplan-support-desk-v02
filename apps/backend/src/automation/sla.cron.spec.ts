import { Test, TestingModule } from '@nestjs/testing';
import { SlaCronService } from './sla.cron';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { getQueueToken } from '@nestjs/bullmq';

describe('SlaCronService', () => {
    let service: SlaCronService;
    let prismaService: PrismaService;
    let eventEmitter: EventEmitter2;
    let notificationsGateway: NotificationsGateway;
    let mockQueue: any;

    beforeEach(async () => {
        const mockPrismaService = {
            ticket: {
                findMany: jest.fn().mockResolvedValue([]),
                update: jest.fn().mockResolvedValue({}),
                updateMany: jest.fn().mockResolvedValue({ count: 0 }),
            },
            ticketMessage: { findFirst: jest.fn().mockResolvedValue(null) },
        };
        const mockEventEmitter = {
            emitAsync: jest.fn().mockResolvedValue([]),
        };
        const mockNotificationsGateway = {
            emitSlaBreached: jest.fn(),
            emitTicketUpdated: jest.fn().mockResolvedValue(undefined),
        };
        mockQueue = {
            add: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SlaCronService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: EventEmitter2, useValue: mockEventEmitter },
                { provide: NotificationsGateway, useValue: mockNotificationsGateway },
                { provide: getQueueToken('sla-processing'), useValue: mockQueue },
            ],
        }).compile();

        service = module.get<SlaCronService>(SlaCronService);
        prismaService = module.get<PrismaService>(PrismaService);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
        notificationsGateway = module.get<NotificationsGateway>(NotificationsGateway);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should register repeatable jobs on bootstrap', async () => {
        await service.onApplicationBootstrap();
        expect(mockQueue.add).toHaveBeenCalledTimes(3);
        expect(mockQueue.add).toHaveBeenNthCalledWith(1, 'check-warnings', {}, expect.any(Object));
        expect(mockQueue.add).toHaveBeenNthCalledWith(2, 'check-breaches', {}, expect.any(Object));
        expect(mockQueue.add).toHaveBeenNthCalledWith(3, 'auto-close-tickets', {}, expect.any(Object));
    });

    it('should query tickets and not emit warnings if no tickets breach SLA', async () => {
        await service.checkSlaWarnings();
        expect(prismaService.ticket.findMany).toHaveBeenCalledTimes(2);
        expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
    });

    it('should emit sla.warning and update ticket when tickets are close to SLA limits', async () => {
        const mockTicket = {
            id: 'ticket-1',
            status: 'OPEN',
            ticketNumber: '#TICKET1',
            subject: 'Help',
            slaWarningSentAt: null,
            assignee: { email: 'agent@aluplan.com' }
        };

        jest.spyOn(prismaService.ticket, 'findMany')
            .mockResolvedValueOnce([mockTicket] as any)
            .mockResolvedValueOnce([] as any);

        await service.checkSlaWarnings();

        expect(eventEmitter.emitAsync).toHaveBeenCalledWith('sla.warning', {
            agentName: 'Temsilci',
            agentEmail: 'agent@aluplan.com',
            ticketId: 'ticket-1',
            ticketNumber: '#TICKET1',
            ticketStatus: 'OPEN',
            subject: 'Help',
            timeLeft: '30 dakikadan az',
            breachType: 'response'
        });

        expect(prismaService.ticket.update).toHaveBeenCalledWith({
            where: { id: 'ticket-1' },
            data: { slaWarningSentAt: expect.any(Date) }
        });
    });

    it('should check active breaches and auto-escalate breached tickets', async () => {
        const mockBreachedTicket = {
            id: 'ticket-breached',
            ticketNumber: '#BREACH1',
            isSlaBreached: false,
        };

        jest.spyOn(prismaService.ticket, 'findMany')
            .mockResolvedValueOnce([mockBreachedTicket] as any)
            .mockResolvedValueOnce([] as any);

        await service.checkSlaBreaches();

        expect(prismaService.ticket.update).toHaveBeenCalledWith({
            where: { id: 'ticket-breached' },
            data: { isSlaBreached: true }
        });

        expect(prismaService.ticket.update).toHaveBeenCalledWith({
            where: { id: 'ticket-breached' },
            data: {
                priority: 'URGENT',
                escalated: true,
                escalationCount: { increment: 1 }
            }
        });

        expect(notificationsGateway.emitSlaBreached).toHaveBeenCalledWith(mockBreachedTicket);
    });

    it.each(['RESOLVED', 'PENDING_CUSTOMER_REVIEW'])('closes overdue %s with an audit trail and lifecycle notifications', async (status) => {
        const ticket = { id: 'overdue', status, updatedAt: new Date('2026-01-01'), resolvedAt: new Date('2026-01-01') };
        jest.spyOn(prismaService.ticket, 'findMany').mockResolvedValueOnce([]).mockResolvedValueOnce([ticket] as any);
        jest.spyOn(prismaService.ticket, 'update').mockResolvedValue({ ...ticket, status: 'CLOSED' } as any);
        await service.autoCloseResolvedTickets();
        expect(prismaService.ticket.findMany).toHaveBeenLastCalledWith(expect.objectContaining({
            where: expect.objectContaining({ deletedAt: null, status: { in: ['RESOLVED', 'PENDING_CUSTOMER_REVIEW'] } }),
            take: 100,
        }));
        expect(prismaService.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ id: ticket.id, status, deletedAt: null, updatedAt: ticket.updatedAt }),
            data: expect.objectContaining({
                status: 'CLOSED', closedAt: expect.any(Date),
                messages: { create: expect.objectContaining({ isInternal: true, metadata: expect.objectContaining({ action: 'AUTO_CLOSED_NO_RESPONSE' }) }) },
            }),
        }));
        expect(eventEmitter.emitAsync).toHaveBeenCalledWith('ticket.status_changed', expect.objectContaining({
            ticketId: ticket.id, oldStatus: status, newStatus: 'CLOSED', closureReason: 'NO_CUSTOMER_RESPONSE',
        }));
        expect(notificationsGateway.emitTicketUpdated).toHaveBeenCalledWith(expect.objectContaining({ id: ticket.id, status: 'CLOSED' }));
    });

    it('does not close or notify when a customer reply wins the conditional update', async () => {
        jest.spyOn(prismaService.ticket, 'findMany').mockResolvedValueOnce([]).mockResolvedValueOnce([
            { id: 'reply-won', status: 'RESOLVED', updatedAt: new Date(0), resolvedAt: new Date(0) },
        ] as any);
        jest.spyOn(prismaService.ticket, 'update').mockRejectedValue({ code: 'P2025' });
        await service.autoCloseResolvedTickets();
        expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
        expect(notificationsGateway.emitTicketUpdated).not.toHaveBeenCalled();
    });

    it('does not infer a resolution date from an old update timestamp', async () => {
        jest.spyOn(prismaService.ticket, 'findMany').mockResolvedValueOnce([]).mockResolvedValueOnce([
            { id: 'legacy-review', status: 'PENDING_CUSTOMER_REVIEW', resolvedAt: null, updatedAt: new Date(0) },
        ] as any);
        await service.autoCloseResolvedTickets();
        expect(prismaService.ticket.update).not.toHaveBeenCalled();
        expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
    });

    it('sends one reminder per resolution proposal before the five-day deadline', async () => {
        const ticket = { id: 'review', status: 'PENDING_CUSTOMER_REVIEW', updatedAt: new Date(0), resolvedAt: new Date(0) };
        jest.spyOn(prismaService.ticket, 'findMany').mockResolvedValueOnce([ticket] as any).mockResolvedValueOnce([]);
        await service.autoCloseResolvedTickets();
        expect(prismaService.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
            data: { messages: { create: expect.objectContaining({
                isInternal: true,
                metadata: { action: 'TICKET_REVIEW_REMINDER', resolutionProposedAt: ticket.resolvedAt.toISOString() },
            }) } },
        }));
        expect(eventEmitter.emitAsync).toHaveBeenCalledWith('ticket.review_reminder', { ticketId: ticket.id });
        expect(notificationsGateway.emitTicketUpdated).not.toHaveBeenCalled();
    });

    it('does not repeat an already recorded reminder for the same proposal', async () => {
        jest.spyOn(prismaService.ticket, 'findMany').mockResolvedValueOnce([
            { id: 'review', status: 'RESOLVED', resolvedAt: new Date(0), updatedAt: new Date(0) },
        ] as any).mockResolvedValueOnce([]);
        (prismaService as any).ticketMessage.findFirst.mockResolvedValue({ id: 'sent-reminder' });
        await service.autoCloseResolvedTickets();
        expect(prismaService.ticket.update).not.toHaveBeenCalled();
        expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
    });
});

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
        };
        const mockEventEmitter = {
            emit: jest.fn(),
        };
        const mockNotificationsGateway = {
            emitSlaBreached: jest.fn(),
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
        expect(eventEmitter.emit).not.toHaveBeenCalled();
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

        expect(eventEmitter.emit).toHaveBeenCalledWith('sla.warning', {
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

    it('should auto-close tickets that have been resolved for 5+ days', async () => {
        jest.spyOn(prismaService.ticket, 'updateMany').mockResolvedValue({ count: 3 } as any);

        await service.autoCloseResolvedTickets();

        expect(prismaService.ticket.updateMany).toHaveBeenCalledWith({
            where: {
                status: 'RESOLVED',
                resolvedAt: { lt: expect.any(Date) }
            },
            data: {
                status: 'CLOSED',
                closedAt: expect.any(Date)
            }
        });
    });
});

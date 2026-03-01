import { Test, TestingModule } from '@nestjs/testing';
import { SlaCronService } from './sla.cron';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('SlaCronService', () => {
    let service: SlaCronService;
    let prismaService: PrismaService;
    let eventEmitter: EventEmitter2;

    beforeEach(async () => {
        // Mock the Prisma Service and Event Emitter interactions
        const mockPrismaService = {
            ticket: {
                findMany: jest.fn().mockResolvedValue([]),
                update: jest.fn().mockResolvedValue({}),
            },
        };
        const mockEventEmitter = {
            emit: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SlaCronService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: EventEmitter2, useValue: mockEventEmitter },
            ],
        }).compile();

        service = module.get<SlaCronService>(SlaCronService);
        prismaService = module.get<PrismaService>(PrismaService);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should query tickets and not emit warnings if no tickets breach SLA', async () => {
        await service.checkSlaWarnings();

        // Assert findMany was called twice: once for response and once for resolution
        expect(prismaService.ticket.findMany).toHaveBeenCalledTimes(2);
        // Ensure no events were emitted because findMany returns empty array
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

        // Make the first prisma call (Response SLA) return 1 risk ticket, the next return empty
        jest.spyOn(prismaService.ticket, 'findMany')
            .mockResolvedValueOnce([mockTicket] as any)
            .mockResolvedValueOnce([] as any);

        await service.checkSlaWarnings();

        expect(eventEmitter.emit).toHaveBeenCalledWith('sla.warning', {
            agentEmail: 'agent@aluplan.com',
            ticketNumber: '#TICKET1',
            subject: 'Help',
            timeLeft: '30 dakikadan az',
            breachType: 'response'
        });

        // Ensure we update to block repeated emails
        expect(prismaService.ticket.update).toHaveBeenCalledWith({
            where: { id: 'ticket-1' },
            data: { slaWarningSentAt: expect.any(Date) }
        });
    });
});

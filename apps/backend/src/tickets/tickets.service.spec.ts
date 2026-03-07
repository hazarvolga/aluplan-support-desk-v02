import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { SlaService } from './sla.service';
import { PiiMaskingService } from './pii-masking.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AiQueryService } from '../ai/ai-query.service';
import { RedisService } from '../redis/redis.service';
import { mockPrismaService } from '../test/mock.utils';
import { TicketStatus, TicketPriority } from '@aluplan/database';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TicketsService', () => {
    let service: TicketsService;
    let prisma: any;
    let eventEmitter: any;

    const mockSlaService = {
        calculateDeadlines: jest.fn(),
        recalculateOnEscalation: jest.fn(),
    };

    const mockPiiMaskingService = {
        maskSensitiveData: jest.fn((str) => str),
    };

    const mockEventEmitter = {
        emit: jest.fn(),
    };

    const mockAiQueryService = {
        smartTagTicket: jest.fn(),
    };

    const mockRedisService = {
        get: jest.fn(),
        set: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TicketsService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: SlaService, useValue: mockSlaService },
                { provide: PiiMaskingService, useValue: mockPiiMaskingService },
                { provide: EventEmitter2, useValue: mockEventEmitter },
                { provide: AiQueryService, useValue: mockAiQueryService },
                { provide: RedisService, useValue: mockRedisService },
            ],
        }).compile();

        service = module.get<TicketsService>(TicketsService);
        prisma = module.get<PrismaService>(PrismaService);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);

        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a ticket and emit event', async () => {
            // Arrange
            const dto = { subject: 'Test', description: 'Desc', priority: TicketPriority.HIGH, departmentId: 'dep1' };
            const userId = 'user1';

            prisma.$queryRaw = jest.fn().mockResolvedValue([{ nextval: 1n }]);
            mockSlaService.calculateDeadlines.mockResolvedValue({
                slaResponseDue: new Date(),
                slaResolveDue: new Date()
            });

            const expectedTicket = { id: 'tik1', ticketNumber: 'SUP-00001', subject: 'Test' };
            prisma.ticket.create.mockResolvedValue(expectedTicket);

            // Act
            const result = await service.create(dto, userId);

            // Assert
            expect(result).toEqual(expectedTicket);
            expect(mockEventEmitter.emit).toHaveBeenCalledWith('ticket.created', expectedTicket);
            expect(prisma.ticket.create).toHaveBeenCalled();
        });
    });

    describe('transition', () => {
        it('should throw BadRequestException if transition is invalid', async () => {
            // Arrange
            const ticket = { id: 'tik1', status: 'NEW' };
            prisma.ticket.findUnique.mockResolvedValue(ticket);

            // Act & Assert
            await expect(service.transition('tik1', TicketStatus.RESOLVED, 'agent1')).rejects.toThrow(BadRequestException);
        });

        it('should update status and emit event for valid transition', async () => {
            // Arrange
            const ticket = { id: 'tik1', status: 'NEW', ticketNumber: 'SUP-00001' };
            const updatedTicket = { ...ticket, status: 'OPEN' };

            prisma.ticket.findUnique.mockResolvedValue(ticket);
            prisma.ticket.update.mockResolvedValue(updatedTicket);

            // Act
            const result = await service.transition('tik1', TicketStatus.OPEN, 'agent1');

            // Assert
            expect(result.status).toBe('OPEN');
            expect(mockEventEmitter.emit).toHaveBeenCalledWith('ticket.status_changed', expect.any(Object));
        });
    });

    describe('assign', () => {
        it('should assign a ticket to an agent', async () => {
            // Arrange
            const ticket = { id: 'tik1', status: 'NEW', ticketNumber: 'SUP-00001' };
            const updatedTicket = { ...ticket, assignedTo: 'agent1', status: 'OPEN' };

            prisma.ticket.findUnique.mockResolvedValue(ticket);
            prisma.ticket.update.mockResolvedValue(updatedTicket);

            // Act
            const result = await service.assign('tik1', 'agent1', 'admin1');

            // Assert
            expect(result.assignedTo).toBe('agent1');
            expect(prisma.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ assignedTo: 'agent1' })
            }));
        });
    });
});

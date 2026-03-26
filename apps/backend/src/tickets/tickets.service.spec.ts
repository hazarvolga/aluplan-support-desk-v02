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
            prisma.ticket.findFirst.mockResolvedValue(ticket);

            // Act & Assert
            await expect(service.transition('tik1', TicketStatus.RESOLVED, 'agent1')).rejects.toThrow(BadRequestException);
        });

        it('should update status and emit event for valid transition', async () => {
            // Arrange
            const ticket = { id: 'tik1', status: 'NEW', ticketNumber: 'SUP-00001' };
            const updatedTicket = { ...ticket, status: 'OPEN' };

            prisma.ticket.findFirst.mockResolvedValue(ticket);
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

            prisma.ticket.findFirst.mockResolvedValue(ticket);
            prisma.ticket.update.mockResolvedValue(updatedTicket);

            // Act
            const result = await service.assign('tik1', 'agent1', 'admin1');

            // Assert
            expect(result.assignedTo).toBe('agent1');
            expect(prisma.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ assignedTo: 'agent1' })
            }));
        });
        describe('findAll', () => {
            it('should return paginated and filtered tickets', async () => {
                // Arrange
                const mockTickets = [{ id: '1' }, { id: '2' }];
                prisma.ticket.findMany.mockResolvedValue(mockTickets);
                prisma.ticket.count.mockResolvedValue(10);

                // Act
                const result = await service.findAll({ status: TicketStatus.OPEN, page: 2, limit: 5 });

                // Assert
                expect(result.data).toEqual(mockTickets);
                expect(result.total).toBe(10);
                expect(result.page).toBe(2);
                expect(result.pages).toBe(2);
                expect(prisma.ticket.findMany).toHaveBeenCalledWith(
                    expect.objectContaining({
                        where: expect.objectContaining({ status: TicketStatus.OPEN }),
                        skip: 5,
                        take: 5
                    })
                );
            });

            it('should filter tickets by teamId', async () => {
                // Arrange
                const teamId = 'team1';
                const teamMembers = [{ userId: 'agent1' }, { userId: 'agent2' }];
                prisma.teamMember.findMany.mockResolvedValue(teamMembers);
                prisma.ticket.findMany.mockResolvedValue([]);
                prisma.ticket.count.mockResolvedValue(0);

                // Act
                await service.findAll({ teamId });

                // Assert
                expect(prisma.teamMember.findMany).toHaveBeenCalledWith({
                    where: { teamId },
                    select: { userId: true },
                });
                expect(prisma.ticket.findMany).toHaveBeenCalledWith(
                    expect.objectContaining({
                        where: expect.objectContaining({
                            assignedTo: { in: ['agent1', 'agent2'] },
                        }),
                    })
                );
            });

            it('should handle combined assignedTo and teamId filtering (valid case)', async () => {
                // Arrange
                const teamId = 'team1';
                const assignedTo = 'agent1';
                const teamMembers = [{ userId: 'agent1' }, { userId: 'agent2' }];
                prisma.teamMember.findMany.mockResolvedValue(teamMembers);
                prisma.ticket.findMany.mockResolvedValue([]);
                prisma.ticket.count.mockResolvedValue(0);

                // Act
                await service.findAll({ teamId, assignedTo });

                // Assert
                expect(prisma.ticket.findMany).toHaveBeenCalledWith(
                    expect.objectContaining({
                        where: expect.objectContaining({
                            assignedTo: 'agent1',
                        }),
                    })
                );
            });

            it('should return zero results if assignedTo agent is not in the specified team', async () => {
                // Arrange
                const teamId = 'team1';
                const assignedTo = 'agent3'; // NOT in team1
                const teamMembers = [{ userId: 'agent1' }, { userId: 'agent2' }];
                prisma.teamMember.findMany.mockResolvedValue(teamMembers);
                prisma.ticket.findMany.mockResolvedValue([]);
                prisma.ticket.count.mockResolvedValue(0);

                // Act
                await service.findAll({ teamId, assignedTo });

                // Assert
                expect(prisma.ticket.findMany).toHaveBeenCalledWith(
                    expect.objectContaining({
                        where: expect.objectContaining({
                            assignedTo: 'none',
                        }),
                    })
                );
            });
        });

        describe('addMessage', () => {
            it('should throw BadRequestException when adding a message to a closed ticket', async () => {
                // Arrange
                const ticket = { id: 'tik1', status: 'CLOSED', userId: 'user1' };
                prisma.ticket.findFirst.mockResolvedValue(ticket);

                // Act & Assert
                await expect(service.addMessage('tik1', { message: 'hello' }, 'user1', 'customer'))
                    .rejects.toThrow(BadRequestException);
            });

            it('should reopen ticket if customer replies to PENDING_CUSTOMER', async () => {
                // Arrange
                const ticket = { id: 'tik1', status: 'PENDING_CUSTOMER', userId: 'user1' };
                prisma.ticket.findFirst.mockResolvedValue(ticket);
                prisma.ticketMessage.create.mockResolvedValue({ id: 'msg1' });

                // Act
                await service.addMessage('tik1', { message: 'hello' }, 'user1', 'customer');

                // Assert
                expect(prisma.ticket.update).toHaveBeenCalledWith(
                    expect.objectContaining({ data: { status: 'OPEN' } })
                );
            });
        });

        describe('transition', () => {
            it('should set closedAt when transitioning to CLOSED', async () => {
                // Arrange
                const ticket = { id: 'tik1', status: 'RESOLVED', ticketNumber: 'SUP-00001' };
                prisma.ticket.findFirst.mockResolvedValue(ticket);
                prisma.ticket.update.mockResolvedValue({ ...ticket, status: 'CLOSED' });

                // Act
                await service.transition('tik1', TicketStatus.CLOSED, 'agent1');

                // Assert
                expect(prisma.ticket.update).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({ status: 'CLOSED', closedAt: expect.any(Date) })
                    })
                );
            });
        });
    });
});

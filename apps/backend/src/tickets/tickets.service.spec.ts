import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { SlaService } from './sla.service';
import { PiiMaskingService } from '../common/services/pii-masking.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AiQueryService } from '../ai/ai-query.service';
import { RedisService } from '../redis/redis.service';
import { mockPrismaService } from '../test/mock.utils';
import { TicketStatus, TicketPriority, ChatStatus, Prisma } from '@aluplan/database';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

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

        it('should reuse an existing ticket for the same AI interaction', async () => {
            const dto = {
                subject: 'License borrow',
                description: 'How do I borrow a license?',
                interactionId: '11111111-1111-4111-8111-111111111111',
            };
            const existingTicket = {
                id: 'tik1',
                ticketNumber: 'SUP-00001',
                userId: 'user1',
                subject: 'License borrow',
            };

            prisma.ticket.findFirst.mockResolvedValue(existingTicket);

            const result = await service.create(dto, 'user1');

            expect(result).toEqual({ ...existingTicket, alreadyCreated: true });
            expect(prisma.$queryRaw).not.toHaveBeenCalled();
            expect(prisma.ticket.create).not.toHaveBeenCalled();
            expect(prisma.aiInteraction.update).toHaveBeenCalledWith({
                where: { id: dto.interactionId },
                data: { ticketCreated: true },
            });
            expect(mockEventEmitter.emit).not.toHaveBeenCalledWith('ticket.created', expect.anything());
        });

        it('should recover from a duplicate AI interaction race by returning the existing ticket', async () => {
            const dto = {
                subject: 'License borrow',
                description: 'How do I borrow a license?',
                priority: TicketPriority.MEDIUM,
                interactionId: '11111111-1111-4111-8111-111111111111',
            };
            const existingTicket = {
                id: 'tik1',
                ticketNumber: 'SUP-00001',
                userId: 'user1',
                subject: 'License borrow',
            };

            prisma.ticket.findFirst
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(existingTicket);
            prisma.$queryRaw = jest.fn().mockResolvedValue([{ nextval: 2n }]);
            mockSlaService.calculateDeadlines.mockResolvedValue({
                slaResponseDue: new Date(),
                slaResolveDue: new Date(),
            });
            prisma.ticket.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError(
                'Unique constraint failed on the fields: (`interaction_id`)',
                {
                    code: 'P2002',
                    clientVersion: 'test',
                    meta: { target: ['interaction_id'] },
                },
            ));

            const result = await service.create(dto, 'user1');

            expect(result).toEqual({ ...existingTicket, alreadyCreated: true });
            expect(mockEventEmitter.emit).not.toHaveBeenCalledWith('ticket.created', expect.anything());
        });
    });

    describe('update live chat policy', () => {
        it('should reject customer live chat requests when creator is not VIP', async () => {
            prisma.ticket.findFirst.mockResolvedValue({
                id: 'tik1',
                userId: 'customer1',
                chatStatus: ChatStatus.NORMAL,
                creator: { customerProfile: { isVip: false } },
                messages: [],
                escalations: [],
            });

            await expect(service.update(
                'tik1',
                { chatStatus: ChatStatus.REQUESTED },
                { id: 'customer1', role: 'CUSTOMER' },
            )).rejects.toThrow(ForbiddenException);
            expect(prisma.ticket.update).not.toHaveBeenCalled();
        });

        it('should allow customer live chat requests when creator is VIP', async () => {
            const ticket = {
                id: 'tik1',
                userId: 'customer1',
                chatStatus: ChatStatus.NORMAL,
                creator: { customerProfile: { isVip: true } },
                messages: [],
                escalations: [],
            };
            prisma.ticket.findFirst.mockResolvedValue(ticket);
            prisma.ticket.update.mockResolvedValue({ ...ticket, chatStatus: ChatStatus.REQUESTED });

            const result = await service.update(
                'tik1',
                { chatStatus: ChatStatus.REQUESTED },
                { id: 'customer1', role: 'CUSTOMER' },
            );

            expect(result.chatStatus).toBe(ChatStatus.REQUESTED);
            expect(prisma.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'tik1' },
                data: expect.objectContaining({ chatStatus: ChatStatus.REQUESTED }),
            }));
        });

        it('should allow staff to start live chat regardless of VIP status', async () => {
            const ticket = {
                id: 'tik1',
                userId: 'customer1',
                chatStatus: ChatStatus.NORMAL,
                creator: { customerProfile: { isVip: false } },
                messages: [],
                escalations: [],
            };
            prisma.ticket.findFirst.mockResolvedValue(ticket);
            prisma.ticket.update.mockResolvedValue({ ...ticket, chatStatus: ChatStatus.LIVE });

            const result = await service.update(
                'tik1',
                { chatStatus: ChatStatus.LIVE },
                { id: 'agent1', role: 'AGENT' },
            );

            expect(result.chatStatus).toBe(ChatStatus.LIVE);
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

    describe('getAssignableAgents', () => {
        it('should list only agents eligible for the ticket department', async () => {
            prisma.ticket.findFirst.mockResolvedValue({ id: 'tik1', departmentId: 'dep1' });
            prisma.user.findMany.mockResolvedValue([
                { id: 'agent1', fullName: 'Agent One', email: 'agent@example.com' },
            ]);

            const result = await service.getAssignableAgents('tik1');

            expect(result).toHaveLength(1);
            expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    deletedAt: null,
                    status: 'ACTIVE',
                    teamMembers: {
                        some: {
                            team: expect.objectContaining({
                                departmentId: 'dep1',
                                isArchived: false,
                                deletedAt: null,
                            }),
                        },
                    },
                }),
            }));
        });

        it('should throw NotFoundException when ticket does not exist', async () => {
            prisma.ticket.findFirst.mockResolvedValue(null);

            await expect(service.getAssignableAgents('missing')).rejects.toThrow(NotFoundException);
            expect(prisma.user.findMany).not.toHaveBeenCalled();
        });
    });

    describe('assign', () => {
        it('should assign a ticket to an agent', async () => {
            // Arrange
            const ticket = { id: 'tik1', status: 'NEW', ticketNumber: 'SUP-00001' };
            const updatedTicket = { ...ticket, assignedTo: 'agent1', status: 'OPEN' };

            prisma.ticket.findFirst.mockResolvedValue(ticket);
            prisma.user.findFirst.mockResolvedValue({ id: 'agent1' });
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

            it('should sanitize allowed rich text HTML before saving', async () => {
                const ticket = { id: 'tik1', status: 'OPEN', userId: 'user1' };
                prisma.ticket.findFirst.mockResolvedValue(ticket);
                prisma.ticketMessage.create.mockResolvedValue({ id: 'msg1' });

                await service.addMessage('tik1', {
                    message: '<p onclick="alert(1)">Hello <strong>team</strong><script>alert(1)</script></p>',
                    contentFormat: 'HTML',
                } as any, 'user1', 'customer');

                expect(prisma.ticketMessage.create).toHaveBeenCalledWith(expect.objectContaining({
                    data: expect.objectContaining({
                        message: '<p>Hello <strong>team</strong></p>',
                    }),
                }));
            });

            it('should reject rich text messages that become empty after sanitization', async () => {
                const ticket = { id: 'tik1', status: 'OPEN', userId: 'user1' };
                prisma.ticket.findFirst.mockResolvedValue(ticket);

                await expect(service.addMessage('tik1', {
                    message: '<script>alert(1)</script>',
                    contentFormat: 'HTML',
                } as any, 'user1', 'customer')).rejects.toThrow(BadRequestException);
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

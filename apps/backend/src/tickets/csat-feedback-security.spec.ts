import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { SlaService } from './sla.service';
import { PiiMaskingService } from '../common/services/pii-masking.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AiQueryService } from '../ai/ai-query.service';
import { RedisService } from '../redis/redis.service';
import { TicketAccessService } from '../common/services/ticket-access.service';
import { MaintenanceWorkService } from '../common/services/maintenance-work.service';
import { TicketStatus, Prisma } from '@aluplan/database';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';

describe('SEC-01: CSAT Feedback Security & Ownership', () => {
    let service: TicketsService;
    let controller: TicketsController;
    let prisma: any;
    let eventEmitter: any;
    let notificationsGateway: any;

    const mockPrisma = {
        ticket: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
        },
        $transaction: jest.fn((cb: any) => cb(mockPrisma)),
    };

    const mockSlaService = {
        calculateDeadlines: jest.fn(),
        recalculateOnEscalation: jest.fn(),
    };

    const mockPiiMaskingService = {
        maskSensitiveData: jest.fn((str) => str),
    };

    const mockEventEmitter = {
        emitAsync: jest.fn().mockResolvedValue([]),
        emit: jest.fn(),
    };

    const mockAiQueryService = {
        smartTagTicket: jest.fn(),
    };

    const mockRedisService = {
        get: jest.fn(),
        set: jest.fn(),
    };

    const mockTicketAccessService = {
        canAccessTicket: jest.fn().mockResolvedValue(true),
        canManageTicket: jest.fn().mockResolvedValue(true),
    };

    const mockNotificationsGateway = {
        emitTicketUpdated: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TicketsController],
            providers: [
                TicketsService,
                MaintenanceWorkService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: SlaService, useValue: mockSlaService },
                { provide: PiiMaskingService, useValue: mockPiiMaskingService },
                { provide: EventEmitter2, useValue: mockEventEmitter },
                { provide: AiQueryService, useValue: mockAiQueryService },
                { provide: RedisService, useValue: mockRedisService },
                { provide: TicketAccessService, useValue: mockTicketAccessService },
                { provide: NotificationsGateway, useValue: mockNotificationsGateway },
            ],
        }).compile();

        service = module.get<TicketsService>(TicketsService);
        controller = module.get<TicketsController>(TicketsController);
        prisma = module.get<PrismaService>(PrismaService);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
        notificationsGateway = module.get<NotificationsGateway>(NotificationsGateway);

        jest.clearAllMocks();
    });

    describe('Service: submitFeedback ownership and status gates', () => {
        const validTicketId = 'ticket-uuid-1';
        const ownerUserId = 'customer-uuid-1';
        const otherUserId = 'other-customer-uuid-2';
        const adminUserId = 'admin-uuid-9';

        it('should succeed when the genuine ticket owner submits feedback for a RESOLVED ticket using atomic scalar update', async () => {
            const ticket = {
                id: validTicketId,
                ticketNumber: 'SUP-00100',
                userId: ownerUserId,
                status: TicketStatus.RESOLVED,
                deletedAt: null,
            };

            prisma.ticket.findFirst.mockResolvedValue(ticket);

            // Scalar ticket return without relations
            const scalarUpdatedTicket = {
                id: validTicketId,
                ticketNumber: 'SUP-00100',
                userId: ownerUserId,
                status: TicketStatus.CLOSED,
                satisfactionScore: 5,
                satisfactionComment: 'Mükemmel destek, teşekkürler',
                closedAt: new Date(),
            };
            prisma.ticket.update.mockResolvedValue(scalarUpdatedTicket);

            const result = await service.submitFeedback(validTicketId, 5, 'Mükemmel destek, teşekkürler', ownerUserId);

            expect(result.status).toBe(TicketStatus.CLOSED);
            expect(result.satisfactionScore).toBe(5);
            expect(prisma.ticket.update).toHaveBeenCalledWith({
                where: {
                    id: validTicketId,
                    userId: ownerUserId,
                    deletedAt: null,
                    status: { in: [TicketStatus.PENDING_CUSTOMER_REVIEW, TicketStatus.RESOLVED] },
                },
                data: {
                    satisfactionScore: 5,
                    satisfactionComment: 'Mükemmel destek, teşekkürler',
                    status: TicketStatus.CLOSED,
                    closedAt: expect.any(Date),
                },
            });
            // Score >= 4 triggers self-learning KB summarize
            expect(eventEmitter.emit).toHaveBeenCalledWith('ticket.kb_summarize', scalarUpdatedTicket);
        });

        it('should succeed when owner submits score 3 for PENDING_CUSTOMER_REVIEW ticket without emitting kb_summarize', async () => {
            const ticket = {
                id: validTicketId,
                ticketNumber: 'SUP-00101',
                userId: ownerUserId,
                status: TicketStatus.PENDING_CUSTOMER_REVIEW,
                deletedAt: null,
            };

            prisma.ticket.findFirst.mockResolvedValue(ticket);

            const scalarUpdatedTicket = {
                id: validTicketId,
                ticketNumber: 'SUP-00101',
                userId: ownerUserId,
                status: TicketStatus.CLOSED,
                satisfactionScore: 3,
                satisfactionComment: null,
                closedAt: new Date(),
            };
            prisma.ticket.update.mockResolvedValue(scalarUpdatedTicket);

            const result = await service.submitFeedback(validTicketId, 3, undefined, ownerUserId);

            expect(result.status).toBe(TicketStatus.CLOSED);
            expect(result.satisfactionScore).toBe(3);
            // Score < 4 must NOT trigger kb_summarize
            expect(eventEmitter.emit).not.toHaveBeenCalledWith('ticket.kb_summarize', expect.anything());
        });

        it('should REJECT with ForbiddenException when a different user tries to submit feedback for another user ticket', async () => {
            const ticket = {
                id: validTicketId,
                ticketNumber: 'SUP-00102',
                userId: ownerUserId,
                status: TicketStatus.RESOLVED,
                deletedAt: null,
            };

            prisma.ticket.findFirst.mockResolvedValue(ticket);

            await expect(
                service.submitFeedback(validTicketId, 5, 'Attacking', otherUserId)
            ).rejects.toThrow(ForbiddenException);

            expect(prisma.ticket.update).not.toHaveBeenCalled();
            expect(eventEmitter.emit).not.toHaveBeenCalled();
        });

        it('should REJECT with ForbiddenException even when staff/admin tries to submit feedback on behalf of customer', async () => {
            const ticket = {
                id: validTicketId,
                ticketNumber: 'SUP-00103',
                userId: ownerUserId,
                status: TicketStatus.RESOLVED,
                deletedAt: null,
            };

            prisma.ticket.findFirst.mockResolvedValue(ticket);

            await expect(
                service.submitFeedback(validTicketId, 5, 'Admin on behalf of customer', adminUserId)
            ).rejects.toThrow(ForbiddenException);

            expect(prisma.ticket.update).not.toHaveBeenCalled();
            expect(eventEmitter.emit).not.toHaveBeenCalled();
        });

        it('should REJECT with UnauthorizedException when actorUserId is missing or empty', async () => {
            await expect(
                service.submitFeedback(validTicketId, 5, 'No actor', '')
            ).rejects.toThrow(UnauthorizedException);

            await expect(
                service.submitFeedback(validTicketId, 5, 'No actor', undefined as any)
            ).rejects.toThrow(UnauthorizedException);

            expect(prisma.ticket.findFirst).not.toHaveBeenCalled();
            expect(prisma.ticket.update).not.toHaveBeenCalled();
            expect(eventEmitter.emit).not.toHaveBeenCalled();
        });

        it('should REJECT with ForbiddenException when ticket has null/undefined userId', async () => {
            const ticket = {
                id: validTicketId,
                ticketNumber: 'SUP-00104',
                userId: null,
                status: TicketStatus.RESOLVED,
                deletedAt: null,
            };

            prisma.ticket.findFirst.mockResolvedValue(ticket);

            await expect(
                service.submitFeedback(validTicketId, 5, 'Orphan ticket', ownerUserId)
            ).rejects.toThrow(ForbiddenException);

            expect(prisma.ticket.update).not.toHaveBeenCalled();
            expect(eventEmitter.emit).not.toHaveBeenCalled();
        });

        it('should REJECT with NotFoundException when ticket is soft-deleted', async () => {
            prisma.ticket.findFirst.mockResolvedValue(null);

            await expect(
                service.submitFeedback(validTicketId, 5, 'Soft-deleted ticket', ownerUserId)
            ).rejects.toThrow(NotFoundException);

            expect(prisma.ticket.update).not.toHaveBeenCalled();
            expect(eventEmitter.emit).not.toHaveBeenCalled();
        });

        it('should REJECT with NotFoundException when ticket does not exist', async () => {
            prisma.ticket.findFirst.mockResolvedValue(null);

            await expect(
                service.submitFeedback('non-existent-uuid', 5, 'Ghost ticket', ownerUserId)
            ).rejects.toThrow(NotFoundException);

            expect(prisma.ticket.update).not.toHaveBeenCalled();
            expect(eventEmitter.emit).not.toHaveBeenCalled();
        });

        it('should REJECT with BadRequestException when ticket status is ineligible (e.g. OPEN or CLOSED)', async () => {
            const openTicket = {
                id: validTicketId,
                ticketNumber: 'SUP-00105',
                userId: ownerUserId,
                status: TicketStatus.OPEN,
                deletedAt: null,
            };

            prisma.ticket.findFirst.mockResolvedValue(openTicket);

            await expect(
                service.submitFeedback(validTicketId, 5, 'Still open', ownerUserId)
            ).rejects.toThrow(BadRequestException);

            const closedTicket = {
                ...openTicket,
                status: TicketStatus.CLOSED,
            };
            prisma.ticket.findFirst.mockResolvedValue(closedTicket);

            await expect(
                service.submitFeedback(validTicketId, 5, 'Already closed', ownerUserId)
            ).rejects.toThrow(BadRequestException);

            expect(prisma.ticket.update).not.toHaveBeenCalled();
            expect(eventEmitter.emit).not.toHaveBeenCalled();
        });

        it('should handle P2025 race/ineligibility error and rethrow as BadRequestException', async () => {
            const ticket = {
                id: validTicketId,
                ticketNumber: 'SUP-00106',
                userId: ownerUserId,
                status: TicketStatus.RESOLVED,
                deletedAt: null,
            };

            prisma.ticket.findFirst.mockResolvedValue(ticket);

            // First call succeeds
            const scalarUpdated = {
                ...ticket,
                status: TicketStatus.CLOSED,
                satisfactionScore: 5,
            };
            prisma.ticket.update.mockResolvedValueOnce(scalarUpdated);

            const firstResult = await service.submitFeedback(validTicketId, 5, 'First submit', ownerUserId);
            expect(firstResult.status).toBe(TicketStatus.CLOSED);
            expect(eventEmitter.emit).toHaveBeenCalledTimes(1);

            // Second concurrent call throws Prisma P2025 because ticket status is already CLOSED
            prisma.ticket.update.mockRejectedValueOnce(
                new Prisma.PrismaClientKnownRequestError(
                    'An operation failed because it depends on one or more records that were required but not found.',
                    {
                        code: 'P2025',
                        clientVersion: '7.4.2',
                    }
                )
            );

            await expect(
                service.submitFeedback(validTicketId, 5, 'Replay submit', ownerUserId)
            ).rejects.toThrow(BadRequestException);

            // eventEmitter must NOT be called again (still 1 call)
            expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        });

        it('should NOT catch other database errors as BadRequestException and rethrow them', async () => {
            const ticket = {
                id: validTicketId,
                ticketNumber: 'SUP-00107',
                userId: ownerUserId,
                status: TicketStatus.RESOLVED,
                deletedAt: null,
            };

            prisma.ticket.findFirst.mockResolvedValue(ticket);

            const unexpectedDbError = new Error('Database connection terminated unexpectedly');
            prisma.ticket.update.mockRejectedValueOnce(unexpectedDbError);

            await expect(
                service.submitFeedback(validTicketId, 5, 'DB error test', ownerUserId)
            ).rejects.toThrow('Database connection terminated unexpectedly');

            expect(eventEmitter.emit).not.toHaveBeenCalled();
        });
    });

    describe('Privacy & Payload Contract: No internal notes or relations leaked', () => {
        const validTicketId = 'ticket-uuid-privacy-1';
        const ownerUserId = 'customer-uuid-privacy-1';

        it('should never include messages, internal notes, escalations, or attachments in returned scalar ticket or events', async () => {
            const ticket = {
                id: validTicketId,
                ticketNumber: 'SUP-00200',
                userId: ownerUserId,
                status: TicketStatus.RESOLVED,
                deletedAt: null,
            };
            prisma.ticket.findFirst.mockResolvedValue(ticket);

            // Pure scalar ticket return as produced by Prisma update without include
            const scalarTicket = {
                id: validTicketId,
                ticketNumber: 'SUP-00200',
                userId: ownerUserId,
                status: TicketStatus.CLOSED,
                satisfactionScore: 5,
                satisfactionComment: 'Çok teşekkürler',
                closedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            prisma.ticket.update.mockResolvedValue(scalarTicket);

            const serviceResult = await service.submitFeedback(validTicketId, 5, 'Çok teşekkürler', ownerUserId);

            // Verify update was called WITHOUT include or select
            const updateArgs = prisma.ticket.update.mock.calls[0][0];
            expect(updateArgs.include).toBeUndefined();
            expect(updateArgs.select).toBeUndefined();

            // Verify serviceResult has NO relations or internal notes
            expect(serviceResult).not.toHaveProperty('messages');
            expect(serviceResult).not.toHaveProperty('internalNotes');
            expect(serviceResult).not.toHaveProperty('attachments');
            expect(serviceResult).not.toHaveProperty('escalations');
            expect(serviceResult).not.toHaveProperty('creator');
            expect(serviceResult).not.toHaveProperty('assignee');

            // Controller layer verification
            const dto: SubmitFeedbackDto = { score: 5, comment: 'Çok teşekkürler' };
            const req = { user: { sub: ownerUserId, role: 'CUSTOMER' } };

            const controllerResult = await controller.submitFeedback(validTicketId, dto, req);

            // Controller response must NOT contain relations
            expect(controllerResult).not.toHaveProperty('messages');
            expect(controllerResult).not.toHaveProperty('internalNotes');
            expect(controllerResult).not.toHaveProperty('attachments');
            expect(controllerResult).not.toHaveProperty('escalations');
            expect(controllerResult).not.toHaveProperty('creator');
            expect(controllerResult).not.toHaveProperty('assignee');

            // Socket broadcast MUST NOT carry messages or internal notes
            expect(notificationsGateway.emitTicketUpdated).toHaveBeenCalledTimes(1);
            const socketPayload = notificationsGateway.emitTicketUpdated.mock.calls[0][0];
            expect(socketPayload).not.toHaveProperty('messages');
            expect(socketPayload).not.toHaveProperty('internalNotes');
            expect(socketPayload).not.toHaveProperty('attachments');
            expect(socketPayload).not.toHaveProperty('escalations');
            expect(socketPayload).not.toHaveProperty('creator');
            expect(socketPayload).not.toHaveProperty('assignee');

            // KB summarize event MUST NOT carry messages or internal notes
            expect(eventEmitter.emit).toHaveBeenCalledWith('ticket.kb_summarize', expect.anything());
            const kbCall = eventEmitter.emit.mock.calls.find((call: any[]) => call[0] === 'ticket.kb_summarize');
            const kbPayload = kbCall[1];
            expect(kbPayload).not.toHaveProperty('messages');
            expect(kbPayload).not.toHaveProperty('internalNotes');
            expect(kbPayload).not.toHaveProperty('attachments');
            expect(kbPayload).not.toHaveProperty('escalations');
            expect(kbPayload).not.toHaveProperty('creator');
            expect(kbPayload).not.toHaveProperty('assignee');
        });
    });

    describe('Controller: submitFeedback delegation and actor isolation', () => {
        it('should extract actor from req.user.sub and pass to service', async () => {
            const dto: SubmitFeedbackDto = { score: 5, comment: 'Great' };
            const req = { user: { sub: 'customer-1', role: 'CUSTOMER' } };
            const updated = { id: 'tik-1', status: TicketStatus.CLOSED, satisfactionScore: 5 };

            jest.spyOn(service, 'submitFeedback').mockResolvedValue(updated as any);

            const result = await controller.submitFeedback('tik-1', dto, req);

            expect(service.submitFeedback).toHaveBeenCalledWith('tik-1', 5, 'Great', 'customer-1');
            expect(notificationsGateway.emitTicketUpdated).toHaveBeenCalledWith(updated);
            expect(result).toEqual(updated);
        });

        it('should NOT emit socket notification if service throws ForbiddenException', async () => {
            const dto: SubmitFeedbackDto = { score: 5 };
            const req = { user: { sub: 'attacker-2', role: 'CUSTOMER' } };

            jest.spyOn(service, 'submitFeedback').mockRejectedValue(new ForbiddenException());

            await expect(controller.submitFeedback('tik-1', dto, req)).rejects.toThrow(ForbiddenException);

            expect(notificationsGateway.emitTicketUpdated).not.toHaveBeenCalled();
        });
    });
});

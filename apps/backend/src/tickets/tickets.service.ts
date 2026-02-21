import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SlaService } from './sla.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { EscalateTicketDto } from './dto/escalate-ticket.dto';
import { BulkUpdateTicketDto } from './dto/bulk-update-ticket.dto';
import { TicketStatus, TicketPriority, Prisma, CommunicationChannel } from '@aluplan/database';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AiQueryService } from '../ai/ai-query.service';

const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
    NEW: [TicketStatus.OPEN],
    OPEN: [TicketStatus.IN_PROGRESS, TicketStatus.PENDING_CUSTOMER, TicketStatus.RESOLVED, TicketStatus.PENDING_CUSTOMER_REVIEW],
    IN_PROGRESS: [TicketStatus.PENDING_CUSTOMER, TicketStatus.RESOLVED, TicketStatus.PENDING_CUSTOMER_REVIEW],
    PENDING_CUSTOMER: [TicketStatus.OPEN, TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.PENDING_CUSTOMER_REVIEW],
    PENDING_CUSTOMER_REVIEW: [TicketStatus.RESOLVED, TicketStatus.OPEN], // Review to final resolved or back to open
    RESOLVED: [TicketStatus.CLOSED, TicketStatus.OPEN], // Reopen on customer reply
    CLOSED: [],
};

@Injectable()
export class TicketsService {
    private readonly logger = new Logger(TicketsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly slaService: SlaService,
        private readonly eventEmitter: EventEmitter2,
        private readonly aiQueryService: AiQueryService,
    ) { }

    // =============================================
    // TICKET NUMBER GENERATOR — SUP-00001 format
    // =============================================
    private async generateTicketNumber(): Promise<string> {
        // Atomic counter using PostgreSQL sequence via raw query
        const result = await this.prisma.$queryRaw<[{ nextval: bigint }]>`
      SELECT nextval('ticket_number_seq')
    `;
        const seq = Number(result[0].nextval);
        return `SUP-${seq.toString().padStart(5, '0')}`;
    }

    // =============================================
    // CREATE
    // =============================================
    async create(dto: CreateTicketDto, createdByUserId: string) {
        const priority = dto.priority ?? TicketPriority.MEDIUM;
        const [ticketNumber, slaDeadlines] = await Promise.all([
            this.generateTicketNumber(),
            this.slaService.calculateDeadlines(priority),
        ]);

        const ticket = await this.prisma.ticket.create({
            data: {
                ticketNumber,
                subject: dto.subject,
                description: dto.description,
                priority,
                status: TicketStatus.NEW,
                tags: dto.tags ?? [],
                userId: createdByUserId,
                interactionId: dto.interactionId,
                productId: dto.productId,
                hotinfoSnapshot: dto.hotinfoContext || undefined,
                slaResponseDue: slaDeadlines.slaResponseDue,
                slaResolveDue: slaDeadlines.slaResolveDue,
                channel: dto.channel || 'WEB',
            },
            include: { creator: { select: { id: true, fullName: true, email: true } } },
        });

        this.logger.log(`🎫 Created ticket ${ticket.ticketNumber} (${priority})`);

        // Option A + C Logic: If the user provided a productId, do auto-tagging
        if (dto.productId) {
            // we run this async so that the frontend feels "zero friction" fast response
            this.runAutoTaggingAsync(ticket.id, dto.productId, `${dto.subject}\n\n${dto.description || ''}`, dto.hotinfoContext);
        }

        // Emit event for Autonomous Resolution Engine
        this.eventEmitter.emit('ticket.created', ticket);

        return ticket;
    }

    private async runAutoTaggingAsync(ticketId: string, productId: string, text: string, hotinfoContext?: any) {
        try {
            const aiTags = await this.aiQueryService.smartTagTicket(productId, text, hotinfoContext);
            if (aiTags.tags.length > 0) {
                await this.prisma.ticket.update({
                    where: { id: ticketId },
                    data: { suggestedCategories: aiTags.tags }
                });
                this.logger.log(`🤖 Auto-tagged ticket ${ticketId} with categories: ${aiTags.tags.join(', ')}`);
            }
        } catch (error) {
            this.logger.error(`❌ Auto-tagging failed for ticket ${ticketId}`, error.stack);
        }
    }

    // =============================================
    // FIND ALL (with filters)
    // =============================================
    async findAll(params: {
        status?: TicketStatus;
        priority?: TicketPriority;
        assignedTo?: string;
        userId?: string; // Filter by creator
        isSlaBreached?: boolean;
        page?: number;
        limit?: number;
    }) {
        const { status, priority, assignedTo, userId, isSlaBreached, page = 1, limit = 20 } = params;
        const where: Prisma.TicketWhereInput = {
            ...(status && { status }),
            ...(priority && { priority }),
            ...(assignedTo && { assignedTo }),
            ...(userId && { userId }),
            ...(isSlaBreached !== undefined && { isSlaBreached }),
        };

        const [data, total] = await Promise.all([
            this.prisma.ticket.findMany({
                where,
                include: {
                    creator: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
                    assignee: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
                    _count: { select: { messages: true } },
                },
                orderBy: [{ isSlaBreached: 'desc' }, { priority: 'desc' }, { createdAt: 'desc' }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.ticket.count({ where }),
        ]);

        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }

    // =============================================
    // FIND ONE
    // =============================================
    async findOne(id: string, requester?: { id: string; role: string }) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
            include: {
                creator: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
                assignee: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
                messages: {
                    where: requester?.role === 'customer' ? { isInternal: false } : {},
                    include: {
                        sender: { select: { id: true, fullName: true, avatarUrl: true } },
                        attachments: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
                escalations: {
                    include: { escalator: { select: { id: true, fullName: true } } },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!ticket) throw new NotFoundException(`Ticket not found`);

        // ownership check for customers
        if (requester?.role === 'customer' && ticket.userId !== requester.id) {
            throw new ForbiddenException('You do not have access to this ticket');
        }

        return ticket;
    }

    async findByNumber(ticketNumber: string, requester?: { id: string; role: string }) {
        const ticket = await this.prisma.ticket.findUnique({ where: { ticketNumber } });
        if (!ticket) throw new NotFoundException(`Ticket ${ticketNumber} not found`);
        return this.findOne(ticket.id, requester);
    }

    // =============================================
    // UPDATE
    // =============================================
    async update(id: string, dto: UpdateTicketDto, actorId: string) {
        await this.findOne(id); // throws if not found

        let slaUpdate = {};
        if (dto.priority) {
            const deadlines = await this.slaService.calculateDeadlines(dto.priority);
            slaUpdate = {
                slaResponseDue: deadlines.slaResponseDue,
                slaResolveDue: deadlines.slaResolveDue,
                isSlaBreached: false,
            };
        }

        return this.prisma.ticket.update({
            where: { id },
            data: {
                ...dto,
                ...slaUpdate,
            },
        });
    }

    // =============================================
    // STATE MACHINE — TRANSITION
    // =============================================
    async transition(id: string, toStatus: TicketStatus, actorId: string) {
        const ticket = await this.findOne(id);
        const allowed = ALLOWED_TRANSITIONS[ticket.status];

        if (!allowed.includes(toStatus)) {
            throw new BadRequestException(
                `Cannot transition from ${ticket.status} to ${toStatus}. Allowed: ${allowed.join(', ')}`,
            );
        }

        const updateData: Prisma.TicketUpdateInput = { status: toStatus };

        // Track first response time (for SLA response metric)
        if (
            toStatus === TicketStatus.IN_PROGRESS &&
            !ticket.slaRespondedAt
        ) {
            updateData.slaRespondedAt = new Date();
        }

        if (toStatus === TicketStatus.RESOLVED) {
            updateData.resolvedAt = new Date();
            updateData.slaSolvedAt = new Date();
        }

        if (toStatus === TicketStatus.CLOSED) {
            updateData.closedAt = new Date();
        }

        const updated = await this.prisma.ticket.update({ where: { id }, data: updateData });

        this.logger.log(
            `🔄 Ticket ${ticket.ticketNumber}: ${ticket.status} → ${toStatus} by ${actorId}`,
        );

        return updated;
    }

    // =============================================
    // ASSIGN
    // =============================================
    async assign(id: string, assigneeId: string, actorId: string) {
        const ticket = await this.findOne(id);
        if (ticket.status === TicketStatus.CLOSED) {
            throw new BadRequestException('Cannot assign a closed ticket');
        }

        const updated = await this.prisma.ticket.update({
            where: { id },
            data: {
                assignedTo: assigneeId,
                status: ticket.status === TicketStatus.NEW ? TicketStatus.OPEN : ticket.status,
                // Mark response time if not yet set
                slaRespondedAt: ticket.slaRespondedAt ?? new Date(),
            },
        });

        this.logger.log(`📌 Ticket ${ticket.ticketNumber} assigned to ${assigneeId}`);
        return updated;
    }

    // =============================================
    // SLA STATS
    // =============================================
    async getSlaStats() {
        const [total, breached, nearing] = await Promise.all([
            this.prisma.ticket.count({ where: { status: { notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED] } } }),
            this.prisma.ticket.count({ where: { isSlaBreached: true, status: { notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED] } } }),
            this.prisma.ticket.count({
                where: {
                    isSlaBreached: false,
                    status: { notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED] },
                    slaResponseDue: { lt: new Date(Date.now() + 60 * 60 * 1000) }, // next hour
                },
            }),
        ]);

        return { total, breached, nearing };
    }

    // =============================================
    // ESCALATE
    // =============================================
    async escalate(id: string, dto: EscalateTicketDto, actorId: string) {
        const ticket = await this.findOne(id);

        if (ticket.status === TicketStatus.CLOSED || ticket.status === TicketStatus.RESOLVED) {
            throw new BadRequestException('Cannot escalate a closed or resolved ticket');
        }

        // Recalculate SLA based on new priority
        const newDeadlines = await this.slaService.recalculateOnEscalation(id, dto.toPriority);

        const [updated] = await this.prisma.$transaction([
            this.prisma.ticket.update({
                where: { id },
                data: {
                    priority: dto.toPriority,
                    escalated: true,
                    escalationCount: { increment: 1 },
                    slaResponseDue: newDeadlines.slaResponseDue,
                    slaResolveDue: newDeadlines.slaResolveDue,
                    isSlaBreached: false, // Reset after escalation
                },
            }),
            this.prisma.ticketEscalation.create({
                data: {
                    ticketId: id,
                    escalatedBy: actorId,
                    fromPriority: ticket.priority,
                    toPriority: dto.toPriority,
                    reason: dto.reason,
                },
            }),
        ]);

        this.logger.warn(
            `⚠️ Ticket ${ticket.ticketNumber} escalated: ${ticket.priority} → ${dto.toPriority}`,
        );

        return updated;
    }

    // =============================================
    // ADD MESSAGE
    // =============================================
    async addMessage(ticketId: string, dto: AddMessageDto, senderId: string, role: string) {
        const ticket = await this.findOne(ticketId, { id: senderId, role }); // ownership check happens here

        if (ticket.status === TicketStatus.CLOSED) {
            throw new BadRequestException('Cannot add message to a closed ticket');
        }

        const message = await this.prisma.ticketMessage.create({
            data: {
                ticketId,
                senderId,
                message: dto.message,
                isInternal: dto.isInternal ?? false,
                channel: dto.channel || 'WEB',
            },
            include: { sender: { select: { id: true, fullName: true, avatarUrl: true } } },
        });

        // If ticket was PENDING_CUSTOMER and a customer replied → reopen
        if (ticket.status === TicketStatus.PENDING_CUSTOMER && ticket.userId === senderId) {
            await this.prisma.ticket.update({
                where: { id: ticketId },
                data: { status: TicketStatus.OPEN },
            });
        }

        // Mark first response if agent replied for the first time
        if (ticket.userId !== senderId && !ticket.slaRespondedAt) {
            await this.prisma.ticket.update({
                where: { id: ticketId },
                data: { slaRespondedAt: new Date() },
            });
        }

        this.eventEmitter.emit('ticket.message_added', { ticket, message });

        return message;
    }

    // =============================================
    // SUBMIT FEEDBACK (Self-Learning KB Trigger)
    // =============================================
    async submitFeedback(id: string, score: number, comment?: string, customerId?: string) {
        const ticket = await this.findOne(id);

        if (ticket.status !== TicketStatus.PENDING_CUSTOMER_REVIEW && ticket.status !== TicketStatus.RESOLVED) {
            throw new BadRequestException('Feedback can only be submitted for tickets pending review or recently resolved.');
        }

        const updated = await this.prisma.ticket.update({
            where: { id },
            data: {
                satisfactionScore: score,
                satisfactionComment: comment,
                status: TicketStatus.CLOSED, // Auto-close upon feedback
                closedAt: new Date()
            }
        });

        this.logger.log(`⭐ Ticket ${ticket.ticketNumber} received feedback: ${score}/5`);

        // Option C Core: If it's a solved issue and the user agrees (score 4 or 5)
        if (score >= 4) {
            this.eventEmitter.emit('ticket.kb_summarize', updated);
        }

        return updated;
    }

    // =============================================
    // BULK UPDATE
    // =============================================
    async bulkUpdate(dto: BulkUpdateTicketDto, actorId: string) {
        const { ticketIds, status, priority, assignedTo } = dto;

        const updateData: Prisma.TicketUpdateInput = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (assignedTo) updateData.assignee = { connect: { id: assignedTo } };

        // If priority changes, we must recalculate SLAs individually
        if (priority) {
            await this.prisma.$transaction(async (tx) => {
                for (const id of ticketIds) {
                    const deadlines = await this.slaService.calculateDeadlines(priority);
                    await tx.ticket.update({
                        where: { id },
                        data: {
                            ...updateData,
                            slaResponseDue: deadlines.slaResponseDue,
                            slaResolveDue: deadlines.slaResolveDue,
                            isSlaBreached: false,
                        },
                    });
                }
            });
            return { count: ticketIds.length };
        }

        const result = await this.prisma.ticket.updateMany({
            where: { id: { in: ticketIds } },
            data: updateData,
        });

        this.logger.log(`🎫 Bulk updated ${result.count} tickets (Agent: ${actorId})`);
        return result;
    }
}

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
import { TicketStatus, TicketPriority, Prisma } from '@aluplan/database';

// =============================================
// State Machine — allowed transitions
// =============================================
const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
    NEW: [TicketStatus.OPEN],
    OPEN: [TicketStatus.IN_PROGRESS, TicketStatus.PENDING_CUSTOMER, TicketStatus.RESOLVED],
    IN_PROGRESS: [TicketStatus.PENDING_CUSTOMER, TicketStatus.RESOLVED],
    PENDING_CUSTOMER: [TicketStatus.OPEN, TicketStatus.RESOLVED, TicketStatus.CLOSED],
    RESOLVED: [TicketStatus.CLOSED, TicketStatus.OPEN], // Reopen on customer reply
    CLOSED: [],
};

@Injectable()
export class TicketsService {
    private readonly logger = new Logger(TicketsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly slaService: SlaService,
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
                slaResponseDue: slaDeadlines.slaResponseDue,
                slaResolveDue: slaDeadlines.slaResolveDue,
            },
            include: { creator: { select: { id: true, fullName: true, email: true } } },
        });

        this.logger.log(`🎫 Created ticket ${ticket.ticketNumber} (${priority})`);
        return ticket;
    }

    // =============================================
    // FIND ALL (with filters)
    // =============================================
    async findAll(params: {
        status?: TicketStatus;
        priority?: TicketPriority;
        assignedTo?: string;
        isSlaBreached?: boolean;
        page?: number;
        limit?: number;
    }) {
        const { status, priority, assignedTo, isSlaBreached, page = 1, limit = 20 } = params;
        const where: Prisma.TicketWhereInput = {
            ...(status && { status }),
            ...(priority && { priority }),
            ...(assignedTo && { assignedTo }),
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
    async findOne(id: string) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
            include: {
                creator: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
                assignee: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
                messages: {
                    include: { sender: { select: { id: true, fullName: true, avatarUrl: true } } },
                    orderBy: { createdAt: 'asc' },
                },
                escalations: {
                    include: { escalator: { select: { id: true, fullName: true } } },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!ticket) throw new NotFoundException(`Ticket not found`);
        return ticket;
    }

    async findByNumber(ticketNumber: string) {
        const ticket = await this.prisma.ticket.findUnique({ where: { ticketNumber } });
        if (!ticket) throw new NotFoundException(`Ticket ${ticketNumber} not found`);
        return this.findOne(ticket.id);
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
    async addMessage(ticketId: string, dto: AddMessageDto, senderId: string) {
        const ticket = await this.findOne(ticketId);

        if (ticket.status === TicketStatus.CLOSED) {
            throw new BadRequestException('Cannot add message to a closed ticket');
        }

        const message = await this.prisma.ticketMessage.create({
            data: {
                ticketId,
                senderId,
                message: dto.message,
                isInternal: dto.isInternal ?? false,
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

        return message;
    }

    // =============================================
    // SLA STATS (for dashboard)
    // =============================================
    async getSlaStats() {
        const [total, breached, byPriority] = await Promise.all([
            this.prisma.ticket.count({ where: { status: { notIn: [TicketStatus.CLOSED] } } }),
            this.prisma.ticket.count({ where: { isSlaBreached: true } }),
            this.prisma.ticket.groupBy({
                by: ['priority'],
                where: { status: { notIn: [TicketStatus.CLOSED] } },
                _count: true,
            }),
        ]);

        return { total, breached, byPriority };
    }
}

import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import { SlaService } from './sla.service';
import { PiiMaskingService } from '../common/services/pii-masking.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { EscalateTicketDto } from './dto/escalate-ticket.dto';
import { BulkUpdateTicketDto } from './dto/bulk-update-ticket.dto';
import { TicketStatus, TicketPriority, ChatStatus, Prisma } from '@aluplan/database';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AiQueryService } from '../ai/ai-query.service';
import { MessageContentFormat } from './dto/add-message.dto';
import { isRichTextEffectivelyEmpty, sanitizeRichTextHtml } from '../common/utils/rich-text-sanitizer';

const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
    NEW: [TicketStatus.OPEN, TicketStatus.DRAFT, TicketStatus.PENDING_CUSTOMER_REVIEW],
    OPEN: [TicketStatus.IN_PROGRESS, TicketStatus.PENDING_CUSTOMER, TicketStatus.RESOLVED, TicketStatus.PENDING_CUSTOMER_REVIEW],
    IN_PROGRESS: [TicketStatus.PENDING_CUSTOMER, TicketStatus.RESOLVED, TicketStatus.PENDING_CUSTOMER_REVIEW],
    PENDING_CUSTOMER: [TicketStatus.OPEN, TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.PENDING_CUSTOMER_REVIEW],
    PENDING_CUSTOMER_REVIEW: [TicketStatus.RESOLVED, TicketStatus.OPEN], // Review to final resolved or back to open
    RESOLVED: [TicketStatus.CLOSED, TicketStatus.OPEN], // Reopen on customer reply
    CLOSED: [],
    DRAFT: [TicketStatus.OPEN, TicketStatus.RESOLVED, TicketStatus.PENDING_CUSTOMER, TicketStatus.CLOSED],
};

@Injectable()
export class TicketsService {
    private readonly logger = new Logger(TicketsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly slaService: SlaService,
        private readonly piiMaskingService: PiiMaskingService,
        private readonly eventEmitter: EventEmitter2,
        @Inject(forwardRef(() => AiQueryService))
        private readonly aiQueryService: AiQueryService,
        private readonly redis: RedisService,
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
        if (dto.interactionId) {
            const existingTicket = await this.findTicketByInteractionId(dto.interactionId);
            if (existingTicket) {
                this.assertInteractionTicketOwner(existingTicket, createdByUserId);
                await this.markInteractionTicketCreated(dto.interactionId);
                this.logger.log(`🎫 Reusing ticket ${existingTicket.ticketNumber} for AI interaction ${dto.interactionId}`);
                return { ...existingTicket, alreadyCreated: true };
            }
        }

        const priority = dto.priority ?? TicketPriority.MEDIUM;
        const [ticketNumber, slaDeadlines] = await Promise.all([
            this.generateTicketNumber(),
            this.slaService.calculateDeadlines(priority, dto.departmentId),
        ]);

        let ticket;
        try {
            ticket = await this.prisma.ticket.create({
                data: {
                    ticketNumber,
                    subject: this.piiMaskingService.maskSensitiveData(dto.subject),
                    description: dto.description ? this.piiMaskingService.maskSensitiveData(dto.description) : null,
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
                    departmentId: dto.departmentId,
                },
                include: this.ticketListInclude(),
            });
        } catch (error) {
            if (dto.interactionId && this.isInteractionUniqueConstraintError(error)) {
                const existingTicket = await this.findTicketByInteractionId(dto.interactionId);
                if (existingTicket) {
                    this.assertInteractionTicketOwner(existingTicket, createdByUserId);
                    await this.markInteractionTicketCreated(dto.interactionId);
                    this.logger.log(`🎫 Reusing ticket ${existingTicket.ticketNumber} after interaction uniqueness race`);
                    return { ...existingTicket, alreadyCreated: true };
                }
            }
            throw error;
        }

        this.logger.log(`🎫 Created ticket ${ticket.ticketNumber} (${priority})`);
        if (dto.interactionId) {
            await this.markInteractionTicketCreated(dto.interactionId);
        }

        // Option A + C Logic: If the user provided a productId, do auto-tagging
        if (dto.productId) {
            // we run this async so that the frontend feels "zero friction" fast response
            this.runAutoTaggingAsync(ticket.id, dto.productId, `${dto.subject}\n\n${dto.description || ''}`, dto.hotinfoContext);
        }

        // Emit event for Autonomous Resolution Engine
        this.eventEmitter.emit('ticket.created', ticket);

        return ticket;
    }

    private ticketListInclude() {
        return {
            creator: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    customerProfile: {
                        select: { isVip: true, contractStatus: true, companyName: true },
                    },
                },
            },
            product: { select: { name: true } },
        };
    }

    private findTicketByInteractionId(interactionId: string) {
        return this.prisma.ticket.findFirst({
            where: { interactionId },
            include: this.ticketListInclude(),
        });
    }

    private assertInteractionTicketOwner(ticket: { userId?: string | null }, createdByUserId: string) {
        if (ticket.userId && ticket.userId !== createdByUserId) {
            throw new BadRequestException('This AI diagnosis is already linked to another ticket');
        }
    }

    private isInteractionUniqueConstraintError(error: unknown) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
            return false;
        }

        const target = error.meta?.target;
        if (Array.isArray(target)) {
            return target.includes('interaction_id') || target.includes('interactionId');
        }

        return String(target).includes('interaction_id') || String(target).includes('interactionId');
    }

    private async markInteractionTicketCreated(interactionId: string) {
        try {
            await this.prisma.aiInteraction.update({
                where: { id: interactionId },
                data: { ticketCreated: true },
            });
        } catch (error) {
            this.logger.warn(`AI interaction ${interactionId} ticketCreated flag could not be updated: ${(error as Error).message}`);
        }
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
        teamId?: string;
        userId?: string; // Filter by creator
        isSlaBreached?: boolean;
        page?: number;
        limit?: number;
    }) {
        const { status, priority, assignedTo, teamId, userId, isSlaBreached, page = 1, limit = 20 } = params;

        // If teamId is provided, get all userIds in that team
        let teamMemberIds: string[] = [];
        if (teamId) {
            const members = await this.prisma.teamMember.findMany({
                where: { teamId },
                select: { userId: true },
            });
            teamMemberIds = members.map((m) => m.userId);
        }

        const where: Prisma.TicketWhereInput = {
            ...(status && { status }),
            ...(priority && { priority }),
            ...(userId && { userId }),
            ...(isSlaBreached !== undefined && { isSlaBreached }),
            deletedAt: null, // Always filter out soft-deleted tickets
        };

        // Handle assignedTo and teamId logic
        if (assignedTo && teamId) {
            // If both are provided, the user must be assigned to the specific agent AND that agent must be in the team
            if (teamMemberIds.includes(assignedTo)) {
                where.assignedTo = assignedTo;
            } else {
                // If the specified agent is NOT in the specified team, return nothing (or handle as filter mismatch)
                where.assignedTo = 'none'; // Prisma trick to return zero results for non-existent userId
            }
        } else if (assignedTo) {
            where.assignedTo = assignedTo;
        } else if (teamId) {
            where.assignedTo = { in: teamMemberIds };
        }

        const [data, total] = await Promise.all([
            this.prisma.ticket.findMany({
                where,
                include: {
                    creator: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            avatarUrl: true,
                            status: true,
                            customerProfile: {
                                select: {
                                    companyName: true,
                                    contractStatus: true,
                                    customerNo: true,
                                    isVip: true,
                                },
                            }
                        },
                    },
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
    async findOne(id: string, requester?: any) {
        const ticket = await this.prisma.ticket.findFirst({
            where: { id, deletedAt: null },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        avatarUrl: true,
                        customerProfile: {
                            select: {
                                isVip: true,
                                contractStatus: true,
                                companyName: true,
                                customerNo: true,
                            },
                        },
                    },
                },
                assignee: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
                messages: {
                    where: (requester?.role?.toLowerCase() === 'customer' || requester?.role?.toLowerCase() === 'viewer') ? { isInternal: false } : {},
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
        if ((requester?.role?.toUpperCase() === 'CUSTOMER' || requester?.role?.toUpperCase() === 'VIEWER') && ticket.userId !== requester.id) {
            throw new ForbiddenException('You do not have access to this ticket');
        }

        return ticket;
    }

    async findByNumber(ticketNumber: string, requester?: { id: string; role: string }) {
        const ticket = await this.prisma.ticket.findFirst({
            where: { ticketNumber, deletedAt: null }
        });
        if (!ticket) throw new NotFoundException(`Ticket ${ticketNumber} not found`);
        return this.findOne(ticket.id, requester);
    }

    async getAssignableAgents(id: string) {
        const ticket = await this.prisma.ticket.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, departmentId: true },
        });

        if (!ticket) throw new NotFoundException(`Ticket not found`);

        return this.prisma.user.findMany({
            where: {
                deletedAt: null,
                status: 'ACTIVE',
                role: {
                    name: {
                        not: 'CUSTOMER',
                        mode: 'insensitive',
                    },
                },
                teamMembers: {
                    some: {
                        team: {
                            isArchived: false,
                            deletedAt: null,
                            ...(ticket.departmentId ? { departmentId: ticket.departmentId } : {}),
                        },
                    },
                },
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
                role: true,
                teamMembers: {
                    where: {
                        team: {
                            isArchived: false,
                            deletedAt: null,
                            ...(ticket.departmentId ? { departmentId: ticket.departmentId } : {}),
                        },
                    },
                    select: {
                        team: {
                            select: {
                                id: true,
                                name: true,
                                departmentId: true,
                            },
                        },
                    },
                },
            },
            orderBy: { fullName: 'asc' },
        });
    }

    // =============================================
    // UPDATE
    // =============================================
    async update(id: string, dto: UpdateTicketDto, requester: any) {
        const ticket = await this.findOne(id, requester); // throws if not found or no access

        if (dto.chatStatus) {
            this.assertChatStatusUpdateAllowed(ticket, dto.chatStatus, requester);
        }

        let slaUpdate = {};
        if (dto.priority) {
            const ticket = await this.prisma.ticket.findUnique({ where: { id } });
            const deadlines = await this.slaService.calculateDeadlines(dto.priority, ticket?.departmentId as string);
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

    private assertChatStatusUpdateAllowed(
        ticket: { chatStatus?: ChatStatus | string; creator?: { customerProfile?: { isVip?: boolean | null } | null } | null },
        nextStatus: ChatStatus,
        requester: any,
    ) {
        const role = String(requester?.role ?? '').toUpperCase();
        const isCustomer = role === 'CUSTOMER' || role === 'VIEWER';

        if (!isCustomer) return;

        if (nextStatus !== ChatStatus.REQUESTED) {
            throw new ForbiddenException('LIVE_CHAT_AGENT_ONLY');
        }

        const isVip = Boolean(ticket.creator?.customerProfile?.isVip);
        if (!isVip) {
            throw new ForbiddenException('LIVE_CHAT_VIP_REQUIRED');
        }
    }

    async getAiTrace(id: string, requester: any) {
        const role = String(requester?.role ?? '').toUpperCase();
        if (role === 'CUSTOMER' || role === 'VIEWER') {
            throw new ForbiddenException('AI ticket trace is available to support staff only');
        }

        const ticket = await this.prisma.ticket.findFirst({
            where: { id, deletedAt: null },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        language: true,
                        customerProfile: {
                            select: {
                                isVip: true,
                                contractStatus: true,
                                companyName: true,
                                customerNo: true,
                            },
                        },
                    },
                },
                interaction: {
                    include: {
                        matchedArticle: { select: { id: true, title: true, category: true, language: true } },
                        matchedVersion: { select: { id: true, title: true, version: true } },
                        feedbacks: {
                            select: { rating: true, comment: true, createdAt: true },
                            orderBy: { createdAt: 'desc' },
                            take: 5,
                        },
                        shiftDetections: {
                            select: { detectedAt: true, previousKeywords: true, newKeywords: true, confirmed: true },
                            orderBy: { detectedAt: 'desc' },
                            take: 5,
                        },
                    },
                },
                messages: {
                    select: {
                        id: true,
                        senderId: true,
                        isInternal: true,
                        createdAt: true,
                        message: true,
                        sender: { select: { id: true, fullName: true, role: { select: { name: true } } } },
                    },
                    orderBy: { createdAt: 'asc' },
                    take: 20,
                },
            },
        }) as any;

        if (!ticket) throw new NotFoundException(`Ticket not found`);

        const interaction = ticket.interaction;
        const response = interaction?.responseGenerated ?? '';
        const userContext = (interaction?.userContext ?? {}) as Record<string, any>;
        const contractSections = this.evaluateAnswerContract(response);

        return {
            ticket: {
                id: ticket.id,
                ticketNumber: ticket.ticketNumber,
                subject: ticket.subject,
                status: ticket.status,
                chatStatus: ticket.chatStatus,
                createdAt: ticket.createdAt,
                creator: ticket.creator,
            },
            interaction: interaction ? {
                id: interaction.id,
                userQuery: interaction.userQuery,
                responseGenerated: interaction.responseGenerated,
                confidenceBand: interaction.confidenceBand,
                similarityScore: interaction.similarityScore ? Number(interaction.similarityScore) : null,
                autoAnswered: interaction.autoAnswered,
                ticketCreated: interaction.ticketCreated,
                provider: interaction.provider,
                model: interaction.model,
                inputTokens: interaction.inputTokens,
                outputTokens: interaction.outputTokens,
                totalTokens: interaction.totalTokens,
                estimatedCost: interaction.estimatedCost ? Number(interaction.estimatedCost) : null,
                channel: interaction.channel,
                createdAt: interaction.createdAt,
                userContext,
                matchedArticle: interaction.matchedArticle,
                matchedVersion: interaction.matchedVersion,
                feedbacks: interaction.feedbacks,
                shiftDetections: interaction.shiftDetections,
            } : null,
            quality: {
                hasInteraction: Boolean(interaction),
                ticketCreatedFlagMatches: Boolean(interaction?.ticketCreated),
                sourceLeakDetected: this.detectSourceLeak(response),
                mixedLanguageRisk: this.detectMixedLanguageRisk(response, userContext.responseLanguage ?? userContext.requestLocale),
                contractSections,
                responseLanguage: userContext.responseLanguage ?? null,
                requestLocale: userContext.requestLocale ?? null,
                routeLocale: userContext.routeLocale ?? null,
                profileLanguage: userContext.profileLanguage ?? ticket.creator?.language ?? null,
                sourceLanguage: userContext.source?.language ?? null,
                answerMode: userContext.answerMode ?? null,
                languageSource: userContext.languageSource ?? null,
                strictLanguage: userContext.strictLanguage ?? null,
            },
            timeline: {
                interactionCreatedAt: interaction?.createdAt ?? null,
                ticketCreatedAt: ticket.createdAt,
                firstStaffMessageAt: ticket.messages.find((m: any) => this.isStaffRole(m.sender?.role?.name))?.createdAt ?? null,
                messageCount: ticket.messages.length,
            },
            recentMessages: ticket.messages.map((message: any) => ({
                id: message.id,
                senderId: message.senderId,
                senderName: message.sender?.fullName ?? null,
                senderRole: message.sender?.role?.name ?? null,
                isInternal: message.isInternal,
                createdAt: message.createdAt,
                preview: this.previewText(message.message),
            })),
        };
    }

    private evaluateAnswerContract(answer: string) {
        const sections = {
            problem: /📌|Problem Interpretation|Sorun Yorumu|Probleminterpretation|Problemdeutung/i.test(answer),
            cause: /🎯|Most Probable Cause|En Olası Neden|Wahrscheinlichste Ursache/i.test(answer),
            checks: /⚠️|Critical Checks|Kritik Kontroller|Kritische Prüfungen/i.test(answer),
            steps: /🛠️|Solution Steps|Çözüm Adımları|Lösungsschritte/i.test(answer),
            verification: /✅|Verification|Doğrulama|Überprüfung/i.test(answer),
        };
        const passed = Object.values(sections).filter(Boolean).length;
        return { ...sections, passed, expected: 5, isComplete: passed === 5 };
    }

    private detectSourceLeak(answer: string) {
        return /\b(Kaynak|Source|Quelle)\s*:/i.test(answer);
    }

    private detectMixedLanguageRisk(answer: string, expectedLanguage?: string | null) {
        const language = String(expectedLanguage ?? '').toLowerCase();
        if (!answer || !language) return false;

        const turkishMarkers = /\b(olarak|sorun|çözüm|talep|müşteri|destek|kontrol|doğrulama)\b/i;
        const germanMarkers = /\b(Problem|Lösung|Überprüfung|Schritte|Ursache|Kunde|Anfrage)\b/i;
        const englishMarkers = /\b(problem|solution|verification|steps|customer|request|support)\b/i;

        if (language.startsWith('tr')) return germanMarkers.test(answer) || englishMarkers.test(answer);
        if (language.startsWith('de')) return turkishMarkers.test(answer) || englishMarkers.test(answer);
        if (language.startsWith('en')) return turkishMarkers.test(answer) || germanMarkers.test(answer);
        return false;
    }

    private isStaffRole(role?: string | null) {
        const value = String(role ?? '').toUpperCase();
        return ['ADMIN', 'SUPER_ADMIN', 'AGENT', 'SENIOR_AGENT', 'TEAM_LEAD', 'DEPARTMENT_MANAGER'].includes(value);
    }

    private previewText(value?: string | null) {
        const text = String(value ?? '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        return text.length > 180 ? `${text.slice(0, 180)}...` : text;
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

        this.eventEmitter.emit('ticket.status_changed', {
            ticketId: updated.id,
            oldStatus: ticket.status,
            newStatus: updated.status
        });

        if (updated.status === TicketStatus.RESOLVED) {
            this.eventEmitter.emit('ticket.resolved', updated);
        }

        this.logger.log(
            `🔄 Ticket ${ticket.ticketNumber}: ${ticket.status} → ${toStatus} by ${actorId}`,
        );

        return updated;
    }

    // =============================================
    // ASSIGN
    // =============================================
    async assign(id: string, assigneeId: string, _actorId: string) {
        const ticket = await this.findOne(id);
        if (ticket.status === TicketStatus.CLOSED) {
            throw new BadRequestException('Cannot assign a closed ticket');
        }

        const assignee = await this.prisma.user.findFirst({
            where: {
                id: assigneeId,
                deletedAt: null,
                status: 'ACTIVE',
                role: {
                    name: {
                        not: 'CUSTOMER',
                        mode: 'insensitive',
                    },
                },
                teamMembers: {
                    some: {
                        team: {
                            isArchived: false,
                            deletedAt: null,
                            ...(ticket.departmentId ? { departmentId: ticket.departmentId } : {}),
                        },
                    },
                },
            },
            select: { id: true },
        });

        if (!assignee) {
            throw new BadRequestException('Ticket can only be assigned to an active support team member');
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
    async getSlaStats(user?: { sub: string, role: string }) {
        const isCustomer = user?.role?.toUpperCase() === 'CUSTOMER' || user?.role?.toUpperCase() === 'VIEWER';
        const cacheKey = isCustomer && user?.sub ? `sla_stats_${user.sub}` : 'sla_stats_global';

        const cached = await this.redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const baseWhere = isCustomer && user?.sub ? { userId: user.sub } : {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [total, breached, nearing, resolvedToday, resolvedTotal] = await Promise.all([
            this.prisma.ticket.count({ where: { ...baseWhere, status: { notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED] } } }),
            this.prisma.ticket.count({ where: { ...baseWhere, isSlaBreached: true, status: { notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED] } } }),
            this.prisma.ticket.count({
                where: {
                    ...baseWhere,
                    isSlaBreached: false,
                    status: { notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED] },
                    slaResponseDue: { lt: new Date(Date.now() + 60 * 60 * 1000) }, // next hour
                },
            }),
            this.prisma.ticket.count({
                where: { ...baseWhere, status: TicketStatus.RESOLVED, resolvedAt: { gte: today } }
            }),
            this.prisma.ticket.count({
                where: { ...baseWhere, status: TicketStatus.RESOLVED }
            }),
        ]);

        const result = { total, breached, nearing, resolvedToday, resolvedTotal };
        await this.redis.set(cacheKey, JSON.stringify(result), 60); // 60 seconds TTL
        return result;
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

        const contentFormat = dto.contentFormat ?? MessageContentFormat.PLAIN_TEXT;
        const messageBody = contentFormat === MessageContentFormat.HTML
            ? sanitizeRichTextHtml(this.piiMaskingService.maskSensitiveData(sanitizeRichTextHtml(dto.message)))
            : this.piiMaskingService.maskSensitiveData(dto.message);

        const hasAttachments = Boolean(dto.attachments?.length);
        if (contentFormat === MessageContentFormat.HTML && isRichTextEffectivelyEmpty(messageBody) && !hasAttachments) {
            throw new BadRequestException('message cannot be empty after sanitization');
        }

        if (messageBody.trim().length === 0 && !hasAttachments) {
            throw new BadRequestException('message cannot be empty');
        }

        const message = await this.prisma.ticketMessage.create({
            data: {
                ticketId,
                senderId,
                message: messageBody,
                isInternal: dto.isInternal ?? false,
                channel: dto.channel || 'WEB',
            },
            include: { sender: { select: { id: true, fullName: true, avatarUrl: true } } },
        });

        // Support UI-based attachments if provided in the DTO
        // Support UI-based attachments using batch creation to prevent N+1 queries
        if (dto.attachments && dto.attachments.length > 0) {
            try {
                const attachmentData = dto.attachments.map(attach => ({
                    messageId: message.id,
                    fileName: attach.fileName,
                    fileSize: attach.fileSize,
                    mimeType: attach.mimeType,
                    url: attach.url,
                }));
                await this.prisma.attachment.createMany({
                    data: attachmentData,
                    skipDuplicates: true
                });
            } catch (err) {
                this.logger.error(`[TicketsService] Failed to link batch attachments: ${err.message}`);
            }
        }

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

        let recipientEmail = ticket.userId === senderId ? ticket.assignee?.email : (ticket.creator?.email || undefined);
        let userName = ticket.userId === senderId ? (ticket.assignee?.fullName || 'Temsilci') : (ticket.creator?.fullName || 'Müşteri');

        // Unassigned fallback: If customer replied and no agent is assigned, notify department agents
        if (ticket.userId === senderId && !recipientEmail && ticket.departmentId) {
            const deptAgents = await this.prisma.user.findMany({
                where: {
                    teamMembers: { some: { team: { departmentId: ticket.departmentId } } },
                    role: { name: { not: 'CUSTOMER' } }
                },
                select: { email: true }
            });
            if (deptAgents.length > 0) {
                recipientEmail = deptAgents.map(a => a.email).join(',');
                userName = 'Destek Ekibi';
            }
        }

        this.eventEmitter.emit('ticket.message_added', {
            ticket,
            message,
            recipientEmail,
            userName
        });

        return message;
    }

    // =============================================
    // SUBMIT FEEDBACK (Self-Learning KB Trigger)
    // =============================================
    async submitFeedback(id: string, score: number, comment?: string, _customerId?: string) {
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
    // TICKET MERGE / LINK
    // =============================================
    async linkTicket(childId: string, parentId: string, actorId: string) {
        if (childId === parentId) throw new BadRequestException('Cannot link ticket to itself');

        const [child, parent] = await Promise.all([
            this.prisma.ticket.findUnique({ where: { id: childId } }),
            this.prisma.ticket.findUnique({ where: { id: parentId } })
        ]);

        if (!child) throw new NotFoundException('Child ticket not found');
        if (!parent) throw new NotFoundException('Parent ticket not found');

        const updatedChild = await this.prisma.ticket.update({
            where: { id: childId },
            data: {
                parentId,
                status: 'CLOSED' as const,
                closedAt: new Date()
            }
        });

        await this.prisma.ticketMessage.createMany({
            data: [
                {
                    ticketId: childId,
                    senderId: actorId,
                    isInternal: true,
                    message: `⚠️ Bilet kapatıldı ve ana bilet #${parent.ticketNumber} ile birleştirildi.`
                },
                {
                    ticketId: parentId,
                    senderId: actorId,
                    isInternal: true,
                    message: `🔗 Bilet #${child.ticketNumber} bu bilete alt bilet olarak birleştirildi.`
                }
            ]
        });

        this.logger.log(`🔗 Ticket ${child.ticketNumber} merged into ${parent.ticketNumber} by agent ${actorId}`);
        return updatedChild;
    }

    // =============================================
    // BULK UPDATE
    // =============================================
    async bulkUpdate(dto: BulkUpdateTicketDto, requester: any) {
        const { ticketIds, status, priority, assignedTo } = dto;
        const actorId = requester.sub;

        // Security check for non-staff roles
        const requesterRole = (typeof requester.role === 'string' ? requester.role : requester.role?.name)?.toUpperCase();
        const isStaff = ['ADMIN', 'SUPER-ADMIN', 'DEPARTMENT_MANAGER', 'TEAM_LEAD', 'SENIOR_AGENT', 'AGENT'].includes(requesterRole);

        if (!isStaff) {
            // Verify ownership for all requested tickets
            const count = await this.prisma.ticket.count({
                where: {
                    id: { in: ticketIds },
                    userId: actorId,
                    deletedAt: null
                }
            });
            if (count !== ticketIds.length) {
                throw new ForbiddenException('You do not have permission to update one or more of these tickets');
            }
        }

        const updateData: Prisma.TicketUpdateInput = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (assignedTo) updateData.assignee = { connect: { id: assignedTo } };

        // If priority changes, we must recalculate SLAs individually (Optimized for N+1)
        if (priority) {
            // 1. Fetch all required tickets in a single batch
            const tickets = await this.prisma.ticket.findMany({
                where: { id: { in: ticketIds } },
                select: { id: true, departmentId: true }
            });

            await this.prisma.$transaction(async (tx) => {
                for (const ticket of tickets) {
                    // We call SLA service for calculation logic. Since we optimized 
                    // BusinessHoursService cache, the O(N*M) pressure is gone.
                    const deadlines = await this.slaService.calculateDeadlines(priority, ticket.departmentId as string);

                    await tx.ticket.update({
                        where: { id: ticket.id },
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

    // =============================================
    // DELETE
    // =============================================
    async remove(id: string, actorId: string) {
        const ticket = await this.findOne(id);

        // Mark the ticket as soft-deleted by setting the deletedAt timestamp.
        await this.prisma.ticket.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        this.logger.warn(`🗑️ Ticket ${ticket.ticketNumber} deleted by Admin ${actorId}`);

        return { success: true, message: `Ticket ${ticket.ticketNumber} deleted.` };
    }

    async bulkRemove(ticketIds: string[], actorId: string) {
        const result = await this.prisma.ticket.updateMany({
            where: { id: { in: ticketIds } },
            data: { deletedAt: new Date() }
        });

        this.logger.warn(`🗑️ Bulk deleted ${result.count} tickets by Admin ${actorId}`);

        return { success: true, count: result.count };
    }
}

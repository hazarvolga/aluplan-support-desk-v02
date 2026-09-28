import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@aluplan/database';
import { PrismaService } from '../prisma/prisma.service';
import { ListAiInteractionsDto } from './dto/list-ai-interactions.dto';

const AI_HISTORY_ROLES = new Set(['ADMIN', 'SUPER_ADMIN', 'SUPERUSER']);

function normalizeRole(role: unknown): string {
    const value = typeof role === 'string'
        ? role
        : role && typeof role === 'object' && 'name' in role
            ? (role as { name?: unknown }).name
            : '';
    return typeof value === 'string' ? value.trim().toUpperCase().replace(/-/g, '_') : '';
}

@Injectable()
export class AiInteractionHistoryService {
    private readonly logger = new Logger(AiInteractionHistoryService.name);

    constructor(private readonly prisma: PrismaService) { }

    async list(params: ListAiInteractionsDto, requesterRole: unknown, actorId?: string) {
        if (!AI_HISTORY_ROLES.has(normalizeRole(requesterRole))) {
            throw new ForbiddenException('AI_INTERACTION_HISTORY_FORBIDDEN');
        }

        const page = params.page ?? 1;
        const limit = params.limit ?? 20;
        const search = params.search?.trim();
        const where: Prisma.AiInteractionWhereInput = {};

        if (params.interactionId) where.id = params.interactionId;

        if (params.ticketState === 'TICKETED') where.ticket = { isNot: null };
        if (params.ticketState === 'TICKETLESS') where.ticket = { is: null };

        if (params.confidence === 'NO_MATCH') {
            where.confidenceBand = null;
        } else if (params.confidence && params.confidence !== 'ALL') {
            where.confidenceBand = params.confidence;
        }

        if (search) {
            where.OR = [
                { userQuery: { contains: search, mode: 'insensitive' } },
                { responseGenerated: { contains: search, mode: 'insensitive' } },
                { user: { is: { fullName: { contains: search, mode: 'insensitive' } } } },
                { user: { is: { email: { contains: search, mode: 'insensitive' } } } },
                { ticket: { is: { ticketNumber: { contains: search, mode: 'insensitive' } } } },
                { matchedArticle: { is: { title: { contains: search, mode: 'insensitive' } } } },
            ];
        }

        const [rows, total] = await Promise.all([
            this.prisma.aiInteraction.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
                select: {
                    id: true,
                    userQuery: true,
                    responseGenerated: true,
                    confidenceBand: true,
                    similarityScore: true,
                    autoAnswered: true,
                    ticketCreated: true,
                    channel: true,
                    provider: true,
                    model: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            customerProfile: { select: { companyName: true } },
                        },
                    },
                    ticket: { select: { id: true, ticketNumber: true, subject: true, status: true } },
                    matchedArticle: { select: { id: true, title: true } },
                },
            }),
            this.prisma.aiInteraction.count({ where }),
        ]);

        const response = {
            data: rows.map((row) => ({
                id: row.id,
                userQuery: row.userQuery,
                responseGenerated: row.responseGenerated,
                confidenceBand: row.confidenceBand,
                similarityScore: row.similarityScore === null ? null : Number(row.similarityScore),
                autoAnswered: row.autoAnswered,
                ticketCreated: row.ticketCreated,
                channel: row.channel,
                provider: row.provider,
                model: row.model,
                createdAt: row.createdAt,
                user: row.user ? {
                    id: row.user.id,
                    fullName: row.user.fullName,
                    email: row.user.email,
                    companyName: row.user.customerProfile?.companyName ?? null,
                } : null,
                ticket: row.ticket,
                matchedArticle: row.matchedArticle,
            })),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };

        if (actorId) {
            try {
                await this.prisma.auditLog.create({
                    data: {
                        actorId,
                        action: 'ai_interactions.read',
                        entityType: 'AiInteraction',
                        newValue: {
                            page,
                            limit,
                            ticketState: params.ticketState ?? 'ALL',
                            confidence: params.confidence ?? 'ALL',
                            interactionIdFilter: Boolean(params.interactionId),
                            searchApplied: Boolean(search),
                            resultCount: rows.length,
                            total,
                        },
                    },
                });
            } catch (error) {
                this.logger.error('Failed to audit AI interaction history read', error);
            }
        }

        return response;
    }
}

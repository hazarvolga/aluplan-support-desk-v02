import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

const AUTO_PUBLISH_THRESHOLD = 0.85; // Sorular %85+ eşleşme → direkt yayınla

export interface ExtractedPattern {
    question: string;
    answer: string;
    confidenceScore: number;
    sourceType: 'ticket' | 'interaction';
    sourceId: string;
    tags: string[];
    language: string;
}

@Injectable()
export class FaqService {
    private readonly logger = new Logger(FaqService.name);

    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('kb-summarizer') private readonly kbQueue: Queue,
    ) { }

    @OnEvent('ticket.kb_summarize')
    async handleTicketKbSummarize(ticket: any) {
        this.logger.log(`📥 Received ticket ${ticket.ticketNumber} for KB Summarization...`);
        // Add ticket to the summarizer queue for Option C pipeline
        await this.kbQueue.add('summarize', { ticketId: ticket.id }, {
            removeOnComplete: true,
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 }
        });
    }

    // ─── EXTRACT PATTERNS FROM TICKETS ──────────────────────
    /**
     * Reads resolved tickets with messages and extracts Q&A patterns.
     * Called by a cron job or manually by admin.
     */
    async extractFromTickets(limit = 100): Promise<ExtractedPattern[]> {
        const tickets = await this.prisma.ticket.findMany({
            where: { status: { in: ['RESOLVED', 'CLOSED'] } },
            include: {
                messages: {
                    where: { isInternal: false },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        const patterns: ExtractedPattern[] = [];

        for (const ticket of tickets) {
            if (ticket.messages.length < 2) continue; // Need at least Q + A

            const question = ticket.subject;
            const answerMsg = ticket.messages.find((m: { senderId: string | null }) => m.senderId !== ticket.userId);
            if (!answerMsg) continue;

            // Simple confidence: based on message length and content
            // (Optimization: Removed per-ticket DB count to avoid N+1)
            const confidenceScore = Math.min(0.6 + (answerMsg.message.length / 500) * 0.2, 0.95);

            patterns.push({
                question,
                answer: answerMsg.message,
                confidenceScore,
                sourceType: 'ticket',
                sourceId: ticket.id,
                tags: ticket.tags,
                language: 'tr',
            });
        }

        return patterns;
    }

    /**
     * Extract from low-confidence AI interactions (those not auto-answered).
     */
    async extractFromInteractions(limit = 100): Promise<ExtractedPattern[]> {
        const interactions = await this.prisma.aiInteraction.findMany({
            where: {
                autoAnswered: false,
                confidenceBand: null, // NO_MATCH queries
                ticketCreated: true,  // User created a ticket = real knowledge gap
            },
            include: {
                feedbacks: { select: { rating: true, comment: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        // Group by similar queries to find frequent patterns
        const queryGroups = new Map<string, { queries: string[]; ids: string[] }>();

        for (const interaction of interactions) {
            const normalized = interaction.userQuery.toLowerCase().trim().replace(/\s+/g, ' ');
            const key = normalized.slice(0, 50); // First 50 chars as group key
            const group = queryGroups.get(key) ?? { queries: [], ids: [] };
            group.queries.push(interaction.userQuery);
            group.ids.push(interaction.id);
            queryGroups.set(key, group);
        }

        const patterns: ExtractedPattern[] = [];

        for (const [, group] of queryGroups) {
            if (group.queries.length < 2) continue; // Only frequent queries become FAQ candidates

            const frequency = group.queries.length;
            const confidenceScore = Math.min(0.40 + frequency * 0.05, 0.80); // Interactions stay below 85%

            patterns.push({
                question: group.queries[0], // Most recent form
                answer: '', // Admin will fill this in review
                confidenceScore,
                sourceType: 'interaction',
                sourceId: group.ids[0],
                tags: [],
                language: 'tr',
            });
        }

        return patterns;
    }

    // ─── PROCESS & UPSERT FAQ ENTRIES ───────────────────────
    /**
     * Process extracted patterns: auto-publish high-confidence, queue low-confidence.
     */
    async processPatterns(patterns: ExtractedPattern[]): Promise<{
        autoPublished: number;
        queued: number;
        skipped: number;
    }> {
        let autoPublished = 0;
        let queued = 0;
        let skipped = 0;

        for (const pattern of patterns) {
            // Skip if empty answer (interaction-sourced without resolution)
            if (!pattern.answer.trim()) { skipped++; continue; }

            // Check for duplicate (Optimized: use exact match or first 30 chars)
            const existing = await this.prisma.faqEntry.findFirst({
                where: { question: pattern.question },
                select: { id: true }
            });

            if (existing) {
                // Bump frequency
                await this.prisma.faqEntry.update({
                    where: { id: existing.id },
                    data: { frequency: { increment: 1 } },
                });
                skipped++;
                continue;
            }

            const status = pattern.confidenceScore >= AUTO_PUBLISH_THRESHOLD ? 'PUBLISHED' : 'PENDING_REVIEW';

            await this.prisma.faqEntry.create({
                data: {
                    question: pattern.question,
                    answer: pattern.answer,
                    status,
                    isInternal: true, // Default to internal for all pipeline-sourced Q&A
                    confidenceScore: pattern.confidenceScore,
                    sourceTypes: [pattern.sourceType],
                    tags: pattern.tags,
                    language: pattern.language,
                    publishedAt: status === 'PUBLISHED' ? new Date() : null,
                },
            });

            if (status === 'PUBLISHED') autoPublished++;
            else queued++;
        }

        this.logger.log(`📊 FAQ Pipeline: ${autoPublished} auto-published, ${queued} queued, ${skipped} skipped`);
        return { autoPublished, queued, skipped };
    }

    // ─── RUN FULL PIPELINE ───────────────────────────────────
    async runPipeline(): Promise<{ autoPublished: number; queued: number; skipped: number }> {
        const [ticketPatterns, interactionPatterns] = await Promise.all([
            this.extractFromTickets(),
            this.extractFromInteractions(),
        ]);

        const all = [...ticketPatterns, ...interactionPatterns];
        return this.processPatterns(all);
    }

    // ─── CRUD ────────────────────────────────────────────────
    async findAll(params: { status?: string; page?: number; limit?: number }): Promise<{ data: any[]; total: number; page: number; limit: number; pages: number }> {
        const { status, page = 1, limit = 20 } = params;
        const statusFilter = status ? { status: status as any } : {};

        const [data, total] = await Promise.all([
            this.prisma.faqEntry.findMany({
                where: statusFilter,
                orderBy: [{ frequency: 'desc' }, { createdAt: 'desc' }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.faqEntry.count({ where: statusFilter }),
        ]);

        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }

    async findOne(id: string): Promise<any> {
        return this.prisma.faqEntry.findUnique({ where: { id } });
    }

    async approveFaq(id: string): Promise<any> {
        return this.prisma.faqEntry.update({
            where: { id },
            data: {
                status: 'PUBLISHED',
                publishedAt: new Date(),
                isInternal: false // Make public when approved by human
            },
        });
    }

    async dismissFaq(id: string): Promise<any> {
        return this.prisma.faqEntry.update({ where: { id }, data: { status: 'DISMISSED' } });
    }

    async updateFaq(id: string, data: { question?: string; answer?: string; tags?: string[] }): Promise<any> {
        return this.prisma.faqEntry.update({ where: { id }, data });
    }

    async deleteFaq(id: string): Promise<any> {
        return this.prisma.faqEntry.delete({ where: { id } });
    }

    /**
     * Public endpoint: returns published FAQs (for KB widget/embed).
     */
    async getPublished(language = 'tr', limit = 50, includeInternal = false): Promise<any[]> {
        return this.prisma.faqEntry.findMany({
            where: {
                status: 'PUBLISHED',
                language,
                ...(!includeInternal && { isInternal: false })
            },
            orderBy: [{ frequency: 'desc' }, { publishedAt: 'desc' }],
            take: limit,
        });
    }
}

import { Injectable, Logger } from '@nestjs/common';
import { FaqStatus } from '@aluplan/database';
import { PrismaService } from '../prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmbeddingService } from '../ai/embedding.service';
import { AiService } from '../ai/ai.service';
import { EmbeddingVersionRegistry } from '../ai/embedding-version.registry';
import { SettingsService } from '../settings/settings.service';

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
        private readonly embeddingService: EmbeddingService,
        private readonly aiService: AiService,
        private readonly registry: EmbeddingVersionRegistry,
        private readonly settingsService: SettingsService,
    ) { }

    @OnEvent('ticket.kb_summarize')
    async handleTicketKbSummarize(ticket: any) {
        // Idempotency: skip if already processed
        if (ticket.knowledgeBaseAdded) {
            this.logger.log(`⏭️ Ticket ${ticket.ticketNumber} already in KB, skipping queue.`);
            return;
        }
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
        // Query remains standard, Prisma Client is now aware of department_id
        const tickets = await this.prisma.ticket.findMany({
            where: { status: { in: ['RESOLVED', 'CLOSED'] } },
            include: {
                messages: {
                    where: { isInternal: false },
                    orderBy: { createdAt: 'asc' },
                },
                department: true
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        const patterns: ExtractedPattern[] = [];

        for (const ticket of tickets) {
            if (ticket.messages.length < 2) continue; // Need at least Q + A

            const answerMsg = ticket.messages.find((m: { senderId: string | null }) => m.senderId !== ticket.userId);
            if (!answerMsg) continue;

            // AI Extraction Logic: Ask AI to format a clean Q&A pair from the conversation
            const conversation = ticket.messages.map(m => `${m.senderId === ticket.userId ? 'Müşteri' : 'Destek'}: ${m.message}`).join('\n');
            const aiFormatted = await this.aiService.reformat(
                'Aşağıdaki destek bileti konuşmasından temel Soru ve Cevap çiftini çıkar. Yanıtı SADECE JSON formatında ver: { "question": "...", "answer": "..." }',
                `Konu: ${ticket.subject}\n\nKonuşma:\n${conversation}`,
                'FAQ Extraction',
                undefined,
                'faq_extraction'
            );

            let question = ticket.subject;
            let answer = answerMsg.message;

            if (aiFormatted?.response) {
                try {
                    const parsed = JSON.parse(aiFormatted.response);
                    question = parsed.question || question;
                    answer = parsed.answer || answer;
                } catch { /* fallback to defaults */ }
            }

            // Simple confidence: based on message length and content
            // (Optimization: Removed per-ticket DB count to avoid N+1)
            const confidenceScore = Math.min(0.6 + (answerMsg.message.length / 500) * 0.2, 0.95);

            patterns.push({
                question,
                answer,
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

        const DEDUP_THRESHOLD = parseFloat(process.env.FAQ_SEMANTIC_DEDUP_THRESHOLD || '0.90');
        const config = await this.registry.getActiveVersionConfig();

        for (const pattern of patterns) {
            // Skip if empty answer (interaction-sourced without resolution)
            if (!pattern.answer.trim()) { skipped++; continue; }

            // 1. Exact match check (fast path)
            const exactMatch = await this.prisma.faqEntry.findFirst({
                where: { question: pattern.question },
                select: { id: true }
            });

            if (exactMatch) {
                await this.prisma.faqEntry.update({
                    where: { id: exactMatch.id },
                    data: { frequency: { increment: 1 } },
                });
                skipped++;
                continue;
            }

            // 2. Semantic deduplication (embedding-based)
            let semanticDuplicateId: string | null = null;
            try {
                const embedding = await this.embeddingService.embedText(pattern.question);
                if (embedding) {
                    const vectorStr = JSON.stringify(embedding);
                    const similar = await this.prisma.$queryRaw<Array<{ id: string; similarity: number }>>`
                        SELECT id, 1 - (question_embedding <=> ${vectorStr}::vector) AS similarity
                        FROM faq_entries
                        WHERE question_embedding IS NOT NULL
                          AND embedding_version = ${config.version}
                          AND status IN ('PUBLISHED', 'PENDING_REVIEW')
                          AND 1 - (question_embedding <=> ${vectorStr}::vector) >= ${DEDUP_THRESHOLD}
                        ORDER BY similarity DESC
                        LIMIT 1
                    `;
                    if (similar.length > 0) {
                        semanticDuplicateId = similar[0].id;
                    }
                }
            } catch (err: any) {
                this.logger.warn(`⚠️ Semantic dedup check failed, falling back: ${err.message}`);
            }

            if (semanticDuplicateId) {
                await this.prisma.faqEntry.update({
                    where: { id: semanticDuplicateId },
                    data: { frequency: { increment: 1 } },
                });
                skipped++;
                continue;
            }

            // 3. Create new FAQ entry with embedding
            const status = pattern.confidenceScore >= AUTO_PUBLISH_THRESHOLD ? 'PUBLISHED' : 'PENDING_REVIEW';

            let questionEmbedding: number[] | null = null;
            try {
                questionEmbedding = await this.embeddingService.embedText(pattern.question);
            } catch { /* non-fatal */ }

            if (questionEmbedding) {
                const vectorStr = JSON.stringify(questionEmbedding);
                await this.prisma.$executeRaw`
                    INSERT INTO faq_entries (id, question, answer, status, is_internal, confidence_score, source_types, tags, language, published_at, question_embedding, embedding_version, embedding_dim)
                    VALUES (gen_random_uuid(), ${pattern.question}, ${pattern.answer}, ${status}::"FaqStatus",
                            true, ${pattern.confidenceScore}, ${pattern.tags}::text[], ${pattern.tags}::text[], ${pattern.language},
                            ${status === 'PUBLISHED' ? new Date() : null}, ${vectorStr}::vector, ${config.version}, ${config.dimension})
                `;
            } else {
                await this.prisma.faqEntry.create({
                    data: {
                        question: pattern.question,
                        answer: pattern.answer,
                        status,
                        isInternal: true,
                        confidenceScore: pattern.confidenceScore,
                        sourceTypes: [pattern.sourceType],
                        tags: pattern.tags,
                        language: pattern.language,
                        publishedAt: status === 'PUBLISHED' ? new Date() : null,
                    },
                });
            }

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
    async findAll(params: { status?: FaqStatus; page?: number; limit?: number }): Promise<{ data: any[]; total: number; page: number; limit: number; pages: number }> {
        const { status, page = 1, limit = 20 } = params;
        const statusFilter = status ? { status: status } : {};

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
        return this.prisma.faqEntry.update({ where: { id }, data: { deletedAt: new Date() } });
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

    // ─── SINGLE PATTERN PROCESSING (for KB Summarizer) ───────────
    /**
     * Process a single KB pattern from ticket summarization.
     * Single-point entry for FAQ creation from KB Summarizer processor.
     * Handles deduplication and FAQ entry creation.
     */
    async createFromCluster(data: {
        question: string;
        answer: string;
        tags: string[];
        ticketCount: number;
        avgCsat?: number;
        consistencyRatio?: number;
    }): Promise<void> {
        // Dynamic confidence: size (30%) + CSAT quality (40%) + cluster consistency (30%)
        const sizeScore = Math.min(data.ticketCount / 10, 1.0) * 0.3;
        const csatScore = ((data.avgCsat ?? 3.5) / 5) * 0.4;
        const consistencyScore = (data.consistencyRatio ?? 0.85) * 0.3;
        const confidenceScore = Math.min(0.90, sizeScore + csatScore + consistencyScore);
        await this.prisma.faqEntry.create({
            data: {
                question: data.question,
                answer: data.answer,
                status: 'PENDING_REVIEW',
                isInternal: true,
                confidenceScore,
                tags: data.tags,
                frequency: data.ticketCount,
                sourceTypes: ['ticket'],
            },
        });
    }

    async processKbPattern(pattern: ExtractedPattern): Promise<{ created: boolean; faqId?: string }> {
        const defaultLanguage = await this.settingsService.getValue('kb.default_language') || 'tr';

        // Check for existing FAQ with same question (exact match)
        const existing = await this.prisma.faqEntry.findFirst({
            where: { question: pattern.question },
            select: { id: true }
        });

        if (existing) {
            await this.prisma.faqEntry.update({
                where: { id: existing.id },
                data: { frequency: { increment: 1 } }
            });
            this.logger.log(`FAQ already exists for question: ${pattern.question.substring(0, 50)}...`);
            return { created: false, faqId: existing.id };
        }

        // Create new FAQ entry
        const faq = await this.prisma.faqEntry.create({
            data: {
                question: pattern.question,
                answer: pattern.answer,
                status: 'PENDING_REVIEW',
                isInternal: pattern.sourceType === 'ticket',
                confidenceScore: pattern.confidenceScore,
                sourceTypes: [pattern.sourceType],
                tags: pattern.tags,
                language: pattern.language || defaultLanguage
            }
        });

        this.logger.log(`Created FAQ entry ${faq.id} from KB summarization`);
        return { created: true, faqId: faq.id };
    }
}

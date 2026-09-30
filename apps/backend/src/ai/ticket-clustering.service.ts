import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { EmbeddingService } from './embedding.service';
import { FaqService } from '../faq/faq.service';
import { Cron } from '@nestjs/schedule';
import { RAG_CONFIG } from '../config/rag.config';

@Injectable()
export class TicketClusteringService {
    private readonly logger = new Logger(TicketClusteringService.name);
    private readonly SIMILARITY_THRESHOLD = RAG_CONFIG.CLUSTERING.SIMILARITY_THRESHOLD;
    private readonly MIN_CLUSTER_SIZE = RAG_CONFIG.CLUSTERING.MIN_CLUSTER_SIZE; // R-T3 uyumu: CLAUDE.md §4.2
    private readonly SUPPORT_ROLES = new Set([
        'ADMIN', 'SUPER_ADMIN', 'SUPPORT_AGENT', 'SENIOR_AGENT', 'TEAM_LEAD',
        'DEPARTMENT_MANAGER', 'MANAGER', 'AGENT', 'KB_EDITOR', 'SUPPORT_MANAGER', 'SUPERUSER',
    ]);

    constructor(
        private readonly prisma: PrismaService,
        private readonly ai: AiService,
        private readonly embeddingService: EmbeddingService,
        @Inject(forwardRef(() => FaqService)) private readonly faqService: FaqService,
    ) { }

    /**
     * Daily job to cluster resolved tickets and generate FAQ candidates.
     * Starts at 02:00 as per architecture specification R-T4.
     */
    @Cron('0 2 * * *', { waitForCompletion: true })
    async runClusteringPipeline() {
        this.logger.log('🚀 Starting Ticket Clustering Pipeline...');

        // 1. Get tickets resolved in the last 7 days that haven't been processed
        // Physical database now has department_id, so this call is safe.
        const tickets = await this.prisma.ticket.findMany({
            where: {
                status: { in: ['RESOLVED', 'CLOSED'] },
                knowledgeBaseAdded: false,
                deletedAt: null,
                updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                satisfactionScore: { gte: 4 },
            },
            include: {
                messages: {
                    where: { isInternal: false, deletedAt: null },
                    orderBy: { createdAt: 'asc' },
                    include: { sender: { select: { role: { select: { name: true } } } } },
                },
                department: true // Optional: tracking which department these belong to
            }
        });

        const eligibleTickets = tickets.filter(ticket => this.findVerifiedSolution(ticket));
        if (eligibleTickets.length < this.MIN_CLUSTER_SIZE) {
            this.logger.log('💤 Not enough tickets to cluster.');
            return;
        }

        // 2. Ensure embeddings exist for these tickets
        for (const ticket of eligibleTickets) {
            const solution = this.findVerifiedSolution(ticket)!;
            const content = `${this.maskCustomerPii(ticket.subject)}\n${this.maskCustomerPii(ticket.description || '')}\nSOLUTION: ${this.maskCustomerPii(solution.message)}`;
            await this.embeddingService.indexTicket(ticket.id, content);
        }

        // 3. Simple clustering logic (Centroid-based)
        // Note: For a production app, we might use a dedicated clustering engine or Python microservice.
        // Here we'll use a simplified similarity-graph approach.
        const clusters = await this.findClusters(eligibleTickets.map(t => t.id));
        this.logger.log(`🧬 Found ${clusters.length} potential clusters.`);

        // 4. Transform clusters into FAQ candidates
        for (const cluster of clusters) {
            if (cluster.length >= this.MIN_CLUSTER_SIZE) {
                await this.generateFaqFromCluster(cluster);
            }
        }
    }

    private async findClusters(ticketIds: string[]): Promise<string[][]> {
        const visited = new Set<string>();
        const clusters: string[][] = [];

        for (const id of ticketIds) {
            if (visited.has(id)) continue;

            // Find all similar items to 'id'
            const currentCluster = [id];
            visited.add(id);

            // Fetch subject for search
            const ticket = await this.prisma.ticket.findFirst({ where: { id, deletedAt: null } });
            if (!ticket) continue;

            const matches = await this.embeddingService.searchTickets(this.maskCustomerPii(ticket.subject), 10);
            for (const match of matches) {
                if (ticketIds.includes(match.ticketId) && !visited.has(match.ticketId) && match.similarity > this.SIMILARITY_THRESHOLD) {
                    currentCluster.push(match.ticketId);
                    visited.add(match.ticketId);
                }
            }

            if (currentCluster.length >= this.MIN_CLUSTER_SIZE) {
                clusters.push(currentCluster);
            }
        }

        return clusters;
    }

    private async generateFaqFromCluster(ticketIds: string[]) {
        const tickets = await this.prisma.ticket.findMany({
            where: {
                id: { in: ticketIds },
                status: { in: ['RESOLVED', 'CLOSED'] },
                satisfactionScore: { gte: 4 },
                deletedAt: null,
            },
            include: {
                messages: {
                    where: { isInternal: false, deletedAt: null },
                    orderBy: { createdAt: 'asc' },
                    take: 20,
                    include: { sender: { select: { role: { select: { name: true } } } } },
                },
            }
        });

        const verifiedSolutions = tickets.map(ticket => this.findVerifiedSolution(ticket));
        if (tickets.length !== ticketIds.length || verifiedSolutions.some(solution => !solution)) {
            this.logger.warn('⏭️ Skipping cluster FAQ without a verified public solution for every ticket.');
            return;
        }

        const context = tickets.map(t =>
            `Subject: ${this.maskCustomerPii(t.subject)}\nProblem: ${this.maskCustomerPii(t.description?.substring(0, 200) || '')}...\nSolution: ${this.maskCustomerPii(this.findVerifiedSolution(t)!.message)}`
        ).join('\n---\n');

        const prompt = `Aşağıda birbirine benzeyen ${tickets.length} adet destek talebi bulunmaktadır. 
Bu taleplerden yola çıkarak GENEL bir FAQ (Sıkça Sorulan Soru) maddesi oluştur.

TALEPLER:
${context}

Görevin:
1. Ortak problemi belirle.
2. NET ve profesyonel bir SORU yaz.
3. Çözümü içeren kapsamlı bir YANIT yaz.
4. Yanıtı JSON formatında dön: { "question": "...", "answer": "...", "tags": ["tag1", "tag2"] }`;

        const result = await this.ai.reformat('', 'FAQ Oluşturucu', prompt);

        if (result?.response) {
            try {
                const parsed = JSON.parse(result.response);
                if (!parsed.question?.trim() || !parsed.answer?.trim()) {
                    this.logger.warn('⏭️ Skipping cluster FAQ because the model returned an empty question or answer.');
                    return;
                }
                const avgCsat = tickets.reduce(
                    (sum, t) => sum + ((t.satisfactionScore as number) ?? 3), 0
                ) / tickets.length;
                await this.faqService.createFromCluster({
                    question: this.maskCustomerPii(parsed.question),
                    answer: this.maskCustomerPii(parsed.answer),
                    tags: parsed.tags || [],
                    ticketCount: tickets.length,
                    avgCsat,
                    consistencyRatio: 1.0, // All members passed configured similarity threshold
                    ticketIds,
                });

                // Mark tickets as processed
                await this.prisma.ticket.updateMany({
                    where: { id: { in: ticketIds } },
                    data: { knowledgeBaseAdded: true }
                });

                this.logger.log(`✅ Generated new FAQ candidate from cluster of ${tickets.length} tickets.`);
            } catch (e) {
                this.logger.error('Failed to parse AI generated FAQ cluster', e);
            }
        }
    }

    private findVerifiedSolution(ticket: any): { message: string } | null {
        const message = Array.isArray(ticket.messages)
            ? ticket.messages.find((candidate: any) =>
                candidate.senderId !== ticket.userId
                && this.SUPPORT_ROLES.has(String(candidate?.sender?.role?.name ?? '').toUpperCase())
                && !candidate.isInternal
                && !candidate.deletedAt
                && typeof candidate.message === 'string'
                && candidate.message.trim().length > 0,
            )
            : null;
        return message ? { message: message.message.trim() } : null;
    }

    private maskCustomerPii(value: string): string {
        return String(value ?? '')
            .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
            .replace(/(?:\+?90|0)?\s*\(?5\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/g, '[telefon]')
            .replace(/\b[A-Z0-9]{8,}\b/g, '[kimlik]');
    }
}

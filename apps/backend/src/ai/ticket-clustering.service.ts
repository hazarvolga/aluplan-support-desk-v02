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
                updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                satisfactionScore: { gte: 3 }, // R-T3: CSAT < 3/5 olan ticket FAQ kaynağı olamaz
            },
            include: {
                messages: { orderBy: { createdAt: 'asc' } },
                department: true // Optional: tracking which department these belong to
            }
        });

        if (tickets.length < this.MIN_CLUSTER_SIZE) {
            this.logger.log('💤 Not enough tickets to cluster.');
            return;
        }

        // 2. Ensure embeddings exist for these tickets
        for (const ticket of tickets) {
            const content = `${ticket.subject}\n${ticket.description || ''}`;
            await this.embeddingService.indexTicket(ticket.id, content);
        }

        // 3. Simple clustering logic (Centroid-based)
        // Note: For a production app, we might use a dedicated clustering engine or Python microservice.
        // Here we'll use a simplified similarity-graph approach.
        const clusters = await this.findClusters(tickets.map(t => t.id));
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
            const ticket = await this.prisma.ticket.findUnique({ where: { id } });
            if (!ticket) continue;

            const matches = await this.embeddingService.searchTickets(ticket.subject, 10);
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
            where: { id: { in: ticketIds } },
            include: { messages: { take: 5 } }
        });

        const context = tickets.map(t =>
            `Subject: ${t.subject}\nProblem: ${t.description?.substring(0, 200)}...`
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
                const avgCsat = tickets.reduce(
                    (sum, t) => sum + ((t.satisfactionScore as number) ?? 3), 0
                ) / tickets.length;
                await this.faqService.createFromCluster({
                    question: parsed.question,
                    answer: parsed.answer,
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
}

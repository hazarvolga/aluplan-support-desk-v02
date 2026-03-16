import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Processor('kb-summarizer')
export class KbSummarizerProcessor extends WorkerHost {
    private readonly logger = new Logger(KbSummarizerProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly ai: AiService,
    ) {
        super();
    }

    async process(job: Job<{ ticketId: string }>): Promise<any> {
        const { ticketId } = job.data;
        this.logger.log(`🤖 Summarizing ticket ${ticketId} for Self-Learning KB...`);

        // 1. Get ticket and messages
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        });

        if (!ticket || ticket.messages.length === 0) {
            this.logger.warn(`Ticket ${ticketId} not found or has no messages.`);
            return;
        }

        // Idempotency: skip if already processed
        if (ticket.knowledgeBaseAdded) {
            this.logger.log(`⏭️ Ticket ${ticketId} already in KB, skipping processor.`);
            return;
        }

        // Idempotency: check for existing faq_entry with same sourceId
        const existingFaq = await this.prisma.faqEntry.findFirst({
            where: { sourceTypes: { has: ticketId } },
            select: { id: true }
        });
        if (existingFaq) {
            this.logger.log(`⏭️ FAQ entry already exists for ticket ${ticketId}, skipping.`);
            return;
        }

        // Check if AI is available
        const isAvailable = await this.ai.isAvailable();
        if (!isAvailable) {
            this.logger.error('AI Service is not available to summarize the ticket.');
            throw new Error('AI service unavailable');
        }

        // 2. Format conversation
        const conversation = ticket.messages.map((m: any) =>
            `${m.isInternal ? '[INTERNAL] ' : ''}${m.senderId === ticket.userId ? 'Customer' : 'Agent'}: ${m.message}`
        ).join('\n---\n');

        // 3. Ask AI to summarize
        const summary = await this.ai.summarizeTicket(ticket.subject, conversation);

        if (!summary) {
            this.logger.error(`Ollama failed to return a summary for ticket ${ticketId}`);
            throw new Error('Model returned empty summary');
        }

        // Simple split for Q and A if AI followed format
        let question = ticket.subject;
        let answer = summary;

        if (summary.includes('Cevap:')) {
            const parts = summary.split('Cevap:');
            question = parts[0].replace('Soru:', '').trim();
            answer = parts[1].trim();
        }

        // 4. Save to FaqEntry (as PENDING_REVIEW)
        await this.prisma.faqEntry.create({
            data: {
                question: question,
                answer: answer,
                status: 'PENDING_REVIEW',
                isInternal: true, // AI summarized tickets are internal by default
                confidenceScore: 0.90, // CSAT backed!
                sourceTypes: ['ticket'],
                tags: ticket.tags,
                language: 'tr' // Default language
            }
        });

        // 5. Update Ticket to indicate it was added to KB
        await this.prisma.ticket.update({
            where: { id: ticketId },
            data: { knowledgeBaseAdded: true }
        });

        this.logger.log(`✅ Default KB Article drafted for ticket ${ticket.ticketNumber}`);
    }
}

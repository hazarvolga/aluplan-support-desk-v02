import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { OllamaService } from '../ai/ollama.service';

@Processor('kb-summarizer')
export class KbSummarizerProcessor extends WorkerHost {
    private readonly logger = new Logger(KbSummarizerProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly ollama: OllamaService,
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

        // Check if ollama is available
        const isAvailable = await this.ollama.isAvailable();
        if (!isAvailable) {
            this.logger.error('Ollama is not available to summarize the ticket.');
            throw new Error('Ollama service unavailable');
        }

        // 2. Format conversation
        const conversation = ticket.messages.map((m: any) =>
            `${m.isInternal ? '[INTERNAL] ' : ''}${m.senderId === ticket.userId ? 'Customer' : 'Agent'}: ${m.message}`
        ).join('\n---\n');

        // 3. Ask Ollama to summarize
        const summary = await this.ollama.summarizeTicket(ticket.subject, conversation);

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

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { FaqService, ExtractedPattern } from './faq.service';
import { PiiMaskingService } from '../common/services/pii-masking.service';

@Processor('kb-summarizer')
export class KbSummarizerProcessor extends WorkerHost {
    private readonly logger = new Logger(KbSummarizerProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly ai: AiService,
        private readonly faqService: FaqService,
        private readonly piiMaskingService: PiiMaskingService,
    ) {
        super();
    }

    async process(job: Job<{ ticketId: string }>): Promise<any> {
        const { ticketId } = job.data;
        this.logger.log(`🤖 Summarizing ticket ${ticketId} for Self-Learning KB...`);

        // 1. Get ticket and messages
        const ticket = await this.prisma.ticket.findFirst({
            where: { id: ticketId, deletedAt: null },
            include: {
                messages: {
                    where: { isInternal: false, deletedAt: null },
                    orderBy: { createdAt: 'asc' },
                },
            }
        });

        if (!ticket || ticket.messages.length === 0) {
            this.logger.warn(`Ticket ${ticketId} not found or has no messages.`);
            return;
        }

        // Idempotency: skip if already processed.
        // FaqEntry'de ticket-id alanı yok — bu yüzden duplicate koruması knowledgeBaseAdded
        // flag'ine + FaqService.handleTicketKbSummarize'daki upstream check'e dayanır.
        // Bu processor knowledgeBaseAdded'i en sonda setler; idempotency tek savunma noktası.
        if (ticket.knowledgeBaseAdded) {
            this.logger.log(`⏭️ Ticket ${ticketId} already in KB, skipping processor.`);
            return;
        }

        // Check if AI is available
        const isAvailable = await this.ai.isAvailable();
        if (!isAvailable) {
            this.logger.error('AI Service is not available to summarize the ticket.');
            throw new Error('AI service unavailable');
        }

        // Defense in depth: keep private staff notes out even if a mocked or
        // future data adapter does not honor the query-level filter.
        const publicMessages = ticket.messages.filter(
            (message: any) => !message.isInternal && !message.deletedAt,
        );
        if (publicMessages.length === 0) {
            this.logger.warn(`Ticket ${ticketId} has no customer-visible messages to summarize.`);
            return;
        }

        // 2. Format customer-visible conversation only
        const conversation = publicMessages.map((m: any) =>
            `${m.senderId === ticket.userId ? 'Customer' : 'Agent'}: ${this.piiMaskingService.maskSensitiveData(m.message)}`
        ).join('\n---\n');

        // 3. Ask AI to summarize
        const maskedSubject = this.piiMaskingService.maskSensitiveData(ticket.subject);
        const summary = await this.ai.summarizeTicket(maskedSubject, conversation);

        if (!summary) {
            this.logger.error(`Ollama failed to return a summary for ticket ${ticketId}`);
            throw new Error('Model returned empty summary');
        }

        // Simple split for Q and A if AI followed format
        let question = maskedSubject;
        let answer = summary;

        if (summary.includes('Cevap:')) {
            const parts = summary.split('Cevap:');
            question = parts[0].replace('Soru:', '').trim();
            answer = parts[1].trim();
        }

        // 4. Delegate FAQ creation to FaqService (single point of responsibility)
        const pattern: ExtractedPattern = {
            question,
            answer,
            confidenceScore: 0.90,
            sourceType: 'ticket',
            sourceId: ticketId,
            tags: ticket.tags || [],
            language: 'tr' // Default language
        };

        await this.faqService.processKbPattern(pattern);

        // 5. Update Ticket to indicate it was added to KB
        await this.prisma.ticket.update({
            where: { id: ticketId },
            data: { knowledgeBaseAdded: true }
        });

        this.logger.log(`✅ Default KB Article drafted for ticket ${ticket.ticketNumber}`);
    }
}

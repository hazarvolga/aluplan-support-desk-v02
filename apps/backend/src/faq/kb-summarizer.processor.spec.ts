import { KbSummarizerProcessor } from './kb-summarizer.processor';
import { PiiMaskingService } from '../common/services/pii-masking.service';

describe('KbSummarizerProcessor privacy', () => {
    const prisma = {
        ticket: {
            findFirst: jest.fn(),
            update: jest.fn().mockResolvedValue({}),
        },
    };
    const ai = {
        isAvailable: jest.fn().mockResolvedValue(true),
        summarizeTicket: jest.fn().mockResolvedValue('Soru: Test\nCevap: Public resolution'),
    };
    const faqService = {
        processKbPattern: jest.fn().mockResolvedValue({}),
    };

    let processor: KbSummarizerProcessor;

    beforeEach(() => {
        jest.clearAllMocks();
        processor = new KbSummarizerProcessor(prisma as any, ai as any, faqService as any, new PiiMaskingService());
    });

    it('excludes internal notes from both the ticket query and summarization prompt', async () => {
        prisma.ticket.findFirst.mockResolvedValue({
            id: 'ticket-1',
            ticketNumber: 'SUP-001',
            userId: 'customer-1',
            subject: 'License issue',
            tags: [],
            knowledgeBaseAdded: false,
            messages: [
                { senderId: 'customer-1', message: 'Public customer issue user@example.com', isInternal: false, deletedAt: null },
                { senderId: 'agent-1', message: 'PRIVATE COMMERCIAL NOTE', isInternal: true, deletedAt: null },
                { senderId: 'agent-1', message: 'DELETED PUBLIC NOTE', isInternal: false, deletedAt: new Date() },
                { senderId: 'agent-1', message: 'Public agent resolution', isInternal: false, deletedAt: null },
            ],
        });

        await processor.process({ data: { ticketId: 'ticket-1' } } as any);

        expect(prisma.ticket.findFirst).toHaveBeenCalledWith({
            where: { id: 'ticket-1', deletedAt: null },
            include: {
                messages: {
                    where: { isInternal: false, deletedAt: null },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        const conversation = ai.summarizeTicket.mock.calls[0][1];
        expect(conversation).toContain('Public customer issue');
        expect(conversation).toContain('Public agent resolution');
        expect(conversation).not.toContain('user@example.com');
        expect(conversation).toContain('[E-POSTA GİZLENDİ: u***@example.com]');
        expect(conversation).not.toContain('PRIVATE COMMERCIAL NOTE');
        expect(conversation).not.toContain('DELETED PUBLIC NOTE');
        expect(conversation).not.toContain('[INTERNAL]');
    });

    it('does not call the model when only internal notes are returned', async () => {
        prisma.ticket.findFirst.mockResolvedValue({
            id: 'ticket-1',
            ticketNumber: 'SUP-001',
            userId: 'customer-1',
            subject: 'License issue',
            tags: [],
            knowledgeBaseAdded: false,
            messages: [
                { senderId: 'agent-1', message: 'PRIVATE COMMERCIAL NOTE', isInternal: true },
            ],
        });

        await processor.process({ data: { ticketId: 'ticket-1' } } as any);

        expect(ai.summarizeTicket).not.toHaveBeenCalled();
        expect(faqService.processKbPattern).not.toHaveBeenCalled();
    });

    it('does not summarize a soft-deleted ticket', async () => {
        prisma.ticket.findFirst.mockResolvedValue(null);

        await processor.process({ data: { ticketId: 'deleted-ticket' } } as any);

        expect(ai.summarizeTicket).not.toHaveBeenCalled();
        expect(faqService.processKbPattern).not.toHaveBeenCalled();
    });

    it('uses the masked subject when the model does not return the structured answer format', async () => {
        prisma.ticket.findFirst.mockResolvedValue({
            id: 'ticket-1',
            ticketNumber: 'SUP-001',
            userId: 'customer-1',
            subject: 'Contact user@example.com about licensing',
            tags: [],
            knowledgeBaseAdded: false,
            messages: [
                { senderId: 'customer-1', message: 'Public issue', isInternal: false, deletedAt: null },
            ],
        });
        ai.summarizeTicket.mockResolvedValueOnce('Plain model summary without the expected marker');

        await processor.process({ data: { ticketId: 'ticket-1' } } as any);

        const pattern = faqService.processKbPattern.mock.calls[0][0];
        expect(pattern.question).toContain('[E-POSTA GİZLENDİ: u***@example.com]');
        expect(pattern.question).not.toContain('user@example.com');
    });
});

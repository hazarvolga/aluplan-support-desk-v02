import { ReviewCenterService } from './review-center.service';

describe('ReviewCenterService', () => {
    const prisma = {
        ticket: { count: jest.fn() },
        knowledgeArticle: { count: jest.fn() },
        faqEntry: { count: jest.fn() },
        crawlCandidate: { count: jest.fn() },
    };

    let service: ReviewCenterService;

    beforeEach(() => {
        jest.clearAllMocks();
        prisma.ticket.count
            .mockResolvedValueOnce(2)
            .mockResolvedValueOnce(3);
        prisma.knowledgeArticle.count.mockResolvedValue(5);
        prisma.faqEntry.count.mockResolvedValue(7);
        prisma.crawlCandidate.count.mockResolvedValue(11);
        service = new ReviewCenterService(prisma as never);
    });

    it('returns every action card plus the audit link for an ADMIN wildcard', async () => {
        const summary = await service.getSummary({
            role: 'ADMIN',
            permissions: ['*'],
        });

        expect(summary.items).toEqual([
            expect.objectContaining({ id: 'live-chat-requests', kind: 'ACTION', count: 2 }),
            expect.objectContaining({ id: 'unassigned-tickets', kind: 'ACTION', count: 3 }),
            expect.objectContaining({ id: 'article-reviews', kind: 'ACTION', count: 5 }),
            expect.objectContaining({ id: 'faq-candidates', kind: 'ACTION', count: 7 }),
            expect.objectContaining({ id: 'crawler-candidates', kind: 'ACTION', count: 11 }),
            expect.objectContaining({ id: 'ai-interaction-history', kind: 'AUDIT' }),
        ]);
        expect(summary.items.at(-1)).not.toHaveProperty('count');
    });

    it('returns only capabilities the SUPPORT_AGENT can actually complete', async () => {
        const summary = await service.getSummary({
            role: { name: 'support-agent' },
            permissions: [
                'ticket:update',
                'ticket:assign',
                'kb:approve',
                'faq:manage',
                'ai-interactions:read',
            ],
        });

        expect(summary.items.map(({ id }) => id)).toEqual([
            'live-chat-requests',
            'unassigned-tickets',
            'article-reviews',
            'faq-candidates',
            'ai-interaction-history',
        ]);
        expect(prisma.crawlCandidate.count).not.toHaveBeenCalled();
    });

    it('does not leak queue existence or execute count queries for customers', async () => {
        const summary = await service.getSummary({
            role: 'CUSTOMER',
            permissions: ['ticket:read', 'ticket:create'],
        });

        expect(summary.items).toEqual([]);
        expect(prisma.ticket.count).not.toHaveBeenCalled();
        expect(prisma.knowledgeArticle.count).not.toHaveBeenCalled();
        expect(prisma.faqEntry.count).not.toHaveBeenCalled();
        expect(prisma.crawlCandidate.count).not.toHaveBeenCalled();
    });

    it('counts only active requested chats and active unassigned tickets', async () => {
        await service.getSummary({
            role: 'SUPPORT_AGENT',
            permissions: ['ticket:update', 'ticket:assign'],
        });

        expect(prisma.ticket.count).toHaveBeenNthCalledWith(1, {
            where: {
                chatStatus: 'REQUESTED',
                status: { notIn: ['RESOLVED', 'CLOSED'] },
            },
        });
        expect(prisma.ticket.count).toHaveBeenNthCalledWith(2, {
            where: {
                assignedTo: null,
                status: { notIn: ['RESOLVED', 'CLOSED'] },
            },
        });
    });
});

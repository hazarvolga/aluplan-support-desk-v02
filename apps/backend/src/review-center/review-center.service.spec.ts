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
                'ticket:read',
                'ticket:update',
                'ticket:assign',
                'kb:read',
                'kb:approve',
                'faq:manage',
                'faq:review',
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
            permissions: ['ticket:create', 'ticket:read', 'ticket:update', 'kb:read'],
        });

        expect(summary.items).toEqual([]);
        expect(prisma.ticket.count).not.toHaveBeenCalled();
        expect(prisma.knowledgeArticle.count).not.toHaveBeenCalled();
        expect(prisma.faqEntry.count).not.toHaveBeenCalled();
        expect(prisma.crawlCandidate.count).not.toHaveBeenCalled();
    });

    it('does not query a queue unless the caller can both open and act on it', async () => {
        const summary = await service.getSummary({
            role: 'SUPPORT_AGENT',
            permissions: ['ticket:update', 'ticket:assign', 'kb:approve', 'faq:manage'],
        });

        expect(summary.items).toEqual([]);
        expect(prisma.ticket.count).not.toHaveBeenCalled();
        expect(prisma.knowledgeArticle.count).not.toHaveBeenCalled();
        expect(prisma.faqEntry.count).not.toHaveBeenCalled();
    });

    it('does not treat the legacy admin permission as a role wildcard', async () => {
        const summary = await service.getSummary({
            role: 'AGENT',
            permissions: ['admin'],
        });

        expect(summary.items.map(({ id }) => id)).not.toContain('faq-candidates');
        expect(summary.items.map(({ id }) => id)).not.toContain('crawler-candidates');
        expect(prisma.faqEntry.count).not.toHaveBeenCalled();
        expect(prisma.crawlCandidate.count).not.toHaveBeenCalled();
    });

    it('counts the same authored article review set shown by the destination list', async () => {
        await service.getSummary({
            role: 'SUPPORT_AGENT',
            permissions: ['kb:read', 'kb:approve'],
        });

        expect(prisma.knowledgeArticle.count).toHaveBeenCalledWith({
            where: {
                status: 'REVIEW',
                deletedAt: null,
                isAutoImported: false,
            },
        });
    });

    it('counts only active requested chats and active unassigned tickets', async () => {
        await service.getSummary({
            role: 'SUPPORT_AGENT',
            permissions: ['ticket:read', 'ticket:update', 'ticket:assign'],
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

        const summary = await service.getSummary({
            role: 'SUPPORT_AGENT',
            permissions: ['ticket:read', 'ticket:update', 'ticket:assign'],
        });
        expect(summary.items.find(({ id }) => id === 'live-chat-requests')?.href)
            .toContain('activeOnly=true');
        expect(summary.items.find(({ id }) => id === 'unassigned-tickets')?.href)
            .toContain('activeOnly=true');
    });
});

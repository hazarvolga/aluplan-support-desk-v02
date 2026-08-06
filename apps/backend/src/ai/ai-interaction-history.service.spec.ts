import { ForbiddenException } from '@nestjs/common';
import { AiInteractionHistoryService } from './ai-interaction-history.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AiInteractionHistoryService', () => {
    const prisma = {
        aiInteraction: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
        auditLog: {
            create: jest.fn(),
        },
    };

    let service: AiInteractionHistoryService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AiInteractionHistoryService(prisma as unknown as PrismaService);
    });

    it('returns a stable, paginated allow-listed interaction history', async () => {
        prisma.aiInteraction.findMany.mockResolvedValue([{
            id: 'interaction-1',
            userQuery: 'How do I reset the workspace?',
            responseGenerated: 'Use the workspace reset command.',
            confidenceBand: 'HIGH',
            similarityScore: { toString: () => '0.91' },
            autoAnswered: true,
            ticketCreated: false,
            channel: 'WEB',
            provider: 'gemini',
            model: 'gemini-2.5-flash',
            createdAt: new Date('2026-08-06T10:00:00Z'),
            user: { id: 'user-1', fullName: 'Ada User', email: 'ada@example.com', customerProfile: { companyName: 'Ada Ltd' } },
            ticket: null,
            matchedArticle: { id: 'article-1', title: 'Workspace reset' },
        }]);
        prisma.aiInteraction.count.mockResolvedValue(1);

        const result = await service.list({ page: 1, limit: 20 }, 'ADMIN', '11111111-1111-4111-8111-111111111111');

        expect(prisma.aiInteraction.findMany).toHaveBeenCalledWith(expect.objectContaining({
            skip: 0,
            take: 20,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            select: expect.not.objectContaining({ userContext: true }),
        }));
        expect(result).toEqual({
            data: [expect.objectContaining({
                id: 'interaction-1',
                userQuery: 'How do I reset the workspace?',
                responseGenerated: 'Use the workspace reset command.',
                user: { id: 'user-1', fullName: 'Ada User', email: 'ada@example.com', companyName: 'Ada Ltd' },
                ticket: null,
            })],
            total: 1,
            page: 1,
            limit: 20,
            pages: 1,
        });
        expect(result.data[0]).not.toHaveProperty('userContext');
        expect(result.data[0]).not.toHaveProperty('inputTokens');
        expect(result.data[0]).not.toHaveProperty('estimatedCost');
        expect(prisma.auditLog.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                actorId: '11111111-1111-4111-8111-111111111111',
                action: 'ai_interactions.read',
                newValue: expect.objectContaining({ resultCount: 1, total: 1 }),
            }),
        });
    });

    it('filters ticketless and NO_MATCH records without trusting the ticketCreated flag', async () => {
        prisma.aiInteraction.findMany.mockResolvedValue([]);
        prisma.aiInteraction.count.mockResolvedValue(0);

        await service.list({
            page: 2,
            limit: 10,
            ticketState: 'TICKETLESS',
            confidence: 'NO_MATCH',
            search: ' toolbar ',
            interactionId: '22222222-2222-4222-8222-222222222222',
        }, 'SUPERUSER');

        const expectedWhere = expect.objectContaining({
            confidenceBand: null,
            id: '22222222-2222-4222-8222-222222222222',
            ticket: { is: null },
            OR: expect.any(Array),
        });
        expect(prisma.aiInteraction.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expectedWhere, skip: 10, take: 10 }));
        expect(prisma.aiInteraction.count).toHaveBeenCalledWith({ where: expectedWhere });
    });

    it.each(['CUSTOMER', 'VIEWER', 'SUPPORT_MANAGER'])('rejects %s before querying Prisma', async (role) => {
        await expect(service.list({ page: 1, limit: 20 }, role)).rejects.toBeInstanceOf(ForbiddenException);
        expect(prisma.aiInteraction.findMany).not.toHaveBeenCalled();
        expect(prisma.aiInteraction.count).not.toHaveBeenCalled();
    });
});

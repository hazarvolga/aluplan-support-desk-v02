import { Test, TestingModule } from '@nestjs/testing';
import { AiAutoResolverService } from './ai-auto-resolver.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { EmbeddingService } from './embedding.service';
import { AiQueryService } from './ai-query.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { mockPrismaService } from '../test/mock.utils';

describe('AiAutoResolverService - Auto Learning', () => {
    let service: AiAutoResolverService;

    const mockAiService = {
        generate: jest.fn(),
    };

    const mockEmbeddingService = {
        indexTicket: jest.fn(),
    };

    const mockAiQueryService = {
        query: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiAutoResolverService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: AiService, useValue: mockAiService },
                { provide: EmbeddingService, useValue: mockEmbeddingService },
                { provide: AiQueryService, useValue: mockAiQueryService },
                { provide: EventEmitter2, useValue: { emit: jest.fn() } },
            ],
        }).compile();

        service = module.get<AiAutoResolverService>(AiAutoResolverService);
        jest.clearAllMocks();
    });

    describe('handleTicketSummarize', () => {
        it('should summarize resolved ticket and trigger embedding index', async () => {
            // Arrange
            const mockTicket = { id: 'tik-1', ticketNumber: 'SUP-001', subject: 'Login issue', satisfactionScore: 5 };
            const mockMessages = [
                { isInternal: false, message: 'I cannot login' },
                { isInternal: false, message: 'Please clear cache' }
            ];

            mockPrismaService.ticketMessage.findMany.mockResolvedValue(mockMessages);
            mockAiService.generate.mockResolvedValue(JSON.stringify({
                question: 'How to login?',
                answer: 'Clear cache.',
                language: 'en'
            }));

            // Act
            await service.handleTicketSummarize(mockTicket as any);

            // Assert
            expect(mockPrismaService.ticketMessage.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { ticketId: 'tik-1' } })
            );
            expect(mockAiService.generate).toHaveBeenCalled();
            expect(mockPrismaService.ticket.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'tik-1' },
                    data: { knowledgeBaseAdded: true }
                })
            );
            expect(mockEmbeddingService.indexTicket).toHaveBeenCalledWith('tik-1', expect.any(String));
        });
    });
});

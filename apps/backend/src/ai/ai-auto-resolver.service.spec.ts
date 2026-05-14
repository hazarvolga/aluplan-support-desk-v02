import { Test, TestingModule } from '@nestjs/testing';
import { AiAutoResolverService } from './ai-auto-resolver.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { EmbeddingService } from './embedding.service';
import { AiQueryService } from './ai-query.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { mockPrismaService } from '../test/mock.utils';
import { SettingsService } from '../settings/settings.service';

describe('AiAutoResolverService - Auto Learning', () => {
    let service: AiAutoResolverService;

    const mockAiService = {
        generate: jest.fn(),
        analyzeSentiment: jest.fn(),
    };

    const mockEmbeddingService = {
        indexTicket: jest.fn(),
    };

    const mockAiQueryService = {
        query: jest.fn(),
    };

    const mockSettingsService = {
        getValue: jest.fn(),
    };

    beforeEach(async () => {
        mockPrismaService.ticketMessage.update ??= jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiAutoResolverService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: AiService, useValue: mockAiService },
                { provide: EmbeddingService, useValue: mockEmbeddingService },
                { provide: AiQueryService, useValue: mockAiQueryService },
                { provide: EventEmitter2, useValue: { emit: jest.fn() } },
                { provide: SettingsService, useValue: mockSettingsService },
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
            // Note: knowledgeBaseAdded flag is set by KbSummarizerProcessor, not here
            expect(mockEmbeddingService.indexTicket).toHaveBeenCalledWith('tik-1', expect.any(String));
        });

        it('should skip tickets with satisfaction score < 4', async () => {
            const mockTicket = { id: 'tik-low', satisfactionScore: 3 };
            await service.handleTicketSummarize(mockTicket as any);
            expect(mockPrismaService.ticketMessage.findMany).not.toHaveBeenCalled();
        });
    });

    describe('handleMessageAdded quota guards', () => {
        it('should skip optional sentiment and context suggestions by default', async () => {
            mockSettingsService.getValue.mockResolvedValue(null);

            await service.handleMessageAdded({
                ticket: {
                    id: 'tik-1',
                    userId: 'user-1',
                    ticketNumber: 'SUP-001',
                    status: 'OPEN',
                },
                message: {
                    id: 'msg-1',
                    ticketId: 'tik-1',
                    senderId: 'user-1',
                    message: 'Allplan is slow',
                    isInternal: false,
                },
            } as any);

            expect(mockAiService.analyzeSentiment).not.toHaveBeenCalled();
            expect(mockAiQueryService.query).not.toHaveBeenCalled();
        });

        it('should run sentiment only when auto sentiment is explicitly enabled', async () => {
            mockSettingsService.getValue.mockImplementation(async (key: string) => {
                if (key === 'ai.auto_sentiment.enabled') return 'true';
                return null;
            });
            mockAiService.analyzeSentiment.mockResolvedValue('NEGATIVE');
            mockPrismaService.ticketMessage.update.mockResolvedValue({});
            mockPrismaService.ticket.update.mockResolvedValue({});

            await service.handleMessageAdded({
                ticket: {
                    id: 'tik-1',
                    userId: 'user-1',
                    ticketNumber: 'SUP-001',
                    status: 'OPEN',
                    priority: 'MEDIUM',
                    channel: 'WEB',
                },
                message: {
                    id: 'msg-1',
                    ticketId: 'tik-1',
                    senderId: 'user-1',
                    message: 'Allplan is slow',
                    isInternal: false,
                },
            } as any);

            expect(mockAiService.analyzeSentiment).toHaveBeenCalledWith('Allplan is slow');
            expect(mockPrismaService.ticketMessage.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'msg-1' },
                data: { sentiment: 'NEGATIVE' },
            }));
            expect(mockAiQueryService.query).not.toHaveBeenCalled();
        });
    });
});

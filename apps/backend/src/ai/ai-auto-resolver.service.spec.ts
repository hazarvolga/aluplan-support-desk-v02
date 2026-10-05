import { Test, TestingModule } from '@nestjs/testing';
import { AiAutoResolverService } from './ai-auto-resolver.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { EmbeddingService } from './embedding.service';
import { AiQueryService } from './ai-query.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { mockPrismaService } from '../test/mock.utils';
import { SettingsService } from '../settings/settings.service';
import { PiiMaskingService } from '../common/services/pii-masking.service';

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
        mockPrismaService.ticket.findFirst.mockResolvedValue({
            status: 'CLOSED',
            satisfactionScore: 5,
            deletedAt: null,
            messages: [],
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiAutoResolverService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: AiService, useValue: mockAiService },
                { provide: EmbeddingService, useValue: mockEmbeddingService },
                { provide: AiQueryService, useValue: mockAiQueryService },
                { provide: EventEmitter2, useValue: { emit: jest.fn() } },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: PiiMaskingService, useValue: new PiiMaskingService() },
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
                { isInternal: false, message: 'I cannot login user@example.com' },
                { isInternal: true, message: 'PRIVATE COMMERCIAL NOTE' },
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
                expect.objectContaining({ where: { ticketId: 'tik-1', isInternal: false, deletedAt: null } })
            );
            // Note: knowledgeBaseAdded flag is set by KbSummarizerProcessor, not here
            expect(mockEmbeddingService.indexTicket).toHaveBeenCalledWith('tik-1', expect.any(String));
            expect(mockEmbeddingService.indexTicket.mock.calls[0][1]).not.toContain('PRIVATE COMMERCIAL NOTE');
            expect(mockEmbeddingService.indexTicket.mock.calls[0][1]).not.toContain('user@example.com');
            expect(mockEmbeddingService.indexTicket.mock.calls[0][1]).toContain('[E-POSTA GİZLENDİ: u***@example.com]');
        });

        it('should skip tickets with satisfaction score < 4', async () => {
            const mockTicket = { id: 'tik-low', satisfactionScore: 3 };
            await service.handleTicketSummarize(mockTicket as any);
            expect(mockPrismaService.ticketMessage.findMany).not.toHaveBeenCalled();
        });

        it('does not index a ticket when an adapter returns only internal notes', async () => {
            mockPrismaService.ticketMessage.findMany.mockResolvedValue([
                { isInternal: true, message: 'PRIVATE COMMERCIAL NOTE' },
            ]);

            await service.handleTicketSummarize({
                id: 'tik-private',
                ticketNumber: 'SUP-PRIVATE',
                subject: 'Private ticket',
                satisfactionScore: 5,
            } as any);

            expect(mockEmbeddingService.indexTicket).not.toHaveBeenCalled();
        });
    });

    describe('AI prompt privacy', () => {
        it('ignores delayed AI events for soft-deleted tickets', async () => {
            const deletedTicket = {
                id: 'tik-deleted',
                userId: 'user-1',
                ticketNumber: 'SUP-DELETED',
                subject: 'Deleted ticket',
                status: 'NEW',
                satisfactionScore: 5,
                deletedAt: new Date(),
            };

            await service.handleTicketCreated(deletedTicket as any);
            await service.handleMessageAdded({
                ticket: deletedTicket,
                message: {
                    id: 'msg-1',
                    senderId: 'user-1',
                    message: 'Should not be processed',
                    isInternal: false,
                },
            } as any);
            await service.handleTicketSummarize(deletedTicket as any);

            expect(mockPrismaService.ticketMessage.findMany).not.toHaveBeenCalled();
            expect(mockAiService.analyzeSentiment).not.toHaveBeenCalled();
            expect(mockAiQueryService.query).not.toHaveBeenCalled();
            expect(mockEmbeddingService.indexTicket).not.toHaveBeenCalled();
        });

        it('excludes internal notes from the ticket-created history', async () => {
            mockPrismaService.ticketMessage.findMany.mockResolvedValue([
                { senderId: 'user-1', message: 'Public issue user@example.com', isInternal: false },
                { senderId: 'agent-1', message: 'PRIVATE COMMERCIAL NOTE', isInternal: true },
            ]);
            mockAiQueryService.query.mockResolvedValue({ confidence: 'LOW', interactionId: 'interaction-1' });
            mockPrismaService.ticket.update.mockResolvedValue({});

            await service.handleTicketCreated({
                id: 'tik-1',
                userId: 'user-1',
                ticketNumber: 'SUP-001',
                subject: 'Login issue',
                description: 'Contact user@example.com',
                status: 'NEW',
                channel: 'WEB',
            } as any);

            expect(mockPrismaService.ticketMessage.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { ticketId: 'tik-1', isInternal: false, deletedAt: null },
            }));
            const queryOptions = mockAiQueryService.query.mock.calls[0][0];
            expect(queryOptions.privacySafeContext).toBe(true);
            expect(JSON.stringify(queryOptions)).not.toContain('PRIVATE COMMERCIAL NOTE');
            expect(JSON.stringify(queryOptions)).not.toContain('user@example.com');
        });

        it('excludes internal notes from context-aware suggestion history', async () => {
            mockSettingsService.getValue.mockImplementation(async (key: string) => (
                key === 'ai.auto_context_suggestion.enabled' ? 'true' : null
            ));
            mockPrismaService.ticketMessage.findMany.mockResolvedValue([
                { senderId: 'user-1', message: 'Public follow-up', isInternal: false },
                { senderId: 'agent-1', message: 'PRIVATE COMMERCIAL NOTE', isInternal: true },
            ]);
            mockAiQueryService.query.mockResolvedValue({ answer: null });

            await service.handleMessageAdded({
                ticket: {
                    id: 'tik-1',
                    userId: 'user-1',
                    ticketNumber: 'SUP-001',
                    status: 'OPEN',
                    channel: 'WEB',
                },
                message: {
                    id: 'msg-1',
                    ticketId: 'tik-1',
                    senderId: 'user-1',
                    message: 'New public question',
                    isInternal: false,
                },
            } as any);

            expect(mockPrismaService.ticketMessage.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { ticketId: 'tik-1', isInternal: false, deletedAt: null },
            }));
            const queryOptions = mockAiQueryService.query.mock.calls[0][0];
            expect(queryOptions.privacySafeContext).toBe(true);
            expect(JSON.stringify(queryOptions.history)).not.toContain('PRIVATE COMMERCIAL NOTE');
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
                    message: 'Allplan is slow, contact user@example.com',
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
                    message: 'Allplan is slow, contact user@example.com',
                    isInternal: false,
                },
            } as any);

            expect(mockAiService.analyzeSentiment).toHaveBeenCalledWith(
                'Allplan is slow, contact [E-POSTA GİZLENDİ: u***@example.com]',
            );
            expect(mockPrismaService.ticketMessage.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'msg-1' },
                data: { sentiment: 'NEGATIVE' },
            }));
            expect(mockAiQueryService.query).not.toHaveBeenCalled();
        });
    });
});

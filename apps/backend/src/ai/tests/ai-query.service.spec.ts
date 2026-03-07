// apps/backend/src/ai/tests/ai-query.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AiQueryService } from '../ai-query.service';
import { AiService } from '../ai.service';
import { LlmApiService } from '../llm-api.service';
import { SettingsService } from '../../settings/settings.service';
import { RedisService } from '../../redis/redis.service';
import { PromptContextBuilderService } from '../prompt-context-builder.service';
import { PromptsService } from '../prompts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockPrismaService, PrismaServiceProvider } from '../../../test/mocks/prisma.mock';
import { EmbeddingService } from '../embedding.service';
import { LangfuseService } from '../langfuse.service';
import { ConfigService } from '@nestjs/config';

const mockEmbeddingService = {
    search: jest.fn(),
    generateEmbedding: jest.fn(),
};

const mockLlmApiService = {
    generateResponse: jest.fn(),
};

const mockLangfuseService = {
    createTrace: jest.fn().mockReturnValue({
        update: jest.fn(),
        generation: jest.fn().mockReturnValue({
            update: jest.fn(),
            end: jest.fn(),
        }),
    }),
    trace: jest.fn().mockResolvedValue({
        update: jest.fn(),
        generation: jest.fn().mockReturnValue({
            update: jest.fn(),
            end: jest.fn(),
        }),
    }),
    flush: jest.fn(),
};

const mockConfigService = {
    get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
};

const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
};

const mockSettingsService = {
    get: jest.fn(),
};

const mockPromptsService = {
    getPrompt: jest.fn(),
};

const mockPromptContextBuilderService = {
    buildContext: jest.fn(),
};

const mockAiService = {
    generateResponse: jest.fn(),
    getActiveProviderName: jest.fn(),
    getActiveModelName: jest.fn(),
    reformat: jest.fn(),
};

describe('AiQueryService', () => {
    let service: AiQueryService;
    let prisma: PrismaService;
    let embeddingService: EmbeddingService;
    let llmApiService: LlmApiService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiQueryService,
                PrismaServiceProvider,
                { provide: AiService, useValue: mockAiService },
                { provide: EmbeddingService, useValue: mockEmbeddingService },
                { provide: LlmApiService, useValue: mockLlmApiService },
                { provide: LangfuseService, useValue: mockLangfuseService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: RedisService, useValue: mockRedisService },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: PromptsService, useValue: mockPromptsService },
                { provide: PromptContextBuilderService, useValue: mockPromptContextBuilderService },
            ],
        }).compile();

        service = module.get<AiQueryService>(AiQueryService);
        prisma = module.get<PrismaService>(PrismaService);
        embeddingService = module.get<EmbeddingService>(EmbeddingService);
        llmApiService = module.get<LlmApiService>(LlmApiService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('query (Internal Search)', () => {
        it('should return context from database when similarities are above threshold', async () => {
            const customerQuery = 'How do I build a roof in Allplan?';

            // Mock vector search returning High confidence results
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        content: 'To build a roof, open the Architecture tab and select Roof Generation.',
                        similarity: 0.90,
                        articleId: 'art-1',
                        articleVersionId: 'ver-1'
                    }
                ],
                diagnostics: {
                    topScore: 0.90,
                    semanticScore: 0.90,
                    reranked: true
                }
            });

            // Mock active provider
            mockAiService.getActiveProviderName.mockResolvedValue('openai');
            mockAiService.reformat.mockResolvedValue({ response: 'Here is how to create a roof...' });
            mockAiService.getActiveModelName.mockResolvedValue('gpt-4o');
            mockPrismaService.aiInteraction.create.mockResolvedValue({ id: 'mock-interaction-1' });

            // Mock DB lookup
            mockPrismaService.knowledgeArticle.findUnique.mockResolvedValue({
                id: 'art-1', title: 'Roof Creation Guide'
            });

            mockAiService.generateResponse.mockResolvedValue('Here is how to create a roof...');

            // Mock user role
            mockPrismaService.user.findUnique.mockResolvedValue({ role: 'USER' });

            const result = await service.query(customerQuery, 'session-123');

            expect(result.answer).toContain('Here is how to create a roof');
            expect(result.confidence).toBe('HIGH');
            expect(mockEmbeddingService.search).toHaveBeenCalled();
        });

        it('should fail over to No Info message when similarity is too low', async () => {
            const customerQuery = 'Unrelated question about pandas';

            // Return very low similarity
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        content: 'Something else entirely',
                        similarity: 0.10,
                        articleId: 'art-2',
                    }
                ],
                diagnostics: {
                    topScore: 0.10,
                    semanticScore: 0.10,
                    reranked: true
                }
            });

            // Mock active provider
            mockAiService.getActiveProviderName.mockResolvedValue('openai');
            mockAiService.getActiveModelName.mockResolvedValue('gpt-4o');
            mockPrismaService.aiInteraction.create.mockResolvedValue({ id: 'mock-interaction-2' });

            // Mock user role
            mockPrismaService.user.findUnique.mockResolvedValue({ role: 'USER' });

            // Even though it found something, threshold logic should reject it.
            const result = await service.query(customerQuery, 'session-456');

            expect(result.answer).toContain('Bu konuda güvenilir bir kaynak bulunamadı. Talebiniz bir destek temsilcisine yönlendirilecektir.');
            expect(result.confidence).toBe('NO_MATCH');
            expect(mockAiService.generateResponse).not.toHaveBeenCalled();
        });
    });
});

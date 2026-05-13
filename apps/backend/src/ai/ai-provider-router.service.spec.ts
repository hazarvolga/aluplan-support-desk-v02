import { Test, TestingModule } from '@nestjs/testing';
import { AiProviderRouter } from './ai-provider-router.service';
import { AiProviderRegistry } from './ai-provider-registry.service';
import { SettingsService } from '../settings/settings.service';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import { OllamaService } from './ollama.service';
import { OpenAiService } from './openai.service';
import { GenericOpenAiService } from './generic-openai.service';
import { LlmApiService } from './llm-api.service';
import { GeminiService } from './gemini.service';
import { mockPrismaService, mockRedisService } from '../test/mock.utils';

describe('AiProviderRouter', () => {
    let router: AiProviderRouter;
    let registry: AiProviderRegistry;
    let settings: any;
    let redis: any;

    const mockSettingsService = {
        getValue: jest.fn(),
    };

    // Mock AI provider services
    const mockOllamaService = { getName: () => 'ollama', isAvailable: jest.fn() };
    const mockOpenAiService = { getName: () => 'openai', isAvailable: jest.fn() };
    const mockGenericOpenAiService = { 
        getName: () => 'custom', 
        setProvider: jest.fn(),
        isAvailable: jest.fn() 
    };
    const mockLlmApiService = { getName: () => 'llmapi', isAvailable: jest.fn() };
    const mockGeminiService = { getName: () => 'gemini', isAvailable: jest.fn() };

    const mockAiProvider = {
        embed: jest.fn(),
        generate: jest.fn(),
        streamGenerate: jest.fn(),
        reformat: jest.fn(),
        streamReformat: jest.fn(),
        suggestCategory: jest.fn(),
        summarizeTicket: jest.fn(),
        analyzeSentiment: jest.fn(),
        translate: jest.fn(),
        isAvailable: jest.fn(),
        testConnection: jest.fn(),
        getName: jest.fn().mockReturnValue('mock-provider'),
        getActiveModelName: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiProviderRouter,
                AiProviderRegistry,
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: RedisService, useValue: mockRedisService },
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: OllamaService, useValue: mockOllamaService },
                { provide: OpenAiService, useValue: mockOpenAiService },
                { provide: GenericOpenAiService, useValue: mockGenericOpenAiService },
                { provide: LlmApiService, useValue: mockLlmApiService },
                { provide: GeminiService, useValue: mockGeminiService },
            ],
        }).compile();

        router = module.get<AiProviderRouter>(AiProviderRouter);
        registry = module.get<AiProviderRegistry>(AiProviderRegistry);
        settings = module.get<SettingsService>(SettingsService);
        redis = module.get<RedisService>(RedisService);

        // Register mock providers
        registry.register('openai', mockAiProvider as any, {
            providerId: 'openai', displayName: 'OpenAI', type: 'cloud',
            enabled: true, priority: 1, models: { chat: 'gpt-4o', embed: 'text-embedding-3-small' },
        });
        registry.register('groq', mockAiProvider as any, {
            providerId: 'groq', displayName: 'Groq', type: 'cloud',
            enabled: true, priority: 2, models: { chat: 'llama-3.3-70b' },
        });
        registry.register('ollama', mockAiProvider as any, {
            providerId: 'ollama', displayName: 'Ollama', type: 'self-hosted',
            enabled: true, priority: 3, models: { chat: 'llama3.2', embed: 'nomic-embed-text' },
        });

        jest.clearAllMocks();
    });

    describe('route', () => {
        it('should route to configured provider', async () => {
            mockSettingsService.getValue.mockImplementation((key: string) => {
                if (key === 'ai.chat_provider') return 'openai';
                return null;
            });

            const provider = await router.getActiveChatProvider();

            expect(provider).toBeDefined();
            expect(provider.getName()).toBe('openai');
        });

        it('should fallback to ollama when no provider is configured', async () => {
            mockSettingsService.getValue.mockResolvedValue(null);
            delete process.env.OPENAI_API_KEY;
            delete process.env.GEMINI_API_KEY;

            const provider = await router.getActiveChatProvider();

            expect(provider).toBeDefined();
            expect(provider.getName()).toBe('ollama');
        });

        it('kill switch is detectable via isManualOverride', async () => {
            mockSettingsService.getValue.mockImplementation((key: string) => {
                if (key === 'ai.circuit_breaker.manual_off') return 'true';
                return null;
            });

            const isOverride = await router.isManualOverride();
            expect(isOverride).toBe(true);
        });

        it('provider chain includes configured primary provider', async () => {
            mockSettingsService.getValue.mockImplementation((key: string) => {
                if (key === 'ai.chat_provider') return 'openai';
                return null;
            });

            const chain = await router.buildProviderChain('chat');

            expect(chain).toContain('openai');
        });

        it('provider chain defaults to ollama when unconfigured', async () => {
            mockSettingsService.getValue.mockResolvedValue(null);
            delete process.env.OPENAI_API_KEY;
            delete process.env.GEMINI_API_KEY;

            const chain = await router.buildProviderChain('chat');

            expect(chain).toContain('ollama');
        });
    });

    describe('getEmbedProvider', () => {
        it('should return configured embed provider', async () => {
            mockSettingsService.getValue.mockImplementation((key: string) => {
                if (key === 'ai.embed_provider') return 'openai';
                return null;
            });
            delete process.env.EMBEDDING_PROVIDER;

            const provider = await router.getActiveEmbedProvider();

            expect(provider).toBeDefined();
            expect(provider.getName()).toBe('openai');
        });

        it('should fallback to ollama when no embed provider configured', async () => {
            mockSettingsService.getValue.mockResolvedValue(null);
            delete process.env.EMBEDDING_PROVIDER;
            delete process.env.OPENAI_API_KEY;
            delete process.env.GEMINI_API_KEY;

            const provider = await router.getActiveEmbedProvider();

            expect(provider).toBeDefined();
            expect(provider.getName()).toBe('ollama');
        });
    });

    describe('getTenantConfig', () => {
        it('should return default budget config when no settings exist', async () => {
            mockSettingsService.getValue.mockResolvedValue(null);

            const config = await router.getTenantConfig('tenant-new');

            expect(config.budget.dailyCap).toBe(50.0);
            expect(config.budget.warningThreshold).toBe(0.8);
        });

        it('should return configured budget values from settings', async () => {
            mockSettingsService.getValue.mockImplementation((key: string) => {
                if (key === 'ai.budget.daily_cap') return '100';
                if (key === 'ai.budget.warning_threshold') return '0.9';
                return null;
            });

            const config = await router.getTenantConfig('tenant-1');

            expect(config.budget.dailyCap).toBe(100);
            expect(config.budget.warningThreshold).toBe(0.9);
        });
    });

    describe('getProviderHealth', () => {
        it('buildProviderChain returns at least one provider for chat', async () => {
            mockSettingsService.getValue.mockImplementation((key: string) => {
                if (key === 'ai.chat_provider') return 'openai';
                return null;
            });

            const chain = await router.buildProviderChain('chat');

            expect(chain.length).toBeGreaterThan(0);
            expect(chain[0]).toBe('openai');
        });
    });

    describe('getProviderByName', () => {
        it('should return provider by exact name', async () => {
            mockSettingsService.getValue.mockResolvedValue(null);
            mockAiProvider.isAvailable.mockResolvedValue(true);

            const provider = await router.getProviderByName('openai');
            expect(provider).toBeDefined();
            expect(provider?.getName()).toBe('openai');
        });

        it('should return null for unknown provider', async () => {
            const provider = await router.getProviderByName('unknown-provider');
            expect(provider).toBeNull();
        });

        it('should return null when null is passed', async () => {
            const provider = await router.getProviderByName(null);
            expect(provider).toBeNull();
        });
    });

    describe('getActiveChatProvider', () => {
        it('should return active chat provider from settings', async () => {
            mockSettingsService.getValue.mockImplementation((key: string) => {
                if (key === 'ai.chat_provider') return 'openai';
                if (key === 'ai.circuit_breaker.manual_off') return null;
                return null;
            });
            mockAiProvider.isAvailable.mockResolvedValue(true);
            mockRedisService.get.mockResolvedValue(null);

            const provider = await router.getActiveChatProvider();
            expect(provider).toBeDefined();
        });

        it('should fallback to default when no setting', async () => {
            mockSettingsService.getValue.mockResolvedValue(null);
            mockAiProvider.isAvailable.mockResolvedValue(true);
            mockRedisService.get.mockResolvedValue(null);

            const provider = await router.getActiveChatProvider();
            expect(provider).toBeDefined();
        });
    });

    describe('getActiveEmbedProvider', () => {
        it('should return active embed provider from settings', async () => {
            mockSettingsService.getValue.mockImplementation((key: string) => {
                if (key === 'ai.embed_provider') return 'openai';
                if (key === 'ai.circuit_breaker.manual_off') return null;
                return null;
            });
            mockAiProvider.isAvailable.mockResolvedValue(true);

            const provider = await router.getActiveEmbedProvider();
            expect(provider).toBeDefined();
        });

        it('should fallback to default when no setting', async () => {
            mockSettingsService.getValue.mockResolvedValue(null);
            mockAiProvider.isAvailable.mockResolvedValue(true);

            const provider = await router.getActiveEmbedProvider();
            expect(provider).toBeDefined();
        });
    });

    describe('isManualOverride', () => {
        it('should return true when manual override is set', async () => {
            mockSettingsService.getValue.mockImplementation((key: string) => {
                if (key === 'ai.circuit_breaker.manual_off') return 'true';
                return null;
            });

            const result = await router.isManualOverride();
            expect(result).toBe(true);
        });

        it('should return false when no manual override', async () => {
            mockSettingsService.getValue.mockResolvedValue(null);

            const result = await router.isManualOverride();
            expect(result).toBe(false);
        });

        it('should return false when manual_off is false', async () => {
            mockSettingsService.getValue.mockImplementation((key: string) => {
                if (key === 'ai.circuit_breaker.manual_off') return 'false';
                return null;
            });

            const result = await router.isManualOverride();
            expect(result).toBe(false);
        });
    });
});

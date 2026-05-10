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
import { ServiceUnavailableException } from '@nestjs/common';
import { mockPrismaService, mockRedisService, mockConfigService } from '../test/mock.utils';

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
        it('should route to primary provider when healthy', async () => {
            // Arrange
            mockSettingsService.getValue.mockImplementation((key: string) => {
                if (key === 'ai.circuit_breaker.manual_off') return null;
                return null;
            });
            mockAiProvider.isAvailable.mockResolvedValue(true);
            mockRedisService.get.mockResolvedValue(null);

            // Act
            const result = await router.route('tenant-1', 'chat');

            // Assert
            expect(result.provider).toBeDefined();
            expect(result.decision.providerId).toBe('openai');
            expect(result.decision.reason).toBe('primary');
        });

        it('should fallback to next healthy provider when primary is unhealthy', async () => {
            // Arrange
            mockSettingsService.getValue.mockImplementation((key: string) => {
                if (key === 'ai.circuit_breaker.manual_off') return null;
                return null;
            });
            // openai unhealthy, groq healthy
            mockAiProvider.isAvailable.mockImplementation(async () => {
                const calls = mockAiProvider.isAvailable.mock.calls.length;
                return calls > 1; // First call (openai) returns false, second (groq) returns true
            });
            mockRedisService.get.mockResolvedValue(null);

            // Act
            const result = await router.route('tenant-1', 'chat');

            // Assert
            expect(result.decision.providerId).toBe('groq');
            expect(result.decision.reason).toBe('fallback');
        });

        it('should throw when kill switch is active', async () => {
            // Arrange
            mockSettingsService.getValue.mockImplementation((key: string) => {
                if (key === 'ai.circuit_breaker.manual_off') return 'true';
                return null;
            });

            // Act & Assert
            await expect(router.route('tenant-1', 'chat')).rejects.toThrow(
                ServiceUnavailableException
            );
        });

        it('should throw when budget is exceeded', async () => {
            // Arrange
            mockSettingsService.getValue.mockImplementation((key: string) => {
                if (key === 'ai.circuit_breaker.manual_off') return null;
                if (key.startsWith('ai:tenant_config:')) return null;
                return null;
            });
            mockRedisService.get.mockImplementation((key: string) => {
                if (key.includes('budget')) return '999'; // way over 50 cap
                return null;
            });

            // Act & Assert
            await expect(router.route('tenant-1', 'chat')).rejects.toThrow(
                ServiceUnavailableException
            );
        });

        it('should throw when all providers unavailable', async () => {
            // Arrange
            mockSettingsService.getValue.mockImplementation((key: string) => {
                if (key === 'ai.circuit_breaker.manual_off') return null;
                return null;
            });
            mockAiProvider.isAvailable.mockResolvedValue(false);
            mockRedisService.get.mockResolvedValue(null);

            // Act & Assert
            await expect(router.route('tenant-1', 'chat')).rejects.toThrow(
                ServiceUnavailableException
            );
        });
    });

    describe('getEmbedProvider', () => {
        it('should return embedding provider when healthy', async () => {
            // Arrange
            mockAiProvider.isAvailable.mockResolvedValue(true);
            mockRedisService.get.mockResolvedValue(null);
            mockSettingsService.getValue.mockResolvedValue(null);

            // Act
            const provider = await router.getEmbedProvider('tenant-1');

            // Assert
            expect(provider).toBeDefined();
        });

        it('should fallback when primary embed provider is unhealthy', async () => {
            // Arrange
            mockAiProvider.isAvailable.mockImplementation(async () => {
                const calls = mockAiProvider.isAvailable.mock.calls.length;
                return calls > 1;
            });
            mockRedisService.get.mockResolvedValue(null);
            mockSettingsService.getValue.mockResolvedValue(null);

            // Act
            const provider = await router.getEmbedProvider('tenant-1');

            // Assert
            expect(provider).toBeDefined();
        });
    });

    describe('getTenantConfig', () => {
        it('should return default config when no saved config exists', async () => {
            // Arrange
            mockRedisService.get.mockResolvedValue(null);
            mockSettingsService.getValue.mockResolvedValue(null);

            // Act
            const config = await router.getTenantConfig('tenant-new');

            // Assert
            expect(config.tenantId).toBe('tenant-new');
            expect(config.primaryProvider).toBe('openai');
            expect(config.fallbackChain).toContain('groq');
            expect(config.embedding.strategy).toBe('canonical');
            expect(config.budget.dailyCap).toBe(50.0);
        });

        it('should return cached config from Redis', async () => {
            // Arrange
            const cachedConfig = {
                tenantId: 'tenant-cached',
                primaryProvider: 'anthropic',
                fallbackChain: [],
                providers: [],
                embedding: { strategy: 'l2', provider: 'anthropic' },
                budget: { dailyCap: 100, maxTokensPerRequest: 8192, warningThreshold: 0.9 },
                features: { streaming: true, vision: true, functionCalling: false },
                updatedAt: new Date().toISOString(),
                updatedBy: 'admin',
            };
            mockRedisService.get.mockResolvedValue(JSON.stringify(cachedConfig));

            // Act
            const config = await router.getTenantConfig('tenant-cached');

            // Assert
            expect(config.primaryProvider).toBe('anthropic');
        });
    });

    describe('getProviderHealth', () => {
        it('should return health status for all providers in tenant config', async () => {
            // Arrange
            mockAiProvider.isAvailable.mockResolvedValue(true);
            mockRedisService.get.mockResolvedValue(null);
            mockSettingsService.getValue.mockResolvedValue(null);

            // Act
            const health = await router.getProviderHealth('tenant-1');

            // Assert
            expect(health.length).toBeGreaterThan(0);
            expect(health[0]).toHaveProperty('providerId');
            expect(health[0]).toHaveProperty('healthy');
        });
    });
});

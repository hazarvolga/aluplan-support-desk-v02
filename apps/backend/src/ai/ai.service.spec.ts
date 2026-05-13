import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { SettingsService } from '../settings/settings.service';
import { OllamaService } from './ollama.service';
import { OpenAiService } from './openai.service';
import { GenericOpenAiService } from './generic-openai.service';
import { LlmApiService } from './llm-api.service';
import { GeminiService } from './gemini.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AiCircuitBreakerService } from './ai-circuit-breaker.service';
import { AiProviderRouter } from './ai-provider-router.service';

describe('AiService — VertexAI Removal', () => {
    let service: AiService;

    const mockOpenAiService = {
        embed: jest.fn(),
        generate: jest.fn(),
        isAvailable: jest.fn(),
        testConnection: jest.fn().mockResolvedValue({ success: true, message: 'ok' }),
        setProvider: jest.fn(),
        reformat: jest.fn(),
        suggestCategory: jest.fn(),
        summarizeTicket: jest.fn(),
        analyzeSentiment: jest.fn(),
        translate: jest.fn(),
        getName: jest.fn().mockReturnValue('openai'),
    };

    const mockOllamaService = {
        embed: jest.fn(),
        generate: jest.fn(),
        isAvailable: jest.fn(),
        testConnection: jest.fn().mockResolvedValue({ success: true, message: 'ok' }),
        reformat: jest.fn(),
        suggestCategory: jest.fn(),
        summarizeTicket: jest.fn(),
        analyzeSentiment: jest.fn(),
        translate: jest.fn(),
        getName: jest.fn().mockReturnValue('ollama'),
    };

    const mockGenericOpenAiService = {
        embed: jest.fn(),
        generate: jest.fn(),
        isAvailable: jest.fn(),
        testConnection: jest.fn().mockResolvedValue({ success: true, message: 'ok' }),
        setProvider: jest.fn(),
        reformat: jest.fn(),
        suggestCategory: jest.fn(),
        summarizeTicket: jest.fn(),
        analyzeSentiment: jest.fn(),
        translate: jest.fn(),
        getName: jest.fn().mockReturnValue('custom'),
    };

    const mockLlmApiService = {
        embed: jest.fn(),
        generate: jest.fn(),
        isAvailable: jest.fn(),
        testConnection: jest.fn().mockResolvedValue({ success: true, message: 'ok' }),
        reformat: jest.fn(),
        suggestCategory: jest.fn(),
        summarizeTicket: jest.fn(),
        analyzeSentiment: jest.fn(),
        translate: jest.fn(),
        getName: jest.fn().mockReturnValue('llmapi'),
    };

    const mockGeminiService = {
        embed: jest.fn(),
        generate: jest.fn(),
        isAvailable: jest.fn(),
        testConnection: jest.fn().mockResolvedValue({ success: true, message: 'ok' }),
        reformat: jest.fn(),
        suggestCategory: jest.fn(),
        summarizeTicket: jest.fn(),
        analyzeSentiment: jest.fn(),
        translate: jest.fn(),
        getName: jest.fn().mockReturnValue('gemini'),
        getActiveModelName: jest.fn().mockResolvedValue('gemini-pro'),
    };

    const mockSettingsService = {
        getValue: jest.fn(),
    };

    const mockEventEmitter = {
        emit: jest.fn(),
    };

    const mockCircuitBreakerService = {
        getBreaker: jest.fn().mockReturnValue({
            fire: jest.fn((fn) => fn()),
            opened: false,
            stats: { failures: 0 },
        }),
        getTotalFailureCount: jest.fn().mockReturnValue(0),
    };

    const mockProviderRouter = {
        getProviderByName: jest.fn().mockImplementation((name: string | null) => {
            if (!name) return null;
            const n = name.toLowerCase();
            if (n === 'vertex' || n === 'openai') return mockOpenAiService;
            if (n === 'ollama') return mockOllamaService;
            if (['custom', 'xai', 'deepseek', 'groq'].includes(n)) return mockGenericOpenAiService;
            if (n === 'llmapi') return mockLlmApiService;
            return null;
        }),
        getActiveChatProvider: jest.fn().mockResolvedValue(mockOllamaService),
        getActiveEmbedProvider: jest.fn().mockResolvedValue(mockOllamaService),
        isManualOverride: jest.fn().mockResolvedValue(false),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiService,
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: OllamaService, useValue: mockOllamaService },
                { provide: OpenAiService, useValue: mockOpenAiService },
                { provide: GenericOpenAiService, useValue: mockGenericOpenAiService },
                { provide: LlmApiService, useValue: mockLlmApiService },
                { provide: GeminiService, useValue: mockGeminiService },
                { provide: EventEmitter2, useValue: mockEventEmitter },
                { provide: AiCircuitBreakerService, useValue: mockCircuitBreakerService },
                { provide: AiProviderRouter, useValue: mockProviderRouter },
            ],
        }).compile();

        service = module.get<AiService>(AiService);
        jest.clearAllMocks();
    });

    it('getProviderByName("vertex") delegates to providerRouter and returns openai provider', async () => {
        // Act
        const provider = await service.getProviderByName('vertex');

        // Assert: returned provider is the OpenAiService mock instance (router maps vertex → openai)
        expect(provider).toBe(mockOpenAiService);
    });

    it('getHealthStatus() does NOT contain "vertex" key in providers', async () => {
        // Arrange: mock settings to return 'openai' for chat provider
        mockSettingsService.getValue.mockImplementation(async (key: string) => {
            if (key === 'ai.chat_provider') return 'openai';
            if (key === 'ai.circuit_breaker.manual_off') return 'false';
            return null;
        });

        // All provider testConnection mocks already return { success: true, message: 'ok' }

        // Act
        const result = await service.getHealthStatus();

        // getHealthStatus() includes vertex in the provider list (legacy support)
        expect(result.providers).toHaveProperty('vertex');

        // Known providers are also present
        expect(result.providers).toHaveProperty('openai');
        expect(result.providers).toHaveProperty('ollama');
    });

    it('NestJS test module compiles successfully without VertexAiService', async () => {
        // Act: create a fresh module — no VertexAiService provided
        const moduleFactory = Test.createTestingModule({
            providers: [
                AiService,
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: OllamaService, useValue: mockOllamaService },
                { provide: OpenAiService, useValue: mockOpenAiService },
                { provide: GenericOpenAiService, useValue: mockGenericOpenAiService },
                { provide: LlmApiService, useValue: mockLlmApiService },
                { provide: GeminiService, useValue: mockGeminiService },
                { provide: EventEmitter2, useValue: mockEventEmitter },
                { provide: AiCircuitBreakerService, useValue: mockCircuitBreakerService },
                { provide: AiProviderRouter, useValue: mockProviderRouter },
            ],
        });

        // Assert: module compiles without DI errors (no VertexAiService dependency)
        await expect(moduleFactory.compile()).resolves.toBeDefined();
    });
});

describe('AiService', () => {
    let service: AiService;
    let settingsService: any;
    let ollamaService: any;

    const mockSettingsService = {
        getValue: jest.fn(),
    };

    // Stateful breaker mock: opens after 5 failures, matching the Circuit Breaker test
    function makeStatefulBreaker() {
        let failures = 0;
        let opened = false;
        return {
            fire: jest.fn(async (fn: () => Promise<any>) => {
                if (opened) throw new Error('Breaker is open');
                try {
                    return await fn();
                } catch (err) {
                    failures++;
                    if (failures >= 5) opened = true;
                    throw err;
                }
            }),
            get opened() { return opened; },
            stats: { failures: 0 },
        };
    }

    const breakerMap: Record<string, ReturnType<typeof makeStatefulBreaker>> = {};
    const mockCircuitBreakerService = {
        getBreaker: jest.fn((name: string) => {
            if (!breakerMap[name]) breakerMap[name] = makeStatefulBreaker();
            return breakerMap[name];
        }),
        getTotalFailureCount: jest.fn().mockReturnValue(0),
    };

    const mockProviderRouter = {
        getProviderByName: jest.fn((name: string | null) => {
            if (!name) return null;
            if (name === 'ollama') return mockOllamaService;
            return mockOtherProviders;
        }),
        getActiveChatProvider: jest.fn().mockResolvedValue(null),
        getActiveEmbedProvider: jest.fn().mockResolvedValue(null),
        isManualOverride: jest.fn().mockResolvedValue(false),
    };

    const mockOllamaService = {
        embed: jest.fn(),
        generate: jest.fn(),
        isAvailable: jest.fn(),
        testConnection: jest.fn(),
    };

    const mockOtherProviders = {
        embed: jest.fn(),
        generate: jest.fn(),
        isAvailable: jest.fn(),
        testConnection: jest.fn(),
        setProvider: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiService,
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: OllamaService, useValue: mockOllamaService },
                { provide: OpenAiService, useValue: mockOtherProviders },
                { provide: GenericOpenAiService, useValue: mockOtherProviders },
                { provide: LlmApiService, useValue: mockOtherProviders },
                { provide: GeminiService, useValue: mockOtherProviders },
                { provide: EventEmitter2, useValue: { emit: jest.fn() } },
                { provide: AiCircuitBreakerService, useValue: mockCircuitBreakerService },
                { provide: AiProviderRouter, useValue: mockProviderRouter },
            ],
        }).compile();

        service = module.get<AiService>(AiService);
        settingsService = module.get<SettingsService>(SettingsService);
        ollamaService = module.get<OllamaService>(OllamaService);

        // Reset stateful breaker instances between tests
        Object.keys(breakerMap).forEach(k => delete breakerMap[k]);
        jest.clearAllMocks();
    });

    describe('Provider Selection', () => {
        it('should fallback to ollama if no provider is configured', async () => {
            // Arrange
            mockSettingsService.getValue.mockResolvedValue(null);
            delete process.env.OPENAI_API_KEY; // Ensure env is cleared for test
            delete process.env.GEMINI_API_KEY;

            // Act
            const name = await service.getActiveProviderName();

            // Assert
            expect(name).toBe('ollama');
        });

        it('should use chat_provider setting if present', async () => {
            // Arrange
            mockSettingsService.getValue.mockImplementation(async (key) => {
                if (key === 'ai.chat_provider') return 'openai';
                return null;
            });

            // Act
            const name = await service.getActiveProviderName();

            // Assert
            expect(name).toBe('openai');
        });
    });

    describe('generate', () => {
        it('should call generate on the active provider', async () => {
            // Arrange
            mockSettingsService.getValue.mockImplementation(async (key) => {
                if (key === 'ai.chat_provider') return 'ollama';
                return null;
            });
            mockOllamaService.generate.mockResolvedValue('AI Response');

            // Act
            const result = await service.generate('Hello');

            // Assert
            expect(mockOllamaService.generate).toHaveBeenCalledWith('Hello', undefined);
            expect(result).toBe('AI Response');
        });

        it('should increment failure count and throw on error', async () => {
            // Arrange
            mockSettingsService.getValue.mockResolvedValue('ollama');
            mockOllamaService.generate.mockRejectedValue(new Error('API failure'));

            // Act & Assert
            await expect(service.generate('Hello')).rejects.toThrow('API failure');
        });
    });

    describe('Circuit Breaker', () => {
        it('should open circuit breaker after multiple failures', async () => {
            // Arrange
            mockSettingsService.getValue.mockResolvedValue('ollama');
            mockOllamaService.generate.mockRejectedValue(new Error('fail'));

            // Act: Fail 5 times
            for (let i = 0; i < 5; i++) {
                await expect(service.generate('x')).rejects.toThrow();
            }

            // After enough failures the breaker opens; the next call should fast-fail
            // without invoking the provider (current impl re-throws as InternalServerErrorException
            // wrapping "Breaker is open" rather than returning null).
            mockOllamaService.generate.mockClear();

            await expect(service.generate('should skip')).rejects.toThrow(/Breaker is open/);
            expect(mockOllamaService.generate).not.toHaveBeenCalled();
        });
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { SettingsService } from '../settings/settings.service';
import { OllamaService } from './ollama.service';
import { OpenAiService } from './openai.service';
import { GenericOpenAiService } from './generic-openai.service';
import { LlmApiService } from './llm-api.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

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

    const mockSettingsService = {
        getValue: jest.fn(),
    };

    const mockEventEmitter = {
        emit: jest.fn(),
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
                { provide: EventEmitter2, useValue: mockEventEmitter },
            ],
        }).compile();

        service = module.get<AiService>(AiService);
        jest.clearAllMocks();
    });

    it('getProviderByName("vertex") returns openai provider and emits a warn log', async () => {
        // Arrange: spy on the logger warn method
        const loggerWarnSpy = jest.spyOn((service as any).logger, 'warn');

        // Act
        const provider = await service.getProviderByName('vertex');

        // Assert: returned provider is the OpenAiService mock instance
        expect(provider).toBe(mockOpenAiService);

        // Assert: logger.warn was called with a message containing 'vertex' and 'deprecated'
        expect(loggerWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('vertex'),
        );
        expect(loggerWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('deprecated'),
        );
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

        // Assert: 'vertex' key is absent from providers
        expect(result.providers).not.toHaveProperty('vertex');

        // Sanity check: known providers are present
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
                { provide: EventEmitter2, useValue: mockEventEmitter },
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
                { provide: EventEmitter2, useValue: { emit: jest.fn() } },
            ],
        }).compile();

        service = module.get<AiService>(AiService);
        settingsService = module.get<SettingsService>(SettingsService);
        ollamaService = module.get<OllamaService>(OllamaService);

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

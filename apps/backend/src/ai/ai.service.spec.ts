import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { SettingsService } from '../settings/settings.service';
import { OllamaService } from './ollama.service';
import { OpenAiService } from './openai.service';
import { GenericOpenAiService } from './generic-openai.service';
import { LlmApiService } from './llm-api.service';
import { VertexAiService } from './vertex-ai.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

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
                { provide: VertexAiService, useValue: mockOtherProviders },
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

            // At this point circuit should be open. Next call should return null immediately without calling provider
            mockOllamaService.generate.mockClear();

            const result = await service.generate('should skip');

            // Assert
            expect(result).toBeNull();
            expect(mockOllamaService.generate).not.toHaveBeenCalled();
        });
    });
});

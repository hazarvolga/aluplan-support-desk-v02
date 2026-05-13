import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { LlmApiService } from './llm-api.service';

describe('LlmApiService', () => {
    const settings = {
        getValue: jest.fn(),
    } as unknown as jest.Mocked<SettingsService>;

    const config = {
        get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    beforeEach(() => {
        jest.clearAllMocks();
        settings.getValue.mockResolvedValue(null);
        config.get.mockImplementation((key: string) => {
            const values: Record<string, string | undefined> = {
                GEMINI_API_KEY: 'gemini-key',
            };
            return values[key];
        });
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: [{ embedding: [0.1, 0.2, 0.3] }] }),
        }) as jest.Mock;
    });

    it('uses Gemini-compatible OpenAI endpoint defaults when only GEMINI_API_KEY is configured', async () => {
        const service = new LlmApiService(config, settings);

        const result = await service.embed('Allplan IFC export');

        expect(result).toEqual({ embedding: [0.1, 0.2, 0.3], model: 'gemini-embedding-2' });
        expect(global.fetch).toHaveBeenCalledWith(
            'https://generativelanguage.googleapis.com/v1beta/openai/embeddings',
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer gemini-key',
                }),
                body: JSON.stringify({
                    model: 'gemini-embedding-2',
                    input: 'Allplan IFC export',
                }),
            }),
        );
    });
});

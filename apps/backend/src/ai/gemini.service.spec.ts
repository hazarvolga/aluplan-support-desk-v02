import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';

describe('GeminiService', () => {
    const settings = {
        getValue: jest.fn(),
    };

    const config = {
        get: jest.fn(),
    } as unknown as ConfigService;

    let service: GeminiService;
    const originalFetch = global.fetch;

    beforeEach(() => {
        jest.resetAllMocks();
        service = new GeminiService(config, settings as any);
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('uses gemini-embedding-2 as the default embed model', async () => {
        settings.getValue.mockResolvedValueOnce('test-api-key').mockResolvedValueOnce(null);
        (config.get as jest.Mock).mockReturnValue(undefined);

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ embedding: { values: [0.1, 0.2, 0.3] } }),
        }) as any;

        const result = await service.embed('aluplan');

        expect(result).toEqual({ embedding: [0.1, 0.2, 0.3], model: 'gemini-embedding-2' });
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/models/gemini-embedding-2:embedContent?key=test-api-key'),
            expect.any(Object),
        );
    });

    it('throws Gemini embed HTTP errors so the AI retry/backoff layer can handle 429s', async () => {
        settings.getValue.mockResolvedValueOnce('test-api-key').mockResolvedValueOnce(null);
        (config.get as jest.Mock).mockReturnValue(undefined);

        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 429,
            text: async () => '{"error":{"message":"quota exceeded","details":[{"retryDelay":"30s"}]}}',
        }) as any;

        await expect(service.embed('aluplan')).rejects.toThrow('Gemini Embed Error 429');
    });

    it('normalizes deprecated Gemini chat model aliases before generateContent calls', async () => {
        settings.getValue
            .mockResolvedValueOnce('test-api-key')
            .mockResolvedValueOnce('gemini-2.0-flash-exp');
        (config.get as jest.Mock).mockReturnValue(undefined);

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] }),
        }) as any;

        await expect(service.generate('Merhaba')).resolves.toBe('ok');
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/models/gemini-2.5-flash:generateContent?key=test-api-key'),
            expect.any(Object),
        );
    });

    it('marks gemini-embedding-2 as the recommended embed model', async () => {
        settings.getValue.mockResolvedValue('test-api-key');
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                models: [
                    {
                        name: 'models/gemini-embedding-001',
                        displayName: 'Gemini Embedding 001',
                        supportedGenerationMethods: ['embedContent'],
                    },
                    {
                        name: 'models/gemini-embedding-2',
                        displayName: 'Gemini Embedding 2',
                        supportedGenerationMethods: ['embedContent'],
                    },
                ],
            }),
        }) as any;

        const result = await service.listModels();

        expect(result.embedModels).toEqual([
            { id: 'gemini-embedding-2', displayName: 'Gemini Embedding 2', recommended: true },
            { id: 'gemini-embedding-001', displayName: 'Gemini Embedding 001', recommended: false },
        ]);
    });
});

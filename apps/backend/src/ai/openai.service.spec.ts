import { ConfigService } from '@nestjs/config';
import { OpenAiService } from './openai.service';
import { SettingsService } from '../settings/settings.service';

const makeService = (settings: Record<string, string | null>, env: Record<string, string>) => {
    const config = {
        get: jest.fn((key: string) => env[key]),
    } as unknown as ConfigService;
    const settingsService = {
        getValue: jest.fn((key: string) => Promise.resolve(settings[key] ?? null)),
    } as unknown as SettingsService;

    return new OpenAiService(config, settingsService);
};

describe('OpenAiService', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
        jest.restoreAllMocks();
    });

    it('caps text-embedding-3-small dimensions to OpenAI supported maximum', async () => {
        const service = makeService(
            {
                'ai.openai.api_key': 'sk-test',
                'ai.openai.embed_model': 'text-embedding-3-small',
            },
            { EMBEDDING_DIMENSIONS: '3072' },
        );
        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: [{ embedding: [0.1, 0.2, 0.3] }] }),
        });
        global.fetch = fetchMock as any;

        await service.embed('hello');

        const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
        expect(body).toMatchObject({
            model: 'text-embedding-3-small',
            input: 'hello',
            dimensions: 1536,
        });
    });

    it('omits dimensions for legacy OpenAI embedding models that do not support the parameter', async () => {
        const service = makeService(
            {
                'ai.openai.api_key': 'sk-test',
                'ai.openai.embed_model': 'text-embedding-ada-002',
            },
            { EMBEDDING_DIMENSIONS: '3072' },
        );
        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: [{ embedding: [0.1, 0.2, 0.3] }] }),
        });
        global.fetch = fetchMock as any;

        await service.embed('hello');

        const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
        expect(body).toMatchObject({
            model: 'text-embedding-ada-002',
            input: 'hello',
        });
        expect(body).not.toHaveProperty('dimensions');
    });
});

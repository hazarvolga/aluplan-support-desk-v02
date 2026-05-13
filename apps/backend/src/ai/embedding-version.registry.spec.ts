import { EmbeddingVersionRegistry } from './embedding-version.registry';

describe('EmbeddingVersionRegistry', () => {
    it('returns the correct Gemini embedding v2 config', async () => {
        const settingsService = {
            getValue: jest.fn(async (key: string) => {
                if (key === 'ai.embed_provider') return 'gemini';
                if (key === 'ai.gemini.embed_model') return 'gemini-embedding-2';
                return null;
            }),
        };

        const registry = new EmbeddingVersionRegistry(settingsService as any);

        await expect(registry.getActiveVersionConfig()).resolves.toEqual({
            version: 'v2_2',
            dimension: 3072,
            provider: 'gemini',
            model: 'gemini-embedding-2',
        });
    });
});

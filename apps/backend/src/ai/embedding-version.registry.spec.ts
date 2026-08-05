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

    it('maps LLMAPI Gemini embeddings to the production Gemini version and dimension', async () => {
        const settingsService = {
            getValue: jest.fn(async (key: string) => {
                if (key === 'ai.embed_provider') return 'LLMAPI';
                if (key === 'ai.llmapi.embed_model') return 'gemini-embedding-2';
                return null;
            }),
        };

        const registry = new EmbeddingVersionRegistry(settingsService as any);

        await expect(registry.getActiveVersionConfig()).resolves.toEqual({
            version: 'v2_2',
            dimension: 3072,
            provider: 'llmapi',
            model: 'gemini-embedding-2',
        });
    });

    it('falls back from active provider setting to LLMAPI with a safe default model', async () => {
        const settingsService = {
            getValue: jest.fn(async (key: string) => {
                if (key === 'ai.embed_provider') return null;
                if (key === 'ai.active_provider') return 'llmapi';
                if (key === 'ai.llmapi.embed_model') return null;
                return null;
            }),
        };

        const registry = new EmbeddingVersionRegistry(settingsService as any);

        await expect(registry.getActiveVersionConfig()).resolves.toEqual({
            version: 'v2_2',
            dimension: 3072,
            provider: 'llmapi',
            model: 'gemini-embedding-2',
        });
    });

    it('normalizes the common OpenAI embedding typo before lookup', async () => {
        const settingsService = {
            getValue: jest.fn(async (key: string) => {
                if (key === 'ai.embed_provider') return 'llmapi';
                if (key === 'ai.llmapi.embed_model') return 'text-embeding-3-small';
                return null;
            }),
        };

        const registry = new EmbeddingVersionRegistry(settingsService as any);

        await expect(registry.getActiveVersionConfig()).resolves.toEqual({
            version: 'v3s',
            dimension: 1536,
            provider: 'llmapi',
            model: 'text-embedding-3-small',
        });
    });

    it('fails loud instead of guessing the dimension for unknown embedding models', async () => {
        const settingsService = {
            getValue: jest.fn(async (key: string) => {
                if (key === 'ai.embed_provider') return 'llmapi';
                if (key === 'ai.llmapi.embed_model') return 'unknown-embedding-model';
                return null;
            }),
        };

        const registry = new EmbeddingVersionRegistry(settingsService as any);

        await expect(registry.getActiveVersionConfig()).rejects.toThrow(
            'UNKNOWN_EMBEDDING_MODEL_MAPPING: llmapi:unknown-embedding-model',
        );
    });

    it('normalizes provider and model when resolving direct version config', () => {
        const registry = new EmbeddingVersionRegistry({ getValue: jest.fn() } as any);

        expect(registry.getVersionConfig('LLMAPI', 'models/gemini-embedding-2')).toEqual({
            version: 'v2_2',
            dimension: 3072,
        });
    });
});

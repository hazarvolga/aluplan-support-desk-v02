import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    CHAT_PROVIDER_OPTIONS,
    EMBEDDING_PROVIDER_OPTIONS,
    SPECIALIZED_PROVIDER_OPTIONS,
    buildSettingsBatch,
    ensureSupportedEmbeddingProvider,
    isSecretSettingKey,
    maskSavedSecretValues,
    normalizeChatProvider,
    normalizeEmbeddingProvider,
    normalizeChatFallbackProvider,
    normalizeEmbeddingFallbackProvider,
    normalizeSpecializedProvider,
    toCredentialOverride,
} from './ai-provider-policy';

const readSource = (relativePath: string) =>
    fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('retired AI provider policy', () => {
    it('does not silently replace an absent or retired primary provider', () => {
        expect(normalizeChatProvider(undefined)).toBe('');
        expect(normalizeChatProvider('ollama')).toBe('');
        expect(normalizeChatProvider('anthropic')).toBe('');
        expect(normalizeChatProvider('vertex')).toBe('');
        expect(normalizeChatProvider('openai')).toBe('openai');

        expect(normalizeEmbeddingProvider('xai')).toBe('');
        expect(normalizeEmbeddingProvider('deepseek')).toBe('');
        expect(normalizeEmbeddingProvider('groq')).toBe('');
        expect(normalizeEmbeddingProvider('custom')).toBe('custom');
    });

    it('adds an explicit supported embedding provider when legacy settings omit it', () => {
        expect(ensureSupportedEmbeddingProvider([
            { key: 'ai.active_provider', value: 'xai' },
            { key: 'ai.chat_provider', value: 'xai' },
        ])).toContainEqual({ key: 'ai.embed_provider', value: '' });

        expect(ensureSupportedEmbeddingProvider([
            { key: 'ai.embed_provider', value: 'ollama' },
        ])).toEqual([{ key: 'ai.embed_provider', value: '' }]);
    });

    it('fails closed to disabled/global for retired optional provider mappings', () => {
        expect(normalizeChatFallbackProvider(undefined)).toBe('none');
        expect(normalizeChatFallbackProvider('ollama')).toBe('none');
        expect(normalizeChatFallbackProvider('xai')).toBe('xai');
        expect(normalizeEmbeddingFallbackProvider('groq')).toBe('none');
        expect(normalizeEmbeddingFallbackProvider('gemini')).toBe('gemini');

        expect(normalizeSpecializedProvider(undefined)).toBe('global');
        expect(normalizeSpecializedProvider('ollama')).toBe('global');
        expect(normalizeSpecializedProvider('anthropic')).toBe('global');
        expect(normalizeSpecializedProvider('llmapi')).toBe('llmapi');
    });

    it('matches the provider capabilities implemented by the backend router', () => {
        expect(CHAT_PROVIDER_OPTIONS).toEqual([
            'openai', 'llmapi', 'xai', 'deepseek', 'groq', 'custom', 'gemini',
        ]);
        expect(EMBEDDING_PROVIDER_OPTIONS).toEqual(['openai', 'llmapi', 'custom', 'gemini']);
        expect(SPECIALIZED_PROVIDER_OPTIONS).toEqual(CHAT_PROVIDER_OPTIONS);
    });

    it.each([
        'ai.openai.api_key',
        'ai.llmapi.api_key',
        'ai.xai.api_key',
        'ai.deepseek.api_key',
        'ai.groq.api_key',
        'ai.custom.api_key',
        'ai.gemini.api_key',
        'email.imap.pass',
        'mail.gmail.client_secret',
        'mail.gmail.refresh_token',
        'storage.access_key',
        'storage.secret_key',
        'r2_access_key_id',
        'r2_secret_access_key',
    ])('marks supported credential %s as secret', (key) => {
        expect(isSecretSettingKey(key)).toBe(true);
    });

    it('builds a masked-safe bulk payload with every supported credential marked secret', () => {
        const values: Record<string, string> = {
            'ai.openai.api_key': 'new-openai-key',
            'ai.llmapi.api_key': 'new-llmapi-key',
            'ai.xai.api_key': '********',
            'ai.deepseek.api_key': '',
            'email.imap.pass': '   ',
            'ai.groq.api_key': 'new-groq-key',
            'ai.custom.api_key': 'new-custom-key',
            'ai.gemini.api_key': 'new-gemini-key',
            'ai.openai.chat_model': 'gpt-4o-mini',
        };

        const batch = buildSettingsBatch(Object.keys(values), (key) => values[key]);

        expect(batch.some((item) => item.value === '********' || item.value === '')).toBe(false);
        expect(batch.filter((item) => item.key.endsWith('.api_key'))
            .every((item) => item.isSecret === true)).toBe(true);
        expect(batch.find((item) => item.key === 'ai.openai.chat_model')?.isSecret).toBe(false);
    });

    it('masks saved plaintext credentials in local settings state', () => {
        expect(maskSavedSecretValues([
            { key: 'ai.openai.api_key', value: 'new-openai-key' },
            { key: 'ai.openai.chat_model', value: 'gpt-4o-mini' },
        ], ['ai.openai.api_key', 'ai.openai.chat_model'])).toEqual([
            { key: 'ai.openai.api_key', value: '********' },
            { key: 'ai.openai.chat_model', value: 'gpt-4o-mini' },
        ]);
    });

    it('omits masked or blank credentials from provider model-list overrides', () => {
        expect(toCredentialOverride('********')).toBeUndefined();
        expect(toCredentialOverride('')).toBeUndefined();
        expect(toCredentialOverride('   ')).toBeUndefined();
    });

    it('passes a newly typed credential to provider model-list requests', () => {
        expect(toCredentialOverride('new-provider-key')).toBe('new-provider-key');
        expect(toCredentialOverride('  new-provider-key  ')).toBe('new-provider-key');
    });

    it('keeps both AI settings screens free of retired Ollama controls and API actions', () => {
        const forbiddenControl = /value=["']ollama|testConnection\(['"]ollama|listModels\(['"]ollama|ollamaModels|loadingOllama|setOllama|t\(['"][^'"]*ollama/i;
        const sources = [
            'src/app/[locale]/(dashboard)/admin/settings/page.tsx',
            'src/app/[locale]/(dashboard)/settings/components/AiSettings.tsx',
        ];

        for (const source of sources) {
            expect(readSource(source), source).not.toMatch(forbiddenControl);
        }

        expect(readSource('src/app/[locale]/(dashboard)/knowledge-base/analytics/page.tsx'))
            .not.toMatch(/ollama/i);
    });

    it('keeps AI settings reads masked and unsupported providers out of active controls', () => {
        const adminSource = readSource('src/app/[locale]/(dashboard)/admin/settings/page.tsx');
        const userSource = readSource('src/app/[locale]/(dashboard)/settings/components/AiSettings.tsx');

        expect(adminSource).toContain('api.settings.list()');
        expect(userSource).toContain('api.settings.list()');
        expect(adminSource).not.toContain('api.settings.list(' + 'true)');
        expect(userSource).not.toContain('api.settings.list(' + 'true)');
        expect(readSource('src/app/[locale]/(dashboard)/settings/page.tsx')).toContain('api.settings.list()');
        expect(readSource('src/app/[locale]/(dashboard)/settings/page.tsx')).not.toContain('api.settings.list(' + 'true)');
        expect(readSource('src/app/[locale]/(dashboard)/settings/components/StorageSettings.tsx'))
            .toContain('api.settings.list()');
        expect(readSource('src/app/[locale]/(dashboard)/settings/components/StorageSettings.tsx'))
            .not.toContain('api.settings.list(' + 'true)');
        expect(adminSource).not.toMatch(/testConnection\(['"](?:anthropic|vertex)/);
        expect(userSource).not.toMatch(/name=["'](?:Anthropic|Vertex)/);
        expect(adminSource).not.toMatch(/listModels\('[^']+', getSetting\('ai\.[^.]+\.api_key'\)/);
        expect(adminSource.match(/toCredentialOverride\(getSetting\('ai\.[^.]+\.api_key'\)\)/g))
            .toHaveLength(3);
        expect(adminSource).toContain('CHAT_PROVIDER_OPTIONS.map');
        expect(adminSource).toContain('EMBEDDING_PROVIDER_OPTIONS.map');
        expect(userSource).toContain('SPECIALIZED_PROVIDER_OPTIONS.map');
    });

    it('has no active Ollama frontend references outside the intentional legacy sanitizer', () => {
        const root = path.resolve(process.cwd(), 'src');
        const files: string[] = [];
        const walk = (directory: string) => {
            for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
                const target = path.join(directory, entry.name);
                if (entry.isDirectory()) walk(target);
                else if (/\.(ts|tsx)$/.test(entry.name) && !/\.spec\.(ts|tsx)$/.test(entry.name)) files.push(target);
            }
        };
        walk(root);

        const offenders = files.filter((file) => {
            const source = fs.readFileSync(file, 'utf8')
                .replace(".filter((setting) => !setting.key.startsWith('ai.ollama.'))", '');
            return /ollama/i.test(source);
        });
        expect(offenders).toEqual([]);
    });

    it.each(['tr', 'en', 'de'])('removes unused Ollama settings messages from %s', (locale) => {
        const messages = JSON.parse(readSource(`messages/${locale}.json`));

        expect(messages.settings?.ai?.ollama).toBeUndefined();
        expect(messages.settings?.ai?.ollama_local).toBeUndefined();
        expect(messages.settings?.ai?.providers?.ollama).toBeUndefined();
        expect(messages.settings?.toasts?.ollama_ok).toBeUndefined();
        expect(messages.settings?.toasts?.ollama_fail).toBeUndefined();
        expect(messages.admin?.settings?.ai?.ollama).toBeUndefined();
        expect(messages.admin?.settings?.ai?.ollama_local).toBeUndefined();
        expect(messages.admin?.settings?.ai?.providers?.ollama).toBeUndefined();
        expect(messages.admin?.settings?.toasts?.ollama_ok).toBeUndefined();
        expect(messages.admin?.settings?.toasts?.ollama_fail).toBeUndefined();
    });
});

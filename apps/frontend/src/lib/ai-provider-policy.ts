export const CHAT_PROVIDER_OPTIONS = [
    'openai',
    'llmapi',
    'xai',
    'deepseek',
    'groq',
    'custom',
    'gemini',
] as const;

export const EMBEDDING_PROVIDER_OPTIONS = [
    'openai',
    'llmapi',
    'custom',
    'gemini',
] as const;

export const SPECIALIZED_PROVIDER_OPTIONS = CHAT_PROVIDER_OPTIONS;

const CHAT_PROVIDERS = new Set<string>(CHAT_PROVIDER_OPTIONS);
const EMBEDDING_PROVIDERS = new Set<string>(EMBEDDING_PROVIDER_OPTIONS);
const SPECIALIZED_PROVIDERS = new Set<string>(SPECIALIZED_PROVIDER_OPTIONS);

const SECRET_SETTING_KEYS = new Set([
    'ai.openai.api_key',
    'ai.llmapi.api_key',
    'ai.xai.api_key',
    'ai.deepseek.api_key',
    'ai.groq.api_key',
    'ai.custom.api_key',
    'ai.gemini.api_key',
    'email.resend.api_key',
    'email.smtp.pass',
    'email.imap.pass',
    'mail.gmail.client_secret',
    'mail.gmail.refresh_token',
    'whatsapp.access_token',
    'whatsapp.verify_token',
    'storage.access_key',
    'storage.secret_key',
    'r2_access_key_id',
    'r2_secret_access_key',
]);

const normalizeProvider = (provider: string | null | undefined, supported: Set<string>): string =>
    provider && supported.has(provider) ? provider : '';

const normalizeFallback = (provider: string | null | undefined, supported: Set<string>): string =>
    provider === 'none' || (provider && supported.has(provider)) ? provider : 'none';

export const normalizeChatProvider = (provider?: string | null): string =>
    normalizeProvider(provider, CHAT_PROVIDERS);

export const normalizeEmbeddingProvider = (provider?: string | null): string =>
    normalizeProvider(provider, EMBEDDING_PROVIDERS);

export const normalizeChatFallbackProvider = (provider?: string | null): string =>
    normalizeFallback(provider, CHAT_PROVIDERS);

export const normalizeEmbeddingFallbackProvider = (provider?: string | null): string =>
    normalizeFallback(provider, EMBEDDING_PROVIDERS);

export const normalizeSpecializedProvider = (provider?: string | null): string =>
    normalizeProvider(provider, SPECIALIZED_PROVIDERS) || 'global';

export const isSecretSettingKey = (key: string): boolean => SECRET_SETTING_KEYS.has(key);

export const toCredentialOverride = (value: string): string | undefined => {
    const normalized = value.trim();
    return normalized && normalized !== '********' ? normalized : undefined;
};

type SettingValue = { key: string; value: string };

export const ensureSupportedEmbeddingProvider = <T extends SettingValue>(settings: T[]): T[] => {
    const index = settings.findIndex((setting) => setting.key === 'ai.embed_provider');
    if (index === -1) {
        return [...settings, { key: 'ai.embed_provider', value: '' } as T];
    }

    const normalized = normalizeEmbeddingProvider(settings[index].value);
    if (normalized === settings[index].value) return settings;
    return settings.map((setting, settingIndex) => settingIndex === index
        ? { ...setting, value: normalized }
        : setting);
};

export const maskSavedSecretValues = <T extends SettingValue>(settings: T[], savedKeys: string[]): T[] => {
    const saved = new Set(savedKeys);
    return settings.map((setting) => saved.has(setting.key) && isSecretSettingKey(setting.key)
        && toCredentialOverride(setting.value)
        ? { ...setting, value: '********' }
        : setting);
};

export type SettingsBatchItem = { key: string; value: string; isSecret: boolean };

export const buildSettingsBatch = (
    keys: string[],
    getValue: (key: string) => string,
): SettingsBatchItem[] => keys
    .map((key) => {
        const isSecret = isSecretSettingKey(key);
        const rawValue = getValue(key);
        return { key, value: isSecret ? rawValue.trim() : rawValue, isSecret };
    })
    .filter((item) => item.value !== '' && item.value !== '********');

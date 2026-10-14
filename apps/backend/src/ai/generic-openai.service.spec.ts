import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { GenericOpenAiService } from './generic-openai.service';
import { OutboundHttpService } from '../common/http/outbound-http.service';

type FetchResponse = {
    ok: boolean;
    status: number;
    statusText: string;
    json: jest.Mock;
    text: jest.Mock;
    headers: Headers;
};

const response = (
    body: unknown,
    options: Partial<Pick<FetchResponse, 'ok' | 'status' | 'statusText' | 'headers'>> = {},
): FetchResponse => ({
    ok: options.ok ?? true,
    status: options.status ?? 200,
    statusText: options.statusText ?? 'OK',
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
    headers: options.headers ?? new Headers(),
});

const makeService = (
    settingValues: Record<string, string | null> = {},
    envValues: Record<string, string | undefined> = {},
) => {
    const settings = {
        getValue: jest.fn((key: string) => Promise.resolve(settingValues[key] ?? null)),
    } as unknown as jest.Mocked<SettingsService>;
    const config = {
        get: jest.fn((key: string, fallback?: string) => envValues[key] ?? fallback),
    } as unknown as jest.Mocked<ConfigService>;
    const outboundHttp = {
        fetch: jest.fn((url: string, init?: RequestInit) => global.fetch(url, init)),
    } as unknown as jest.Mocked<OutboundHttpService>;

    return {
        service: new GenericOpenAiService(config, settings, outboundHttp),
        settings,
        config,
        outboundHttp,
    };
};

describe('GenericOpenAiService', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn() as jest.Mock;
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    it('switches provider namespaces and resolves provider-specific default models', async () => {
        const values: Record<string, string | null> = {
            'ai.groq.url': 'https://api.groq.com/openai/v1',
            'ai.groq.api_key': 'gsk_test',
        };
        const { service } = makeService(values);

        const groq = service.forProvider('groq');

        expect(groq.getName()).toBe('groq');
        expect(await groq.getActiveModelName()).toBe('llama-3.3-70b-versatile');
        expect(await groq.isAvailable()).toBe(true);
    });

    it.each([
        ['https://api.deepseek.com/v1', 'deepseek-chat'],
        ['https://api.x.ai/v1', 'grok-2-latest'],
        ['https://api.grok.com/v1', 'grok-2-latest'],
        ['https://provider.example/v1', 'gpt-4o-mini'],
    ])('selects the expected default model for %s', async (url, model) => {
        const { service } = makeService({ 'ai.custom.url': url });

        expect(await service.getActiveModelName()).toBe(model);
    });

    it('prefers configured chat and embedding models', async () => {
        const { service } = makeService({
            'ai.custom.url': 'https://provider.example/v1',
            'ai.custom.chat_model': 'custom-chat',
            'ai.custom.embed_model': 'custom-embed',
            'ai.custom.api_key': 'key',
        });
        (global.fetch as jest.Mock).mockResolvedValue(response({ data: [{ embedding: [0.1] }] }));

        expect(await service.getActiveModelName()).toBe('custom-chat');
        expect(await service.embed('hello')).toEqual({ embedding: [0.1], model: 'custom-embed' });
    });

    it('uses the GROQ_API_KEY environment fallback only for the Groq provider', async () => {
        const { service } = makeService(
            { 'ai.groq.url': 'https://api.groq.com/openai/v1' },
            { GROQ_API_KEY: 'gsk_environment' },
        );
        const groq = service.forProvider('groq');

        expect(await groq.isAvailable()).toBe(true);
    });

    it('keeps concurrent provider endpoint, key, and model snapshots isolated', async () => {
        const settingValues: Record<string, string | null> = {
            'ai.groq.url': 'https://api.groq.com/openai/v1',
            'ai.groq.api_key': 'gsk_concurrent',
            'ai.groq.chat_model': 'groq-model',
            'ai.xai.url': 'https://api.x.ai/v1',
            'ai.xai.api_key': 'xai-concurrent',
            'ai.xai.chat_model': 'xai-model',
        };
        const { service, outboundHttp, settings } = makeService(settingValues);
        let releaseGroqUrl!: () => void;
        const groqUrlRelease = new Promise<void>((resolve) => {
            releaseGroqUrl = resolve;
        });
        let markGroqUrlRequested!: () => void;
        const groqUrlRequested = new Promise<void>((resolve) => {
            markGroqUrlRequested = resolve;
        });
        settings.getValue.mockImplementation(async (key: string) => {
            if (key === 'ai.groq.url') {
                markGroqUrlRequested();
                await groqUrlRelease;
            }
            return settingValues[key] ?? null;
        });
        (global.fetch as jest.Mock)
            .mockResolvedValue(response({ choices: [{ message: { content: 'ok' } }] }));

        const groqCall = service.forProvider('groq').generate('first');
        await groqUrlRequested;
        const xaiCall = service.forProvider('xai').generate('second');
        await xaiCall;
        releaseGroqUrl();
        await groqCall;

        const calls = outboundHttp.fetch.mock.calls.map(([url, init]) => ({
            url,
            authorization: (init?.headers as Record<string, string>).Authorization,
            model: JSON.parse(String(init?.body)).model,
        }));
        expect(calls).toEqual(expect.arrayContaining([
            { url: 'https://api.groq.com/openai/v1/chat/completions', authorization: 'Bearer gsk_concurrent', model: 'groq-model' },
            { url: 'https://api.x.ai/v1/chat/completions', authorization: 'Bearer xai-concurrent', model: 'xai-model' },
        ]));
    });

    it('returns null for embedding when URL or API key is missing', async () => {
        const { service } = makeService();

        await expect(service.embed('hello')).resolves.toBeNull();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('posts embeddings with the configured model and bearer token', async () => {
        const { service } = makeService(
            {
                'ai.custom.url': 'https://provider.example/v1',
                'ai.custom.api_key': 'secret',
            },
            { EMBEDDING_MODEL: 'env-embed' },
        );
        (global.fetch as jest.Mock).mockResolvedValue(response({ data: [{ embedding: [0.1, 0.2] }] }));

        await expect(service.embed('Allplan')).resolves.toEqual({
            embedding: [0.1, 0.2],
            model: 'env-embed',
        });
        expect(global.fetch).toHaveBeenCalledWith(
            'https://provider.example/v1/embeddings',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({ Authorization: 'Bearer secret' }),
                body: JSON.stringify({ model: 'env-embed', input: 'Allplan' }),
            }),
        );
    });

    it.each([
        ['xai', 'https://api.x.ai/v1', 'wrong-key', 'xai-'],
        ['groq', 'https://api.groq.com/openai/v1', 'wrong-key', 'gsk_'],
        ['deepseek', 'https://api.deepseek.com/v1', 'wrong-key', 'sk-'],
    ] as const)('rejects invalid %s API key prefixes before network access', async (_provider, url, key, prefix) => {
        const { service } = makeService({
            'ai.custom.url': url,
            'ai.custom.api_key': key,
        });

        await expect(service.embed('hello')).rejects.toThrow(prefix);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('turns xAI credit failures into an actionable bad request', async () => {
        const { service } = makeService({
            'ai.custom.url': 'https://api.x.ai/v1',
            'ai.custom.api_key': 'xai-valid',
        });
        (global.fetch as jest.Mock).mockResolvedValue(response('insufficient credits', { ok: false, status: 402 }));

        await expect(service.embed('hello')).rejects.toThrow(BadRequestException);
        await expect(service.embed('hello')).rejects.toThrow('console.x.ai/billing');
    });

    it('reports provider embedding errors without exposing response details', async () => {
        const { service } = makeService({
            'ai.custom.url': 'https://provider.example/v1',
            'ai.custom.api_key': 'key',
        });
        (global.fetch as jest.Mock).mockResolvedValue(response('invalid input', { ok: false, status: 400 }));

        await expect(service.embed('hello')).rejects.toThrow('provider=custom HTTP 400');
        await expect(service.embed('hello')).rejects.not.toThrow('invalid input');
    });

    it.each([
        ['embed', (service: GenericOpenAiService) => service.embed('hello')],
        ['generate', (service: GenericOpenAiService) => service.generate('hello')],
        ['reformat', (service: GenericOpenAiService) => service.reformat('system', 'query', 'kb')],
    ] as const)('sanitizes %s upstream bodies and keeps only a safe request id', async (_name, invoke) => {
        const { service } = makeService({
            'ai.custom.url': 'https://provider.example/v1',
            'ai.custom.api_key': 'key',
        });
        const warn = jest.spyOn((service as any).logger, 'warn').mockImplementation();
        const secretBody = 'Bearer sk-secret\r\nInjected-Header: yes\n' + 'x'.repeat(5000);
        (global.fetch as jest.Mock).mockResolvedValue(response(secretBody, {
            ok: false,
            status: 502,
            headers: new Headers({ 'x-request-id': 'req_SAFE-123' }),
        }));

        await expect(invoke(service)).rejects.toThrow(
            'provider=custom HTTP 502 requestId=req_SAFE-123',
        );
        const logged = warn.mock.calls.flat().join(' ');
        expect(logged).not.toContain('sk-secret');
        expect(logged).not.toContain('Injected-Header');
        expect(logged).not.toContain('x'.repeat(100));
    });

    it('returns null from generate when provider configuration is incomplete', async () => {
        const { service } = makeService();

        await expect(service.generate('hello')).resolves.toBeNull();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('sends plain text prompts and trims generated output', async () => {
        const { service } = makeService({
            'ai.custom.url': 'https://provider.example/v1',
            'ai.custom.api_key': 'key',
            'ai.custom.chat_model': 'chat-model',
        });
        (global.fetch as jest.Mock).mockResolvedValue(response({ choices: [{ message: { content: ' answer ' } }] }));

        await expect(service.generate('question', 1234)).resolves.toBe('answer');
        const request = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
        expect(request).toEqual({
            model: 'chat-model',
            messages: [{ role: 'user', content: 'question' }],
            temperature: 0.2,
        });
    });

    it('joins all-text parts and maps image parts to OpenAI content blocks', async () => {
        const { service } = makeService({
            'ai.custom.url': 'https://provider.example/v1',
            'ai.custom.api_key': 'key',
        });
        (global.fetch as jest.Mock).mockResolvedValue(response({ choices: [{ message: { content: 'ok' } }] }));

        await service.generate([{ text: 'one' }, { text: 'two' }]);
        let request = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
        expect(request.messages[0].content).toBe('one\ntwo');

        await service.generate([
            { text: 'inspect' },
            { inlineData: { mimeType: 'image/png', data: 'base64-data' } },
        ]);
        request = JSON.parse((global.fetch as jest.Mock).mock.calls[1][1].body);
        expect(request.messages[0].content).toEqual([
            { type: 'text', text: 'inspect' },
            { type: 'image_url', image_url: { url: 'data:image/png;base64,base64-data' } },
        ]);
    });

    it('never logs an editable base URL when warning about vision capability', async () => {
        const maliciousUrl = 'https://provider.example/v1?next=deepseek.com%0D%0ABearer%20sk-secret';
        const { service } = makeService({
            'ai.custom.url': maliciousUrl,
            'ai.custom.api_key': 'key',
        });
        const warn = jest.spyOn((service as any).logger, 'warn');
        (global.fetch as jest.Mock).mockRejectedValue(new Error('offline'));

        await expect(service.generate([{
            inlineData: { mimeType: 'image/png', data: 'image-data' },
        }])).rejects.toThrow('provider=custom failure=Error');

        const logs = warn.mock.calls.flat().join(' ');
        expect(logs).not.toContain(maliciousUrl);
        expect(logs).not.toContain('sk-secret');
        expect(logs).not.toContain('\r');
        expect(logs).not.toContain('\n');
    });

    it('propagates generation HTTP and transport failures', async () => {
        const { service } = makeService({
            'ai.custom.url': 'https://provider.example/v1',
            'ai.custom.api_key': 'key',
        });
        (global.fetch as jest.Mock).mockResolvedValueOnce(response('upstream down', { ok: false, status: 503 }));

        await expect(service.generate('hello')).rejects.toThrow('provider=custom HTTP 503');

        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network down'));
        await expect(service.generate('hello')).rejects.toThrow('provider=custom failure=Error');
    });

    it('builds grounded reformat messages with mapped attachments', async () => {
        const { service } = makeService({
            'ai.custom.url': 'https://provider.example/v1',
            'ai.custom.api_key': 'key',
            'ai.custom.chat_model': 'support-model',
        });
        (global.fetch as jest.Mock).mockResolvedValue(response({ choices: [{ message: { content: ' fixed ' } }] }));

        await expect(service.reformat(
            'system rules',
            'license error',
            'official article',
            [{ fileData: { mimeType: 'image/jpeg', fileUri: 'https://cdn.example/image.jpg' } }],
        )).resolves.toEqual({ response: 'fixed', model: 'support-model' });

        const request = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
        expect(request.messages[0]).toEqual({ role: 'system', content: 'system rules' });
        expect(request.messages[1].content).toEqual(expect.arrayContaining([
            { type: 'text', text: 'KULLANICI SORUSU:\nlicense error' },
            { type: 'image_url', image_url: { url: 'https://cdn.example/image.jpg' } },
        ]));
        expect(request.messages[1].content.at(-1).text).toContain('official article');
    });

    it('returns null from reformat without credentials and propagates upstream errors', async () => {
        const missing = makeService().service;
        await expect(missing.reformat('system', 'query', 'kb')).resolves.toBeNull();

        const { service } = makeService({
            'ai.custom.url': 'https://provider.example/v1',
            'ai.custom.api_key': 'key',
        });
        (global.fetch as jest.Mock).mockResolvedValue(response('bad request', { ok: false, status: 400 }));
        await expect(service.reformat('system', 'query', 'kb')).rejects.toThrow('provider=custom HTTP 400');
    });

    it('delegates category selection and ticket summary with bounded prompts', async () => {
        const { service } = makeService();
        const generate = jest.spyOn(service, 'generate')
            .mockResolvedValueOnce('License & Activation')
            .mockResolvedValueOnce('summary');

        await expect(service.suggestCategory('Title', 'x'.repeat(600), ['General', 'License & Activation']))
            .resolves.toBe('License & Activation');
        expect(generate).toHaveBeenNthCalledWith(1, expect.stringContaining('x'.repeat(500)), 30_000);
        expect(generate.mock.calls[0][0]).not.toContain('x'.repeat(501));

        await expect(service.summarizeTicket('Subject', 'y'.repeat(3500))).resolves.toBe('summary');
        expect(generate).toHaveBeenNthCalledWith(2, expect.stringContaining('y'.repeat(3000)), 60_000);
        expect(generate.mock.calls[1][0]).not.toContain('y'.repeat(3001));
    });

    it.each([
        [null, 'NEUTRAL'],
        [' positive ', 'POSITIVE'],
        ['negative customer experience', 'NEGATIVE'],
        ['unclear', 'NEUTRAL'],
    ] as const)('normalizes sentiment result %s to %s', async (generated, expected) => {
        const { service } = makeService();
        jest.spyOn(service, 'generate').mockResolvedValue(generated);

        await expect(service.analyzeSentiment('message')).resolves.toBe(expected);
    });

    it('translates text and returns null for empty provider output', async () => {
        const { service } = makeService({
            'ai.custom.url': 'https://provider.example/v1',
            'ai.custom.api_key': 'key',
        });
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce(response({ choices: [{ message: { content: ' Übersetzung ' } }] }))
            .mockResolvedValueOnce(response({ choices: [] }));

        await expect(service.translate('Metin', 'German')).resolves.toBe('Übersetzung');
        const request = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
        expect(request.messages).toEqual([
            expect.objectContaining({ role: 'system', content: expect.stringContaining('German') }),
            { role: 'user', content: 'Metin' },
        ]);
        await expect(service.translate('Metin', 'German')).resolves.toBeNull();
    });

    it('returns null from translate when configuration is missing and propagates provider errors', async () => {
        await expect(makeService().service.translate('text', 'Turkish')).resolves.toBeNull();

        const { service } = makeService({
            'ai.custom.url': 'https://provider.example/v1',
            'ai.custom.api_key': 'key',
        });
        (global.fetch as jest.Mock).mockResolvedValue(response('failure', { ok: false, status: 500 }));
        await expect(service.translate('text', 'Turkish')).rejects.toThrow('provider=custom HTTP 500');
    });

    it('lists and prioritizes the recommended Groq model', async () => {
        const { service } = makeService();
        (global.fetch as jest.Mock).mockResolvedValue(response({
            data: [{ id: 'other' }, { id: 'llama-3.3-70b-versatile' }],
        }));

        await expect(service.listModels('override-key', 'https://api.groq.com/openai/v1')).resolves.toEqual({
            chatModels: [
                { id: 'llama-3.3-70b-versatile', displayName: 'llama-3.3-70b-versatile', recommended: true },
                { id: 'other', displayName: 'other', recommended: false },
            ],
            embedModels: [],
        });
    });

    it('returns empty model lists for missing configuration, HTTP errors, and transport errors', async () => {
        const { service } = makeService();
        const empty = { chatModels: [], embedModels: [] };
        await expect(service.listModels()).resolves.toEqual(empty);

        (global.fetch as jest.Mock).mockResolvedValueOnce(response({}, { ok: false, status: 401 }));
        await expect(service.listModels('key', 'https://provider.example/v1')).resolves.toEqual(empty);

        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('offline'));
        await expect(service.listModels('key', 'https://provider.example/v1')).resolves.toEqual(empty);
    });

    it('reports successful and missing-configuration connection checks', async () => {
        await expect(makeService().service.testConnection()).resolves.toEqual({
            success: false,
            message: 'API Key veya Base URL eksik/çözülemedi.',
        });

        const { service } = makeService({
            'ai.custom.url': 'https://provider.example/v1',
            'ai.custom.api_key': 'key',
        });
        (global.fetch as jest.Mock).mockResolvedValue(response({}));
        await expect(service.testConnection()).resolves.toEqual({ success: true, message: 'Bağlantı başarılı.' });
    });

    it.each([
        [401, { error: { message: 'bad key' } }, 'Yetkisiz (401). API Key hatalı olabilir.'],
        [429, { error: { message: 'rate limit' } }, 'Kota/Bakiye yetersiz. Faturalandırmayı kontrol edin.'],
        [402, { error: { message: 'no credits' } }, 'Kota/Bakiye yetersiz. Faturalandırmayı kontrol edin.'],
        [500, { error: { message: 'server' } }, 'Sağlayıcı isteği başarısız (HTTP 500).'],
    ] as const)('reports connection HTTP %s without throwing', async (status, body, message) => {
        const { service } = makeService({
            'ai.custom.url': 'https://provider.example/v1',
            'ai.custom.api_key': 'key',
        });
        (global.fetch as jest.Mock).mockResolvedValue(response(body, { ok: false, status, statusText: 'Failure' }));

        await expect(service.testConnection()).resolves.toEqual({ success: false, message });
    });

    it('falls back to status text when a connection error body is not JSON', async () => {
        const { service } = makeService({
            'ai.custom.url': 'https://provider.example/v1',
            'ai.custom.api_key': 'key',
        });
        const invalidJson = response('not-json', { ok: false, status: 503, statusText: 'Unavailable' });
        invalidJson.json.mockRejectedValue(new SyntaxError('invalid JSON'));
        (global.fetch as jest.Mock).mockResolvedValue(invalidJson);

        await expect(service.testConnection()).resolves.toEqual({
            success: false,
            message: 'Sağlayıcı isteği başarısız (HTTP 503).',
        });
    });

    it('does not expose connection error bodies, control characters, secrets, or unsafe request ids', async () => {
        const { service } = makeService({
            'ai.custom.url': 'https://provider.example/v1',
            'ai.custom.api_key': 'key',
        });
        const errorResponse = response({
            error: { message: 'Bearer sk-secret\r\nInjected: true' },
        }, {
            ok: false,
            status: 500,
            headers: new Headers({ 'x-request-id': 'unsafe request;secret' }),
        });
        (global.fetch as jest.Mock).mockResolvedValue(errorResponse);

        const result = await service.testConnection();

        expect(result).toEqual({ success: false, message: 'Sağlayıcı isteği başarısız (HTTP 500).' });
        expect(JSON.stringify(result)).not.toContain('sk-secret');
        expect(JSON.stringify(result)).not.toContain('requestId');
    });

    it('preserves only a validated, length-bounded request id in connection diagnostics', async () => {
        const { service } = makeService({
            'ai.custom.url': 'https://provider.example/v1',
            'ai.custom.api_key': 'key',
        });
        const errorResponse = response('Bearer sk-secret\r\nInjected: true', {
            ok: false,
            status: 503,
            headers: new Headers({ 'x-request-id': 'req_SAFE-123' }),
        });
        (global.fetch as jest.Mock).mockResolvedValue(errorResponse);

        await expect(service.testConnection()).resolves.toEqual({
            success: false,
            message: 'Sağlayıcı isteği başarısız (HTTP 503). İstek kimliği: req_SAFE-123.',
        });
    });

    it('returns actionable invalid-key, timeout, and network connection messages', async () => {
        const invalid = makeService({
            'ai.custom.url': 'https://api.x.ai/v1',
            'ai.custom.api_key': 'wrong',
        }).service;
        await expect(invalid.testConnection()).resolves.toEqual(expect.objectContaining({
            success: false,
            message: expect.stringContaining('xai-'),
        }));

        const { service } = makeService({
            'ai.custom.url': 'https://provider.example/v1',
            'ai.custom.api_key': 'key',
        });
        const timeout = new Error('timed out');
        timeout.name = 'TimeoutError';
        (global.fetch as jest.Mock).mockRejectedValueOnce(timeout);
        await expect(service.testConnection()).resolves.toEqual({
            success: false,
            message: 'Bağlantı zaman aşımına uğradı. Base URL yanlış olabilir.',
        });

        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network unreachable'));
        await expect(service.testConnection()).resolves.toEqual({
            success: false,
            message: 'Erişim sağlanamadı: sağlayıcı isteği başarısız.',
        });
    });
});

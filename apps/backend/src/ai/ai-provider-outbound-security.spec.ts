import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { OutboundHttpService } from '../common/http/outbound-http.service';
import { OutboundUrlSafetyService } from '../knowledge-pool/outbound-url-safety.service';
import { GenericOpenAiService } from './generic-openai.service';

const makeSettings = (values: Record<string, string | null>): SettingsService => ({
    getValue: jest.fn((key: string) => Promise.resolve(values[key] ?? null)),
} as unknown as SettingsService);

const makeConfig = (values: Record<string, string | undefined> = {}): ConfigService => ({
    get: jest.fn((key: string, fallback?: string) => values[key] ?? fallback),
} as unknown as ConfigService);

const makeOutbound = (
    addresses: Array<{ address: string; family: number }>,
    transport: jest.Mock = jest.fn(),
): OutboundHttpService => new OutboundHttpService(
    new OutboundUrlSafetyService(jest.fn().mockResolvedValue(addresses)),
    transport,
);

const jsonResponse = (body: unknown, status = 200, location?: string): Response => ({
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(location ? { location } : {}),
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
} as unknown as Response);

describe('AI provider outbound URL security', () => {
    it.each([
        'https://127.0.0.1/v1',
        'https://10.0.0.8/v1',
        'https://169.254.169.254/v1',
        'https://[::1]/v1',
        'https://[fe80::1]/v1',
    ])('blocks a literal Generic OpenAI base URL before transport: %s', async (baseUrl) => {
        const transport = jest.fn();
        const service = new GenericOpenAiService(
            makeConfig(),
            makeSettings({
                'ai.custom.url': baseUrl,
                'ai.custom.api_key': 'test-key',
            }),
            makeOutbound([{ address: '8.8.8.8', family: 4 }], transport),
        );

        await expect(service.embed('test')).rejects.toThrow('provider=custom failure=ProviderError');
        expect(transport).not.toHaveBeenCalled();
    });

    it('blocks a Generic OpenAI hostname when DNS resolves to a private address', async () => {
        const transport = jest.fn();
        const service = new GenericOpenAiService(
            makeConfig(),
            makeSettings({
                'ai.custom.url': 'https://provider.example/v1',
                'ai.custom.api_key': 'test-key',
            }),
            makeOutbound([{ address: '10.10.10.10', family: 4 }], transport),
        );

        await expect(service.generate('test')).rejects.toThrow('provider=custom failure=ProviderError');
        expect(transport).not.toHaveBeenCalled();
    });

    it('permits a Generic OpenAI hostname only when every resolved address is public', async () => {
        const transport = jest.fn().mockResolvedValue(jsonResponse({
            data: [{ embedding: [0.1, 0.2] }],
        }));
        const service = new GenericOpenAiService(
            makeConfig(),
            makeSettings({
                'ai.custom.url': 'https://provider.example/v1',
                'ai.custom.api_key': 'test-key',
            }),
            makeOutbound([
                { address: '8.8.8.8', family: 4 },
                { address: '2001:4860:4860::8888', family: 6 },
            ], transport),
        );

        await expect(service.embed('test')).resolves.toEqual({
            embedding: [0.1, 0.2],
            model: 'text-embedding-3-small',
        });
        expect(transport).toHaveBeenCalledTimes(1);
    });

    it('rejects a provider redirect without contacting its private Location', async () => {
        const transport = jest.fn().mockResolvedValue(
            jsonResponse({}, 302, 'http://169.254.169.254/latest/meta-data'),
        );
        const service = new GenericOpenAiService(
            makeConfig(),
            makeSettings({
                'ai.custom.url': 'https://provider.example/v1',
                'ai.custom.api_key': 'test-key',
            }),
            makeOutbound([{ address: '8.8.8.8', family: 4 }], transport),
        );

        await expect(service.generate('test')).rejects.toThrow('provider=custom failure=ProviderError');
        expect(transport).toHaveBeenCalledTimes(1);
    });

});

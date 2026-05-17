import axios from 'axios';
import { CrawlService } from './crawl.service';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const makeService = (env: Record<string, string | undefined>) => {
    const config = {
        get: jest.fn((key: string) => env[key]),
    };

    return new CrawlService(config as any);
};

describe('CrawlService', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
        jest.clearAllMocks();
    });

    it('uses Crawl4AI markdown when enabled', async () => {
        const service = makeService({
            CRAWL4AI_ENABLED: 'true',
            CRAWL4AI_BASE_URL: 'http://crawl4ai:11235',
            CRAWL4AI_API_TOKEN: 'secret-token',
        });
        const markdown = '# Allplan Help\n\nThis markdown content is long enough to be accepted by the crawler adapter.';
        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                results: [{
                    url: 'https://example.com/help',
                    success: true,
                    metadata: { title: 'Allplan Help' },
                    markdown: { fit_markdown: markdown },
                }],
            }),
        });
        global.fetch = fetchMock as any;

        const result = await service.fetch('https://example.com/help');

        expect(fetchMock).toHaveBeenCalledWith(
            'http://crawl4ai:11235/crawl',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({ Authorization: 'Bearer secret-token' }),
            }),
        );
        expect(result).toMatchObject({
            provider: 'crawl4ai',
            title: 'Allplan Help',
            content: markdown,
            isDynamic: true,
        });
    });

    it('falls back to the basic crawler when Crawl4AI fails', async () => {
        const service = makeService({
            CRAWL4AI_ENABLED: 'true',
            CRAWL4AI_BASE_URL: 'http://crawl4ai:11235',
        });
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
            text: async () => 'server error',
        }) as any;
        const fallbackContent = 'Useful fallback content for indexing. '.repeat(80);
        mockedAxios.get.mockResolvedValue({
            data: `<html><head><title>Fallback Page</title></head><body><main>${fallbackContent}</main></body></html>`,
        } as any);

        const result = await service.fetch('https://example.com/fallback');

        expect(mockedAxios.get).toHaveBeenCalled();
        expect(result.provider).toBe('basic');
        expect(result.title).toBe('Fallback Page');
        expect(result.content).toContain('Useful fallback content');
    });
});

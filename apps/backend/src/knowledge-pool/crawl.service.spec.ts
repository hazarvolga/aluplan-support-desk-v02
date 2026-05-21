import axios from 'axios';
import { CrawlService } from './crawl.service';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const makeService = (env: Record<string, string | boolean | undefined>) => {
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

    it('extracts image references from Crawl4AI markdown', async () => {
        const service = makeService({
            CRAWL4AI_ENABLED: 'true',
            CRAWL4AI_BASE_URL: 'http://crawl4ai:11235',
        });
        const markdown = '# Visual Help\n\n![Dialog showing option](/pluginfile.php/123/dialog.png)\n\nThis markdown content is long enough to be accepted by the crawler adapter.';
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                results: [{
                    url: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=8572',
                    success: true,
                    metadata: { title: 'Visual Help' },
                    markdown,
                }],
            }),
        }) as any;

        const result = await service.fetch('https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=8572');

        expect(result.images).toEqual([
            {
                url: 'https://learnnow.allplan.com/pluginfile.php/123/dialog.png',
                alt: 'Dialog showing option',
            },
        ]);
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

    it('extracts image references with captions from static HTML', async () => {
        const service = makeService({});
        const fallbackContent = 'Useful fallback content for indexing. '.repeat(80);
        mockedAxios.get.mockResolvedValue({
            data: `<html><head><title>Fallback Page</title></head><body><main>${fallbackContent}<figure><img src="/images/dialog.png" alt="Wireframe option dialog" width="640" height="480"><figcaption>Display fixtures as wireframe</figcaption></figure></main></body></html>`,
        } as any);

        const result = await service.fetch('https://example.com/help/start');

        expect(result.images).toEqual([
            {
                url: 'https://example.com/images/dialog.png',
                alt: 'Wireframe option dialog',
                caption: 'Display fixtures as wireframe',
                width: 640,
                height: 480,
            },
        ]);
    });

    it('accepts boolean CRAWL4AI_ENABLED values from validated config', async () => {
        const service = makeService({
            CRAWL4AI_ENABLED: true,
            CRAWL4AI_BASE_URL: 'http://crawl4ai:11235',
        });
        const markdown = '# Boolean Config\n\nCrawler output generated from a boolean validated environment flag.';
        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                results: [{
                    url: 'https://example.com/boolean-config',
                    success: true,
                    title: 'Boolean Config',
                    markdown,
                }],
            }),
        });
        global.fetch = fetchMock as any;

        const result = await service.fetch('https://example.com/boolean-config');

        expect(fetchMock).toHaveBeenCalledWith(
            'http://crawl4ai:11235/crawl',
            expect.objectContaining({ method: 'POST' }),
        );
        expect(result.provider).toBe('crawl4ai');
        expect(result.content).toBe(markdown);
    });

    it('extracts normalized links from markdown crawler output', async () => {
        const service = makeService({});

        expect(service.extractLinksFromText(
            '[Install](/help/install)\n[License](https://example.com/license#section)\nhttps://example.com/raw?utm_source=test',
            'https://example.com/docs/start',
        )).toEqual([
            'https://example.com/help/install',
            'https://example.com/license',
            'https://example.com/raw?utm_source=test',
        ]);
    });
});

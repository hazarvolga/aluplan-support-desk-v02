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
        const markdown = '# Visual Help\n\n![Dialog showing option](https://learnnow.allplan.com/pluginfile.php/123/dialog.png)\n\nThis markdown content is long enough to be accepted by the crawler adapter.';
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

        const result = await service.fetch('https://example.com/totara/engage/resources/howto/index.php?id=8572');

        expect(result.images).toEqual([
            {
                url: 'https://learnnow.allplan.com/pluginfile.php/123/dialog.png',
                alt: 'Dialog showing option',
            },
        ]);
    });

    it('extracts Learn Now howto detail content and images through the public Totara API', async () => {
        const service = makeService({});
        mockedAxios.get
            .mockResolvedValueOnce({
                data: '<html><title>LEARNNOW Allplan</title></html>',
                headers: { 'set-cookie': ['TotaraSession=session-one; path=/; secure'] },
            } as any)
            .mockResolvedValueOnce({
                data: '<html lang="en"><script>M.cfg = {"sesskey":"abc123","currentlanguage":"en"};</script></html>',
                headers: { 'set-cookie': ['TotaraSession=session-two; path=/; secure'] },
            } as any);
        mockedAxios.post.mockResolvedValue({
            data: {
                data: {
                    howto: {
                        id: '9089',
                        type: 'knowledge_article',
                        language: 'en',
                        versions: ['ALLPLAN 2025', 'ALLPLAN 2024'],
                        categories: ['allplan::technic'],
                        human_readable_categories: ['ALLPLAN', 'Technic'],
                        country_settings: ['int'],
                        salesforce_number: '000008140-en',
                        video_url: null,
                        pdf_url: null,
                        content: '',
                        description: '',
                        short_description: '',
                        resource: {
                            id: '9093',
                            name: 'Operate Allplan with a QHD/UHD/4K monitor from Allplan 2023',
                        },
                        salesforce_content: [
                            '<u><b>Question:</b></u><br>The icons are too small.',
                            '<p><u><b>Answer:</b></u><br>Define the QHD/UHD/4K screen as the main display.',
                            '<img alt="Windows display settings" src="https://learnnow.allplan.com/pluginfile.php/5/engage_howto/salesforce_content/9093/dialog.png" style="width: 599px;height: 296px;"></p>',
                        ].join(''),
                    },
                },
            },
        } as any);

        const result = await service.fetch('https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=9093&source=howto');

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'https://learnnow.allplan.com/totara/webapi/ajax.php?operation=engage_howto_get_howto&lang=en',
            expect.objectContaining({
                operationName: 'engage_howto_get_howto',
                variables: { id: 9093 },
            }),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'X-Totara-Sesskey': 'abc123',
                    Cookie: 'TotaraSession=session-two',
                }),
            }),
        );
        expect(result).toMatchObject({
            provider: 'learnnow-api',
            isDynamic: true,
            title: 'Operate Allplan with a QHD/UHD/4K monitor from Allplan 2023',
            metadata: {
                learnNow: expect.objectContaining({
                    resourceId: 9093,
                    type: 'knowledge_article',
                    salesforceNumber: '000008140-en',
                    imageCount: 1,
                }),
            },
        });
        expect(result.content).toContain('Question:');
        expect(result.content).toContain('Define the QHD/UHD/4K screen as the main display.');
        expect(result.images).toEqual([
            {
                url: 'https://learnnow.allplan.com/pluginfile.php/5/engage_howto/salesforce_content/9093/dialog.png',
                alt: 'Windows display settings',
            },
        ]);
    });

    it('extracts Vimeo transcripts for Learn Now explaining videos', async () => {
        const service = makeService({});
        mockedAxios.get
            .mockResolvedValueOnce({
                data: '<html><title>LEARNNOW Allplan</title></html>',
                headers: { 'set-cookie': ['TotaraSession=session-one; path=/; secure'] },
            } as any)
            .mockResolvedValueOnce({
                data: '<html lang="en"><script>M.cfg = {"sesskey":"abc123","currentlanguage":"en"};</script></html>',
                headers: { 'set-cookie': ['TotaraSession=session-two; path=/; secure'] },
            } as any)
            .mockResolvedValueOnce({
                data: {
                    video: { title: 'IFC Improvements Infrastructure' },
                    request: {
                        text_tracks: [{
                            default: true,
                            kind: 'subtitles',
                            lang: 'de',
                            label: 'Deutsch',
                            url: 'https://captions.vimeo.com/captions/115946356.vtt',
                        }],
                    },
                },
            } as any)
            .mockResolvedValueOnce({
                data: [
                    'WEBVTT',
                    '',
                    '00:00:01.000 --> 00:00:03.000',
                    'Verbesserter IFC-Import von Infrastrukturprojekten',
                    '',
                    '00:00:03.000 --> 00:00:06.000',
                    'Prüfen Sie die Achsen und Attribute vor dem Import.',
                ].join('\n'),
            } as any);
        mockedAxios.post.mockResolvedValue({
            data: {
                data: {
                    howto: {
                        id: '2740',
                        type: 'explainer_video',
                        language: 'de',
                        versions: [],
                        categories: ['allplan::general::interface'],
                        human_readable_categories: ['ALLPLAN', 'General', 'Interface'],
                        country_settings: ['de'],
                        salesforce_number: '',
                        video_url: null,
                        vimeo_url: '880602266',
                        pdf_url: null,
                        content: '',
                        salesforce_content: null,
                        description: '<div><p>Verbesserter IFC-Import von Infrastrukturprojekten</p></div>',
                        short_description: '',
                        resource: {
                            id: '2740',
                            name: 'NEUERUNG 2024 - IFC Verbesserungen Infrastruktur',
                        },
                    },
                },
            },
        } as any);

        const result = await service.fetch('https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=2740&source=howto');

        expect(mockedAxios.get).toHaveBeenCalledWith(
            'https://player.vimeo.com/video/880602266/config',
            expect.objectContaining({
                headers: expect.objectContaining({ Referer: 'https://learnnow.allplan.com/' }),
            }),
        );
        expect(mockedAxios.get).toHaveBeenCalledWith(
            'https://captions.vimeo.com/captions/115946356.vtt',
            expect.objectContaining({ headers: expect.objectContaining({ 'User-Agent': expect.any(String) }) }),
        );
        expect(result.content).toContain('Video Transcript (Deutsch):');
        expect(result.content).toContain('Prüfen Sie die Achsen und Attribute vor dem Import.');
        expect(result.metadata).toEqual({
            learnNow: expect.objectContaining({
                type: 'explainer_video',
                vimeoVideoId: '880602266',
                transcriptStatus: 'AVAILABLE',
                transcriptLanguage: 'de',
                transcriptLength: expect.any(Number),
                vimeoTitle: 'IFC Improvements Infrastructure',
            }),
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

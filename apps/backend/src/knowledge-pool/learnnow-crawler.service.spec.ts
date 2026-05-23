import axios from 'axios';
import { LearnNowCrawlerService } from './learnnow-crawler.service';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const makeService = () => {
    const prisma = {
        $queryRawUnsafe: jest.fn(),
        $executeRawUnsafe: jest.fn(),
        knowledgeSource: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
    };
    const storage = {
        uploadFile: jest.fn(),
    };
    const pool = {
        triggerSync: jest.fn(),
    };
    const crawl = {
        fetch: jest.fn(),
    };

    return {
        service: new LearnNowCrawlerService(prisma as any, storage as any, pool as any, crawl as any),
        prisma,
        storage,
        pool,
        crawl,
    };
};

describe('LearnNowCrawlerService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('discovers public Learn Now knowledge article and PDF candidates without importing in dry-run mode', async () => {
        const { service, prisma } = makeService();
        mockedAxios.get.mockResolvedValue({
            data: `
              <html><body>
                <a href="/course/view.php?id=101">License Server Access Rights</a>
                <a href="/mod/resource/view.php?id=202">Workgroup Home Office PDF</a>
              </body></html>
            `,
        } as any);

        const result = await service.discover({
            formats: ['knowledge_article', 'pdf'],
            maxPages: 1,
            maxCandidates: 10,
            dryRun: true,
        });

        expect(result).toMatchObject({ dryRun: true, discovered: 2 });
        expect(result.candidates).toEqual(expect.arrayContaining([
            expect.objectContaining({
                sourceUrl: 'https://learnnow.allplan.com/course/view.php?id=101',
                format: 'KNOWLEDGE_ARTICLE',
                categorySlug: 'license-server-codemeter',
            }),
            expect.objectContaining({
                sourceUrl: 'https://learnnow.allplan.com/mod/resource/view.php?id=202',
                format: 'PDF',
                categorySlug: 'network-workgroup',
            }),
        ]));
        expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
    });

    it('falls back to Crawler markdown discovery when static Learn Now search has no usable links', async () => {
        const { service, crawl } = makeService();
        mockedAxios.get.mockResolvedValue({
            data: '<html><body><main>No static anchors rendered here</main></body></html>',
        } as any);
        crawl.fetch.mockResolvedValue({
            content: [
                '[License Server Access Rights](https://learnnow.allplan.com/course/view.php?id=301)',
                '[Workgroup Checkout PDF](https://learnnow.allplan.com/mod/resource/view.php?id=302)',
            ].join('\n'),
            title: 'Learn Now Search',
            hash: 'hash',
            isDynamic: true,
            provider: 'crawl4ai',
            metadata: { crawl4aiSuccess: true },
        });

        const result = await service.discover({
            formats: ['knowledge_article', 'pdf'],
            maxPages: 1,
            maxCandidates: 10,
            dryRun: true,
        });

        expect(crawl.fetch).toHaveBeenCalled();
        expect(result).toMatchObject({ dryRun: true, discovered: 2 });
        expect(result.candidates).toEqual(expect.arrayContaining([
            expect.objectContaining({
                sourceUrl: 'https://learnnow.allplan.com/course/view.php?id=301',
                format: 'KNOWLEDGE_ARTICLE',
                metadata: expect.objectContaining({ discoveredVia: 'crawler_markdown', crawlerProvider: 'crawl4ai' }),
            }),
            expect.objectContaining({
                sourceUrl: 'https://learnnow.allplan.com/mod/resource/view.php?id=302',
                format: 'PDF',
                metadata: expect.objectContaining({ discoveredVia: 'crawler_markdown', crawlerProvider: 'crawl4ai' }),
            }),
        ]));
    });

    it('discovers public Totara howto resources for article and video filters without changing import format', async () => {
        const { service } = makeService();
        mockedAxios.get
            .mockResolvedValueOnce({
                data: `
                  <html><body>
                    <a href="/totara/engage/resources/howto/index.php?id=8572&source=howto">
                      Operate Allplan with a QHD/UHD/4K monitor from Allplan 2023
                    </a>
                  </body></html>
                `,
            } as any)
            .mockResolvedValueOnce({
                data: `
                  <html><body>
                    <a href="/totara/engage/resources/howto/index.php?id=2740&source=howto">
                      NEUERUNG 2024 - IFC VERBESSERUNGEN INFRASTRUKTUR
                    </a>
                  </body></html>
                `,
            } as any);

        const result = await service.discover({
            formats: ['knowledge_article', 'explaining_video'],
            maxPages: 1,
            maxCandidates: 10,
            dryRun: true,
        });

        expect(String(mockedAxios.get.mock.calls[0][0])).toContain('filter%5Bformat%5D%5B%5D=knowledge_article');
        expect(String(mockedAxios.get.mock.calls[1][0])).toContain('filter%5Bformat%5D%5B%5D=explainer_video');
        expect(result).toMatchObject({ dryRun: true, discovered: 2 });
        expect(result.candidates).toEqual(expect.arrayContaining([
            expect.objectContaining({
                sourceUrl: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=8572&source=howto',
                format: 'KNOWLEDGE_ARTICLE',
                crawlFilter: 'knowledge_article',
                metadata: expect.objectContaining({
                    sourceType: 'knowledge_article',
                    candidateFormat: 'KNOWLEDGE_ARTICLE',
                }),
            }),
            expect.objectContaining({
                sourceUrl: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=2740&source=howto',
                format: 'KNOWLEDGE_ARTICLE',
                crawlFilter: 'explaining_video',
                metadata: expect.objectContaining({
                    sourceType: 'explaining_video',
                    candidateFormat: 'KNOWLEDGE_ARTICLE',
                }),
            }),
        ]));
    });

    it('maps Learn Now UI formats to the public search filter values', async () => {
        const { service, crawl } = makeService();
        mockedAxios.get.mockResolvedValue({ data: '<html><body>No results</body></html>' } as any);
        crawl.fetch.mockResolvedValue({
            content: 'No crawler-discoverable results',
            title: 'Learn Now Search',
            hash: 'hash',
            isDynamic: true,
            provider: 'crawl4ai',
            metadata: {},
        });

        await service.discover({
            formats: ['technical_manual', 'recorded_online_session'],
            maxPages: 1,
            maxCandidates: 10,
            dryRun: true,
        });

        expect(String(mockedAxios.get.mock.calls[0][0])).toContain('filter%5Bformat%5D%5B%5D=pdf');
        expect(String(mockedAxios.get.mock.calls[1][0])).toContain('filter%5Bformat%5D%5B%5D=recording');
    });

    it('enriches saved Learn Now howto candidates with review quality metadata', async () => {
        const { service, prisma, crawl } = makeService();
        mockedAxios.get.mockResolvedValueOnce({
            data: `
              <html><body>
                <a href="/totara/engage/resources/howto/index.php?id=2740&source=howto">
                  NEUERUNG 2024 - IFC VERBESSERUNGEN INFRASTRUKTUR
                </a>
              </body></html>
            `,
        } as any);
        prisma.$queryRawUnsafe.mockResolvedValue([]);
        crawl.fetch.mockResolvedValue({
            content: 'Transcript-backed explaining video content for the Learn Now source.'.repeat(8),
            title: 'NEUERUNG 2024 - IFC Verbesserungen Infrastruktur',
            hash: 'video-content-hash',
            isDynamic: true,
            provider: 'learnnow-api',
            images: [],
            metadata: {
                learnNow: {
                    type: 'explainer_video',
                    transcriptStatus: 'AVAILABLE',
                    transcriptLanguage: 'de',
                    transcriptLength: 442,
                },
            },
        });

        const result = await service.discover({
            formats: ['explaining_video'],
            maxPages: 1,
            maxCandidates: 10,
            dryRun: false,
        });

        expect(result).toMatchObject({ dryRun: false, discovered: 1, inserted: 1, skipped: 0 });
        expect(crawl.fetch).toHaveBeenCalledWith('https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=2740&source=howto');
        expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO crawl_candidates'),
            'allplan_learnnow',
            'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=2740&source=howto',
            'NEUERUNG 2024 - IFC Verbesserungen Infrastruktur',
            'KNOWLEDGE_ARTICLE',
            'en',
            'export-import-ifc-dwg',
            'video-content-hash',
            'explaining_video',
            expect.stringContaining('"transcriptStatus":"AVAILABLE"'),
        );
        const metadata = JSON.parse(prisma.$executeRawUnsafe.mock.calls[0][9]);
        expect(metadata.reviewQuality).toEqual(expect.objectContaining({
            sourceType: 'explainer_video',
            transcriptStatus: 'AVAILABLE',
            transcriptLanguage: 'de',
            transcriptLength: 442,
            readyForImport: true,
        }));
    });

    it('imports an article candidate into the existing knowledge sync queue', async () => {
        const { service, prisma, pool } = makeService();
        prisma.$queryRawUnsafe.mockResolvedValueOnce([{
            id: '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            source: 'allplan_learnnow',
            source_url: 'https://learnnow.allplan.com/course/view.php?id=101',
            title: 'License Server Access Rights',
            format: 'KNOWLEDGE_ARTICLE',
            status: 'PENDING_REVIEW',
            language: 'en',
            category_slug: 'license-server-codemeter',
            content_hash: null,
            crawl_filter: 'knowledge_article',
            rejection_reason: null,
            metadata: { source: 'allplan_learnnow' },
        }]);
        prisma.knowledgeSource.findFirst.mockResolvedValue(null);
        prisma.knowledgeSource.create.mockResolvedValue({ id: 'source-1' });

        const result = await service.importCandidate('7c0ee310-32d5-47d0-bf19-286b8839b4db');

        expect(prisma.knowledgeSource.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                type: 'URL',
                url: 'https://learnnow.allplan.com/course/view.php?id=101',
                metadata: expect.objectContaining({
                    source: 'allplan_learnnow',
                    sourceType: 'knowledge_article',
                    ingestionMode: 'bulk-safe',
                }),
            }),
        });
        expect(pool.triggerSync).toHaveBeenCalledWith('source-1');
        expect(result).toEqual({ imported: true, candidateId: '7c0ee310-32d5-47d0-bf19-286b8839b4db', sourceId: 'source-1' });
    });

    it('skips duplicate article imports by URL', async () => {
        const { service, prisma, pool } = makeService();
        prisma.$queryRawUnsafe.mockResolvedValueOnce([{
            id: '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            source: 'allplan_learnnow',
            source_url: 'https://learnnow.allplan.com/course/view.php?id=101',
            title: 'License Server Access Rights',
            format: 'KNOWLEDGE_ARTICLE',
            status: 'PENDING_REVIEW',
            language: 'en',
            category_slug: 'license-server-codemeter',
            content_hash: null,
            crawl_filter: 'knowledge_article',
            rejection_reason: null,
            metadata: {},
        }]);
        prisma.knowledgeSource.findFirst.mockResolvedValue({ id: 'existing-source' });

        const result = await service.importCandidate('7c0ee310-32d5-47d0-bf19-286b8839b4db');

        expect(result).toEqual({ skipped: true, reason: 'DUPLICATE_URL', sourceId: 'existing-source' });
        expect(pool.triggerSync).not.toHaveBeenCalled();
    });

    it('deletes a crawler candidate from the review queue', async () => {
        const { service, prisma } = makeService();
        prisma.$executeRawUnsafe.mockResolvedValue(1);

        const result = await service.deleteCandidate('7c0ee310-32d5-47d0-bf19-286b8839b4db');

        expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
            'DELETE FROM crawl_candidates WHERE id = $1::uuid',
            '7c0ee310-32d5-47d0-bf19-286b8839b4db',
        );
        expect(result).toEqual({ success: true, count: 1 });
    });

    it('bulk deletes unique crawler candidates with validated UUID placeholders', async () => {
        const { service, prisma } = makeService();
        prisma.$executeRawUnsafe.mockResolvedValue(2);

        const result = await service.bulkDeleteCandidates([
            '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            '996bd927-1c24-48e2-a256-1420b6d57bb6',
        ]);

        expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
            'DELETE FROM crawl_candidates WHERE id IN ($1::uuid, $2::uuid)',
            '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            '996bd927-1c24-48e2-a256-1420b6d57bb6',
        );
        expect(result).toEqual({ success: true, count: 2 });
    });
});

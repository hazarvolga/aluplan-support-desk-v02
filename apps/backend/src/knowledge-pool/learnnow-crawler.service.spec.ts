import axios from 'axios';
import { LearnNowCrawlerService } from './learnnow-crawler.service';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const makeService = () => {
    const prisma = {
        $queryRawUnsafe: jest.fn(),
        $executeRawUnsafe: jest.fn().mockResolvedValue(1),
        $transaction: jest.fn(),
        knowledgeSource: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
    };
    prisma.$transaction.mockImplementation(async (callback: (transaction: typeof prisma) => unknown) => callback(prisma));
    const storage = {
        uploadFile: jest.fn(),
    };
    const pool = {
        triggerSync: jest.fn(),
        createImportedUrlSource: jest.fn(),
    };
    const crawl = {
        fetch: jest.fn(),
    };
    const urlSafety = {
        validateLearnNowUrl: jest.fn().mockResolvedValue({ httpsAgent: {} }),
        validatePublicHttpsUrl: jest.fn().mockResolvedValue({ httpsAgent: {} }),
        validateVimeoUrl: jest.fn().mockResolvedValue({ httpsAgent: {} }),
    };
    const pacer = {
        waitForTurn: jest.fn().mockResolvedValue(undefined),
    };

    return {
        service: new LearnNowCrawlerService(
            prisma as any,
            storage as any,
            pool as any,
            crawl as any,
            urlSafety as any,
            pacer as any,
        ),
        prisma,
        storage,
        pool,
        crawl,
        urlSafety,
        pacer,
    };
};

describe('LearnNowCrawlerService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('discovers public Learn Now knowledge article and PDF candidates without importing in dry-run mode', async () => {
        const { service, prisma, urlSafety, pacer } = makeService();
        mockedAxios.get.mockResolvedValue({
            data: `
              <html><body>
                <a href="/totara/engage/resources/howto/index.php?id=101&source=howto">License Server Access Rights</a>
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

        expect(urlSafety.validateLearnNowUrl).toHaveBeenCalledWith('https://learnnow.allplan.com/int');
        expect(urlSafety.validateLearnNowUrl).toHaveBeenCalledWith(expect.stringContaining('/course/search.php'));
        expect(pacer.waitForTurn).toHaveBeenCalledTimes(3);

        expect(result).toMatchObject({ dryRun: true, discovered: 2 });
        expect(result.candidates).toEqual(expect.arrayContaining([
            expect.objectContaining({
                sourceUrl: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=101&source=howto',
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

    it('does not fall back to an unbounded browser crawler when static Learn Now search has no usable links', async () => {
        const { service, crawl } = makeService();
        mockedAxios.get.mockResolvedValue({
            data: '<html><body><main>No static anchors rendered here</main></body></html>',
        } as any);
        crawl.fetch.mockResolvedValue({
            content: [
                '[License Server Access Rights](https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=301&source=howto)',
                '[Workgroup Checkout PDF](https://learnnow.allplan.com/mod/resource/view.php?id=302)',
            ].join('\n'),
            title: 'Learn Now Search',
            hash: 'hash',
            isDynamic: true,
            provider: 'crawl4ai',
            metadata: { crawl4aiSuccess: true },
        });

        const result = await service.discover({
            formats: ['knowledge_article'],
            maxPages: 1,
            maxCandidates: 5,
            dryRun: true,
        });

        expect(crawl.fetch).not.toHaveBeenCalled();
        expect(result).toEqual({ dryRun: true, discovered: 0, candidates: [] });
    });

    it('does not stage enrollment/course-layer Learn Now pages for automatic crawl', async () => {
        const { service } = makeService();
        mockedAxios.get.mockResolvedValue({
            data: `
              <html><body>
                <a href="/course/view.php?id=101">Enrollment Course Detail</a>
                <a href="/course/preview.php?id=102">Course Preview</a>
                <a href="/mod/page/view.php?id=103">E-learning Page</a>
                <a href="/totara/engage/resources/howto/index.php?id=8572&source=howto">Public Knowledge Article</a>
              </body></html>
            `,
        } as any);

        const result = await service.discover({
            formats: ['knowledge_article'],
            maxPages: 1,
            maxCandidates: 10,
            dryRun: true,
        });

        expect(result).toMatchObject({ dryRun: true, discovered: 1 });
        expect(result.candidates).toEqual([
            expect.objectContaining({
                sourceUrl: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=8572&source=howto',
                title: 'Public Knowledge Article',
            }),
        ]);
    });

    it('normalizes Learn Now howto tracking URLs to canonical source=howto URLs', async () => {
        const { service } = makeService();
        mockedAxios.get.mockResolvedValue({
            data: `
              <html><body>
                <a href="/totara/engage/resources/howto/index.php?id=9018&source=ct.orderbykey%3Dfeatured%26itemstyle%3Dnarrow">Featured Copy</a>
                <a href="/totara/engage/resources/howto/index.php?id=9018&source=howto">Canonical Copy</a>
              </body></html>
            `,
        } as any);

        const result = await service.discover({
            formats: ['knowledge_article'],
            maxPages: 1,
            maxCandidates: 10,
            dryRun: true,
        });

        expect(result).toMatchObject({ dryRun: true, discovered: 1 });
        expect(result.candidates).toEqual([
            expect.objectContaining({
                sourceUrl: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=9018&source=howto',
            }),
        ]);
    });

    it('rejects course-layer URLs before PDF candidate acceptance', async () => {
        const { service } = makeService();
        mockedAxios.get.mockResolvedValue({
            data: `
              <html><body>
                <a href="/course/files/enrolled-only-manual.pdf">Enrollment PDF</a>
                <a href="/mod/resource/view.php?id=202">Public Technical Manual</a>
              </body></html>
            `,
        } as any);

        const result = await service.discover({
            formats: ['pdf'],
            maxPages: 1,
            maxCandidates: 10,
            dryRun: true,
        });

        expect(result).toMatchObject({ dryRun: true, discovered: 1 });
        expect(result.candidates).toEqual([
            expect.objectContaining({
                sourceUrl: 'https://learnnow.allplan.com/mod/resource/view.php?id=202',
                title: 'Public Technical Manual',
                format: 'PDF',
            }),
        ]);
    });

    it('discovers public Totara howto resources for article and video filters without changing import format', async () => {
        const { service } = makeService();
        mockedAxios.get
            .mockResolvedValueOnce({
                headers: { 'set-cookie': ['TotaraSession=test-session; Path=/'] },
                data: '<html><body>session</body></html>',
            } as any)
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

        const searchCalls = mockedAxios.get.mock.calls.map(call => String(call[0])).filter(url => url.includes('/course/search.php'));
        expect(searchCalls[0]).toContain('filter%5Bformat%5D%5B%5D=knowledge_article');
        expect(searchCalls[1]).toContain('filter%5Bformat%5D%5B%5D=explainer_video');
        expect(mockedAxios.get.mock.calls[1][1]).toEqual(expect.objectContaining({
            headers: expect.objectContaining({ Cookie: expect.stringContaining('TotaraSession=test-session') }),
        }));
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

        const searchCalls = mockedAxios.get.mock.calls.map(call => String(call[0])).filter(url => url.includes('/course/search.php'));
        expect(searchCalls[0]).toContain('filter%5Bformat%5D%5B%5D=pdf');
        expect(searchCalls[1]).toContain('filter%5Bformat%5D%5B%5D=recording');
    });

    it('enriches saved Learn Now howto candidates with review quality metadata', async () => {
        const { service, prisma, crawl } = makeService();
        mockedAxios.get
            .mockResolvedValueOnce({
                headers: { 'set-cookie': ['TotaraSession=test-session; Path=/'] },
                data: '<html><body>session</body></html>',
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
                    language: 'de',
                    humanReadableCategories: ['ALLPLAN', 'General', 'Interface'],
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
            dryRun: true,
        });
        await service.stageCandidate(result.candidates[0]);

        expect(result).toMatchObject({ dryRun: true, discovered: 1 });
        expect(crawl.fetch).toHaveBeenCalledWith('https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=2740&source=howto');
        expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO crawl_candidates'),
            'allplan_learnnow',
            'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=2740&source=howto',
            'NEUERUNG 2024 - IFC Verbesserungen Infrastruktur',
            'KNOWLEDGE_ARTICLE',
            'de',
            'allplan-general-interface',
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
            reasonCode: 'MEDIA_TRANSCRIPT_READY',
        }));
    });

    it('keeps recorded session candidates review-only when transcript is missing', async () => {
        const { service, prisma, crawl } = makeService();
        mockedAxios.get
            .mockResolvedValueOnce({
                headers: { 'set-cookie': ['TotaraSession=test-session; Path=/'] },
                data: '<html><body>session</body></html>',
            } as any)
            .mockResolvedValueOnce({
                data: `
              <html><body>
                <a href="/totara/engage/resources/howto/index.php?id=3777&source=howto">
                  Recorded Session - Model Coordination
                </a>
              </body></html>
            `,
            } as any);
        prisma.$queryRawUnsafe.mockResolvedValue([]);
        crawl.fetch.mockResolvedValue({
            content: 'Recorded session overview without transcript.'.repeat(12),
            title: 'Recorded Session - Model Coordination',
            hash: 'recording-content-hash',
            isDynamic: true,
            provider: 'learnnow-api',
            images: [],
            metadata: {
                learnNow: {
                    type: 'recording',
                    transcriptStatus: 'MISSING',
                    transcriptLength: 0,
                },
            },
        });

        const result = await service.discover({
            formats: ['recorded_online_session'],
            maxPages: 1,
            maxCandidates: 10,
            dryRun: true,
        });
        await service.stageCandidate(result.candidates[0]);

        const metadata = JSON.parse(prisma.$executeRawUnsafe.mock.calls[0][9]);
        expect(metadata.reviewQuality).toEqual(expect.objectContaining({
            sourceType: 'recording',
            transcriptStatus: 'MISSING',
            readyForImport: false,
            reasonCode: 'TRANSCRIPT_REQUIRED',
        }));
    });

    it('marks technical manual PDF candidates as importable but validated during import', async () => {
        const { service, prisma } = makeService();
        mockedAxios.get
            .mockResolvedValueOnce({
                headers: { 'set-cookie': ['TotaraSession=test-session; Path=/'] },
                data: '<html><body>session</body></html>',
            } as any)
            .mockResolvedValueOnce({
                data: `
              <html><body>
                <a href="/mod/resource/view.php?id=9021">Allplan Technical Manual</a>
              </body></html>
            `,
            } as any);
        prisma.$queryRawUnsafe.mockResolvedValue([]);

        const result = await service.discover({
            formats: ['technical_manual'],
            maxPages: 1,
            maxCandidates: 10,
            dryRun: true,
        });
        await service.stageCandidate(result.candidates[0]);

        expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO crawl_candidates'),
            'allplan_learnnow',
            'https://learnnow.allplan.com/mod/resource/view.php?id=9021',
            'Allplan Technical Manual',
            'PDF',
            'en',
            'uncategorized',
            null,
            'technical_manual',
            expect.stringContaining('"reasonCode":"PDF_VALIDATED_ON_IMPORT"'),
        );
        const metadata = JSON.parse(prisma.$executeRawUnsafe.mock.calls[0][9]);
        expect(metadata.reviewQuality).toEqual(expect.objectContaining({
            sourceType: 'technical_manual',
            candidateFormat: 'PDF',
            readyForImport: true,
            reasonCode: 'PDF_VALIDATED_ON_IMPORT',
        }));
    });

    it('marks discovered candidates as skipped duplicates when their URL already exists in Knowledge Pool', async () => {
        const { service, prisma } = makeService();
        mockedAxios.get
            .mockResolvedValueOnce({
                headers: { 'set-cookie': ['TotaraSession=test-session; Path=/'] },
                data: '<html><body>session</body></html>',
            } as any)
            .mockResolvedValueOnce({
                data: `
              <html><body>
                <a href="/mod/resource/view.php?id=9021">Allplan Technical Manual</a>
              </body></html>
            `,
            } as any);
        prisma.knowledgeSource.findFirst.mockResolvedValueOnce({ id: 'existing-source' });
        prisma.$queryRawUnsafe.mockResolvedValue([]);

        const result = await service.discover({
            formats: ['technical_manual'],
            maxPages: 1,
            maxCandidates: 10,
            dryRun: true,
        });
        const staged = await service.stageCandidate(result.candidates[0]);

        expect(result).toMatchObject({ dryRun: true, discovered: 1 });
        expect(staged).toEqual({ inserted: false });
        expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
            expect.stringContaining('SKIPPED_DUPLICATE'),
            'allplan_learnnow',
            'https://learnnow.allplan.com/mod/resource/view.php?id=9021',
            'Allplan Technical Manual',
            'PDF',
            'en',
            'uncategorized',
            null,
            'technical_manual',
            'Knowledge source URL already exists',
            'existing-source',
            expect.stringContaining('"reasonCode":"PDF_VALIDATED_ON_IMPORT"'),
        );
    });

    it('imports an article candidate into the existing knowledge sync queue', async () => {
        const { service, prisma, pool } = makeService();
        prisma.$queryRawUnsafe.mockResolvedValueOnce([{
            id: '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            source: 'allplan_learnnow',
            source_url: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=101&source=howto',
            title: 'License Server Access Rights',
            format: 'KNOWLEDGE_ARTICLE',
            status: 'APPROVED',
            language: 'en',
            category_slug: 'license-server-codemeter',
            content_hash: null,
            crawl_filter: 'knowledge_article',
            rejection_reason: null,
            metadata: { source: 'allplan_learnnow', reviewQuality: { readyForImport: true } },
        }]);
        prisma.knowledgeSource.findFirst.mockResolvedValue(null);
        pool.createImportedUrlSource.mockResolvedValue({ source: { id: 'source-1' }, created: true });

        const result = await service.importCandidate('7c0ee310-32d5-47d0-bf19-286b8839b4db');

        expect(pool.createImportedUrlSource).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'URL',
                url: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=101&source=howto',
            }),
            expect.objectContaining({
                metadata: expect.objectContaining({
                    source: 'allplan_learnnow',
                    sourceType: 'knowledge_article',
                    ingestionMode: 'bulk-safe',
                }),
            }),
        );
        expect(pool.triggerSync).not.toHaveBeenCalled();
        expect(result).toEqual({ imported: true, candidateId: '7c0ee310-32d5-47d0-bf19-286b8839b4db', sourceId: 'source-1' });
    });

    it.each(['PENDING_REVIEW', 'FAILED', 'REJECTED'])(
        'rejects import while candidate status is %s',
        async (status) => {
            const { service, prisma, pool } = makeService();
            prisma.$queryRawUnsafe.mockResolvedValueOnce([{
                id: '7c0ee310-32d5-47d0-bf19-286b8839b4db',
                source: 'allplan_learnnow',
                source_url: 'https://learnnow.allplan.com/resource',
                title: 'Candidate',
                format: 'KNOWLEDGE_ARTICLE',
                status,
                language: 'en',
                category_slug: 'general',
                content_hash: null,
                crawl_filter: 'knowledge_article',
                rejection_reason: null,
                imported_source_id: null,
                metadata: { reviewQuality: { readyForImport: true } },
            }]);

            await expect(service.importCandidate('7c0ee310-32d5-47d0-bf19-286b8839b4db'))
                .rejects.toThrow('Only approved crawler candidates can be imported');
            expect(pool.createImportedUrlSource).not.toHaveBeenCalled();
        },
    );

    it('rejects an approved candidate whose review quality is not ready', async () => {
        const { service, prisma, pool } = makeService();
        prisma.$queryRawUnsafe.mockResolvedValueOnce([{
            id: '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            source: 'allplan_learnnow',
            source_url: 'https://learnnow.allplan.com/resource',
            title: 'Candidate',
            format: 'KNOWLEDGE_ARTICLE',
            status: 'APPROVED',
            language: 'en',
            category_slug: 'general',
            content_hash: null,
            crawl_filter: 'knowledge_article',
            rejection_reason: null,
            imported_source_id: null,
            metadata: { reviewQuality: { readyForImport: false } },
        }]);

        await expect(service.importCandidate('7c0ee310-32d5-47d0-bf19-286b8839b4db'))
            .rejects.toThrow('Candidate review quality is not ready for import');
        expect(pool.createImportedUrlSource).not.toHaveBeenCalled();
    });

    it.each([
        ['IMPORTED', 'ALREADY_IMPORTED'],
        ['SKIPPED_DUPLICATE', 'ALREADY_DUPLICATE'],
    ])('keeps %s imports idempotent', async (status, reason) => {
        const { service, prisma, pool, urlSafety } = makeService();
        prisma.$queryRawUnsafe.mockResolvedValueOnce([{
            id: '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            source: 'allplan_learnnow',
            source_url: 'https://learnnow.allplan.com/resource',
            title: 'Candidate',
            format: 'KNOWLEDGE_ARTICLE',
            status,
            language: 'en',
            category_slug: 'general',
            content_hash: null,
            crawl_filter: 'knowledge_article',
            rejection_reason: null,
            imported_source_id: '2fe6127e-ca14-4a60-91eb-539ffd09c83d',
            metadata: { reviewQuality: { readyForImport: true } },
        }]);

        await expect(service.importCandidate('7c0ee310-32d5-47d0-bf19-286b8839b4db'))
            .resolves.toEqual(expect.objectContaining({ skipped: true, reason }));
        expect(urlSafety.validateLearnNowUrl).not.toHaveBeenCalled();
        expect(pool.createImportedUrlSource).not.toHaveBeenCalled();
    });

    it('allows only one concurrent importer to claim an approved candidate', async () => {
        const { service, prisma, pool } = makeService();
        const candidate = {
            id: '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            source: 'allplan_learnnow',
            source_url: 'https://learnnow.allplan.com/resource',
            title: 'Candidate',
            format: 'KNOWLEDGE_ARTICLE',
            status: 'APPROVED',
            language: 'en',
            category_slug: 'general',
            content_hash: null,
            crawl_filter: 'knowledge_article',
            rejection_reason: null,
            imported_source_id: null,
            metadata: { reviewQuality: { readyForImport: true } },
        };
        prisma.$queryRawUnsafe
            .mockResolvedValueOnce([candidate])
            .mockResolvedValueOnce([{ ...candidate, status: 'IMPORTING' }]);
        prisma.$executeRawUnsafe.mockResolvedValueOnce(0);

        await expect(service.importCandidate(candidate.id))
            .rejects.toThrow('import is already in progress or no longer approved');
        expect(pool.createImportedUrlSource).not.toHaveBeenCalled();
    });

    it('does not allow rejection to overwrite an importing candidate', async () => {
        const { service, prisma } = makeService();
        prisma.$queryRawUnsafe.mockResolvedValueOnce([]);

        await expect(service.rejectCandidate(
            '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            'Operator changed their mind',
        )).rejects.toThrow('Only pending-review or approved candidates can be rejected');
    });

    it('approves only ready pending-review candidates and rejects candidates explicitly', async () => {
        const { service, prisma } = makeService();
        prisma.$queryRawUnsafe
            .mockResolvedValueOnce([{ id: '7c0ee310-32d5-47d0-bf19-286b8839b4db' }])
            .mockResolvedValueOnce([{ id: '7c0ee310-32d5-47d0-bf19-286b8839b4db' }]);

        await expect(service.approveCandidate('7c0ee310-32d5-47d0-bf19-286b8839b4db'))
            .resolves.toEqual({ success: true, status: 'APPROVED' });
        await expect(service.rejectCandidate('7c0ee310-32d5-47d0-bf19-286b8839b4db', 'Not relevant'))
            .resolves.toEqual({ success: true, status: 'REJECTED' });

        expect(prisma.$queryRawUnsafe).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("metadata->'reviewQuality'->>'readyForImport' = 'true'"),
            '7c0ee310-32d5-47d0-bf19-286b8839b4db',
        );
        expect(prisma.$queryRawUnsafe).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining("status IN ('PENDING_REVIEW', 'APPROVED')"),
            '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            'Not relevant',
        );
    });

    it('rejects save mode on the legacy synchronous discovery endpoint', async () => {
        const { service, prisma } = makeService();

        await expect(service.discover({ dryRun: false })).rejects.toThrow(
            'Saving discovery is only available through the rate-limited Learn Now crawl run endpoint',
        );
        expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
    });

    it('does not import a video candidate without a transcript', async () => {
        const { service, prisma, pool } = makeService();
        prisma.$queryRawUnsafe.mockResolvedValueOnce([{
            id: '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            source: 'allplan_learnnow',
            source_url: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=3777&source=howto',
            title: 'Recorded Session - Model Coordination',
            format: 'KNOWLEDGE_ARTICLE',
            status: 'APPROVED',
            language: 'en',
            category_slug: 'uncategorized',
            content_hash: 'recording-content-hash',
            crawl_filter: 'recorded_online_session',
            rejection_reason: null,
            metadata: {
                reviewQuality: {
                    sourceType: 'recording',
                    transcriptStatus: 'MISSING',
                    readyForImport: false,
                },
            },
        }]);

        await expect(service.importCandidate('7c0ee310-32d5-47d0-bf19-286b8839b4db'))
            .rejects.toThrow('Learn Now video candidates require an available transcript before import');
        expect(pool.createImportedUrlSource).not.toHaveBeenCalled();
    });

    it('reuses the durable run marker without enriching the same candidate twice', async () => {
        const { service, prisma, crawl } = makeService();
        const runCandidate = {
            sourceUrl: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=2740&source=howto',
            title: 'IFC Improvements',
            format: 'KNOWLEDGE_ARTICLE' as const,
            language: 'en',
            categorySlug: 'export-import-ifc-dwg',
            crawlFilter: 'knowledge_article',
            metadata: { source: 'allplan_learnnow' },
        };
        prisma.$queryRawUnsafe
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([{ inserted: true }]);
        prisma.knowledgeSource.findFirst.mockResolvedValue(null);
        crawl.fetch.mockResolvedValue({
            content: 'Official Learn Now article content.'.repeat(20),
            title: 'IFC Improvements',
            hash: 'hash-1',
            isDynamic: true,
            provider: 'learnnow-api',
            metadata: { learnNow: { type: 'knowledge_article' } },
        });

        await expect(service.stageCandidate(runCandidate, 'run-1:0')).resolves.toEqual({ inserted: true });
        await expect(service.stageCandidate(runCandidate, 'run-1:0')).resolves.toEqual({ inserted: true });

        expect(crawl.fetch).toHaveBeenCalledTimes(1);
        expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO crawl_candidates'),
            expect.anything(), expect.anything(), expect.anything(), expect.anything(), expect.anything(),
            expect.anything(), expect.anything(), expect.anything(),
            expect.stringContaining('"crawlRunKey":"run-1:0"'),
        );
    });

    it('rejects non-HTTPS and non-LearnNow candidates at the staging sink', async () => {
        const { service, crawl } = makeService();
        const unsafeCandidate = {
            sourceUrl: 'http://169.254.169.254/latest/meta-data',
            title: 'Unsafe candidate',
            format: 'KNOWLEDGE_ARTICLE' as const,
            language: 'en',
            categorySlug: 'uncategorized',
            crawlFilter: 'knowledge_article',
            metadata: { source: 'allplan_learnnow' },
        };

        await expect(service.stageCandidate(unsafeCandidate, 'run-1:0'))
            .rejects.toThrow('Only public HTTPS learnnow.allplan.com candidate URLs are allowed');
        expect(crawl.fetch).not.toHaveBeenCalled();
    });

    it('marks an article candidate duplicate when the shared URL writer loses a race', async () => {
        const { service, prisma, pool } = makeService();
        prisma.$queryRawUnsafe.mockResolvedValueOnce([{
            id: '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            source: 'allplan_learnnow',
            source_url: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=101&source=howto',
            title: 'License Server Access Rights',
            format: 'KNOWLEDGE_ARTICLE',
            status: 'APPROVED',
            language: 'en',
            category_slug: 'license-server-codemeter',
            content_hash: null,
            crawl_filter: 'knowledge_article',
            rejection_reason: null,
            metadata: { reviewQuality: { readyForImport: true } },
        }]);
        prisma.knowledgeSource.findFirst.mockResolvedValue(null);
        pool.createImportedUrlSource.mockResolvedValue({
            source: { id: 'winning-source' },
            created: false,
        });

        const result = await service.importCandidate('7c0ee310-32d5-47d0-bf19-286b8839b4db');

        expect(result).toEqual({ skipped: true, reason: 'DUPLICATE_URL', sourceId: 'winning-source' });
        expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE crawl_candidates'),
            '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            'SKIPPED_DUPLICATE',
            'winning-source',
            'Knowledge source URL already exists',
        );
    });

    it('skips duplicate article imports by URL', async () => {
        const { service, prisma, pool } = makeService();
        prisma.$queryRawUnsafe.mockResolvedValueOnce([{
            id: '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            source: 'allplan_learnnow',
            source_url: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=101&source=howto',
            title: 'License Server Access Rights',
            format: 'KNOWLEDGE_ARTICLE',
            status: 'APPROVED',
            language: 'en',
            category_slug: 'license-server-codemeter',
            content_hash: null,
            crawl_filter: 'knowledge_article',
            rejection_reason: null,
            metadata: { reviewQuality: { readyForImport: true } },
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
            expect.stringContaining("status <> 'IMPORTING'"),
            '7c0ee310-32d5-47d0-bf19-286b8839b4db',
        );
        expect(result).toEqual({ success: true, count: 1 });
    });

    it('bulk deletes unique crawler candidates with validated UUID placeholders', async () => {
        const { service, prisma } = makeService();
        prisma.$queryRawUnsafe.mockResolvedValueOnce([
            { id: '7c0ee310-32d5-47d0-bf19-286b8839b4db', status: 'APPROVED' },
            { id: '996bd927-1c24-48e2-a256-1420b6d57bb6', status: 'PENDING_REVIEW' },
        ]);
        prisma.$executeRawUnsafe.mockResolvedValue(2);

        const result = await service.bulkDeleteCandidates([
            '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            '996bd927-1c24-48e2-a256-1420b6d57bb6',
        ]);

        expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
            expect.stringContaining('ORDER BY id\n                 FOR UPDATE'),
            '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            '996bd927-1c24-48e2-a256-1420b6d57bb6',
        );
        expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM crawl_candidates'),
            '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            '996bd927-1c24-48e2-a256-1420b6d57bb6',
        );
        expect(result).toEqual({ success: true, count: 2 });
    });

    it('bulk delete is atomic when any requested candidate is importing', async () => {
        const { service, prisma } = makeService();
        prisma.$queryRawUnsafe.mockResolvedValueOnce([
            { id: '7c0ee310-32d5-47d0-bf19-286b8839b4db', status: 'APPROVED' },
            { id: '996bd927-1c24-48e2-a256-1420b6d57bb6', status: 'IMPORTING' },
        ]);

        await expect(service.bulkDeleteCandidates([
            '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            '996bd927-1c24-48e2-a256-1420b6d57bb6',
        ])).rejects.toThrow('Importing crawler candidates cannot be deleted');

        expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
            expect.stringContaining('FOR UPDATE'),
            '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            '996bd927-1c24-48e2-a256-1420b6d57bb6',
        );
        expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
    });

    it('rejects deletion of an importing candidate', async () => {
        const { service, prisma } = makeService();
        prisma.$executeRawUnsafe.mockResolvedValueOnce(0);
        prisma.$queryRawUnsafe.mockResolvedValueOnce([{ status: 'IMPORTING' }]);

        await expect(service.deleteCandidate('7c0ee310-32d5-47d0-bf19-286b8839b4db'))
            .rejects.toThrow('Importing crawler candidates cannot be deleted');
    });

    it('recovers a stale importing candidate by reconciling its checkpointed source', async () => {
        const { service, prisma, pool } = makeService();
        prisma.$queryRawUnsafe.mockResolvedValueOnce([{
            id: '7c0ee310-32d5-47d0-bf19-286b8839b4db',
            source: 'allplan_learnnow',
            source_url: 'https://learnnow.allplan.com/resource',
            title: 'Candidate',
            format: 'KNOWLEDGE_ARTICLE',
            status: 'IMPORTING',
            language: 'en',
            category_slug: 'general',
            content_hash: null,
            crawl_filter: 'knowledge_article',
            rejection_reason: 'process interrupted',
            imported_source_id: '2fe6127e-ca14-4a60-91eb-539ffd09c83d',
            import_started_at: new Date(Date.now() - (16 * 60 * 1000)),
            metadata: { reviewQuality: { readyForImport: true } },
        }]);

        await expect(service.importCandidate('7c0ee310-32d5-47d0-bf19-286b8839b4db'))
            .resolves.toEqual(expect.objectContaining({ imported: true, resumed: true }));
        expect(pool.triggerSync).toHaveBeenCalledWith('2fe6127e-ca14-4a60-91eb-539ffd09c83d');
    });
});

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

    return {
        service: new LearnNowCrawlerService(prisma as any, storage as any, pool as any),
        prisma,
        storage,
        pool,
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
});

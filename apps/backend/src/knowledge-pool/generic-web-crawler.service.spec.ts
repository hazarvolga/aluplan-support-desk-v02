import { GenericWebCrawlerService } from './generic-web-crawler.service';

const makeService = () => {
    const prisma = {
        $queryRawUnsafe: jest.fn().mockResolvedValue([]),
        $executeRawUnsafe: jest.fn().mockResolvedValue(1),
    };
    const crawl = {
        fetch: jest.fn(),
        extractLinksFromText: jest.fn().mockReturnValue([]),
    };
    return {
        service: new GenericWebCrawlerService(prisma as any, crawl as any),
        prisma,
        crawl,
    };
};

describe('GenericWebCrawlerService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('discovers same-domain child pages up to safe limits', async () => {
        const { service, crawl } = makeService();
        crawl.fetch
            .mockResolvedValueOnce({
                content: '# Root',
                title: 'Root Docs',
                hash: 'root-hash',
                isDynamic: true,
                provider: 'crawl4ai',
                links: [
                    'https://docs.example.com/help/install',
                    'https://docs.example.com/help/license',
                    'https://external.example.net/skip',
                    'mailto:support@example.com',
                ],
            })
            .mockResolvedValue({
                content: '# Child',
                title: 'Child Docs',
                hash: 'child-hash',
                isDynamic: true,
                provider: 'crawl4ai',
                links: [],
            });

        const result = await service.discover({
            startUrl: 'https://docs.example.com/help',
            maxDepth: 1,
            maxCandidates: 10,
            dryRun: true,
        });

        expect(crawl.fetch).toHaveBeenCalledTimes(3);
        expect(result).toMatchObject({ dryRun: true, discovered: 3 });
        expect(result.candidates.map((c: any) => c.sourceUrl)).toEqual([
            'https://docs.example.com/help',
            'https://docs.example.com/help/install',
            'https://docs.example.com/help/license',
        ]);
    });

    it('classifies PDF links without crawling them', async () => {
        const { service, crawl } = makeService();
        crawl.fetch.mockResolvedValueOnce({
            content: '# Root',
            title: 'Root Docs',
            hash: 'root-hash',
            isDynamic: true,
            provider: 'crawl4ai',
            links: ['https://docs.example.com/files/license-server.pdf'],
        });

        const result = await service.discover({
            startUrl: 'https://docs.example.com/help',
            maxDepth: 1,
            maxCandidates: 10,
            dryRun: true,
        });

        expect(crawl.fetch).toHaveBeenCalledTimes(1);
        expect(result.candidates).toEqual(expect.arrayContaining([
            expect.objectContaining({
                sourceUrl: 'https://docs.example.com/files/license-server.pdf',
                format: 'PDF',
            }),
        ]));
    });

    it('skips duplicate candidate URLs when saving discovery results', async () => {
        const { service, crawl, prisma } = makeService();
        crawl.fetch.mockResolvedValueOnce({
            content: '# Root',
            title: 'Root Docs',
            hash: 'root-hash',
            isDynamic: true,
            provider: 'crawl4ai',
            links: ['https://docs.example.com/help/install'],
        }).mockResolvedValueOnce({
            content: '# Install',
            title: 'Install Docs',
            hash: 'install-hash',
            isDynamic: true,
            provider: 'crawl4ai',
            links: [],
        });
        prisma.$queryRawUnsafe
            .mockResolvedValueOnce([{ id: 'existing-root' }])
            .mockResolvedValueOnce([]);

        const result = await service.discover({
            startUrl: 'https://docs.example.com/help',
            maxDepth: 1,
            maxCandidates: 10,
            dryRun: false,
        });

        expect(result).toMatchObject({ dryRun: false, discovered: 2, inserted: 1, skipped: 1 });
        expect(prisma.$executeRawUnsafe).toHaveBeenCalledTimes(1);
    });
});

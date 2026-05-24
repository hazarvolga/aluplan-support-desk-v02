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

    it('rejects LearnNow course start URLs because they require enrollment', async () => {
        const { service, crawl } = makeService();

        await expect(service.discover({
            startUrl: 'https://learnnow.allplan.com/course/view.php?id=123',
            dryRun: true,
        })).rejects.toThrow('LEARNNOW_COURSE_URLS_REQUIRE_ENROLLMENT');

        expect(crawl.fetch).not.toHaveBeenCalled();
    });

    it('does not discover LearnNow course child links from generic web crawl', async () => {
        const { service, crawl } = makeService();
        crawl.fetch
            .mockResolvedValueOnce({
                content: '# LearnNow',
                title: 'LearnNow Search',
                hash: 'root-hash',
                isDynamic: true,
                provider: 'crawl4ai',
                links: [
                    'https://learnnow.allplan.com/course/view.php?id=123',
                    'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=8572&source=howto',
                ],
            })
            .mockResolvedValueOnce({
                content: '# Public HowTo',
                title: 'Public HowTo',
                hash: 'howto-hash',
                isDynamic: true,
                provider: 'crawl4ai',
                links: [],
            });

        const result = await service.discover({
            startUrl: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=9000&source=howto',
            maxDepth: 1,
            maxCandidates: 10,
            dryRun: true,
        });

        expect(result.candidates.map((candidate: any) => candidate.sourceUrl)).not.toContain(
            'https://learnnow.allplan.com/course/view.php?id=123',
        );
        expect(result.candidates.map((candidate: any) => candidate.sourceUrl)).toContain(
            'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=8572&source=howto',
        );
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

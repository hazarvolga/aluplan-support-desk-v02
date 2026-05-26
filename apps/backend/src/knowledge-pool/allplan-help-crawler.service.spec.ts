import axios from 'axios';
import { BadRequestException } from '@nestjs/common';
import { AllplanHelpCrawlerService } from './allplan-help-crawler.service';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const makeService = () => {
    const prisma = {
        $queryRawUnsafe: jest.fn().mockResolvedValue([]),
        $executeRawUnsafe: jest.fn().mockResolvedValue(1),
        knowledgeSource: {
            findFirst: jest.fn().mockResolvedValue(null),
        },
    };
    const crawl = {
        fetch: jest.fn(),
    };

    return {
        service: new AllplanHelpCrawlerService(prisma as any, crawl as any),
        prisma,
        crawl,
    };
};

const topicResult = (title: string, hash: string, content = 'Allplan Help topic content with enough detail for review. '.repeat(4)) => ({
    content,
    title,
    hash,
    isDynamic: false,
    provider: 'basic' as const,
    metadata: { crawler: 'test' },
    images: [
        {
            url: 'https://help.allplan.com/Allplan/2026-1/1033/Allplan/images/topic.png',
            alt: 'Topic screenshot',
            width: 1280,
            height: 720,
        },
    ],
});

describe('AllplanHelpCrawlerService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('discovers a hash-topic Allplan Help URL from toc.json and keeps visual assets', async () => {
        const { service, crawl, prisma } = makeService();
        mockedAxios.get.mockResolvedValueOnce({
            data: [
                {
                    text: 'Basics',
                    url: '1000.htm',
                    children: [
                        { text: 'Open Project', url: '5464.htm' },
                    ],
                },
            ],
        } as any);
        crawl.fetch.mockResolvedValueOnce(topicResult('Opening a Project', 'topic-hash'));

        const result = await service.discover({
            startUrl: 'https://help.allplan.com/Allplan/2026-1/1033/Allplan/index.htm#5464.htm',
            name: 'Allplan Help Topic',
            mode: 'topic',
            dryRun: true,
        });

        expect(mockedAxios.get).toHaveBeenCalledWith(
            'https://help.allplan.com/Allplan/2026-1/1033/Allplan/toc.json',
            expect.any(Object),
        );
        expect(crawl.fetch).toHaveBeenCalledWith('https://help.allplan.com/Allplan/2026-1/1033/Allplan/5464.htm');
        expect(result).toMatchObject({ dryRun: true, discovered: 1 });
        expect(result.candidates[0]).toMatchObject({
            sourceUrl: 'https://help.allplan.com/Allplan/2026-1/1033/Allplan/5464.htm',
            title: 'Opening a Project',
            format: 'KNOWLEDGE_ARTICLE',
            language: 'en',
            metadata: expect.objectContaining({
                source: 'allplan_help',
                sourceName: 'Allplan Help Topic',
                visualAssets: [
                    expect.objectContaining({
                        url: 'https://help.allplan.com/Allplan/2026-1/1033/Allplan/images/topic.png',
                        source: 'allplan_help',
                    }),
                ],
                allplanHelp: expect.objectContaining({
                    version: '2026-1',
                    lcid: '1033',
                    book: 'Allplan',
                    topicFile: '5464.htm',
                    tocPath: ['Basics', 'Open Project'],
                }),
            }),
        });
        expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
    });

    it('excludes hidden toc nodes unless explicitly requested', async () => {
        const { service, crawl } = makeService();
        mockedAxios.get.mockResolvedValueOnce({
            data: [
                { text: 'Visible Topic', url: 'visible.htm' },
                { text: 'Hidden Topic', url: 'hidden.htm', hidden: true },
            ],
        } as any);
        crawl.fetch
            .mockResolvedValueOnce(topicResult('Visible Topic', 'visible-hash'))
            .mockResolvedValueOnce(topicResult('Hidden Topic', 'hidden-hash'));

        const visibleOnly = await service.discover({
            startUrl: 'https://help.allplan.com/Allplan/2026-1/1033/Allplan/index.htm',
            mode: 'fullBook',
            maxCandidates: 10,
            dryRun: true,
        });

        expect(visibleOnly.candidates.map((candidate: any) => candidate.sourceUrl)).toEqual([
            'https://help.allplan.com/Allplan/2026-1/1033/Allplan/visible.htm',
        ]);

        mockedAxios.get.mockResolvedValueOnce({
            data: [
                { text: 'Visible Topic', url: 'visible.htm' },
                { text: 'Hidden Topic', url: 'hidden.htm', hidden: true },
            ],
        } as any);
        crawl.fetch
            .mockResolvedValueOnce(topicResult('Visible Topic', 'visible-hash-2'))
            .mockResolvedValueOnce(topicResult('Hidden Topic', 'hidden-hash'));
        const withHidden = await service.discover({
            startUrl: 'https://help.allplan.com/Allplan/2026-1/1033/Allplan/index.htm',
            mode: 'fullBook',
            maxCandidates: 10,
            includeHidden: true,
            dryRun: true,
        });

        expect(withHidden.candidates.map((candidate: any) => candidate.sourceUrl)).toEqual([
            'https://help.allplan.com/Allplan/2026-1/1033/Allplan/visible.htm',
            'https://help.allplan.com/Allplan/2026-1/1033/Allplan/hidden.htm',
        ]);
    });

    it('marks saved candidates as skipped duplicates when the URL already exists in Knowledge Pool', async () => {
        const { service, crawl, prisma } = makeService();
        mockedAxios.get.mockResolvedValueOnce({
            data: [{ text: 'License Activation', url: 'license.htm' }],
        } as any);
        crawl.fetch.mockResolvedValueOnce(topicResult('License Activation', 'license-hash'));
        prisma.knowledgeSource.findFirst.mockResolvedValueOnce({ id: 'existing-source' });
        prisma.$queryRawUnsafe.mockResolvedValueOnce([]);

        const result = await service.discover({
            startUrl: 'https://help.allplan.com/Allplan/2026-1/1033/Allplan/index.htm#license.htm',
            mode: 'topic',
            dryRun: false,
        });

        expect(result).toMatchObject({ dryRun: false, discovered: 1, inserted: 0, skipped: 1 });
        expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
            expect.stringContaining('SKIPPED_DUPLICATE'),
            'allplan_help',
            'https://help.allplan.com/Allplan/2026-1/1033/Allplan/license.htm',
            'License Activation',
            'KNOWLEDGE_ARTICLE',
            'en',
            'license-server-codemeter',
            'license-hash',
            'topic',
            'Knowledge source URL already exists',
            'existing-source',
            expect.stringContaining('"source":"allplan_help"'),
        );
    });

    it('rejects non Allplan Help URLs before crawling', async () => {
        const { service, crawl } = makeService();

        await expect(service.discover({
            startUrl: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=11851&source=howto',
            dryRun: true,
        })).rejects.toBeInstanceOf(BadRequestException);

        expect(crawl.fetch).not.toHaveBeenCalled();
    });
});

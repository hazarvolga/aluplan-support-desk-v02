import { LearnNowCrawlerService } from './learnnow-crawler.service';
import { OutboundUrlSafetyService } from './outbound-url-safety.service';

const run = process.env.LEARNNOW_LIVE_PILOT === 'read-only-single-candidate'
    ? describe
    : describe.skip;

run('Learn Now read-only discovery pilot', () => {
    jest.setTimeout(180_000);

    it('discovers one public knowledge article without touching persistence or imports', async () => {
        const forbiddenWrite = jest.fn(() => {
            throw new Error('The read-only Learn Now pilot attempted a forbidden write');
        });
        const prisma = new Proxy({}, {
            get: () => forbiddenWrite,
        });
        const storage = new Proxy({}, {
            get: () => forbiddenWrite,
        });
        const knowledgePool = new Proxy({}, {
            get: () => forbiddenWrite,
        });
        const crawl = new Proxy({}, {
            get: () => forbiddenWrite,
        });
        let previousRequestAt = 0;
        const requestTimes: number[] = [];
        const pacer = {
            waitForTurn: jest.fn(async () => {
                const now = Date.now();
                const waitMs = Math.max(0, previousRequestAt + 60_000 - now);
                if (waitMs > 0) {
                    await new Promise(resolve => setTimeout(resolve, waitMs));
                }
                previousRequestAt = Date.now();
                requestTimes.push(previousRequestAt);
            }),
        };
        const service = new LearnNowCrawlerService(
            prisma as never,
            storage as never,
            knowledgePool as never,
            crawl as never,
            new OutboundUrlSafetyService(),
            pacer as never,
        );

        const result = await service.discover({
            formats: ['knowledge_article'],
            maxPages: 1,
            maxCandidates: 1,
            dryRun: true,
        });

        expect(result.dryRun).toBe(true);
        expect(result.discovered).toBe(1);
        expect(result.candidates).toHaveLength(result.discovered);
        for (const candidate of result.candidates) {
            const url = new URL(candidate.sourceUrl);
            expect(url.protocol).toBe('https:');
            expect(url.hostname).toBe('learnnow.allplan.com');
            expect(candidate.format).toBe('KNOWLEDGE_ARTICLE');
        }
        expect(pacer.waitForTurn).toHaveBeenCalledTimes(2);
        expect(requestTimes[1] - requestTimes[0]).toBeGreaterThanOrEqual(60_000);
        expect(forbiddenWrite).not.toHaveBeenCalled();
        process.stdout.write(`[LearnNow pilot] ${JSON.stringify({
            discovered: result.discovered,
            title: result.candidates[0].title,
            sourceUrl: result.candidates[0].sourceUrl,
            crawlerSequencingMs: requestTimes[1] - requestTimes[0],
        })}\n`);
    });
});

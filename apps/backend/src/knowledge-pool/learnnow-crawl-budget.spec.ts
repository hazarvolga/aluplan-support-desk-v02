import { LearnNowCrawlBudget } from './learnnow-crawl-budget';

describe('LearnNowCrawlBudget', () => {
    it('uses conservative defaults', () => {
        const budget = new LearnNowCrawlBudget({});

        expect(budget.pacingMs).toBe(60_000);
        expect(budget.dailyCandidateLimit).toBe(10);
        expect(budget.runCandidateLimit).toBe(5);
    });

    it('never permits configuration above the safety caps', () => {
        const budget = new LearnNowCrawlBudget({
            LEARNNOW_CRAWL_PACING_MS: 1,
            LEARNNOW_CRAWL_DAILY_CANDIDATE_LIMIT: 100,
            LEARNNOW_CRAWL_RUN_CANDIDATE_LIMIT: 100,
        });

        expect(budget.pacingMs).toBe(60_000);
        expect(budget.dailyCandidateLimit).toBe(10);
        expect(budget.runCandidateLimit).toBe(5);
    });

    it('returns the strictest remaining allowance', () => {
        const budget = new LearnNowCrawlBudget({});

        expect(budget.remaining({ runProcessed: 1, requested: 5 })).toBe(4);
        expect(budget.remaining({ runProcessed: 5, requested: 5 })).toBe(0);
    });
});

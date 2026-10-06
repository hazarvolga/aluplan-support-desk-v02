type LearnNowBudgetEnvironment = {
    LEARNNOW_CRAWL_PACING_MS?: number;
    LEARNNOW_CRAWL_DAILY_CANDIDATE_LIMIT?: number;
    LEARNNOW_CRAWL_RUN_CANDIDATE_LIMIT?: number;
};

const MINIMUM_PACING_MS = 60_000;
const MAXIMUM_DAILY_CANDIDATES = 10;
const MAXIMUM_RUN_CANDIDATES = 5;

export class LearnNowCrawlBudget {
    readonly pacingMs: number;
    readonly dailyCandidateLimit: number;
    readonly runCandidateLimit: number;

    constructor(environment: LearnNowBudgetEnvironment) {
        this.pacingMs = Math.max(environment.LEARNNOW_CRAWL_PACING_MS ?? MINIMUM_PACING_MS, MINIMUM_PACING_MS);
        this.dailyCandidateLimit = Math.min(
            environment.LEARNNOW_CRAWL_DAILY_CANDIDATE_LIMIT ?? MAXIMUM_DAILY_CANDIDATES,
            MAXIMUM_DAILY_CANDIDATES,
        );
        this.runCandidateLimit = Math.min(
            environment.LEARNNOW_CRAWL_RUN_CANDIDATE_LIMIT ?? MAXIMUM_RUN_CANDIDATES,
            MAXIMUM_RUN_CANDIDATES,
        );
    }

    remaining(input: { runProcessed: number; requested: number }): number {
        return Math.max(0, Math.min(
            this.runCandidateLimit - input.runProcessed,
            input.requested - input.runProcessed,
        ));
    }
}

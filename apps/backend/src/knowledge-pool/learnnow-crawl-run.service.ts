import { BadRequestException, ConflictException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { Prisma } from '@aluplan/database';
import { PrismaService } from '../prisma/prisma.service';
import { StartLearnNowCrawlRunDto } from './dto/learnnow-crawl-run.dto';
import { LearnNowCrawlerService, DiscoveredCandidate } from './learnnow-crawler.service';
import { LearnNowCrawlBudget } from './learnnow-crawl-budget';

type RunCheckpoint = {
    candidates: DiscoveredCandidate[];
    nextCandidateIndex: number;
    notBefore: number;
};

type RunRecord = {
    id: string;
    status: string;
    search: string | null;
    formats: string[];
    maxCandidates: number;
    attemptCount: number;
    processedCount: number;
    insertedCount: number;
    checkpoint: Prisma.JsonValue | null;
};

@Injectable()
export class LearnNowCrawlRunService {
    private readonly budget: LearnNowCrawlBudget;

    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('learnnow-crawl') private readonly queue: Queue,
        private readonly crawler: LearnNowCrawlerService,
        private readonly config: ConfigService,
    ) {
        this.budget = new LearnNowCrawlBudget({
            LEARNNOW_CRAWL_PACING_MS: this.config.get<number>('LEARNNOW_CRAWL_PACING_MS'),
            LEARNNOW_CRAWL_DAILY_CANDIDATE_LIMIT: this.config.get<number>('LEARNNOW_CRAWL_DAILY_CANDIDATE_LIMIT'),
            LEARNNOW_CRAWL_RUN_CANDIDATE_LIMIT: this.config.get<number>('LEARNNOW_CRAWL_RUN_CANDIDATE_LIMIT'),
        });
    }

    async start(dto: StartLearnNowCrawlRunDto) {
        if (!this.isEnabled()) {
            throw new ServiceUnavailableException({
                code: 'LEARNNOW_CRAWLER_DISABLED',
                message: 'Learn Now crawling is disabled by configuration',
            });
        }

        const active = await this.prisma.learnNowCrawlRun.findFirst({
            where: { activeKey: 'learnnow', deletedAt: null },
            select: { id: true },
        });
        if (active) {
            throw new ConflictException({ code: 'LEARNNOW_CRAWL_ALREADY_ACTIVE', runId: active.id });
        }

        const maxCandidates = Math.min(dto.maxCandidates ?? this.budget.runCandidateLimit, this.budget.runCandidateLimit);
        let run;
        try {
            run = await this.prisma.learnNowCrawlRun.create({
                data: {
                    activeKey: 'learnnow',
                    search: dto.search?.trim() || null,
                    formats: dto.formats?.length ? dto.formats : ['knowledge_article'],
                    maxCandidates,
                },
            });
        } catch (error) {
            if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
                throw new ConflictException({ code: 'LEARNNOW_CRAWL_ALREADY_ACTIVE' });
            }
            throw error;
        }
        try {
            await this.enqueue(run.id, 'catalog', 0);
        } catch (error) {
            await this.prisma.learnNowCrawlRun.update({
                where: { id: run.id },
                data: {
                    status: 'FAILED',
                    failedCount: { increment: 1 },
                    completedAt: new Date(),
                    activeKey: null,
                    lastError: error instanceof Error ? error.message.slice(0, 2000) : 'Queue enqueue failed',
                },
            });
            throw error;
        }
        return run;
    }

    async latest() {
        return this.prisma.learnNowCrawlRun.findFirst({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    }

    async get(id: string) {
        const run = await this.prisma.learnNowCrawlRun.findFirst({ where: { id, deletedAt: null } });
        if (!run) throw new NotFoundException('Learn Now crawl run not found');
        return run;
    }

    async pause(id: string) {
        const paused = await this.prisma.learnNowCrawlRun.updateMany({
            where: { id, deletedAt: null, status: { in: ['QUEUED', 'RUNNING'] } },
            data: { status: 'PAUSED', pausedAt: new Date() },
        });
        const run = await this.get(id);
        if (paused.count === 0) {
            throw new BadRequestException(`Learn Now crawl run cannot be paused from ${run.status}`);
        }
        return run;
    }

    async resume(id: string) {
        if (!this.isEnabled()) {
            throw new ServiceUnavailableException({
                code: 'LEARNNOW_CRAWLER_DISABLED',
                message: 'Learn Now crawling is disabled by configuration',
            });
        }
        let resumed;
        try {
            const transition = await this.prisma.learnNowCrawlRun.updateMany({
                where: { id, deletedAt: null, status: 'PAUSED' },
                data: { status: 'QUEUED', activeKey: 'learnnow', pausedAt: null, lastError: null },
            });
            if (transition.count === 0) {
                const current = await this.get(id);
                throw new BadRequestException(`Learn Now crawl run cannot be resumed from ${current.status}`);
            }
            resumed = await this.get(id);
        } catch (error) {
            if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
                throw new ConflictException({ code: 'LEARNNOW_CRAWL_ALREADY_ACTIVE' });
            }
            throw error;
        }
        try {
            await this.enqueue(id, `resume-${resumed.processedCount}-${Date.now()}`, 0);
        } catch (error) {
            await this.prisma.learnNowCrawlRun.updateMany({
                where: { id, status: 'QUEUED' },
                data: {
                    status: 'PAUSED',
                    pausedAt: new Date(),
                    lastError: error instanceof Error ? error.message.slice(0, 2000) : 'Queue enqueue failed',
                },
            });
            throw error;
        }
        return resumed;
    }

    async processStep(runId: string): Promise<void> {
        const run = await this.prisma.learnNowCrawlRun.findUnique({ where: { id: runId } }) as RunRecord | null;
        if (!run || ['PAUSED', 'COMPLETED', 'FAILED'].includes(run.status)) return;
        if (!this.isEnabled()) {
            await this.prisma.learnNowCrawlRun.updateMany({
                where: { id: runId, status: { in: ['QUEUED', 'RUNNING'] } },
                data: { status: 'PAUSED', pausedAt: new Date(), lastError: 'LEARNNOW_CRAWLER_DISABLED' },
            });
            return;
        }

        let checkpoint = this.parseCheckpoint(run.checkpoint);
        const currentCandidate = checkpoint?.candidates[checkpoint.nextCandidateIndex];
        if (checkpoint && currentCandidate) {
            const priorResult = await this.crawler.getStageResult(
                currentCandidate.sourceUrl,
                `${runId}:${checkpoint.nextCandidateIndex}`,
            );
            if (priorResult !== null) {
                await this.persistOutcome(run, checkpoint, priorResult);
                return;
            }
        }

        const remaining = this.budget.remaining({
            runProcessed: run.processedCount,
            requested: run.maxCandidates,
        });
        if (remaining === 0) {
            await this.complete(runId, null);
            return;
        }

        if (!checkpoint) {
            if (!await this.reserveOutboundAttempt(runId)) return;
            checkpoint = await this.discoverCheckpoint(run, remaining);
            const persisted = await this.prisma.learnNowCrawlRun.updateMany({
                where: { id: runId, status: { in: ['QUEUED', 'RUNNING'] } },
                data: {
                    status: 'RUNNING',
                    startedAt: run.status === 'QUEUED' ? new Date() : undefined,
                    checkpoint: checkpoint as unknown as Prisma.InputJsonValue,
                    lastError: null,
                },
            });
            if (persisted.count === 0) {
                await this.prisma.learnNowCrawlRun.update({
                    where: { id: runId },
                    data: { checkpoint: checkpoint as unknown as Prisma.InputJsonValue },
                });
                return;
            }
            if (checkpoint.candidates.length === 0) {
                await this.complete(runId, null);
                return;
            }
            await this.enqueue(runId, 'candidate-0', this.budget.pacingMs);
            return;
        }

        const candidate = checkpoint.candidates[checkpoint.nextCandidateIndex];
        if (!candidate) {
            await this.complete(runId, null);
            return;
        }
        const waitMs = Math.max(0, checkpoint.notBefore - Date.now());
        if (waitMs > 0) {
            await this.enqueue(runId, `candidate-${checkpoint.nextCandidateIndex}-wait-${Date.now()}`, waitMs);
            return;
        }

        if (!await this.reserveOutboundAttempt(runId)) return;

        const staged = await this.crawler.stageCandidate(candidate, `${runId}:${checkpoint.nextCandidateIndex}`);
        await this.persistOutcome(run, checkpoint, staged.inserted);
    }

    private async persistOutcome(run: RunRecord, checkpoint: RunCheckpoint, inserted: boolean): Promise<void> {
        const processedCount = run.processedCount + 1;
        const insertedCount = run.insertedCount + (inserted ? 1 : 0);
        const nextCheckpoint: RunCheckpoint = {
            candidates: checkpoint.candidates,
            nextCandidateIndex: checkpoint.nextCandidateIndex + 1,
            notBefore: Date.now() + this.budget.pacingMs,
        };
        const exhausted = nextCheckpoint.nextCandidateIndex >= nextCheckpoint.candidates.length;
        const completed = processedCount >= run.maxCandidates || insertedCount >= this.budget.runCandidateLimit || exhausted;

        const progressed = await this.prisma.learnNowCrawlRun.updateMany({
            where: { id: run.id, status: { in: ['QUEUED', 'RUNNING'] } },
            data: {
                status: completed ? 'COMPLETED' : 'RUNNING',
                startedAt: run.status === 'QUEUED' ? new Date() : undefined,
                completedAt: completed ? new Date() : undefined,
                processedCount: { increment: 1 },
                insertedCount: { increment: inserted ? 1 : 0 },
                skippedCount: { increment: inserted ? 0 : 1 },
                checkpoint: nextCheckpoint as unknown as Prisma.InputJsonValue,
                lastError: null,
                activeKey: completed ? null : 'learnnow',
            },
        });
        if (progressed.count === 0) {
            await this.prisma.learnNowCrawlRun.update({
                where: { id: run.id },
                data: {
                    processedCount: { increment: 1 },
                    insertedCount: { increment: inserted ? 1 : 0 },
                    skippedCount: { increment: inserted ? 0 : 1 },
                    checkpoint: nextCheckpoint as unknown as Prisma.InputJsonValue,
                },
            });
            return;
        }
        if (!completed) {
            await this.enqueue(run.id, `candidate-${nextCheckpoint.nextCandidateIndex}`, this.budget.pacingMs);
        }
    }

    async fail(id: string, message: string): Promise<void> {
        await this.prisma.learnNowCrawlRun.updateMany({
            where: { id, status: { in: ['QUEUED', 'RUNNING'] } },
            data: {
                status: 'FAILED',
                failedCount: { increment: 1 },
                lastError: message.slice(0, 2000),
                completedAt: new Date(),
                activeKey: null,
            },
        });
    }

    private async discoverCheckpoint(run: RunRecord, remaining: number): Promise<RunCheckpoint> {
        const result = await this.crawler.discover({
            search: run.search ?? undefined,
            formats: run.formats as StartLearnNowCrawlRunDto['formats'],
            maxPages: 1,
            maxCandidates: Math.min(remaining, run.maxCandidates),
            dryRun: true,
        });
        return {
            candidates: result.candidates ?? [],
            nextCandidateIndex: 0,
            notBefore: Date.now() + this.budget.pacingMs,
        };
    }

    private parseCheckpoint(value: Prisma.JsonValue | null): RunCheckpoint | null {
        if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
        const checkpoint = value as Record<string, unknown>;
        if (!Array.isArray(checkpoint.candidates) || typeof checkpoint.nextCandidateIndex !== 'number') return null;
        return {
            candidates: checkpoint.candidates as DiscoveredCandidate[],
            nextCandidateIndex: checkpoint.nextCandidateIndex,
            notBefore: typeof checkpoint.notBefore === 'number' ? checkpoint.notBefore : 0,
        };
    }

    private async reserveOutboundAttempt(runId: string): Promise<boolean> {
        const runReservation = await this.prisma.learnNowCrawlRun.updateMany({
            where: { id: runId, status: { in: ['QUEUED', 'RUNNING'] } },
            data: { attemptCount: { increment: 1 } },
        });
        if (runReservation.count === 0) return false;

        const rows = await this.prisma.$queryRaw<Array<{ attempt_count: number }>>(Prisma.sql`
            INSERT INTO learnnow_crawl_daily_budgets (budget_date, attempt_count, updated_at)
            VALUES (CURRENT_DATE, 1, CURRENT_TIMESTAMP)
            ON CONFLICT (budget_date) DO UPDATE
            SET attempt_count = learnnow_crawl_daily_budgets.attempt_count + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE learnnow_crawl_daily_budgets.attempt_count < ${this.budget.dailyCandidateLimit}
            RETURNING attempt_count
        `);
        if (rows.length === 0) {
            await this.complete(runId, 'DAILY_BUDGET_REACHED');
            return false;
        }

        const current = await this.prisma.learnNowCrawlRun.findUnique({
            where: { id: runId },
            select: { status: true },
        });
        return current?.status === 'QUEUED' || current?.status === 'RUNNING';
    }

    private async complete(id: string, reason: string | null): Promise<void> {
        await this.prisma.learnNowCrawlRun.updateMany({
            where: { id, status: { in: ['QUEUED', 'RUNNING'] } },
            data: { status: 'COMPLETED', completedAt: new Date(), lastError: reason, activeKey: null },
        });
    }

    private async enqueue(runId: string, step: string, delay: number): Promise<void> {
        await this.queue.add(
            'learnnow-crawl-step',
            { runId },
            { jobId: `learnnow-run-${runId}-${step}`, delay },
        );
    }

    private isEnabled(): boolean {
        return this.config.get<boolean>('LEARNNOW_CRAWL_ENABLED') === true;
    }
}

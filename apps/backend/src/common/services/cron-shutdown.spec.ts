import { Injectable, Logger } from '@nestjs/common';
import { Cron, ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { Test } from '@nestjs/testing';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { CronShutdownService } from './cron-shutdown.service';

describe('finite cron shutdown boundary', () => {
    it.each(['success', 'failure'] as const)(
        'waits two actual cron callbacks through %s before dependency shutdown',
        async (outcome) => {
            let releaseFirst!: () => void;
            let releaseSecond!: () => void;
            let rejectSecond!: (error: Error) => void;
            const first = new Promise<void>((resolve) => {
                releaseFirst = resolve;
            });
            const second = new Promise<void>((resolve, reject) => {
                releaseSecond = resolve;
                rejectSecond = reject;
            });
            const events: string[] = [];
            @Injectable()
            class FixtureTasks {
                @Cron('0 0 1 1 *', { name: 'first', waitForCompletion: true })
                async first() {
                    events.push('first-start');
                    await first;
                    events.push('enqueue-finished');
                }
                @Cron('0 0 1 1 *', { name: 'second', waitForCompletion: true })
                async second() {
                    events.push('second-start');
                    await second;
                }
            }
            const module = await Test.createTestingModule({
                imports: [ScheduleModule.forRoot()],
                providers: [
                    FixtureTasks,
                    CronShutdownService,
                    {
                        provide: 'dependency',
                        useValue: {
                            onApplicationShutdown() {
                                events.push('dependency-closed');
                            },
                        },
                    },
                ],
            }).compile();
            const log = jest
                .spyOn(Logger.prototype, 'error')
                .mockImplementation(() => undefined);
            let closing: Promise<void> | undefined;
            let ticks: Promise<void>[] = [];
            try {
                await module.init();
                const jobs = [
                    ...module.get(SchedulerRegistry).getCronJobs().values(),
                ];
                expect(jobs).toHaveLength(2);
                ticks = jobs.map((job) => job.fireOnTick());
                await Promise.resolve();
                expect(events).toEqual(['first-start', 'second-start']);
                await Promise.all(jobs.map((job) => job.fireOnTick()));
                expect(events).toEqual(['first-start', 'second-start']);
                closing = module.close();
                await new Promise<void>((resolve) => setImmediate(resolve));
                expect(jobs.every((job) => !job.running)).toBe(true);
                expect(events).not.toContain('dependency-closed');
                releaseFirst();
                await ticks[0];
                expect(events).toContain('enqueue-finished');
                expect(events).not.toContain('dependency-closed');
                if (outcome === 'failure')
                    rejectSecond(new Error('Synthetic callback failure'));
                else releaseSecond();
                await closing;
                expect(events.at(-1)).toBe('dependency-closed');
            } finally {
                releaseFirst();
                releaseSecond();
                await Promise.allSettled(ticks);
                try {
                    if (closing) await closing;
                    else await module.close();
                } finally {
                    log.mockRestore();
                }
            }
        },
    );

    it('stops every job and rejects an unjoinable callback configuration', async () => {
        const first = {
            stop: jest.fn(),
            waitForCompletion: false,
            isCallbackRunning: false,
        };
        const second = {
            stop: jest.fn(),
            waitForCompletion: true,
            isCallbackRunning: false,
        };
        const service = new CronShutdownService({
            getCronJobs: () =>
                new Map([
                    ['first', first],
                    ['second', second],
                ]),
        } as never);
        await expect(service.onModuleDestroy()).rejects.toThrow(
            'Cron completion tracking is required',
        );
        expect(first.stop).toHaveBeenCalledTimes(1);
        expect(second.stop).toHaveBeenCalledTimes(1);
    });

    it('keeps all ten source cron declarations explicitly joinable', () => {
        const sourceRoot = join(__dirname, '../..');
        const readSources = (dir: string): string[] =>
            readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
                const path = join(dir, entry.name);
                if (entry.isDirectory()) return readSources(path);
                return entry.name.endsWith('.ts') &&
                    !entry.name.endsWith('.spec.ts')
                    ? [readFileSync(path, 'utf8')]
                    : [];
            });
        const declarations = readSources(sourceRoot).flatMap(
            (source) => source.match(/@Cron\([^\n]+/g) ?? [],
        );
        expect(declarations).toHaveLength(10);
        expect(
            declarations.every((line) =>
                /waitForCompletion:\s*true/.test(line),
            ),
        ).toBe(true);
    });
});

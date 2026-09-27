import { Controller, Get, Injectable } from '@nestjs/common';
import { Cron, ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { Test } from '@nestjs/testing';
import { DiscoveryModule } from '@nestjs/core';
import request from 'supertest';
import { ClientRequest, request as httpRequest } from 'node:http';
import { AddressInfo } from 'node:net';
import { Request, Response, NextFunction } from 'express';
import { CronShutdownService } from './cron-shutdown.service';
import { WorkerShutdownService } from './worker-shutdown.service';
import { MaintenanceWorkService } from './maintenance-work.service';
import { MaintenanceAdmissionMiddleware } from '../middleware/maintenance-admission.middleware';

function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((done) => {
        resolve = done;
    });
    return { promise, resolve };
}

async function bounded(promise: Promise<unknown>) {
    let timer!: ReturnType<typeof setTimeout>;
    try {
        await Promise.race([
            promise,
            new Promise<never>((_, reject) => {
                timer = setTimeout(
                    () =>
                        reject(
                            new Error('Maintenance fixture phase timed out'),
                        ),
                    1500,
                );
            }),
        ]);
    } finally {
        clearTimeout(timer);
    }
}

// Contrast the missing hook, test-only sequencing, and the runtime coordinator.
// A synthetic controller/dependency is not full application or all-writer proof.
describe('combined HTTP and cron completion boundary', () => {
    it.each([
        'connected',
        'disconnected-gap',
        'explicit-test-sequence',
        'runtime-coordinator',
    ] as const)('%s', async (mode) => {
        const httpHold = deferred();
        const httpEntered = deferred();
        const cronHold = deferred();
        const closed = deferred();
        const socketClosed = deferred();
        const operationFinished = deferred();
        const cronDrained = deferred();
        const admissionClosed = deferred();
        const events: string[] = [];
        let dependencyClosed = false;
        let acceptedCalls = 0;
        @Controller('work')
        class FixtureController {
            constructor(private readonly work: MaintenanceWorkService) {}
            @Get()
            async execute() {
                return this.work.runRoot('http.fixture', async () => {
                    acceptedCalls++;
                    httpEntered.resolve();
                    await httpHold.promise;
                    events.push(
                        dependencyClosed
                            ? 'write-after-close'
                            : 'write-before-close',
                    );
                    operationFinished.resolve();
                    return { dependencyAvailable: !dependencyClosed };
                });
            }
        }
        @Injectable()
        class FixtureCron {
            @Cron('0 0 1 1 *', { name: 'combined', waitForCompletion: true })
            async tick() {
                await cronHold.promise;
                events.push('cron-complete');
            }
        }
        const module = await Test.createTestingModule({
            imports: [ScheduleModule.forRoot(), DiscoveryModule],
            controllers: [FixtureController],
            providers: [
                MaintenanceWorkService,
                MaintenanceAdmissionMiddleware,
                CronShutdownService,
                ...(mode === 'runtime-coordinator' ? [WorkerShutdownService] : []),
                FixtureCron,
                {
                    provide: 'dependency',
                    useValue: {
                        onApplicationShutdown() {
                            dependencyClosed = true;
                            events.push('dependency-closed');
                            closed.resolve();
                        },
                    },
                },
            ],
        }).compile();
        const app = module.createNestApplication();
        const cronShutdown = module.get(CronShutdownService);
        const originalDrain = cronShutdown.onModuleDestroy.bind(cronShutdown);
        const drainSpy = jest
            .spyOn(cronShutdown, 'onModuleDestroy')
            .mockImplementation(async () => {
                await originalDrain();
                cronDrained.resolve();
            });
        const admission = module.get(MaintenanceAdmissionMiddleware);
        app.use(admission.use.bind(admission));
        app.use((req: Request, res: Response, next: NextFunction) => {
            if (req.headers['x-fixture-accepted'] === '1')
                res.once('close', socketClosed.resolve);
            next();
        });
        let closing: Promise<void> | undefined;
        let client: ClientRequest | undefined;
        let tick: Promise<void> | undefined;
        const work = module.get(MaintenanceWorkService);
        const originalClose = work.closeAdmission.bind(work);
        const closeSpy = jest.spyOn(work, 'closeAdmission').mockImplementation(() => {
            originalClose();
            admissionClosed.resolve();
        });
        try {
            await app.listen(0, '127.0.0.1');
            const job = module.get(SchedulerRegistry).getCronJob('combined');
            tick = job.fireOnTick();
            const { port } = app.getHttpServer().address() as AddressInfo;
            client = httpRequest(
                {
                    hostname: '127.0.0.1',
                    port,
                    path: '/work',
                    headers: { 'x-fixture-accepted': '1' },
                },
                (res) => res.resume(),
            );
            client.on('error', () => undefined); // Intentional destroy can cause ECONNRESET; phases are bounded.
            client.end();
            await bounded(httpEntered.promise);
            if (mode !== 'runtime-coordinator') {
                work.closeAdmission();
                await request(app.getHttpServer())
                    .get('/work')
                    .timeout({ response: 1000, deadline: 1500 })
                    .expect(503);
                expect(acceptedCalls).toBe(1);
                expect(await work.waitForIdle(0)).toEqual({
                    drained: false,
                    activeCount: 1,
                });
            }

            if (mode !== 'connected') {
                client.destroy();
                await bounded(socketClosed.promise);
            }
            if (mode !== 'explicit-test-sequence') {
                closing = app.close();
                await new Promise<void>((resolve) => setImmediate(resolve));
                expect(job.running).toBe(false);
                expect(dependencyClosed).toBe(false);
                cronHold.resolve();
                await tick;
                await bounded(cronDrained.promise);
                if (mode === 'runtime-coordinator') {
                    await bounded(admissionClosed.promise);
                    await request(app.getHttpServer())
                        .get('/work')
                        .timeout({ response: 1000, deadline: 1500 })
                        .expect(503);
                    expect(acceptedCalls).toBe(1);
                }
                if (mode === 'disconnected-gap') await bounded(closed.promise);
                else {
                    await new Promise<void>((resolve) => setImmediate(resolve));
                    expect(dependencyClosed).toBe(false);
                }
                // Only the disconnected path bypasses HTTP transport's natural wait.
                expect(await work.waitForIdle(0)).toEqual({
                    drained: false,
                    activeCount: 1,
                });
                httpHold.resolve();
                await bounded(operationFinished.promise);
            } else {
                // Explicit orchestration ONLY in this test; not installed as a product hook.
                const cronDrain = module
                    .get(CronShutdownService)
                    .onModuleDestroy();
                cronHold.resolve();
                await cronDrain;
                expect(await work.waitForIdle(0)).toEqual({
                    drained: false,
                    activeCount: 1,
                });
                expect(dependencyClosed).toBe(false);
                httpHold.resolve();
                await bounded(operationFinished.promise);
                expect(await work.waitForIdle(1000)).toEqual({
                    drained: true,
                    activeCount: 0,
                });
                closing = app.close();
            }
            await closing;
            expect(events.indexOf('cron-complete')).toBeLessThan(
                events.indexOf('dependency-closed'),
            );
            expect(events).toContain(
                mode === 'disconnected-gap'
                    ? 'write-after-close'
                    : 'write-before-close',
            );
        } finally {
            httpHold.resolve();
            cronHold.resolve();
            client?.destroy();
            await Promise.allSettled([tick]);
            try {
                if (closing) await closing;
                else await app.close();
            } finally {
                drainSpy.mockRestore();
                closeSpy.mockRestore();
            }
        }
    });
});

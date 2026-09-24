import { EventEmitter } from 'node:events';
import { Global, Logger, Module } from '@nestjs/common';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { Worker } from 'bullmq';
import { CrmProcessor } from './crm.processor';
import { CrmService } from './crm.service';
import { CrmDeltaSyncService } from './services/crm-delta-sync.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

const disconnect = jest.fn();
jest.mock('@aluplan/database', () => ({
    SyncStatus: { ERROR: 'ERROR' },
    PrismaClient: class {
        async $connect() {}
        async $disconnect() {
            disconnect();
        }
        $extends() {
            return {};
        }
    },
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));
jest.mock('pg', () => ({ Pool: class {} }));
jest.mock('./crm.service', () => ({ CrmService: class {} }));
jest.mock('./services/crm-delta-sync.service', () => ({
    CrmDeltaSyncService: class {},
}));
jest.mock('../metrics/metrics.service', () => ({ MetricsService: class {} }));
jest.mock('../metrics/metrics.module', () => {
    const { MetricsService } = require('../metrics/metrics.service');
    class MetricsModule {}
    Global()(MetricsModule);
    Module({
        providers: [{ provide: MetricsService, useValue: {} }],
        exports: [MetricsService],
    })(MetricsModule);
    return { MetricsModule };
});

@Module({
    imports: [BullModule.registerQueue({ name: 'crm-sync' }), PrismaModule],
    providers: [
        CrmProcessor,
        { provide: CrmService, useValue: {} },
        { provide: CrmDeltaSyncService, useValue: {} },
    ],
})
class CrmFixtureModule {}

describe('CRM failure write before database shutdown', () => {
    it.each(['success', 'failure'] as const)(
        'joins a failure emitted during worker close through %s',
        async (outcome) => {
            let release!: () => void;
            let fail!: (error: Error) => void;
            let entered!: () => void;
            const held = new Promise<void>((resolve, reject) => {
                release = resolve;
                fail = reject;
            });
            const started = new Promise<void>((resolve) => {
                entered = resolve;
            });
            const update = jest
                .fn(() => {
                    entered();
                    return held;
                })
                .mockImplementationOnce(() =>
                    Promise.reject(new Error('First audit failed')),
                );
            const events: string[] = [];
            class FixtureWorker extends EventEmitter {
                private closing?: Promise<void>;
                close(force?: boolean) {
                    expect(force).not.toBe(true);
                    return (this.closing ??= Promise.resolve().then(() => {
                        events.push('worker-stopped');
                        this.emit(
                            'failed',
                            {
                                id: 'first-job',
                                data: { logId: 'first-log' },
                                attemptsMade: 3,
                                opts: { attempts: 3 },
                            },
                            new Error('First failure'),
                        );
                        this.emit(
                            'failed',
                            {
                                id: 'synthetic-job',
                                data: { logId: 'synthetic-log' },
                                attemptsMade: 3,
                                opts: { attempts: 3 },
                            },
                            new Error('Synthetic failure'),
                        );
                    }));
                }
            }
            const log = jest
                .spyOn(Logger.prototype, 'error')
                .mockImplementation(() => undefined);
            const info = jest
                .spyOn(Logger.prototype, 'log')
                .mockImplementation(() => undefined);
            disconnect
                .mockReset()
                .mockImplementation(() => events.push('disconnect'));
            BullModule.workerClass = FixtureWorker as unknown as typeof Worker;
            let module: TestingModule | undefined;
            let closing: Promise<void> | undefined;
            let timeout: ReturnType<typeof setTimeout> | undefined;
            try {
                module = await Test.createTestingModule({
                    imports: [
                        BullModule.forRootAsync({
                            useFactory: () => ({ connection: {} }),
                        }),
                        PrismaModule,
                        CrmFixtureModule,
                    ],
                })
                    .overrideProvider(getQueueToken('crm-sync'))
                    .useValue({ opts: { connection: {} } })
                    .compile();
                // Real Prisma lifecycle/proxy, but only the selected database boundary is synthetic.
                Object.defineProperty(module.get(PrismaService), 'crmSyncLog', {
                    value: { update },
                    configurable: true,
                });
                await module.init();
                closing = module.close();
                await Promise.race([
                    started,
                    new Promise<never>((_, reject) => {
                        timeout = setTimeout(
                            () =>
                                reject(
                                    new Error('Failure listener not reached'),
                                ),
                            1000,
                        );
                    }),
                ]);
                await new Promise<void>((resolve) => setImmediate(resolve));
                expect(events).toEqual(['worker-stopped']);
                expect(disconnect).not.toHaveBeenCalled();
                expect(update).toHaveBeenCalledTimes(2);
                if (outcome === 'failure')
                    fail(new Error('Synthetic DB failure'));
                else release();
                await closing;
                expect(events).toEqual(['worker-stopped', 'disconnect']);
            } finally {
                if (timeout) clearTimeout(timeout);
                release();
                try {
                    if (closing) await closing;
                    else if (module) await module.close();
                } finally {
                    BullModule.workerClass = Worker;
                    log.mockRestore();
                    info.mockRestore();
                }
            }
        },
    );

    it('does not hide worker-close errors', async () => {
        const processor = new CrmProcessor(
            {} as never,
            {} as never,
            {} as never,
        );
        const error = new Error('Synthetic worker close failure');
        Object.defineProperty(processor, 'worker', {
            value: { close: jest.fn().mockRejectedValue(error) },
        });
        await expect(processor.onModuleDestroy()).rejects.toBe(error);
    });

    it('fails explicitly if worker registration never completed', async () => {
        const processor = new CrmProcessor(
            {} as never,
            {} as never,
            {} as never,
        );
        await expect(processor.onModuleDestroy()).rejects.toThrow(
            'not yet been initialized',
        );
    });
});

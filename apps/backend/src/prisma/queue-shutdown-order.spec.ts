import { Module } from '@nestjs/common';
import { BullModule, getQueueToken, Processor, WorkerHost } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { Worker } from 'bullmq';
import { PrismaModule } from './prisma.module';
import { PrismaService } from './prisma.service';

const disconnect = jest.fn();
jest.mock('@aluplan/database', () => ({
    PrismaClient: class {
        async $connect() { }
        async $disconnect() { disconnect(); }
        $extends() { return {}; }
    },
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));
jest.mock('pg', () => ({ Pool: class {} }));
jest.mock('../metrics/metrics.service', () => ({ MetricsService: class {} }));
jest.mock('../metrics/metrics.module', () => {
    const { Global, Module } = require('@nestjs/common');
    const { MetricsService } = require('../metrics/metrics.service');
    class MetricsModule { }
    Global()(MetricsModule);
    Module({
        providers: [{ provide: MetricsService, useValue: { setDbPoolConnections: jest.fn() } }],
        exports: [MetricsService],
    })(MetricsModule);
    return { MetricsModule };
});

@Processor('shutdown-order-fixture')
class FixtureProcessor extends WorkerHost {
    constructor(readonly prisma: PrismaService) { super(); }
    async process() { }
}

@Module({
    imports: [BullModule.registerQueue({ name: 'shutdown-order-fixture' }), PrismaModule],
    providers: [FixtureProcessor],
})
class QueueFeatureModule { }

// AppModule registers Bull root config, then the global PrismaModule, then feature
// modules that register queues. Both Prisma and Bull's explorer module are global;
// Nest's actual ordering, rather than sharing a phase alone, determines safety.
// Real Nest/Bull discovery + Prisma proxy; queue/worker/drivers are synthetic.
// This does not prove full-AppModule ordering, Redis drain, or job persistence.
describe('queue shutdown ordering in the candidate module topology', () => {
    it('awaits BullExplorer worker close before disconnecting the global Prisma service', async () => {
        const events: string[] = [];
        let release!: () => void;
        const outstanding = new Promise<void>((resolve) => { release = resolve; });
        let started!: () => void;
        const closeStarted = new Promise<void>((resolve) => { started = resolve; });
        const close = jest.fn(async () => {
            events.push('worker-close-start');
            started();
            await outstanding;
            events.push('worker-close-end');
        });
        class HeldWorker {
            close = close;
        }
        disconnect.mockReset().mockImplementation(() => { events.push('disconnect'); });
        BullModule.workerClass = HeldWorker as unknown as typeof Worker;
        let module: TestingModule | undefined;
        let closing: Promise<void> | undefined;
        let timeout: NodeJS.Timeout | undefined;
        try {
            module = await Test.createTestingModule({ imports: [
                BullModule.forRootAsync({ useFactory: () => ({ connection: {} }) }),
                PrismaModule,
                QueueFeatureModule,
            ] })
                .overrideProvider(getQueueToken('shutdown-order-fixture'))
                .useValue({ opts: { connection: {} } })
                .compile();
            await module.init();
            expect(module.get(FixtureProcessor).prisma).toBe(module.get(PrismaService));
            closing = module.close();
            await Promise.race([
                closeStarted,
                new Promise<never>((_, reject) => {
                    timeout = setTimeout(() => reject(new Error('Bull worker close was not reached')), 1000);
                }),
            ]);
            expect(events).toEqual(['worker-close-start']);
            expect(disconnect).not.toHaveBeenCalled();
            release();
            await closing;
            expect(events).toEqual(['worker-close-start', 'worker-close-end', 'disconnect']);
            expect(close).toHaveBeenCalledTimes(1);
            expect(disconnect).toHaveBeenCalledTimes(1);
        } finally {
            if (timeout) clearTimeout(timeout);
            release();
            try {
                if (closing) await closing;
                else if (module) await module.close();
            } finally {
                BullModule.workerClass = Worker;
            }
        }
    });
});

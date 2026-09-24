import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule, getQueueToken, Processor, WorkerHost } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { Worker } from 'bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from './redis.module';
import { RedisService } from './redis.service';

let events: string[] = [];
jest.mock('@aluplan/database', () => ({
    PrismaClient: class {
        async $connect() { }
        async $disconnect() { events.push('prisma-disconnect'); }
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
    Module({ providers: [MetricsService], exports: [MetricsService] })(MetricsModule);
    return { MetricsModule };
});
jest.mock('ioredis', () => ({
    __esModule: true,
    default: class {
        on() { return this; }
        async quit() { events.push('redis-quit'); }
    },
}));
jest.mock('generic-pool', () => ({ createPool: () => ({
    on() { },
    async drain() { events.push('pool-drain'); },
    async clear() { events.push('pool-clear'); },
}) }));

@Global()
@Module({
    providers: [{ provide: ConfigService, useValue: { get: () => 'redis://synthetic.invalid' } }],
    exports: [ConfigService],
})
class ConfigFixtureModule { }

@Processor('redis-shutdown-fixture')
class FixtureProcessor extends WorkerHost {
    constructor(readonly redis: RedisService) { super(); }
    async process() { }
}

@Module({
    imports: [BullModule.registerQueue({ name: 'redis-shutdown-fixture' }), PrismaModule],
    providers: [FixtureProcessor],
})
class QueueFeatureModule { }

// Reduced AppModule relative order: Bull root, Prisma, queue features, Redis.
// Real global modules/discovery/hooks; all network drivers and worker close mocked.
// The second case is a test-only phase-move experiment, not a product fix.
describe('application Redis shutdown relative to Bull workers', () => {
    it.each(['current destroy phase', 'hypothetical final phase'] as const)(
        'initiates Redis quit before worker drain with %s', async (variant) => {
            events = [];
            let release!: () => void;
            const held = new Promise<void>((resolve) => { release = resolve; });
            let started!: () => void;
            const workerStarted = new Promise<void>((resolve) => { started = resolve; });
            class HeldWorker {
                async close() {
                    events.push('worker-close-start');
                    started();
                    await held;
                    events.push('worker-close-end');
                }
            }
            BullModule.workerClass = HeldWorker as unknown as typeof Worker;
            let module: TestingModule | undefined;
            let closing: Promise<void> | undefined;
            let timeout: NodeJS.Timeout | undefined;
            try {
                module = await Test.createTestingModule({ imports: [
                    ConfigFixtureModule,
                    BullModule.forRootAsync({ useFactory: () => ({ connection: {} }) }),
                    PrismaModule,
                    QueueFeatureModule,
                    RedisModule,
                ] })
                    .overrideProvider(getQueueToken('redis-shutdown-fixture'))
                    .useValue({ opts: { connection: {} } })
                    .compile();
                await module.init();
                const redis = module.get(RedisService);
                expect(module.get(FixtureProcessor).redis).toBe(redis);
                if (variant === 'hypothetical final phase') {
                    // Move the actual cleanup body on this isolated instance only.
                    Object.defineProperties(redis, {
                        onApplicationShutdown: { value: redis.onModuleDestroy.bind(redis) },
                        onModuleDestroy: { value: undefined },
                    });
                }
                closing = module.close();
                await Promise.race([
                    workerStarted,
                    new Promise<never>((_, reject) => {
                        timeout = setTimeout(() => reject(new Error('Worker close not reached')), 1000);
                    }),
                ]);
                expect(events).toEqual(['pool-drain', 'pool-clear', 'redis-quit', 'worker-close-start']);
                release();
                await closing;
                expect(events).toEqual([
                    'pool-drain', 'pool-clear', 'redis-quit',
                    'worker-close-start', 'worker-close-end', 'prisma-disconnect',
                ]);
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
        },
    );
});

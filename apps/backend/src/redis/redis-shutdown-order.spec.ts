import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule, getQueueToken, Processor, WorkerHost } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { Worker } from 'bullmq';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from './redis.module';
import { RedisService } from './redis.service';

let events: string[] = [];
let quitResult: () => Promise<void>;
let disconnected = false;
let redisUrl: string | undefined;
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
        constructor(url: string) { redisUrl = url; }
        on() { return this; }
        async get() {
            if (disconnected) throw new Error('Redis already closed');
            events.push('redis-get');
            return 'available';
        }
        async quit() {
            events.push('redis-quit');
            disconnected = true;
            await quitResult();
            events.push('redis-quit-end');
        }
        disconnect() { disconnected = true; events.push('redis-disconnect'); }
    },
}));
jest.mock('generic-pool', () => ({ createPool: () => ({
    on() { },
    async drain() { events.push('pool-drain'); },
    async clear() { events.push('pool-clear'); },
}) }));

@Global()
@Module({
    providers: [{
        provide: ConfigService,
        useFactory: async () => ({ get: () => 'redis://synthetic.invalid' }),
    }],
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

function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((done) => { resolve = done; });
    return { promise, resolve };
}

async function waitForPhase(phase: Promise<void>, closing: Promise<void>, name: string) {
    let timeout: NodeJS.Timeout | undefined;
    try {
        await Promise.race([
            phase,
            closing,
            new Promise<never>((_, reject) => {
                timeout = setTimeout(() => reject(new Error(`Shutdown phase not reached: ${name}`)), 1000);
            }),
        ]);
    } finally {
        if (timeout) clearTimeout(timeout);
    }
}

// Real global modules/discovery/hooks; network drivers and worker close are mocked.
// Guard root first-discovery order without importing/booting the full application.
describe('application Redis shutdown relative to Bull workers', () => {
    it('keeps Redis first in AppModule imports to preserve reverse global shutdown order', () => {
        const source = readFileSync(join(__dirname, '../app.module.ts'), 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
        expect(source).toMatch(/@Module\(\{\s*imports:\s*\[\s*RedisModule\s*,/);
    });

    it.each(['resolve', 'reject'] as const)(
        'waits worker Redis use, pool cleanup and held QUIT (%s)', async (outcome) => {
            events = [];
            disconnected = false;
            redisUrl = undefined;
            const workerHeld = deferred();
            const workerStarted = deferred();
            const quitHeld = deferred();
            const quitStarted = deferred();
            quitResult = async () => {
                quitStarted.resolve();
                await quitHeld.promise;
                if (outcome === 'reject') throw new Error('Synthetic QUIT failure');
            };
            let redis!: RedisService;
            let lateRead: string | null | undefined;
            class HeldWorker {
                async close() {
                    events.push('worker-close-start');
                    workerStarted.resolve();
                    await workerHeld.promise;
                    lateRead = await redis.get('synthetic-late-worker-read').catch(() => null);
                    events.push('worker-close-end');
                }
            }
            BullModule.workerClass = HeldWorker as unknown as typeof Worker;
            let module: TestingModule | undefined;
            let closing: Promise<void> | undefined;
            try {
                module = await Test.createTestingModule({ imports: [
                    RedisModule,
                    ConfigFixtureModule,
                    BullModule.forRootAsync({ useFactory: () => ({ connection: {} }) }),
                    PrismaModule,
                    QueueFeatureModule,
                ] })
                    .overrideProvider(getQueueToken('redis-shutdown-fixture'))
                    .useValue({ opts: { connection: {} } })
                    .compile();
                await module.init();
                expect(redisUrl).toBe('redis://synthetic.invalid');
                redis = module.get(RedisService);
                expect(module.get(FixtureProcessor).redis).toBe(redis);
                closing = module.close();
                await waitForPhase(workerStarted.promise, closing, 'worker close');
                expect(events).toEqual(['worker-close-start']);
                workerHeld.resolve();
                await waitForPhase(quitStarted.promise, closing, 'Redis QUIT');
                expect(lateRead).toBe('available');
                expect(events).toEqual([
                    'worker-close-start', 'redis-get', 'worker-close-end',
                    'prisma-disconnect', 'pool-drain', 'pool-clear', 'redis-quit',
                ]);
                // An event-loop barrier lets an incorrectly detached QUIT settle close().
                const closeState = await Promise.race([
                    closing.then(() => 'closed'),
                    new Promise<string>((resolve) => setImmediate(() => resolve('pending'))),
                ]);
                expect(closeState).toBe('pending');
                quitHeld.resolve();
                await closing;
                expect(events).toEqual([
                    'worker-close-start', 'redis-get', 'worker-close-end', 'prisma-disconnect',
                    'pool-drain', 'pool-clear', 'redis-quit',
                    outcome === 'reject' ? 'redis-disconnect' : 'redis-quit-end',
                ]);
            } finally {
                workerHeld.resolve();
                quitHeld.resolve();
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

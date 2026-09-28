import { WorkerHost } from '@nestjs/bullmq';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import type { Worker } from 'bullmq';
import { WorkerShutdownService } from './worker-shutdown.service';
import { MaintenanceWorkService } from './maintenance-work.service';

function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((done) => { resolve = done; });
    return { promise, resolve };
}

class FixtureHost extends WorkerHost {
    constructor(private readonly fixture: Worker) { super(); }
    override get worker(): Worker { return this.fixture; }
    async process() {}
}

function wrapper(close: () => Promise<void>, isStatic = true) {
    return {
        instance: new FixtureHost({ close } as unknown as Worker),
        metatype: FixtureHost,
        isDependencyTreeStatic: () => isStatic,
    };
}

function service(providers: unknown[]) {
    return new WorkerShutdownService(
        { getProviders: () => providers } as unknown as DiscoveryService,
        new MaintenanceWorkService(),
    );
}

describe('worker shutdown before final dependency teardown', () => {
    it('deduplicates workers and starts all closes without forcing active jobs', async () => {
        const held = deferred();
        const first = jest.fn(() => held.promise);
        const second = jest.fn(async () => undefined);
        const provider = wrapper(first);
        const shutdown = service([provider, provider, wrapper(second), { instance: {} }]);
        const closing = shutdown.beforeApplicationShutdown();
        try {
            await Promise.resolve();
            expect(first).toHaveBeenCalledTimes(1);
            expect(first).toHaveBeenCalledWith();
            expect(second).toHaveBeenCalledTimes(1);
        } finally {
            held.resolve();
            await closing;
        }
    });

    it.each(['reject', 'throw'] as const)('joins other workers even when one close will %s', async (mode) => {
        const held = deferred();
        const second = jest.fn(() => held.promise);
        const bad = () => {
            if (mode === 'throw') throw new Error('synthetic sensitive failure');
            return Promise.reject(new Error('synthetic sensitive failure'));
        };
        let settled = false;
        const outcome = service([wrapper(bad), wrapper(second)])
            .beforeApplicationShutdown().then(() => 'unexpected', (error: Error) => {
                settled = true;
                return error.message;
            });
        try {
            await new Promise<void>((resolve) => setImmediate(resolve));
            expect(second).toHaveBeenCalledTimes(1);
            expect(settled).toBe(false);
        } finally {
            held.resolve();
        }
        expect(await outcome).toBe('Worker shutdown could not be verified');
    });

    it('fails explicitly for an uninitialized host while closing other workers', async () => {
        class Uninitialized extends WorkerHost { async process() {} }
        const close = jest.fn(async () => undefined);
        await expect(service([
            { instance: new Uninitialized(), metatype: Uninitialized, isDependencyTreeStatic: () => true },
            wrapper(close),
        ]).beforeApplicationShutdown()).rejects.toThrow('Worker shutdown could not be verified');
        expect(close).toHaveBeenCalledTimes(1);
    });

    it('rejects non-static worker scope and still closes the initialized worker', async () => {
        const close = jest.fn(async () => undefined);
        await expect(service([wrapper(close, false)]).beforeApplicationShutdown())
            .rejects.toThrow('Worker shutdown could not be verified');
        expect(close).toHaveBeenCalledTimes(1);
    });

    it('uses real Nest discovery and waits for late accepted work before final hooks', async () => {
        const held = deferred();
        const entered = deferred();
        const work = new MaintenanceWorkService();
        const events: string[] = [];
        const close = jest.fn(async () => {
            entered.resolve();
            await held.promise;
            await work.runRoot('accepted.worker', async () => { events.push('write'); });
        });
        const module = await Test.createTestingModule({
            imports: [DiscoveryModule],
            providers: [
                WorkerShutdownService,
                { provide: MaintenanceWorkService, useValue: work },
                { provide: FixtureHost, useValue: new FixtureHost({ close } as unknown as Worker) },
                { provide: 'dependency', useValue: { onApplicationShutdown: () => events.push('disconnect') } },
            ],
        }).compile();
        await module.init();
        const closing = module.close();
        try {
            await entered.promise;
            expect(events).toEqual([]);
            work.assertAdmissionOpen();
        } finally {
            held.resolve();
            await closing;
        }
        expect(events).toEqual(['write', 'disconnect']);
    });
});

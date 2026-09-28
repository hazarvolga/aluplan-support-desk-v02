import { WorkerHost } from '@nestjs/bullmq';
import { DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import type { Worker } from 'bullmq';
import { MaintenanceWorkService, WorkLease } from './maintenance-work.service';
import { WorkerShutdownService } from './worker-shutdown.service';

function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((done) => { resolve = done; });
    return { promise, resolve };
}

async function bounded(promise: Promise<unknown>) {
    let timer!: ReturnType<typeof setTimeout>;
    try {
        await Promise.race([
            promise,
            new Promise<never>((_, reject) => {
                timer = setTimeout(() => reject(new Error('Drain fixture phase timed out')), 1500);
            }),
        ]);
    } finally {
        clearTimeout(timer);
    }
}

class FixtureHost extends WorkerHost {
    constructor(private readonly fixture: Worker) { super(); }
    override get worker(): Worker { return this.fixture; }
    async process() {}
}

async function fixture(close?: () => Promise<void>) {
    const events: string[] = [];
    const module = await Test.createTestingModule({
        imports: [DiscoveryModule],
        providers: [
            MaintenanceWorkService,
            WorkerShutdownService,
            { provide: 'dependency', useValue: {
                onApplicationShutdown() { events.push('dependency-closed'); },
            } },
            ...(close ? [{ provide: FixtureHost,
                useValue: new FixtureHost({ close } as unknown as Worker) }] : []),
        ],
    }).compile();
    await module.init();
    const work = module.get(MaintenanceWorkService);
    const fenced = deferred();
    const originalClose = work.closeAdmission.bind(work);
    jest.spyOn(work, 'closeAdmission').mockImplementation(() => {
        originalClose();
        fenced.resolve();
    });
    return { module, work, events, fenced };
}

// Real Nest lifecycle/discovery; synthetic workers and dependency, no application IO.
describe('worker completion followed by tracked work drain', () => {
    it('does not treat an incomplete drain result as permission to close dependencies', async () => {
        const f = await fixture();
        const secondWait = deferred();
        const idleHeld = deferred();
        const wait = jest.spyOn(f.work, 'waitForIdle')
            .mockResolvedValueOnce({ drained: false, activeCount: 1 })
            .mockImplementation(async () => {
                secondWait.resolve();
                await idleHeld.promise;
                return { drained: true, activeCount: 0 };
            });
        let closing: Promise<void> | undefined;
        try {
            closing = f.module.close();
            await bounded(secondWait.promise);
            expect(wait).toHaveBeenCalledTimes(2);
            expect(f.events).toEqual([]);
            idleHeld.resolve();
            await bounded(closing);
            expect(f.events).toEqual(['dependency-closed']);
        } finally {
            idleHeld.resolve();
            await bounded(closing ?? f.module.close());
        }
    });

    it('fences new roots and joins an active parent plus a child registered after the fence', async () => {
        const f = await fixture();
        const parentHeld = deferred();
        const parentEntered = deferred();
        const childHeld = deferred();
        const childEntered = deferred();
        let parent!: WorkLease;
        let child: Promise<void> | undefined;
        const root = f.work.runRoot('fixture.parent', async () => {
            parent = f.work.currentLease()!;
            parentEntered.resolve();
            await parentHeld.promise;
            f.events.push('parent-complete');
        });
        let closing: Promise<void> | undefined;
        try {
            await bounded(parentEntered.promise);
            closing = f.module.close();
            await bounded(f.fenced.promise);
            expect(() => f.work.assertAdmissionOpen()).toThrow();
            await expect(f.work.runRoot('fixture.rejected', async () => undefined)).rejects.toThrow();
            expect(f.events).toEqual([]);
            child = f.work.runChild(parent, 'fixture.child', async () => {
                childEntered.resolve();
                await childHeld.promise;
                f.events.push('child-complete');
            });
            await bounded(childEntered.promise);
            parentHeld.resolve();
            await root;
            await new Promise<void>((resolve) => setImmediate(resolve));
            expect(f.events).toEqual(['parent-complete']);
            childHeld.resolve();
            await child;
            await bounded(closing);
            expect(f.events).toEqual(['parent-complete', 'child-complete', 'dependency-closed']);
        } finally {
            parentHeld.resolve();
            childHeld.resolve();
            await Promise.allSettled([root, child]);
            await bounded(closing ?? f.module.close());
        }
    });

    it('keeps admission open until an accepted worker enters and completes late tracked work', async () => {
        const workerHeld = deferred();
        const workerEntered = deferred();
        const operationHeld = deferred();
        const operationEntered = deferred();
        let work!: MaintenanceWorkService;
        const close = jest.fn(async () => {
            workerEntered.resolve();
            await workerHeld.promise;
            await work.runRoot('fixture.worker', async () => {
                operationEntered.resolve();
                await operationHeld.promise;
            });
        });
        const f = await fixture(close);
        work = f.work;
        let closing: Promise<void> | undefined;
        try {
            closing = f.module.close();
            await bounded(workerEntered.promise);
            expect(() => work.assertAdmissionOpen()).not.toThrow();
            expect(work.closeAdmission).not.toHaveBeenCalled();
            workerHeld.resolve();
            await bounded(operationEntered.promise);
            expect(() => work.assertAdmissionOpen()).not.toThrow();
            expect(f.events).toEqual([]);
            operationHeld.resolve();
            await bounded(closing);
            expect(close).toHaveBeenCalledWith();
            expect(work.closeAdmission).toHaveBeenCalledTimes(1);
            expect(() => work.assertAdmissionOpen()).toThrow();
            expect(f.events).toEqual(['dependency-closed']);
        } finally {
            workerHeld.resolve();
            operationHeld.resolve();
            await bounded(closing ?? f.module.close());
        }
    });
});

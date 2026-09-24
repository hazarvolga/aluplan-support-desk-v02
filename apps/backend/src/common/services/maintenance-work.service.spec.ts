import { EventEmitter2 } from '@nestjs/event-emitter';
import { MaintenanceWorkService, WorkLease } from './maintenance-work.service';

function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((done) => {
        resolve = done;
    });
    return { promise, resolve };
}

describe('MaintenanceWorkService', () => {
    it('reserves root work synchronously before a fence and runs it in a microtask', async () => {
        const service = new MaintenanceWorkService();
        const hold = deferred();
        const operation = jest.fn(() => hold.promise);
        const work = service.runRoot('customer-secret', operation);
        expect(operation).not.toHaveBeenCalled();
        service.closeAdmission();
        expect(await service.waitForIdle(0)).toEqual({
            drained: false,
            activeCount: 1,
        });
        hold.resolve();
        await work;
        expect(await service.waitForIdle(0)).toEqual({
            drained: true,
            activeCount: 0,
        });
    });

    it('propagates a lease across awaits and restores context outside the operation', async () => {
        const service = new MaintenanceWorkService();
        expect(service.currentLease()).toBeUndefined();
        const value = await service.runRoot('root', async () => {
            const lease = service.currentLease();
            expect(lease).toBeDefined();
            await Promise.resolve();
            expect(service.currentLease()).toBe(lease);
            return 42;
        });
        expect(value).toBe(42);
        expect(service.currentLease()).toBeUndefined();
        service.closeAdmission();
        expect(await service.waitForIdle(0)).toEqual({
            drained: true,
            activeCount: 0,
        });
    });

    it('admits a child of active work after the fence and tracks it after its parent settles', async () => {
        const service = new MaintenanceWorkService();
        const hold = deferred();
        const operation = jest.fn(() => hold.promise);
        let child!: Promise<void>;
        await service.runRoot('parent', () => {
            const lease = service.currentLease()!;
            service.closeAdmission();
            child = service.runChild(lease, 'child', operation);
            expect(operation).not.toHaveBeenCalled();
        });
        expect(await service.waitForIdle(0)).toEqual({
            drained: false,
            activeCount: 1,
        });
        hold.resolve();
        await child;
        expect(await service.waitForIdle(10)).toEqual({
            drained: true,
            activeCount: 0,
        });
    });

    it('rejects new roots after repeated fences without invoking their callback', async () => {
        const service = new MaintenanceWorkService();
        service.closeAdmission();
        service.closeAdmission();
        const operation = jest.fn();
        await expect(service.runRoot('late', operation)).rejects.toThrow();
        expect(operation).not.toHaveBeenCalled();
        expect(await service.waitForIdle(0)).toEqual({
            drained: true,
            activeCount: 0,
        });
    });

    it('rejects forged and cross-instance leases without running child work', async () => {
        const service = new MaintenanceWorkService();
        const other = new MaintenanceWorkService();
        const operation = jest.fn();
        await expect(
            service.runChild({} as WorkLease, 'forged', operation),
        ).rejects.toThrow();
        await service.runRoot('parent', async () => {
            await expect(
                other.runChild(service.currentLease()!, 'foreign', operation),
            ).rejects.toThrow();
            await expect(
                service.runChild(
                    { ...service.currentLease()! },
                    'copied',
                    operation,
                ),
            ).rejects.toThrow();
        });
        expect(operation).not.toHaveBeenCalled();
        service.closeAdmission();
        other.closeAdmission();
        expect(await service.waitForIdle(0)).toEqual({
            drained: true,
            activeCount: 0,
        });
        expect(await other.waitForIdle(0)).toEqual({
            drained: true,
            activeCount: 0,
        });
    });

    it('isolates leases between concurrent root contexts', async () => {
        const service = new MaintenanceWorkService();
        const hold = deferred();
        const leases: WorkLease[] = [];
        const roots = ['one', 'two'].map((label) =>
            service.runRoot(label, async () => {
                const lease = service.currentLease()!;
                leases.push(lease);
                await hold.promise;
                expect(service.currentLease()).toBe(lease);
            }),
        );
        service.closeAdmission();
        await Promise.resolve();
        expect(leases).toHaveLength(2);
        expect(leases[0]).not.toBe(leases[1]);
        expect(service.currentLease()).toBeUndefined();
        hold.resolve();
        await Promise.all(roots);
        expect(await service.waitForIdle(0)).toEqual({
            drained: true,
            activeCount: 0,
        });
    });

    it('rejects an expired lease even from an async context inherited while it was active', async () => {
        const service = new MaintenanceWorkService();
        const resume = deferred();
        const operation = jest.fn();
        let stale!: Promise<void>;
        let lease!: WorkLease;
        await service.runRoot('parent', () => {
            lease = service.currentLease()!;
            stale = resume.promise.then(async () => {
                expect(service.currentLease()).toBeUndefined();
                await expect(
                    service.runChild(lease, 'stale', operation),
                ).rejects.toThrow();
            });
        });
        service.closeAdmission();
        resume.resolve();
        await stale;
        await expect(
            service.runChild(lease, 'expired', operation),
        ).rejects.toThrow();
        expect(operation).not.toHaveBeenCalled();
        expect(await service.waitForIdle(0)).toEqual({
            drained: true,
            activeCount: 0,
        });
    });

    it('reports timeout without cancelling work and subsequently drains', async () => {
        const service = new MaintenanceWorkService();
        const hold = deferred();
        const work = service.runRoot('private-label', () => hold.promise);
        service.closeAdmission();
        expect(await service.waitForIdle(5)).toEqual({
            drained: false,
            activeCount: 1,
        });
        hold.resolve();
        await work;
        expect(await service.waitForIdle(5)).toEqual({
            drained: true,
            activeCount: 0,
        });
    });

    it('requires a fence before waiting', async () => {
        const service = new MaintenanceWorkService();
        await expect(service.waitForIdle(0)).rejects.toThrow();
    });

    it.each([
        -1,
        0.5,
        2147483648,
        NaN,
        Infinity,
        -Infinity,
        '10',
        null,
        undefined,
    ])('rejects malformed timeout %p', async (timeout) => {
        const service = new MaintenanceWorkService();
        service.closeAdmission();
        await expect(service.waitForIdle(timeout as number)).rejects.toThrow();
    });

    it.each([
        '',
        'with spaces',
        'UPPER',
        'ü',
        '😀',
        "';--",
        'a'.repeat(65),
        null,
        undefined,
        42,
    ])(
        'rejects invalid labels %p without invoking operations',
        async (label) => {
            const service = new MaintenanceWorkService();
            const operation = jest.fn();
            await expect(
                service.runRoot(label as string, operation),
            ).rejects.toThrow();
            await service.runRoot('valid', async () => {
                await expect(
                    service.runChild(
                        service.currentLease()!,
                        label as string,
                        operation,
                    ),
                ).rejects.toThrow();
            });
            expect(operation).not.toHaveBeenCalled();
            service.closeAdmission();
            expect(await service.waitForIdle(0)).toEqual({
                drained: true,
                activeCount: 0,
            });
        },
    );

    it('accepts the upper timeout boundary when idle and a maximum-length static label', async () => {
        const service = new MaintenanceWorkService();
        expect(await service.runRoot('a'.repeat(64), () => 'result')).toBe(
            'result',
        );
        service.closeAdmission();
        expect(await service.waitForIdle(2147483647)).toEqual({
            drained: true,
            activeCount: 0,
        });
    });

    it.each([null, undefined, 42, 'callback', {}])(
        'rejects non-callable operations %p without retaining work',
        async (operation) => {
            const service = new MaintenanceWorkService();
            const invalid = operation as unknown as () => void;
            await expect(service.runRoot('root', invalid)).rejects.toThrow();
            await service.runRoot('parent', async () => {
                await expect(
                    service.runChild(service.currentLease()!, 'child', invalid),
                ).rejects.toThrow();
            });
            service.closeAdmission();
            expect(await service.waitForIdle(0)).toEqual({
                drained: true,
                activeCount: 0,
            });
        },
    );

    it.each([false, true])(
        'releases a root after a failure (asynchronous=%p)',
        async (asynchronous) => {
            const service = new MaintenanceWorkService();
            const failure = new Error('operation failed');
            const work = service.runRoot('root', () => {
                if (asynchronous) return Promise.reject(failure);
                throw failure;
            });
            service.closeAdmission();
            await expect(work).rejects.toBe(failure);
            expect(await service.waitForIdle(0)).toEqual({
                drained: true,
                activeCount: 0,
            });
        },
    );

    it('releases a rejected child independently and preserves the parent result', async () => {
        const service = new MaintenanceWorkService();
        const failure = new Error('child failed');
        const result = await service.runRoot('parent', async () => {
            const child = service.runChild(
                service.currentLease()!,
                'child',
                () => {
                    throw failure;
                },
            );
            service.closeAdmission();
            await expect(child).rejects.toBe(failure);
            expect(await service.waitForIdle(0)).toEqual({
                drained: false,
                activeCount: 1,
            });
            return 'parent success';
        });
        expect(result).toBe('parent success');
        expect(await service.waitForIdle(0)).toEqual({
            drained: true,
            activeCount: 0,
        });
    });

    it('resolves multiple waiters when the final root settles', async () => {
        const service = new MaintenanceWorkService();
        const first = deferred();
        const second = deferred();
        const work = [
            service.runRoot('one', () => first.promise),
            service.runRoot('two', () => second.promise),
        ];
        service.closeAdmission();
        const waiters = [service.waitForIdle(1000), service.waitForIdle(1000)];
        first.resolve();
        await work[0];
        expect(await service.waitForIdle(0)).toEqual({
            drained: false,
            activeCount: 1,
        });
        second.resolve();
        await Promise.all(work);
        expect(await Promise.all(waiters)).toEqual([
            { drained: true, activeCount: 0 },
            { drained: true, activeCount: 0 },
        ]);
    });

    it('tracks a synchronous EventEmitter2 listener wrapper that reserves a held child', async () => {
        const service = new MaintenanceWorkService();
        const emitter = new EventEmitter2();
        const hold = deferred();
        let child!: Promise<void>;
        emitter.on('fixture', () => {
            child = service.runChild(
                service.currentLease()!,
                'listener',
                () => hold.promise,
            );
        });
        await service.runRoot('publisher', () => {
            service.closeAdmission();
            expect(emitter.emit('fixture')).toBe(true);
        });
        expect(await service.waitForIdle(0)).toEqual({
            drained: false,
            activeCount: 1,
        });
        hold.resolve();
        await child;
        expect(await service.waitForIdle(0)).toEqual({
            drained: true,
            activeCount: 0,
        });
    });

    it('accounts for ten thousand pending roots and drains them without leaking registrations', async () => {
        const service = new MaintenanceWorkService();
        const hold = deferred();
        const roots = Array.from({ length: 10000 }, () =>
            service.runRoot('batch', () => hold.promise),
        );
        service.closeAdmission();
        expect(await service.waitForIdle(0)).toEqual({
            drained: false,
            activeCount: 10000,
        });
        hold.resolve();
        await Promise.all(roots);
        expect(await service.waitForIdle(0)).toEqual({
            drained: true,
            activeCount: 0,
        });
    });
});

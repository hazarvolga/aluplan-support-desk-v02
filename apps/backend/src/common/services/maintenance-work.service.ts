import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

// Identity, not the token value, authorizes descendants in this process only.
export type WorkLease = Readonly<{ token: symbol }>;
export type WorkDrainResult = Readonly<{
    drained: boolean;
    activeCount: number;
}>;

/**
 * Process-local work accounting; WorkerShutdownService joins registered work.
 * Integrations remain partial: unregistered writers are outside this guarantee.
 * Every caller must return its actual operation promise, not a response lifetime.
 * Drained means settled tracked work, not successful delivery or global quiescence.
 */
@Injectable()
export class MaintenanceWorkService {
    private accepting = true;
    private readonly active = new Set<WorkLease>();
    private readonly context = new AsyncLocalStorage<WorkLease>();
    private readonly idleWaiters = new Set<() => void>();

    async runRoot<T>(
        label: string,
        operation: () => T | Promise<T>,
    ): Promise<T> {
        this.assertAdmissionOpen();
        return this.reserve(label, operation);
    }

    // Admission only: does not reserve or imply completion of downstream work.
    assertAdmissionOpen(): void {
        if (!this.accepting)
            throw new ServiceUnavailableException('Maintenance admission is closed');
    }

    async runChild<T>(
        parent: WorkLease,
        label: string,
        operation: () => T | Promise<T>,
    ): Promise<T> {
        if (!this.active.has(parent))
            throw new Error('Work parent is not active in this process');
        return this.reserve(label, operation);
    }

    currentLease(): WorkLease | undefined {
        const lease = this.context.getStore();
        return lease && this.active.has(lease) ? lease : undefined;
    }

    closeAdmission(): void {
        this.accepting = false;
    }

    async waitForIdle(timeoutMs: number): Promise<WorkDrainResult> {
        if (this.accepting)
            throw new Error('Close admission before waiting for idle');
        if (
            !Number.isInteger(timeoutMs) ||
            timeoutMs < 0 ||
            timeoutMs > 2147483647
        ) {
            throw new Error('Invalid maintenance wait timeout');
        }
        if (this.active.size === 0) return { drained: true, activeCount: 0 };
        return new Promise<WorkDrainResult>((resolve) => {
            const finish = () => {
                clearTimeout(timer);
                this.idleWaiters.delete(finish);
                resolve({
                    drained: this.active.size === 0,
                    activeCount: this.active.size,
                });
            };
            this.idleWaiters.add(finish);
            const timer = setTimeout(finish, timeoutMs);
        });
    }

    private reserve<T>(
        label: string,
        operation: () => T | Promise<T>,
    ): Promise<T> {
        if (
            typeof label !== 'string' ||
            !/^[a-z][a-z0-9:._-]{0,63}$/.test(label)
        ) {
            throw new Error('Invalid work label');
        }
        if (typeof operation !== 'function')
            throw new Error('Work operation must be a function');
        const lease: WorkLease = Object.freeze({ token: Symbol(label) });
        // Reserve before any callback/microtask can be scheduled or admission closed.
        this.active.add(lease);
        return this.context.run(lease, () =>
            Promise.resolve()
                .then(operation)
                .finally(() => {
                    this.active.delete(lease);
                    if (this.active.size === 0) {
                        for (const finish of [...this.idleWaiters]) finish();
                    }
                }),
        );
    }
}

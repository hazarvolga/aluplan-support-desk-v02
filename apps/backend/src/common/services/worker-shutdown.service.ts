import { BeforeApplicationShutdown, Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { WorkerHost } from '@nestjs/bullmq';
import type { Worker } from 'bullmq';
import { MaintenanceWorkService } from './maintenance-work.service';

/** Joins workers, then fences and drains tracked work before dependency teardown. */
@Injectable()
export class WorkerShutdownService implements BeforeApplicationShutdown {
    constructor(
        private readonly discovery: DiscoveryService,
        private readonly work: MaintenanceWorkService,
    ) {}

    async beforeApplicationShutdown(): Promise<void> {
        const workers = new Set<Worker>();
        let invalid = false;
        for (const provider of this.discovery.getProviders()) {
            const instance = provider.instance;
            const isHost = instance instanceof WorkerHost;
            const isHostType = provider.metatype?.prototype instanceof WorkerHost;
            if (!isHost && !isHostType) continue;
            if (!provider.isDependencyTreeStatic()) invalid = true;
            try {
                if (!isHost) throw new Error('Uninitialized worker host');
                workers.add(instance.worker);
            } catch {
                invalid = true;
            }
        }
        // Start every close, including after a synchronous throw; no forced close.
        // Leave shared admission open for accepted jobs entering tracked work late.
        const results = await Promise.allSettled(
            [...workers].map((worker) => Promise.resolve().then(() => worker.close())),
        );
        if (invalid || results.some((result) => result.status === 'rejected')) {
            throw new Error('Worker shutdown could not be verified');
        }
        this.work.closeAdmission();
        // A wait interval expiring never authorizes dependency teardown. Registered
        // descendants of accepted work may still finish after admission closes.
        // This is process-local tracking, not proof that every writer is covered.
        while (!(await this.work.waitForIdle(1000)).drained) {
            // Keep dependencies alive; an external force-kill is not a safe drain.
        }
    }
}

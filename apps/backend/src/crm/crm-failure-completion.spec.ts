import { EventEmitter } from 'node:events';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CrmProcessor } from './crm.processor';
import { MaintenanceWorkService } from '../common/services/maintenance-work.service';

/** Shared accounting alone cannot replace the processor's separate shutdown join. */
describe('CRM failed-event completion boundary', () => {
    it.each(['success', 'failure'] as const)(
        'exposes a pending terminal audit outside work accounting until %s',
        async (outcome) => {
            let release!: () => void;
            let fail!: (error: Error) => void;
            const held = new Promise<void>((resolve, reject) => {
                release = resolve;
                fail = reject;
            });
            const update = jest.fn(() => held);
            const processor = new CrmProcessor(
                {} as never,
                {} as never,
                {
                    crmSyncLog: { update },
                } as never,
            );
            const log = jest
                .spyOn(Logger.prototype, 'error')
                .mockImplementation(() => undefined);
            const info = jest
                .spyOn(Logger.prototype, 'log')
                .mockImplementation(() => undefined);
            const emitter = new EventEmitter();
            const work = new MaintenanceWorkService();
            let handler!: Promise<void>;
            let settled = false;
            emitter.on('failed', (job, error) => {
                handler = processor.onFailed(job, error).finally(() => {
                    settled = true;
                });
                return handler; // Node event dispatch ignores this promise.
            });
            try {
                expect(
                    emitter.emit(
                        'failed',
                        {
                            id: 'synthetic-job',
                            data: { logId: 'synthetic-log' },
                            attemptsMade: 3,
                            opts: { attempts: 3 },
                        } as Job,
                        new Error('Synthetic sync failure'),
                    ),
                ).toBe(true);
                await Promise.resolve();
                expect(update).toHaveBeenCalledTimes(1);
                work.closeAdmission();
                // Explicitly exposes the false-zero risk; this is NOT an acceptance assertion.
                expect(await work.waitForIdle(0)).toEqual({
                    drained: true,
                    activeCount: 0,
                });
                expect(settled).toBe(false);
                if (outcome === 'failure')
                    fail(new Error('Synthetic database failure'));
                else release();
                await handler;
                expect(settled).toBe(true);
            } finally {
                release();
                try { await handler; }
                finally {
                    emitter.removeAllListeners();
                    log.mockRestore();
                    info.mockRestore();
                }
            }
        },
    );

    it.each([
        {
            attemptsMade: 1,
            opts: { attempts: 3 },
            data: { logId: 'synthetic-log' },
        },
        { attemptsMade: 3, opts: { attempts: 3 }, data: {} },
    ])(
        'preserves no-write behavior for intermediate retry or absent log ID %#',
        async (job) => {
            const update = jest.fn();
            const processor = new CrmProcessor(
                {} as never,
                {} as never,
                { crmSyncLog: { update } } as never,
            );
            const log = jest
                .spyOn(Logger.prototype, 'error')
                .mockImplementation(() => undefined);
            try {
                await processor.onFailed(
                    job as Job,
                    new Error('Synthetic failure'),
                );
                expect(update).not.toHaveBeenCalled();
            } finally {
                log.mockRestore();
            }
        },
    );
});

import { Injectable } from '@nestjs/common';
import {
    EventEmitter2,
    EventEmitterModule,
    OnEvent,
} from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceWorkService } from '../common/services/maintenance-work.service';

function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((fulfill) => {
        resolve = fulfill;
    });
    return { promise, resolve };
}

@Injectable()
class SyntheticTicketListeners {
    readonly release = deferred();
    readonly started = deferred();
    readonly finished = deferred();
    hasStarted = false;

    @OnEvent('characterization.detached', { async: true })
    async detached() {
        return this.performHeldWork();
    }

    @OnEvent('characterization.joined', { async: true, promisify: true })
    async joined() {
        return this.performHeldWork();
    }

    private async performHeldWork() {
        this.hasStarted = true;
        this.started.resolve();
        await this.release.promise;
        this.finished.resolve();
    }
}

// These fixtures characterize the installed Nest/EventEmitter2 boundary only.
// They do not certify the application's five ticket.created consumers or their
// internal detached AI/network work as fully tracked.
describe('ticket event completion scheduling characterization', () => {
    let module: TestingModule;
    let listener: SyntheticTicketListeners;
    let emitter: EventEmitter2;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [EventEmitterModule.forRoot()],
            providers: [SyntheticTicketListeners],
        }).compile();
        await module.init();
        listener = module.get(SyntheticTicketListeners);
        emitter = module.get(EventEmitter2);
        expect(emitter.listenerCount('characterization.detached')).toBe(1);
        expect(emitter.listenerCount('characterization.joined')).toBe(1);
    });

    afterEach(async () => {
        listener.release.resolve();
        // Flush scheduled listeners even if an assertion failed before start.
        await new Promise<void>((resolve) => setImmediate(resolve));
        if (listener.hasStarted) await listener.finished.promise;
        await module.close();
    });

    it('async:true alone resolves emitAsync before the scheduled held handler finishes', async () => {
        let finished = false;
        void listener.finished.promise.then(() => {
            finished = true;
        });

        await emitter.emitAsync('characterization.detached');
        expect(listener.hasStarted).toBe(false);
        await listener.started.promise;
        expect(finished).toBe(false);

        listener.release.resolve();
        await listener.finished.promise;
        expect(finished).toBe(true);
    });

    it('promisify:true preserves deferred scheduling and joins the held handler promise', async () => {
        let emissionFinished = false;
        const emission = emitter
            .emitAsync('characterization.joined')
            .then(() => {
                emissionFinished = true;
            });
        try {
            expect(listener.hasStarted).toBe(false);
            await listener.started.promise;
            await Promise.resolve();
            expect(emissionFinished).toBe(false);

            listener.release.resolve();
            await emission;
            expect(emissionFinished).toBe(true);
        } finally {
            listener.release.resolve();
            await emission;
        }
    });

    it('a reserved joined event child remains counted after a fast root response', async () => {
        const tracker = new MaintenanceWorkService();
        let child!: Promise<unknown>;
        let drained = false;
        let drain:
            | ReturnType<MaintenanceWorkService['waitForIdle']>
            | undefined;

        try {
            const response = await tracker.runRoot('ticket.create', () => {
                const lease = tracker.currentLease();
                if (!lease) throw new Error('Expected admitted root lease');
                child = tracker.runChild(lease, 'ticket.created', () =>
                    emitter.emitAsync('characterization.joined'),
                );
                return { id: 'synthetic-ticket' };
            });
            expect(response).toEqual({ id: 'synthetic-ticket' });
            expect(listener.hasStarted).toBe(false);
            tracker.closeAdmission();
            drain = tracker.waitForIdle(1000).then((result) => {
                drained = true;
                return result;
            });

            await listener.started.promise;
            await Promise.resolve();
            expect(drained).toBe(false);
            listener.release.resolve();
            await child;
            await expect(drain).resolves.toEqual({
                drained: true,
                activeCount: 0,
            });
        } finally {
            listener.release.resolve();
            if (child) await child;
            if (drain) await drain;
        }
    });
});

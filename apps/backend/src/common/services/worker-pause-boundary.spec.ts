import type { Worker } from 'bullmq';
import { MaintenanceWorkService } from './maintenance-work.service';

// The repository setup mocks BullMQ globally; explicitly bypass it here.
const { Worker: InstalledWorker } = jest.requireActual<typeof import('bullmq')>('bullmq');

function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((done) => { resolve = done; });
    return { promise, resolve };
}

// Execute the installed public pause implementation with synthetic job/transport
// boundaries. This is not a real Redis acquisition, lock, or persistence test.
function fixtureWorker(completion: Promise<void>) {
    const state = {
        name: 'pause-boundary',
        id: 'synthetic-worker',
        opts: {},
        paused: false,
        trace: async (
            _kind: unknown,
            _operation: string,
            _name: string,
            callback: () => Promise<void>,
        ) => callback(),
        whenCurrentJobsFinished: jest.fn(() => completion),
        stalledCheckStopper: jest.fn(),
        emit: jest.fn(),
    };
    return {
        state,
        pause: (skipActive = false) =>
            InstalledWorker.prototype.pause.call(state as unknown as Worker, skipActive),
    };
}

describe('installed worker pause completion boundary', () => {
    it('keeps admission open for an accepted job entering tracked work late', async () => {
        const work = new MaintenanceWorkService();
        const active = deferred();
        const worker = fixtureWorker(active.promise);
        let pauseFinished = false;
        const pausing = worker.pause().then(() => { pauseFinished = true; });
        try {
            await Promise.resolve();
            expect(worker.state.paused).toBe(true);
            expect(pauseFinished).toBe(false);
            const write = jest.fn(async () => 'saved');
            await expect(work.runRoot('accepted.job', write)).resolves.toBe('saved');
            expect(write).toHaveBeenCalledTimes(1);
            expect(pauseFinished).toBe(false);
            active.resolve();
            await pausing;
            work.closeAdmission();
            await expect(work.runRoot('new.job', write)).rejects.toThrow(
                'Maintenance admission is closed',
            );
            expect(await work.waitForIdle(0)).toEqual({ drained: true, activeCount: 0 });
        } finally {
            active.resolve();
            await pausing;
        }
    });

    it('initiates every worker pause before waiting for any active job', async () => {
        const first = deferred();
        const second = deferred();
        const workers = [fixtureWorker(first.promise), fixtureWorker(second.promise)];
        let finished = false;
        const pausing = Promise.all(workers.map((worker) => worker.pause()))
            .then(() => { finished = true; });
        try {
            await Promise.resolve();
            for (const worker of workers) {
                expect(worker.state.paused).toBe(true);
                expect(worker.state.whenCurrentJobsFinished).toHaveBeenCalledTimes(1);
            }
            first.resolve();
            await Promise.resolve();
            expect(finished).toBe(false);
            second.resolve();
            await pausing;
            expect(finished).toBe(true);
        } finally {
            first.resolve();
            second.resolve();
            await pausing;
        }
    });

    it('does not mistake pause(true) followed by pause(false) for a completion join', async () => {
        const active = deferred();
        let activeFinished = false;
        const completion = active.promise.then(() => { activeFinished = true; });
        const worker = fixtureWorker(completion);
        try {
            await worker.pause(true);
            await worker.pause(false);
            expect(worker.state.paused).toBe(true);
            expect(worker.state.whenCurrentJobsFinished).not.toHaveBeenCalled();
            expect(activeFinished).toBe(false);
        } finally {
            active.resolve();
            await completion;
        }
    });
});

import { MaintenanceWorkService } from '../common/services/maintenance-work.service';
import { AiService } from './ai.service';
import { SupportAnswerOrchestrator } from './support-answer-orchestrator.service';

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((fulfill) => {
        resolve = fulfill;
    });
    return { promise, resolve };
}

// Scoped acceptance: a response timeout must not release surviving generation.
// The actual orchestrator is used; provider IO is synthetic and never connects.
describe('Support answer timeout completion boundary', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it.each(['late-answer', 'late-reformat'] as const)(
        'keeps %s generation counted after returning the timely fallback',
        async (outcome) => {
            jest.useFakeTimers();
            const generated = deferred<string>();
            const reformatted = deferred<{ response: string; model: string }>();
            const ai = {
                generate: jest.fn().mockReturnValue(generated.promise),
                reformat: jest.fn().mockReturnValue(reformatted.promise),
                getActiveModelName: jest
                    .fn()
                    .mockResolvedValue('synthetic-model'),
            };
            const work = new MaintenanceWorkService();
            const service = new SupportAnswerOrchestrator(
                ai as unknown as AiService,
                work,
            );
            const response = work.runRoot('test.answer', () =>
                service.generate({
                    finalPrompt: 'Synthetic prompt',
                    userQuery: 'Synthetic question',
                    kbContent: 'Synthetic context',
                    timeoutMs: 100,
                    audience: 'customer',
                    fallback: () => 'Synthetic fallback',
                }),
            );
            try {
                await jest.advanceTimersByTimeAsync(0);
                expect(ai.generate).toHaveBeenCalledTimes(1);
                await jest.advanceTimersByTimeAsync(100);
                expect(await response).toMatchObject({
                    response: 'Synthetic fallback',
                    mode: 'FALLBACK',
                    fallbackReason: 'TIMEOUT_OR_EMPTY',
                });
                work.closeAdmission();
                const pending = work.waitForIdle(0);
                await jest.advanceTimersByTimeAsync(0);
                expect(await pending).toEqual({
                    drained: false,
                    activeCount: 1,
                });
                expect(ai.getActiveModelName).not.toHaveBeenCalled();
                expect(ai.reformat).not.toHaveBeenCalled();

                generated.resolve(
                    outcome === 'late-answer'
                        ? 'Late answer'
                        : '{"rankings":[]}',
                );
                await jest.advanceTimersByTimeAsync(0);
                if (outcome === 'late-answer') {
                    expect(ai.getActiveModelName).toHaveBeenCalledTimes(1);
                    expect(ai.reformat).not.toHaveBeenCalled();
                } else {
                    // Already admitted work may finish after the fence.
                    expect(ai.reformat).toHaveBeenCalledTimes(1);
                    expect(ai.getActiveModelName).not.toHaveBeenCalled();
                    const reformatPending = work.waitForIdle(0);
                    await jest.advanceTimersByTimeAsync(0);
                    expect(await reformatPending).toEqual({
                        drained: false,
                        activeCount: 1,
                    });
                }
            } finally {
                generated.resolve('Cleanup answer');
                reformatted.resolve({
                    response: 'Cleanup answer',
                    model: 'synthetic-model',
                });
                await jest.advanceTimersByTimeAsync(100);
                await response;
                expect(await work.waitForIdle(0)).toEqual({
                    drained: true,
                    activeCount: 0,
                });
            }
        },
    );
});

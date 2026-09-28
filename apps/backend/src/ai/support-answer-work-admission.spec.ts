import { ServiceUnavailableException } from '@nestjs/common';
import { MaintenanceWorkService } from '../common/services/maintenance-work.service';
import { AiService } from './ai.service';
import { SupportAnswerOrchestrator } from './support-answer-orchestrator.service';

const options = {
    finalPrompt: 'Synthetic prompt',
    userQuery: 'Question',
    kbContent: 'Context',
    timeoutMs: 100,
    audience: 'customer' as const,
    fallback: () => 'Fallback',
};

describe('answer operation admission and failure settlement', () => {
    const setup = () => {
        const work = new MaintenanceWorkService();
        const ai = {
            generate: jest.fn().mockResolvedValue('Answer'),
            getActiveModelName: jest.fn().mockResolvedValue('synthetic'),
            reformat: jest.fn(),
        };
        const service = new SupportAnswerOrchestrator(
            ai as unknown as AiService,
            work,
        );
        return { work, ai, service };
    };
    afterEach(() => jest.useRealTimers());

    it('rejects a closed root before provider invocation', async () => {
        const { work, ai, service } = setup();
        work.closeAdmission();
        await expect(service.generate(options)).rejects.toBeInstanceOf(
            ServiceUnavailableException,
        );
        expect(ai.generate).not.toHaveBeenCalled();
        expect(await work.waitForIdle(0)).toEqual({
            drained: true,
            activeCount: 0,
        });
    });

    it('allows an admitted parent to finish generation after admission closes', async () => {
        const { work, service } = setup();
        const result = await work.runRoot('test.parent', () => {
            work.closeAdmission();
            return service.generate(options);
        });
        expect(result.response).toBe('Answer');
        expect(await work.waitForIdle(0)).toEqual({
            drained: true,
            activeCount: 0,
        });
    });

    it.each(['before', 'after'] as const)(
        'settles a provider rejection %s response timeout',
        async (timing) => {
            jest.useFakeTimers();
            const { work, ai, service } = setup();
            let reject!: (error: Error) => void;
            ai.generate.mockReturnValue(
                new Promise<string>((_, fail) => {
                    reject = fail;
                }),
            );
            const failure = new Error('Synthetic failure');
            // Attach rejection handling immediately, including the pre-timeout branch.
            const result = service.generate(options).then(
                (value) => ({ value }),
                (error) => ({ error }),
            );
            try {
                await jest.advanceTimersByTimeAsync(0);
                work.closeAdmission();
                if (timing === 'after') {
                    await jest.advanceTimersByTimeAsync(100);
                    expect(await result).toMatchObject({
                        value: { response: 'Fallback' },
                    });
                    const pending = work.waitForIdle(0);
                    await jest.advanceTimersByTimeAsync(0);
                    expect(await pending).toEqual({
                        drained: false,
                        activeCount: 1,
                    });
                }
                reject(failure);
                await jest.advanceTimersByTimeAsync(0);
                if (timing === 'before')
                    expect(await result).toEqual({ error: failure });
                expect(await work.waitForIdle(0)).toEqual({
                    drained: true,
                    activeCount: 0,
                });
            } finally {
                reject(failure);
                await jest.advanceTimersByTimeAsync(100);
                await result;
            }
        },
    );
});

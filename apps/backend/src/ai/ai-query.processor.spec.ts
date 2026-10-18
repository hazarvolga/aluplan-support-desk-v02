import { Logger } from '@nestjs/common';
import { AiQueryProcessor } from './ai-query.processor';
import { SAFE_AI_QUERY_FAILURE } from './ai-job-error';

describe('AiQueryProcessor error boundary', () => {
    const queryResult = {
        answer: 'Safe answer',
        answerMode: 'RAG',
        interactionId: 'interaction-1',
        confidence: 'HIGH',
        suggestTicket: false,
    };

    function createProcessor() {
        const aiQueryService = { queryInternal: jest.fn() };
        const notifications = { sendToUser: jest.fn() };
        const processor = new AiQueryProcessor(aiQueryService as any, notifications as any);
        return { processor, aiQueryService, notifications };
    }

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('sends the completed result only to the job owner', async () => {
        const { processor, aiQueryService, notifications } = createProcessor();
        aiQueryService.queryInternal.mockResolvedValue(queryResult);

        await expect(processor.process({
            data: { jobId: 'job-1', options: { userId: 'owner-1', channel: 'WEB' } },
        } as any)).resolves.toMatchObject({ status: 'COMPLETED' });

        expect(notifications.sendToUser).toHaveBeenCalledWith(
            'owner-1',
            'AI_QUERY_COMPLETED',
            expect.objectContaining({ jobId: 'job-1', result: expect.objectContaining({ status: 'COMPLETED' }) }),
        );
    });

    it('emits and throws stable safe failures without exposing an Error message', async () => {
        const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
        const { processor, aiQueryService, notifications } = createProcessor();
        const privateMessage = 'connect ECONNREFUSED 10.0.0.12:443 api_key=private';
        aiQueryService.queryInternal.mockRejectedValue(new Error(privateMessage));

        const thrown = await processor.process({
            data: { jobId: 'job-2', options: { userId: 'owner-1' } },
        } as any).catch((error) => error);

        expect(notifications.sendToUser).toHaveBeenCalledWith('owner-1', 'AI_QUERY_FAILED', {
            jobId: 'job-2',
            error: SAFE_AI_QUERY_FAILURE,
        });
        expect(thrown).toMatchObject({
            name: 'AiQueryJobError',
            code: SAFE_AI_QUERY_FAILURE.code,
            message: SAFE_AI_QUERY_FAILURE.message,
        });
        expect(String(thrown.stack)).toContain(SAFE_AI_QUERY_FAILURE.message);
        expect(JSON.stringify({
            thrown: { name: thrown.name, code: thrown.code, message: thrown.message, stack: thrown.stack },
            logs: errorSpy.mock.calls,
            notifications: notifications.sendToUser.mock.calls,
        })).not.toContain(privateMessage);
    });

    it('logs sanitized server-side failure metadata without the raw exception message', async () => {
        const privateMessage = 'socket hang up token=private';
        const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
        const { processor, aiQueryService, notifications } = createProcessor();
        aiQueryService.queryInternal.mockRejectedValue(new TypeError(privateMessage));

        const thrown = await processor.process({
            data: { jobId: 'job-3', options: { userId: 'owner-1' } },
        } as any).catch((error) => error);

        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('errorType=TypeError'));
        expect(JSON.stringify({
            thrown: { message: thrown.message, stack: thrown.stack },
            logs: errorSpy.mock.calls,
            notifications: notifications.sendToUser.mock.calls,
        })).not.toContain(privateMessage);
    });

    it('does not trust a mutable exception name when building sanitized logs', async () => {
        const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
        const { processor, aiQueryService, notifications } = createProcessor();
        const error = new Error('provider failed');
        error.name = 'Bearer private-token';
        aiQueryService.queryInternal.mockRejectedValue(error);

        const thrown = await processor.process({
            data: { jobId: 'job-malicious-name', options: { userId: 'owner-1' } },
        } as any).catch((caught) => caught);

        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('errorType=Error'));
        const observable = JSON.stringify({
            thrown: { message: thrown.message, stack: thrown.stack },
            logs: errorSpy.mock.calls,
            notifications: notifications.sendToUser.mock.calls,
        });
        expect(observable).not.toContain('provider failed');
        expect(observable).not.toContain('private-token');
    });

    it('sanitizes a thrown string across the queue error, logs, and notification', async () => {
        const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
        const { processor, aiQueryService, notifications } = createProcessor();
        const privateMessage = 'provider failed token=private';
        aiQueryService.queryInternal.mockRejectedValue(privateMessage);

        const thrown = await processor.process({
            data: { jobId: 'job-4', options: { userId: 'owner-1' } },
        } as any).catch((error) => error);

        expect(thrown).toMatchObject({
            name: 'AiQueryJobError',
            code: SAFE_AI_QUERY_FAILURE.code,
            message: SAFE_AI_QUERY_FAILURE.message,
        });
        expect(JSON.stringify({
            thrown: { message: thrown.message, stack: thrown.stack },
            logs: errorSpy.mock.calls,
            notifications: notifications.sendToUser.mock.calls,
        })).not.toContain(privateMessage);
    });

    it('does not emit a failure event when owner metadata is missing', async () => {
        const { processor, aiQueryService, notifications } = createProcessor();
        aiQueryService.queryInternal.mockRejectedValue(new Error('provider failed'));

        await expect(processor.process({
            data: { jobId: 'job-no-owner', options: {} },
        } as any)).rejects.toMatchObject({
            code: SAFE_AI_QUERY_FAILURE.code,
            message: SAFE_AI_QUERY_FAILURE.message,
        });

        expect(notifications.sendToUser).not.toHaveBeenCalled();
    });

    it('still throws the stable queue error when failure notification delivery throws', async () => {
        const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
        const { processor, aiQueryService, notifications } = createProcessor();
        const providerSecret = 'provider token=private';
        const notificationSecret = 'socket endpoint=wss://private.example';
        aiQueryService.queryInternal.mockRejectedValue(new Error(providerSecret));
        notifications.sendToUser.mockImplementation(() => {
            throw new Error(notificationSecret);
        });

        const thrown = await processor.process({
            data: { jobId: 'job-notification-failure', options: { userId: 'owner-1' } },
        } as any).catch((error) => error);

        const observable = JSON.stringify({
            thrown: { name: thrown.name, code: thrown.code, message: thrown.message, stack: thrown.stack },
            logs: errorSpy.mock.calls,
            notifications: notifications.sendToUser.mock.calls,
        });
        expect(thrown.message).toBe(SAFE_AI_QUERY_FAILURE.message);
        expect(observable).not.toContain(providerSecret);
        expect(observable).not.toContain(notificationSecret);
    });
});

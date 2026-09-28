import { ArgumentsHost, BadRequestException, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { MaintenanceWorkService } from '../services/maintenance-work.service';

describe('exception audit completion', () => {
    const fixture = () => {
        const work = new MaintenanceWorkService();
        const logError = jest.fn().mockResolvedValue(undefined);
        const reply = jest.fn();
        const response = { destroyed: false, writableEnded: false };
        const host = {
            switchToHttp: () => ({
                getRequest: () => ({ method: 'POST' }),
                getResponse: () => response,
            }),
        } as ArgumentsHost;
        const filter = new GlobalExceptionFilter(
            {
                httpAdapter: {
                    getRequestUrl: () => '/test?token=synthetic-secret',
                    reply,
                },
            } as never,
            { logError } as never,
            work,
        );
        return { work, logError, reply, response, host, filter };
    };

    it.each(['success', 'failure', 'disconnected'] as const)(
        'holds admitted write through %s',
        async (outcome) => {
            const f = fixture();
            let release!: () => void;
            let reject!: (error: Error) => void;
            f.logError.mockReturnValue(
                new Promise<void>((resolve, fail) => {
                    release = resolve;
                    reject = fail;
                }),
            );
            const log = jest
                .spyOn(Logger.prototype, 'error')
                .mockImplementation(() => undefined);
            const pending = f.filter.catch(
                new BadRequestException('Invalid input'),
                f.host,
            );
            f.work.closeAdmission();
            try {
                if (outcome === 'disconnected') f.response.destroyed = true;
                expect(await f.work.waitForIdle(0)).toEqual({
                    drained: false,
                    activeCount: 1,
                });
                expect(f.logError).toHaveBeenCalledTimes(1);
                expect(f.reply).not.toHaveBeenCalled();
                if (outcome === 'failure')
                    reject(new Error('synthetic-secret'));
                else release();
                await pending;
                expect(await f.work.waitForIdle(0)).toEqual({
                    drained: true,
                    activeCount: 0,
                });
                if (outcome === 'disconnected')
                    expect(f.reply).not.toHaveBeenCalled();
                else
                    expect(f.reply).toHaveBeenCalledWith(
                        f.response,
                        expect.objectContaining({
                            statusCode: 400,
                            message: 'Invalid input',
                        }),
                        400,
                    );
                expect(JSON.stringify(log.mock.calls)).not.toContain(
                    'synthetic-secret',
                );
            } finally {
                release();
                await pending;
                log.mockRestore();
            }
        },
    );

    it('rejects standalone audit after closure but preserves original error response', async () => {
        const f = fixture();
        const log = jest
            .spyOn(Logger.prototype, 'error')
            .mockImplementation(() => undefined);
        f.work.closeAdmission();
        try {
            await f.filter.catch(
                new BadRequestException('Invalid input'),
                f.host,
            );
            expect(f.logError).not.toHaveBeenCalled();
            expect(f.reply).toHaveBeenCalledWith(
                f.response,
                expect.objectContaining({ statusCode: 400 }),
                400,
            );
        } finally {
            log.mockRestore();
        }
    });

    it('admits an active parent descendant after closure', async () => {
        const f = fixture();
        await f.work.runRoot('test.parent', async () => {
            f.work.closeAdmission();
            await f.filter.catch(
                new BadRequestException('Invalid input'),
                f.host,
            );
        });
        expect(f.logError).toHaveBeenCalledTimes(1);
        expect(f.reply).toHaveBeenCalledTimes(1);
        expect(await f.work.waitForIdle(0)).toEqual({
            drained: true,
            activeCount: 0,
        });
    });
});

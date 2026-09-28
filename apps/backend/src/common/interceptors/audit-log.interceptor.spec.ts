import { ExecutionContext, Logger } from '@nestjs/common';
import { lastValueFrom, of, Subject, toArray } from 'rxjs';
import { AuditLogInterceptor } from './audit-log.interceptor';
import { MaintenanceWorkService } from '../services/maintenance-work.service';

const context = (body: unknown, url = '/settings', type = 'http') =>
    ({
        getType: () => type,
        switchToHttp: () => ({
            getRequest: () => ({
                method: 'POST',
                url,
                body,
                user: { id: 'synthetic-actor' },
                ip: '127.0.0.1',
                headers: {},
            }),
        }),
    }) as unknown as ExecutionContext;

describe('administrative audit secrecy and completion', () => {
    const setup = () => {
        const create = jest.fn().mockResolvedValue({});
        const work = new MaintenanceWorkService();
        const interceptor = new AuditLogInterceptor(
            { auditLog: { create } } as never,
            work,
        );
        return { create, work, interceptor };
    };

    it.each([
        { key: 'email.smtp.pass', value: 'synthetic-sensitive-value' },
        {
            settings: [
                {
                    key: 'ai.api_key',
                    value: 'synthetic-sensitive-value',
                    isSecret: false,
                },
            ],
        },
        {
            accessKey: 'synthetic-sensitive-value',
            secretKey: 'synthetic-sensitive-value',
        },
    ])('never persists credential-bearing request body %#', async (body) => {
        const { create, work, interceptor } = setup();
        const response = { id: 'synthetic-entity', ok: true };
        expect(
            await lastValueFrom(
                interceptor.intercept(context(body), {
                    handle: () => of(response),
                }),
            ),
        ).toBe(response);
        work.closeAdmission();
        await work.waitForIdle(1000);
        expect(create).toHaveBeenCalledTimes(1);
        expect(create.mock.calls[0][0].data).not.toHaveProperty('newValue');
        expect(create.mock.calls[0][0].data).toMatchObject({
            actorId: 'synthetic-actor',
            entityId: 'synthetic-entity',
            action: 'settings.create',
        });
        expect(JSON.stringify(create.mock.calls)).not.toContain(
            'synthetic-sensitive-value',
        );
    });

    it('does not copy query parameters into audit identifiers', async () => {
        const { create, work, interceptor } = setup();
        await lastValueFrom(
            interceptor.intercept(
                context({}, '/settings?token=synthetic-sensitive-value'),
                { handle: () => of({}) },
            ),
        );
        work.closeAdmission();
        await work.waitForIdle(1000);
        expect(create.mock.calls[0][0].data).toMatchObject({
            action: 'settings.create',
            entityType: 'settings',
        });
        expect(JSON.stringify(create.mock.calls)).not.toContain(
            'synthetic-sensitive-value',
        );
    });

    it.each(['success', 'failure'] as const)(
        'returns the response while admitted audit stays counted until %s',
        async (outcome) => {
            const { create, work, interceptor } = setup();
            let release!: () => void;
            let fail!: (error: Error) => void;
            create.mockReturnValue(
                new Promise<void>((resolve, reject) => {
                    release = resolve;
                    fail = reject;
                }),
            );
            const log = jest
                .spyOn(Logger.prototype, 'error')
                .mockImplementation(() => undefined);
            try {
                await work.runRoot('test.request', async () => {
                    work.closeAdmission();
                    expect(
                        await lastValueFrom(
                            interceptor.intercept(context({}), {
                                handle: () => of('response'),
                            }),
                        ),
                    ).toBe('response');
                });
                expect(create).toHaveBeenCalledTimes(1);
                expect(await work.waitForIdle(0)).toEqual({
                    drained: false,
                    activeCount: 1,
                });
                if (outcome === 'failure')
                    fail(new Error('synthetic-sensitive-error'));
                else release();
                expect(await work.waitForIdle(1000)).toEqual({
                    drained: true,
                    activeCount: 0,
                });
                await Promise.resolve();
                expect(JSON.stringify(log.mock.calls)).not.toContain(
                    'synthetic-sensitive-error',
                );
            } finally {
                release();
                await work.waitForIdle(1000);
                log.mockRestore();
            }
        },
    );

    it('preserves multiple emissions and their completion', async () => {
        const { interceptor, work, create } = setup();
        const subject = new Subject<number>();
        const response = lastValueFrom(
            interceptor
                .intercept(context({}), { handle: () => subject })
                .pipe(toArray()),
        );
        subject.next(1);
        subject.next(2);
        subject.complete();
        expect(await response).toEqual([1, 2]);
        work.closeAdmission();
        await work.waitForIdle(1000);
        expect(create).toHaveBeenCalledTimes(2);
    });

    it('bypasses non-HTTP contexts without touching request or persistence', async () => {
        const { interceptor, create } = setup();
        const ctx = {
            getType: () => 'ws',
            switchToHttp: jest.fn(() => {
                throw new Error('Not HTTP');
            }),
        } as unknown as ExecutionContext;
        expect(
            await lastValueFrom(
                interceptor.intercept(ctx, { handle: () => of('unchanged') }),
            ),
        ).toBe('unchanged');
        expect(create).not.toHaveBeenCalled();
    });

    it('does not turn a completed response into an error if standalone audit admission closed', async () => {
        const { interceptor, create, work } = setup();
        work.closeAdmission();
        expect(
            await lastValueFrom(
                interceptor.intercept(context({}), {
                    handle: () => of('unchanged'),
                }),
            ),
        ).toBe('unchanged');
        await Promise.resolve();
        expect(create).not.toHaveBeenCalled();
    });
});

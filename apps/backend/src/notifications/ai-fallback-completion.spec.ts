import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bullmq';
import { NotificationsGateway } from './notifications.gateway';
import { MaintenanceWorkService } from '../common/services/maintenance-work.service';
import { TicketAccessService } from '../common/services/ticket-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { AiHealthEventService } from '../ai/ai-health-event.service';
import { PROACTIVE_CHAT_QUEUE } from '../proactive-chat/proactive-chat.constants';

const payload = {
    primaryProvider: 'primary',
    fallbackProvider: 'secondary',
    task: 'test',
    error: 'Synthetic failure',
};
const turn = () => new Promise<void>((resolve) => setImmediate(resolve));

// Real Nest event discovery and gateway; no socket server, DB or provider IO.
describe('AI fallback notification completion', () => {
    let module: TestingModule;
    let emitter: EventEmitter2;
    let work: MaintenanceWorkService;
    let record: jest.Mock;
    let createMany: jest.Mock;

    beforeEach(async () => {
        record = jest.fn().mockResolvedValue(undefined);
        createMany = jest.fn().mockResolvedValue({ count: 1 });
        module = await Test.createTestingModule({
            imports: [EventEmitterModule.forRoot()],
            providers: [
                NotificationsGateway,
                MaintenanceWorkService,
                AiHealthEventService,
                ...[
                    JwtService,
                    ConfigService,
                    RedisService,
                    EmailService,
                    TicketAccessService,
                ].map((provide) => ({ provide, useValue: {} })),
                {
                    provide: PrismaService,
                    useValue: {
                        aiHealthEvent: { create: record },
                        user: {
                            findMany: jest
                                .fn()
                                .mockResolvedValue([{ id: 'synthetic-admin' }]),
                        },
                        notification: { createMany },
                    },
                },
                { provide: getQueueToken(PROACTIVE_CHAT_QUEUE), useValue: {} },
            ],
        }).compile();
        await module.init();
        emitter = module.get(EventEmitter2);
        work = module.get(MaintenanceWorkService);
        expect(emitter.listenerCount('system.ai_fallback')).toBe(1);
    });

    afterEach(async () => {
        await module.close();
    });

    describe.each(['health', 'notification'] as const)('%s write', (stage) => {
        it.each(['success', 'failure'] as const)(
            'remains reserved after publisher returns until %s',
            async (outcome) => {
                let release!: () => void;
                let reject!: (error: Error) => void;
                const held = new Promise<void>((resolve, fail) => {
                    release = resolve;
                    reject = fail;
                });
                void held.catch(() => undefined);
                (stage === 'health' ? record : createMany).mockReturnValueOnce(
                    held,
                );
                try {
                    await work.runRoot('test.publisher', () => {
                        emitter.emit('system.ai_fallback', payload);
                        // Callback must be reserved now, but persistence stays deferred.
                        expect(record).not.toHaveBeenCalled();
                        work.closeAdmission();
                    });
                    await turn();
                    expect(
                        stage === 'health' ? record : createMany,
                    ).toHaveBeenCalledTimes(1);
                    expect(await work.waitForIdle(0)).toEqual({
                        drained: false,
                        activeCount: 1,
                    });
                    if (outcome === 'failure')
                        reject(new Error('Synthetic write failure'));
                    else release();
                    expect(await work.waitForIdle(1000)).toEqual({
                        drained: true,
                        activeCount: 0,
                    });
                    // Real health service catches a failed health write and preserves
                    // the existing subsequent notification attempt.
                    if (stage === 'health')
                        expect(createMany).toHaveBeenCalledTimes(1);
                } finally {
                    release();
                    await turn();
                }
            },
        );
    });

    it('rejects standalone events after closure without persistence', async () => {
        work.closeAdmission();
        await emitter.emitAsync('system.ai_fallback', payload);
        await turn();
        expect(record).not.toHaveBeenCalled();
        expect(createMany).not.toHaveBeenCalled();
    });
});

import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
    EventEmitter2,
    EventEmitterModule,
    OnEvent,
} from '@nestjs/event-emitter';
import { RuleEngineService } from './rule-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../automation/audit.service';

@Injectable()
class HeldTranslation {
    finish!: () => void;
    fail!: (error: Error) => void;
    readonly held = new Promise<void>((resolve, reject) => {
        this.finish = resolve;
        this.fail = reject;
    });
    @OnEvent('ai.translate_message', { async: true, promisify: true })
    async handle() {
        await this.held;
    }
}

// Actual rule engine, synthetic nested listener. Actual translation metadata is
// guarded separately; this does not claim full AI provider/DB integration.
describe('rule engine nested translation completion', () => {
    it.each(['success', 'failure'] as const)(
        'joins nested translation before subsequent rule writes (%s)',
        async (outcome) => {
            const update = jest.fn().mockResolvedValue({});
            const module = await Test.createTestingModule({
                imports: [EventEmitterModule.forRoot()],
                providers: [
                    RuleEngineService,
                    HeldTranslation,
                    {
                        provide: AuditService,
                        useValue: {
                            log: jest.fn().mockResolvedValue(undefined),
                        },
                    },
                    {
                        provide: PrismaService,
                        useValue: {
                            ticketRule: {
                                findMany: jest
                                    .fn()
                                    .mockResolvedValue([
                                        {
                                            name: 'Synthetic rule',
                                            conditions: {},
                                            actions: {
                                                translateTo: 'en',
                                                setPriority: 'HIGH',
                                            },
                                        },
                                    ]),
                            },
                            ticket: {
                                findUnique: jest.fn().mockResolvedValue({}),
                                update,
                            },
                        },
                    },
                ],
            }).compile();
            await module.init();
            const listener = module.get(HeldTranslation);
            let settled = false;
            const processing = module
                .get(EventEmitter2)
                .emitAsync('ticket.created', { id: 'synthetic-ticket' })
                .then(() => {
                    settled = true;
                });
            try {
                // Two event-loop turns enter the scheduled outer and nested listener.
                await new Promise<void>((resolve) => setImmediate(resolve));
                await new Promise<void>((resolve) => setImmediate(resolve));
                expect(settled).toBe(false);
                expect(update).not.toHaveBeenCalled();
                if (outcome === 'failure')
                    listener.fail(new Error('Synthetic translation failure'));
                else listener.finish();
                await processing;
                expect(update).toHaveBeenCalledTimes(1);
            } finally {
                listener.finish();
                await processing;
                await module.close();
            }
        },
    );
});

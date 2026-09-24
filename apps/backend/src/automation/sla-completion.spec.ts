import { getQueueToken } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
import { AutomationService } from './automation.service';
import { SlaCronService } from './sla.cron';
import { SlaProcessor } from './sla.processor';

function deferred() {
    let resolve!: () => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<void>((fulfill, fail) => {
        resolve = fulfill;
        reject = fail;
    });
    return { promise, resolve, reject };
}

describe('SLA worker completion through discovered event listeners', () => {
    let module: TestingModule;
    let processor: SlaProcessor;
    let findMany: jest.Mock;
    let update: jest.Mock;
    let sendSlaBreachWarning: jest.Mock;

    beforeEach(async () => {
        findMany = jest.fn().mockResolvedValue([]);
        update = jest.fn().mockResolvedValue({});
        sendSlaBreachWarning = jest.fn();
        module = await Test.createTestingModule({
            imports: [EventEmitterModule.forRoot()],
            providers: [
                SlaProcessor,
                SlaCronService,
                AutomationService,
                { provide: PrismaService, useValue: { ticket: { findMany, update } } },
                { provide: AuditService, useValue: { log: jest.fn() } },
                { provide: EmailService, useValue: { sendSlaBreachWarning } },
                { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('https://support.example.test') } },
                { provide: NotificationsGateway, useValue: { emitSlaBreached: jest.fn() } },
                { provide: getQueueToken('sla-processing'), useValue: { add: jest.fn().mockResolvedValue({}) } },
            ],
        }).compile();
        // Real Nest bootstrap discovers AutomationService's @OnEvent listener.
        await module.init();
        processor = module.get(SlaProcessor);
        expect(module.get(EventEmitter2).listenerCount('sla.warning')).toBe(1);
    });

    afterEach(async () => {
        await module.close();
    });

    describe.each(['response', 'resolution'] as const)('%s warning', (breachType) => {
        it.each(['success', 'failure'] as const)(
            'waits for the enqueue attempt to settle (%s) before recording the attempt and completing',
            async (outcome) => {
                const enqueue = deferred();
                const started = deferred();
                sendSlaBreachWarning.mockImplementation(() => {
                    started.resolve();
                    return enqueue.promise;
                });
                const ticket = {
                    id: `ticket-${breachType}`,
                    ticketNumber: '#SLA-1',
                    subject: 'Warning test',
                    status: 'OPEN',
                    assignee: { email: 'agent@example.test', fullName: 'Test Agent' },
                };
                findMany.mockResolvedValueOnce(breachType === 'response' ? [ticket] : [])
                    .mockResolvedValueOnce(breachType === 'resolution' ? [ticket] : []);

                let completed = false;
                let startTimeout: NodeJS.Timeout | undefined;
                const processing = processor.process({ id: 'sla-job', name: 'check-warnings' } as Job)
                    .then(result => {
                        completed = true;
                        return result;
                    });
                try {
                    await Promise.race([
                        started.promise,
                        processing,
                        new Promise<never>((_, reject) => {
                            startTimeout = setTimeout(() => reject(new Error('SLA listener did not start')), 1000);
                        }),
                    ]);
                    if (startTimeout) clearTimeout(startTimeout);
                    // Allow detached promise continuations to run without releasing the enqueue.
                    await new Promise<void>(resolve => setImmediate(resolve));
                    expect(sendSlaBreachWarning).toHaveBeenCalledWith({
                        recipientEmail: 'agent@example.test',
                        agentName: 'Test Agent',
                        ticketId: ticket.id,
                        ticketNumber: '#SLA-1',
                        ticketSubject: 'Warning test',
                        ticketStatus: 'OPEN',
                        ticketUrl: `https://support.example.test/tickets/${ticket.id}`,
                        minutesLeft: '30 dakikadan az',
                        breachType,
                    });
                    expect(update).not.toHaveBeenCalled();
                    expect(completed).toBe(false);

                    if (outcome === 'failure') {
                        enqueue.reject(new Error('Mock enqueue unavailable'));
                    } else {
                        enqueue.resolve();
                    }
                    // AutomationService catches enqueue failure: completion is best effort,
                    // and the timestamp is an attempted-warning marker, not delivery proof.
                    await expect(processing).resolves.toEqual({ status: 'completed', job: 'check-warnings' });
                    expect(update).toHaveBeenCalledTimes(1);
                    expect(update).toHaveBeenCalledWith({
                        where: { id: ticket.id },
                        data: { slaWarningSentAt: expect.any(Date) },
                    });
                } finally {
                    if (startTimeout) clearTimeout(startTimeout);
                    enqueue.resolve();
                    await processing;
                }
            },
        );
    });
});

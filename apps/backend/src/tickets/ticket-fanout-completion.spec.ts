import { Test } from '@nestjs/testing';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getQueueToken } from '@nestjs/bullmq';
import { TicketsService } from './tickets.service';
import { RuleEngineService } from './rule-engine.service';
import { AutoAssignmentService } from './auto-assignment.service';
import { SlaService } from './sla.service';
import { AiAutoResolverService } from '../ai/ai-auto-resolver.service';
import { AiQueryService } from '../ai/ai-query.service';
import { AiService } from '../ai/ai.service';
import { EmbeddingService } from '../ai/embedding.service';
import { AiHealthEventService } from '../ai/ai-health-event.service';
import { AutomationService } from '../automation/automation.service';
import { AuditService } from '../automation/audit.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { MaintenanceWorkService } from '../common/services/maintenance-work.service';
import { PiiMaskingService } from '../common/services/pii-masking.service';
import { TicketAccessService } from '../common/services/ticket-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { SettingsService } from '../settings/settings.service';
import { PROACTIVE_CHAT_QUEUE } from '../proactive-chat/proactive-chat.constants';

const stages = [
    'rule',
    'assignment',
    'draft',
    'email',
    'notification',
] as const;
type Stage = (typeof stages)[number];

// Actual creation service and all five real ticket.created consumers through
// Nest discovery. External IO is mocked: not DB durability or mail/socket delivery.
describe('complete known ticket.created consumer fan-out', () => {
    afterEach(() => jest.useRealTimers());

    describe.each(stages)('held %s operation', (heldStage) => {
        it.each(['success', 'failure'] as const)(
            'keeps the fast response and drains only after %s',
            async (outcome) => {
                jest.useFakeTimers();
                let release!: () => void;
                let reject!: (error: Error) => void;
                const held = new Promise<void>((resolve, fail) => {
                    release = resolve;
                    reject = fail;
                });
                void held.catch(() => undefined);
                const entered = new Set<Stage>();
                const boundary = async (stage: Stage) => {
                    entered.add(stage);
                    if (stage === heldStage) await held;
                    return {};
                };
                const ticket = {
                    id: 'synthetic-ticket',
                    ticketNumber: 'SYN-1',
                    subject: 'Synthetic issue',
                    description: 'Synthetic detail',
                    status: 'NEW',
                    priority: 'MEDIUM',
                    userId: 'synthetic-customer',
                    departmentId: 'synthetic-department',
                    assignedTo: null,
                    interactionId: null,
                    channel: 'WEB',
                    createdAt: new Date('2026-01-01T00:00:00Z'),
                    creator: {
                        email: 'customer@example.invalid',
                        fullName: 'Synthetic Customer',
                    },
                };
                const update = jest.fn(
                    ({ data }: { data: Record<string, unknown> }) => {
                        if (data.assignedTo) return boundary('assignment');
                        if (data.priority) return boundary('rule');
                        return Promise.resolve({});
                    },
                );
                const staffEmail = jest.fn().mockResolvedValue(undefined);
                const audit = jest.fn().mockResolvedValue(undefined);
                const prisma = {
                    $queryRaw: jest.fn().mockResolvedValue([{ nextval: 1n }]),
                    ticket: {
                        create: jest.fn().mockResolvedValue(ticket),
                        findUnique: jest.fn().mockResolvedValue(ticket),
                        update,
                        groupBy: jest.fn().mockResolvedValue([]),
                    },
                    ticketRule: {
                        findMany: jest.fn().mockResolvedValue([
                            {
                                name: 'Synthetic rule',
                                conditions: {},
                                actions: { setPriority: 'HIGH' },
                            },
                        ]),
                    },
                    ticketMessage: {
                        findMany: jest.fn().mockResolvedValue([]),
                        create: jest.fn(() => boundary('draft')),
                    },
                    user: {
                        findMany: jest.fn(
                            ({ where }: { where: { teamMembers?: unknown } }) =>
                                Promise.resolve(
                                    where.teamMembers
                                        ? [{ id: 'synthetic-agent' }]
                                        : [{ email: 'staff@example.invalid' }],
                                ),
                        ),
                    },
                    notification: {
                        createMany: jest.fn(() => boundary('notification')),
                    },
                };
                const module = await Test.createTestingModule({
                    imports: [EventEmitterModule.forRoot()],
                    providers: [
                        TicketsService,
                        RuleEngineService,
                        AutoAssignmentService,
                        AiAutoResolverService,
                        AutomationService,
                        NotificationsGateway,
                        MaintenanceWorkService,
                        { provide: PrismaService, useValue: prisma },
                        {
                            provide: SlaService,
                            useValue: {
                                calculateDeadlines: jest
                                    .fn()
                                    .mockResolvedValue({}),
                            },
                        },
                        {
                            provide: PiiMaskingService,
                            useValue: {
                                maskSensitiveData: (value: string) => value,
                            },
                        },
                        {
                            provide: AiQueryService,
                            useValue: {
                                query: jest.fn().mockResolvedValue({
                                    confidence: 'HIGH',
                                    answer: 'Synthetic answer',
                                    interactionId: 'synthetic-interaction',
                                }),
                            },
                        },
                        {
                            provide: ConfigService,
                            useValue: {
                                get: jest
                                    .fn()
                                    .mockReturnValue(
                                        'https://support.example.invalid',
                                    ),
                            },
                        },
                        {
                            provide: RedisService,
                            useValue: {
                                getClient: () => ({
                                    sunion: jest
                                        .fn()
                                        .mockResolvedValue(['synthetic-agent']),
                                }),
                            },
                        },
                        { provide: AuditService, useValue: { log: audit } },
                        {
                            provide: EmailService,
                            useValue: {
                                sendTicketCreated: jest.fn(() =>
                                    boundary('email'),
                                ),
                                sendNewTicketToStaff: staffEmail,
                            },
                        },
                        ...[
                            JwtService,
                            TicketAccessService,
                            AiService,
                            EmbeddingService,
                            SettingsService,
                            AiHealthEventService,
                        ].map((provide) => ({ provide, useValue: {} })),
                        {
                            provide: getQueueToken(PROACTIVE_CHAT_QUEUE),
                            useValue: {},
                        },
                    ],
                }).compile();
                await module.init();
                const work = module.get(MaintenanceWorkService);
                try {
                    expect(
                        module
                            .get(EventEmitter2)
                            .listenerCount('ticket.created'),
                    ).toBe(5);
                    // No timers advanced: HTTP-like response must not wait for the
                    // 1.5s assignment delay or any deliberately held consumer.
                    expect(
                        await module.get(TicketsService).create(
                            {
                                subject: ticket.subject,
                                departmentId: ticket.departmentId,
                            },
                            ticket.userId,
                        ),
                    ).toEqual(ticket);
                    work.closeAdmission();
                    await jest.advanceTimersByTimeAsync(1501);
                    expect([...entered].sort()).toEqual([...stages].sort());
                    const pending = work.waitForIdle(0);
                    await jest.advanceTimersByTimeAsync(0);
                    expect(await pending).toEqual({
                        drained: false,
                        activeCount: 1,
                    });
                    if (outcome === 'failure')
                        reject(new Error('Synthetic boundary failure'));
                    else release();
                    await jest.advanceTimersByTimeAsync(0);
                    expect(await work.waitForIdle(0)).toEqual({
                        drained: true,
                        activeCount: 0,
                    });
                    expect(staffEmail).toHaveBeenCalledTimes(1);
                    expect(audit).toHaveBeenCalledWith(
                        expect.objectContaining({ action: 'ticket.created' }),
                    );
                    if (!(heldStage === 'rule' && outcome === 'failure'))
                        expect(audit).toHaveBeenCalledWith(
                            expect.objectContaining({
                                action: 'automation.rule_applied',
                            }),
                        );
                    if (!(heldStage === 'draft' && outcome === 'failure'))
                        expect(update).toHaveBeenCalledWith(
                            expect.objectContaining({
                                data: {
                                    status: 'DRAFT',
                                    interactionId: 'synthetic-interaction',
                                },
                            }),
                        );
                    expect(update).toHaveBeenCalledWith(
                        expect.objectContaining({
                            data: { assignedTo: 'synthetic-agent' },
                        }),
                    );
                } finally {
                    release();
                    await jest.advanceTimersByTimeAsync(2000);
                    work.closeAdmission();
                    const drained = work.waitForIdle(0);
                    await jest.advanceTimersByTimeAsync(0);
                    try {
                        expect(await drained).toEqual({
                            drained: true,
                            activeCount: 0,
                        });
                    } finally {
                        await module.close();
                    }
                }
            },
        );
    });
});

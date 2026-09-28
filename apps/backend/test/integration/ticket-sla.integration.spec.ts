import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from '../../src/tickets/tickets.service';
import { SlaService } from '../../src/tickets/sla.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { SettingsService } from '../../src/settings/settings.service';
import { BusinessHoursService } from '../../src/tickets/business-hours.service';
import { PiiMaskingService } from '../../src/common/services/pii-masking.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TicketPriority, TicketStatus } from '@aluplan/database';
import { AiQueryService } from '../../src/ai/ai-query.service';
import { RedisService } from '../../src/redis/redis.service';
import { TicketAccessService } from '../../src/common/services/ticket-access.service';
import { MaintenanceWorkService } from '../../src/common/services/maintenance-work.service';

/**
 * Integration test for Ticket + SLA flow.
 * Uses mocks to avoid full AppModule dependency issues.
 */
describe('Ticket + SLA Flow (Integration)', () => {
    let ticketsService: TicketsService;
    let slaService: SlaService;

    const mockPrisma = {
        $queryRaw: jest.fn().mockResolvedValue([{ nextval: 1n }]),
        slaPolicy: { findFirst: jest.fn().mockResolvedValue(null) },
        ticket: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
        user: {
            upsert: jest.fn().mockResolvedValue({ id: 'test-user-id' }),
            findFirst: jest.fn().mockResolvedValue({ id: 'test-user-id' }),
        },
    };

    const mockSettings = {
        getValue: jest.fn().mockResolvedValue(null),
    };

    const mockBusinessHours = {
        calculateDeadline: jest.fn().mockImplementation((from: Date, hours: number) => {
            const result = new Date(from);
            result.setHours(result.getHours() + hours);
            return Promise.resolve(result);
        }),
    };

    const mockPiiMasking = {
        maskSensitiveData: jest.fn((text) => text),
    };

    const mockEventEmitter = {
        emitAsync: jest.fn().mockResolvedValue([]),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TicketsService,
                SlaService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: SettingsService, useValue: mockSettings },
                { provide: BusinessHoursService, useValue: mockBusinessHours },
                { provide: PiiMaskingService, useValue: mockPiiMasking },
                { provide: EventEmitter2, useValue: mockEventEmitter },
                { provide: AiQueryService, useValue: {} },
                { provide: RedisService, useValue: {} },
                { provide: TicketAccessService, useValue: {} },
                MaintenanceWorkService,
            ],
        }).compile();

        ticketsService = module.get<TicketsService>(TicketsService);
        slaService = module.get<SlaService>(SlaService);

        jest.clearAllMocks();
        mockPrisma.ticket.create.mockImplementation(({ data }) => Promise.resolve({ id: 'ticket-1', ...data }));
    });

    describe('SlaService.calculateDeadlines', () => {
        it('should calculate deadlines correctly for MEDIUM priority', async () => {
            const deadlines = await slaService.calculateDeadlines(TicketPriority.MEDIUM);

            expect(deadlines.slaResponseDue).toBeInstanceOf(Date);
            expect(deadlines.slaResolveDue).toBeInstanceOf(Date);
            expect(deadlines.slaResolveDue.getTime()).toBeGreaterThan(deadlines.slaResponseDue.getTime());
        });

        it('should calculate deadlines correctly for URGENT priority', async () => {
            const deadlines = await slaService.calculateDeadlines(TicketPriority.URGENT);

            expect(deadlines.slaResponseDue).toBeInstanceOf(Date);
            expect(deadlines.slaResolveDue).toBeInstanceOf(Date);
            expect(deadlines.slaResolveDue.getTime()).toBeGreaterThan(deadlines.slaResponseDue.getTime());
        });

        it('should calculate deadlines correctly for LOW priority', async () => {
            const deadlines = await slaService.calculateDeadlines(TicketPriority.LOW);

            expect(deadlines.slaResponseDue).toBeInstanceOf(Date);
            expect(deadlines.slaResolveDue).toBeInstanceOf(Date);
            expect(deadlines.slaResolveDue.getTime()).toBeGreaterThan(deadlines.slaResponseDue.getTime());
        });

        it('should return future dates for all priorities', async () => {
            const now = Date.now();

            const [low, medium, high, urgent] = await Promise.all([
                slaService.calculateDeadlines(TicketPriority.LOW),
                slaService.calculateDeadlines(TicketPriority.MEDIUM),
                slaService.calculateDeadlines(TicketPriority.HIGH),
                slaService.calculateDeadlines(TicketPriority.URGENT),
            ]);

            expect(low.slaResponseDue.getTime()).toBeGreaterThan(now);
            expect(low.slaResolveDue.getTime()).toBeGreaterThan(now);
            expect(medium.slaResponseDue.getTime()).toBeGreaterThan(now);
            expect(high.slaResponseDue.getTime()).toBeGreaterThan(now);
            expect(urgent.slaResponseDue.getTime()).toBeGreaterThan(now);
        });
    });

    describe('Ticket Creation with SLA', () => {
        const testUserId = 'test-user-id';

        it('should create ticket with SLA deadlines for MEDIUM priority', async () => {
            const result = await ticketsService.create(
                {
                    subject: 'Test Ticket',
                    description: 'Test description',
                    priority: TicketPriority.MEDIUM,
                },
                testUserId
            );

            expect(result).toBeDefined();
            expect(result.slaResponseDue).toBeDefined();
            expect(result.slaResolveDue).toBeDefined();
            expect(result.priority).toBe(TicketPriority.MEDIUM);
            expect(result.status).toBe(TicketStatus.NEW);
            expect(mockPrisma.ticket.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    slaResponseDue: result.slaResponseDue,
                    slaResolveDue: result.slaResolveDue,
                }),
            }));
        });

        it('should create ticket with stricter SLA for URGENT priority', async () => {
            const result = await ticketsService.create(
                {
                    subject: 'Urgent Ticket',
                    priority: TicketPriority.URGENT,
                },
                testUserId
            );

            expect(result.priority).toBe(TicketPriority.URGENT);
            expect(result.slaResponseDue!.getTime()).toBeLessThan(Date.now() + 2 * 60 * 60 * 1000);
            expect(mockBusinessHours.calculateDeadline).toHaveBeenCalledWith(expect.any(Date), 1);
            expect(mockBusinessHours.calculateDeadline).toHaveBeenCalledWith(expect.any(Date), 4);
        });

        it('should default to MEDIUM priority when not specified', async () => {
            const result = await ticketsService.create(
                { subject: 'No Priority' },
                testUserId
            );

            expect(result.priority).toBe(TicketPriority.MEDIUM);
        });

        it('should calculate different deadlines for different priorities', async () => {
            mockBusinessHours.calculateDeadline.mockImplementation((from: Date, hours: number) => {
                const result = new Date(from);
                result.setHours(result.getHours() + hours);
                return Promise.resolve(result);
            });

            const [low, medium, high, urgent] = await Promise.all([
                slaService.calculateDeadlines(TicketPriority.LOW),
                slaService.calculateDeadlines(TicketPriority.MEDIUM),
                slaService.calculateDeadlines(TicketPriority.HIGH),
                slaService.calculateDeadlines(TicketPriority.URGENT),
            ]);

            // Higher priority = earlier deadline
            expect(low.slaResponseDue!.getTime()).toBeGreaterThan(medium.slaResponseDue!.getTime());
            expect(medium.slaResponseDue!.getTime()).toBeGreaterThan(high.slaResponseDue!.getTime());
            expect(high.slaResponseDue!.getTime()).toBeGreaterThan(urgent.slaResponseDue!.getTime());
        });
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SlaService } from '../sla.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../../settings/settings.service';
import { BusinessHoursService } from '../business-hours.service';
import { TicketPriority } from '@aluplan/database';

describe('SlaService', () => {
    let service: SlaService;
    let prisma: any;
    let settings: any;
    let businessHours: any;

    beforeEach(async () => {
        prisma = {
            slaPolicy: {
                findFirst: jest.fn(),
            },
            ticket: {
                findUnique: jest.fn(),
                findUniqueOrThrow: jest.fn(),
                update: jest.fn(),
            },
            ticketEscalation: {
                create: jest.fn(),
            },
            $transaction: jest.fn((ops) => Promise.all(ops)),
        };
        // Alias findUniqueOrThrow to findUnique for breach checks unless overridden
        prisma.ticket.findUniqueOrThrow.mockImplementation((args: any) => {
            return prisma.ticket.findUnique(args);
        });

        settings = {
            getValue: jest.fn(),
        };

        businessHours = {
            calculateDeadline: jest.fn((from: Date, hours: number) =>
                Promise.resolve(new Date(from.getTime() + hours * 60 * 60 * 1000)),
            ),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SlaService,
                { provide: PrismaService, useValue: prisma },
                { provide: SettingsService, useValue: settings },
                { provide: BusinessHoursService, useValue: businessHours },
            ],
        }).compile();

        service = module.get<SlaService>(SlaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('calculateDeadlines', () => {
        it('should use department-specific SLA policy when available', async () => {
            const policy = { firstResponseMinutes: 120, resolutionMinutes: 480 };
            prisma.slaPolicy.findFirst.mockResolvedValueOnce(policy);

            const result = await service.calculateDeadlines(TicketPriority.HIGH, 'dept-1');

            expect(prisma.slaPolicy.findFirst).toHaveBeenCalledWith({
                where: { priority: TicketPriority.HIGH, departmentId: 'dept-1' },
            });
            expect(businessHours.calculateDeadline).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                slaResponseDue: expect.any(Date),
                slaResolveDue: expect.any(Date),
            });
        });

        it('should fall back to general policy when no department policy', async () => {
            prisma.slaPolicy.findFirst.mockResolvedValue({ firstResponseMinutes: 240, resolutionMinutes: 720 });

            const result = await service.calculateDeadlines(TicketPriority.MEDIUM);

            // When no departmentId provided, only 1 call to findFirst (general policy)
            expect(prisma.slaPolicy.findFirst).toHaveBeenCalledTimes(1);
            expect(prisma.slaPolicy.findFirst).toHaveBeenCalledWith({
                where: { priority: TicketPriority.MEDIUM },
            });
            expect(result).toBeDefined();
        });

        it('should fall back to settings when no policy exists', async () => {
            prisma.slaPolicy.findFirst.mockResolvedValue(null);
            settings.getValue
                .mockResolvedValueOnce('6')
                .mockResolvedValueOnce('12');

            const result = await service.calculateDeadlines(TicketPriority.LOW);

            expect(settings.getValue).toHaveBeenCalledWith('sla.low.response_hours');
            expect(settings.getValue).toHaveBeenCalledWith('sla.low.resolve_hours');
            expect(businessHours.calculateDeadline).toHaveBeenCalledWith(expect.any(Date), 6);
            expect(businessHours.calculateDeadline).toHaveBeenCalledWith(expect.any(Date), 12);
        });

        it('should use defaults when nothing configured', async () => {
            prisma.slaPolicy.findFirst.mockResolvedValue(null);
            settings.getValue.mockResolvedValue(null);

            const result = await service.calculateDeadlines(TicketPriority.URGENT);

            // URGENT default: response 1h, resolve 4h
            expect(businessHours.calculateDeadline).toHaveBeenCalledWith(expect.any(Date), 1);
            expect(businessHours.calculateDeadline).toHaveBeenCalledWith(expect.any(Date), 4);
        });
    });

    describe('recalculateOnEscalation', () => {
        it('should keep original response due if already responded', async () => {
            const respondedAt = new Date('2024-01-01T10:00:00Z');
            const originalResponseDue = new Date('2024-01-01T14:00:00Z');
            prisma.ticket.findUniqueOrThrow.mockResolvedValue({
                slaRespondedAt: respondedAt,
                slaResponseDue: originalResponseDue,
            });
            prisma.slaPolicy.findFirst.mockResolvedValue({ firstResponseMinutes: 60, resolutionMinutes: 240 });

            const result = await service.recalculateOnEscalation('ticket-1', TicketPriority.HIGH);

            expect(result.slaResponseDue).toEqual(originalResponseDue);
            expect(businessHours.calculateDeadline).toHaveBeenCalledTimes(1); // only resolve
        });

        it('should recalculate both deadlines if not yet responded', async () => {
            prisma.ticket.findUniqueOrThrow.mockResolvedValue({
                slaRespondedAt: null,
                slaResponseDue: null,
            });
            prisma.slaPolicy.findFirst.mockResolvedValue({ firstResponseMinutes: 60, resolutionMinutes: 240 });

            const result = await service.recalculateOnEscalation('ticket-1', TicketPriority.HIGH);

            expect(businessHours.calculateDeadline).toHaveBeenCalledTimes(2);
        });
    });

    describe('checkAndMarkBreach', () => {
        it('should return false if ticket already breached', async () => {
            prisma.ticket.findUnique.mockResolvedValue({ isSlaBreached: true });
            const result = await service.checkAndMarkBreach('ticket-1');
            expect(result).toBe(false);
        });

        it('should return false if ticket not found', async () => {
            prisma.ticket.findUnique.mockResolvedValue(null);
            const result = await service.checkAndMarkBreach('ticket-1');
            expect(result).toBe(false);
        });

        it('should escalate and return true on resolve deadline breach', async () => {
            const past = new Date(Date.now() - 3600_000);
            prisma.ticket.findUnique.mockResolvedValue({
                id: 'ticket-1',
                ticketNumber: 'SUP-00001',
                isSlaBreached: false,
                slaResponseDue: null,
                slaResolveDue: past,
                slaRespondedAt: new Date(),
                priority: TicketPriority.MEDIUM,
                escalated: false,
            });

            const result = await service.checkAndMarkBreach('ticket-1');
            expect(result).toBe(true);
            expect(prisma.$transaction).toHaveBeenCalled();
        });

        it('should escalate and return true on response deadline breach', async () => {
            const past = new Date(Date.now() - 3600_000);
            prisma.ticket.findUnique.mockResolvedValue({
                id: 'ticket-1',
                ticketNumber: 'SUP-00002',
                isSlaBreached: false,
                slaResponseDue: past,
                slaResolveDue: new Date(Date.now() + 3600_000),
                slaRespondedAt: null,
                priority: TicketPriority.MEDIUM,
                escalated: false,
            });

            const result = await service.checkAndMarkBreach('ticket-1');
            expect(result).toBe(true);
        });

        it('should return false if no deadline breached', async () => {
            const future = new Date(Date.now() + 3600_000);
            prisma.ticket.findUnique.mockResolvedValue({
                id: 'ticket-1',
                isSlaBreached: false,
                slaResponseDue: future,
                slaResolveDue: future,
                slaRespondedAt: null,
            });

            const result = await service.checkAndMarkBreach('ticket-1');
            expect(result).toBe(false);
            expect(prisma.$transaction).not.toHaveBeenCalled();
        });
    });

    describe('escalateTicket', () => {
        it('should escalate ticket to URGENT and create escalation record', async () => {
            prisma.ticket.findUniqueOrThrow.mockResolvedValue({
                id: 'ticket-1',
                priority: TicketPriority.HIGH,
                escalated: false,
            });

            await service.escalateTicket('ticket-1', 'Manual escalation');

            expect(prisma.$transaction).toHaveBeenCalled();
            expect(prisma.ticket.update).toHaveBeenCalledWith({
                where: { id: 'ticket-1' },
                data: {
                    priority: TicketPriority.URGENT,
                    escalated: true,
                    escalationCount: { increment: 1 },
                },
            });
            expect(prisma.ticketEscalation.create).toHaveBeenCalledWith({
                data: {
                    ticketId: 'ticket-1',
                    fromPriority: TicketPriority.HIGH,
                    toPriority: TicketPriority.URGENT,
                    reason: 'Manual escalation',
                },
            });
        });

        it('should not escalate if already URGENT and escalated', async () => {
            prisma.ticket.findUniqueOrThrow.mockResolvedValue({
                priority: TicketPriority.URGENT,
                escalated: true,
            });

            await service.escalateTicket('ticket-1', 'Duplicate escalation');

            expect(prisma.$transaction).not.toHaveBeenCalled();
        });
    });
});

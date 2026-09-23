import { Test, TestingModule } from '@nestjs/testing';
import { EmailInboundService } from './email-inbound.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { TicketsService } from '../tickets/tickets.service';
import { StorageService } from '../common/services/storage.service';
import { PiiMaskingService } from '../common/services/pii-masking.service';

describe('EmailInboundService', () => {
    let service: EmailInboundService;
    let prismaService: PrismaService;
    let ticketsService: TicketsService;

    const mockPrismaService = {
        inboundEmailLog: {
            findUnique: jest.fn(),
            create: jest.fn(),
            updateMany: jest.fn(),
        },
        ticket: {
            findUnique: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        role: {
            findFirst: jest.fn().mockResolvedValue({ id: 'role-1', name: 'CUSTOMER' }),
        },
        ticketMessage: {
            create: jest.fn().mockResolvedValue({ id: 'msg-1' }),
        },
        attachment: {
            create: jest.fn().mockResolvedValue({ id: 'att-1' }),
        },
    };

    const mockSettingsService = {
        get: jest.fn(),
    };

    const mockTicketsService = {
        addMessage: jest.fn().mockResolvedValue({ id: 'msg-1' }),
        create: jest.fn(),
    };

    const mockStorageService = {
        uploadFile: jest.fn(),
    };

    const mockPiiMaskingService = {
        maskSensitiveData: jest.fn((text) => text),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailInboundService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: TicketsService, useValue: mockTicketsService },
                { provide: StorageService, useValue: mockStorageService },
                { provide: PiiMaskingService, useValue: mockPiiMaskingService },
            ],
        }).compile();

        service = module.get<EmailInboundService>(EmailInboundService);
        prismaService = module.get<PrismaService>(PrismaService);
        ticketsService = module.get<TicketsService>(TicketsService);

        jest.clearAllMocks();
        mockPrismaService.inboundEmailLog.updateMany.mockResolvedValue({ count: 1 });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Ticket Tag Regex Matching', () => {
        it('should extract SUP-12345 from standard subject and call addMessage', async () => {
            // Mock the log creation
            mockPrismaService.inboundEmailLog.findUnique.mockResolvedValue(null);
            mockPrismaService.inboundEmailLog.create.mockImplementation(async ({ data }) => ({ id: 'log-1', ...data }));

            // Mock finding a ticket with SUP-12345
            mockPrismaService.ticket.findUnique.mockImplementation(({ where }) => {
                if (where.ticketNumber === 'SUP-12345') {
                    return Promise.resolve({ id: 'ticket-1', ticketNumber: 'SUP-12345', userId: 'user-2' });
                }
                return Promise.resolve(null);
            });

            // Mock finding the sender
            mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-2', email: 'customer@example.com', status: 'ACTIVE', deletedAt: null, role: { name: 'CUSTOMER' } });

            const mockMail = {
                from: { value: [{ address: 'customer@example.com' }] },
                subject: 'Re: 🚨 [SUP-12345] Yanıt SLA İhlali',
                text: 'This is a reply to the ticket.',
            };

            await (service as any).processMail(mockMail, 'msg-123');

            expect(mockPrismaService.ticket.findUnique).toHaveBeenCalledWith({ where: { ticketNumber: 'SUP-12345' } });
            expect(mockTicketsService.addMessage).toHaveBeenCalledWith(
                'ticket-1',
                { message: 'This is a reply to the ticket.', isInternal: false, channel: 'EMAIL' },
                'user-2',
                'CUSTOMER'
            );
        });

        it('should create a new ticket for an eligible existing account if no correct SUP tag is found', async () => {
            mockPrismaService.inboundEmailLog.findUnique.mockResolvedValue(null);
            mockPrismaService.inboundEmailLog.create.mockImplementation(async ({ data }) => ({ id: 'log-2', ...data }));

            mockPrismaService.user.findUnique.mockResolvedValue({ id: 'new-user-1', email: 'new@example.com', status: 'ACTIVE', deletedAt: null, role: { name: 'CUSTOMER' } });

            mockTicketsService.create.mockResolvedValue({ id: 'new-ticket-1' });

            const mockMail = {
                from: { value: [{ address: 'new@example.com' }] },
                subject: 'Need help with login',
                text: 'I cannot login to my account.',
            };

            await (service as any).processMail(mockMail, 'msg-124');

            expect(mockPrismaService.ticket.findUnique).not.toHaveBeenCalled();
            expect(mockPrismaService.user.create).not.toHaveBeenCalled();
            expect(mockTicketsService.create).toHaveBeenCalledWith(
                { subject: 'Need help with login', description: 'I cannot login to my account.', priority: 'MEDIUM' },
                'new-user-1'
            );
        });

        it('should ignore delivery status notifications without creating a ticket', async () => {
            mockPrismaService.inboundEmailLog.findUnique.mockResolvedValue(null);
            mockPrismaService.inboundEmailLog.create.mockImplementation(async ({ data }) => ({ id: 'log-bounce', ...data }));

            const mockMail = {
                from: { value: [{ address: 'MAILER-DAEMON@mail.allplan.net.tr' }] },
                subject: 'Undelivered Mail Returned to Sender',
                text: [
                    'This is the mail system at host mail.allplan.net.tr.',
                    'Reporting-MTA: dns; mail.allplan.net.tr',
                    'Final-Recipient: rfc822; admin@example.com',
                    'Action: failed',
                    'Status: 5.1.0',
                    'Diagnostic-Code: X-Postfix; Domain example.com does not accept mail (nullMX)',
                ].join('\n'),
                headers: new Map([['content-type', 'multipart/report; report-type=delivery-status']]),
            };

            await (service as any).processMail(mockMail, 'msg-bounce');

            expect(mockTicketsService.create).not.toHaveBeenCalled();
            expect(mockTicketsService.addMessage).not.toHaveBeenCalled();
            expect(mockPrismaService.user.create).not.toHaveBeenCalled();
            expect(mockPrismaService.inboundEmailLog.updateMany).toHaveBeenCalledWith({
                where: expect.objectContaining({ id: 'log-bounce', processed: false }),
                data: expect.objectContaining({
                    processed: true,
                    error: expect.stringContaining('IGNORED_DSN'),
                }),
            });
        });
    });
});

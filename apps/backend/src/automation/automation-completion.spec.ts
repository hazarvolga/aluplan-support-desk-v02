import { AutomationService } from './automation.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { TicketStatus } from '@aluplan/database';
import { Logger } from '@nestjs/common';
import { verifyCsatFeedbackToken } from '../tickets/csat-feedback-token';

const testConfig = {
    get: () => 'https://example.invalid',
    getOrThrow: () => 'synthetic-csat-secret',
} as unknown as ConfigService;

jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('./audit.service', () => ({ AuditService: class {} }));
jest.mock('../email/email.service', () => ({ EmailService: class {} }));

// Direct handler completion only; EventEmitter dispatch and shutdown are not joined here.
describe('Automation email child completion', () => {
    const methods = ['sendNewMessage', 'sendTicketCreated', 'sendNewTicketToStaff',
        'sendTicketStatusChanged', 'sendTicketResolved', 'sendCsatSurvey',
        'sendWelcomeCustomer', 'sendSecurityAlert', 'sendTwoFactorAuth', 'sendSlaBreachWarning'] as const;
    it('still attempts staff notification when customer enqueue fails', async () => {
        const errorLog = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
        const email = { sendTicketCreated: jest.fn().mockRejectedValue(new Error('sensitive-synthetic')),
            sendNewTicketToStaff: jest.fn().mockResolvedValue(undefined) };
        const service = new AutomationService(
            { user: { findMany: async () => [{ email: 'staff@example.invalid' }] } } as unknown as PrismaService,
            { log: async () => undefined } as unknown as AuditService,
            email as unknown as EmailService,
            testConfig,
        );
        try {
            await expect(service.handleTicketCreated({ id: 'synthetic', creator: { email: 'customer@example.invalid' },
                createdAt: new Date(0) })).resolves.toBeUndefined();
            expect(email.sendNewTicketToStaff).toHaveBeenCalledTimes(1);
            expect(errorLog).toHaveBeenCalledWith('Failed to enqueue ticket creation email');
        } finally { errorLog.mockRestore(); }
    });
    it.each(['sendTicketResolved', 'sendCsatSurvey'] as const)(
        'handles rejected %s without losing subsequent notification attempts', async (failed) => {
            const errorLog = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
            const email = {
                sendTicketStatusChanged: jest.fn().mockResolvedValue(undefined),
                sendTicketResolved: jest.fn().mockResolvedValue(undefined),
                sendCsatSurvey: jest.fn().mockResolvedValue(undefined),
            };
            email[failed].mockRejectedValue(new Error('synthetic-sensitive-error-do-not-log'));
            const ticketId = 'bfaa5692-5b7d-40fb-94fd-b6ac12abaaff';
            const service = new AutomationService(
                { ticket: { findUnique: async () => ({ id: ticketId, creator: { email: 'customer@example.invalid' } }) } } as unknown as PrismaService,
                { log: async () => undefined } as unknown as AuditService,
                email as unknown as EmailService,
                testConfig,
            );
            try {
                await expect(service.handleStatusChange({ ticketId, oldStatus: TicketStatus.NEW,
                    newStatus: TicketStatus.RESOLVED })).resolves.toBeUndefined();
                expect(email.sendTicketStatusChanged).toHaveBeenCalledTimes(1);
                expect(email.sendTicketResolved).toHaveBeenCalledTimes(1);
                expect(email.sendCsatSurvey).toHaveBeenCalledTimes(1);
                expect(errorLog).toHaveBeenCalledTimes(1);
                expect(JSON.stringify(errorLog.mock.calls)).not.toContain('synthetic-sensitive-error');
            } finally { errorLog.mockRestore(); }
        },
    );
    it.each(methods)('keeps handler pending until %s finishes enqueueing', async (method) => {
        let release!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        const email = Object.fromEntries(methods.map(name => [name, jest.fn().mockResolvedValue(undefined)]));
        email[method].mockImplementation(() => gate);
        const ticket = { id: 'bfaa5692-5b7d-40fb-94fd-b6ac12abaaff', ticketNumber: 'TEST-1', subject: 'Synthetic',
            creator: { email: 'customer@example.invalid' }, createdAt: new Date(0), priority: 'LOW' };
        const service = new AutomationService(
            { ticket: { findUnique: async () => ticket }, user: { findMany: async () => [{ email: 'staff@example.invalid' }] } } as unknown as PrismaService,
            { log: async () => undefined } as unknown as AuditService,
            email as unknown as EmailService,
            testConfig,
        );
        const calls: Record<typeof methods[number], () => Promise<void>> = {
            sendNewMessage: () => service.handleMessageAdded({ ticket, message: { isInternal: false, channel: 'EMAIL' }, recipientEmail: 'customer@example.invalid' }),
            sendTicketCreated: () => service.handleTicketCreated(ticket),
            sendNewTicketToStaff: () => service.handleTicketCreated(ticket),
            sendTicketStatusChanged: () => service.handleStatusChange({ ticketId: ticket.id, oldStatus: TicketStatus.NEW, newStatus: TicketStatus.RESOLVED }),
            sendTicketResolved: () => service.handleStatusChange({ ticketId: ticket.id, oldStatus: TicketStatus.NEW, newStatus: TicketStatus.RESOLVED }),
            sendCsatSurvey: () => service.handleStatusChange({ ticketId: ticket.id, oldStatus: TicketStatus.NEW, newStatus: TicketStatus.RESOLVED }),
            sendWelcomeCustomer: () => service.handleUserCreated(ticket.creator),
            sendSecurityAlert: () => service.handleSecurityAlert({ email: 'customer@example.invalid', location: 'Synthetic', ipValue: '127.0.0.1' }),
            sendTwoFactorAuth: () => service.handle2faRequested({ email: 'customer@example.invalid', code: 'synthetic-only' }),
            sendSlaBreachWarning: () => service.handleSlaWarning({ agentEmail: 'staff@example.invalid', ticketNumber: 'TEST-1', subject: 'Synthetic', timeLeft: '1', breachType: 'response' }),
        };
        let completed = false;
        const running = calls[method]().then(() => { completed = true; });
        try {
            await new Promise<void>(resolve => setImmediate(resolve));
            expect(email[method]).toHaveBeenCalledTimes(1);
            expect(completed).toBe(false);
        } finally {
            release();
            await running;
        }
        expect(completed).toBe(true);
    });

    it('sends a signed, expiring feedback URL to the customer-facing survey emails', async () => {
        const ticket = {
            id: 'bfaa5692-5b7d-40fb-94fd-b6ac12abaaff',
            ticketNumber: 'SUP-SYNTHETIC',
            subject: 'Synthetic request',
            priority: 'MEDIUM',
            creator: { email: 'customer@example.invalid' },
        };
        const email = {
            sendTicketStatusChanged: jest.fn().mockResolvedValue(undefined),
            sendTicketResolved: jest.fn().mockResolvedValue(undefined),
            sendCsatSurvey: jest.fn().mockResolvedValue(undefined),
        };
        const service = new AutomationService(
            { ticket: { findUnique: async () => ticket } } as unknown as PrismaService,
            { log: async () => undefined } as unknown as AuditService,
            email as unknown as EmailService,
            testConfig,
        );

        await service.handleStatusChange({ ticketId: ticket.id, oldStatus: TicketStatus.NEW, newStatus: TicketStatus.RESOLVED });

        const emailSurveyUrl = email.sendCsatSurvey.mock.calls[0][0].surveyUrl as string;
        const parsedUrl = new URL(emailSurveyUrl);
        const token = parsedUrl.pathname.split('/').at(-1)!;
        expect(parsedUrl.origin).toBe('https://example.invalid');
        expect(parsedUrl.pathname).toMatch(/^\/tr\/feedback\/v1\./);
        expect(verifyCsatFeedbackToken(token, 'synthetic-csat-secret')).toBe(ticket.id);
        expect(email.sendTicketResolved.mock.calls[0][0]).not.toHaveProperty('surveyUrl');
    });

    it('does not send a second survey after a ticket has already been rated and reopened', async () => {
        const ticket = {
            id: 'bfaa5692-5b7d-40fb-94fd-b6ac12abaaff',
            ticketNumber: 'SUP-SYNTHETIC',
            subject: 'Synthetic request',
            priority: 'MEDIUM',
            satisfactionScore: 5,
            creator: { email: 'customer@example.invalid' },
        };
        const email = {
            sendTicketStatusChanged: jest.fn().mockResolvedValue(undefined),
            sendTicketResolved: jest.fn().mockResolvedValue(undefined),
            sendCsatSurvey: jest.fn().mockResolvedValue(undefined),
        };
        const service = new AutomationService(
            { ticket: { findUnique: async () => ticket } } as unknown as PrismaService,
            { log: async () => undefined } as unknown as AuditService,
            email as unknown as EmailService,
            testConfig,
        );

        await service.handleStatusChange({ ticketId: ticket.id, oldStatus: TicketStatus.OPEN, newStatus: TicketStatus.RESOLVED });

        expect(email.sendTicketResolved).toHaveBeenCalledTimes(1);
        expect(email.sendCsatSurvey).not.toHaveBeenCalled();
    });
});

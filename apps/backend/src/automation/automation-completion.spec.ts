import { AutomationService } from './automation.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { TicketStatus } from '@aluplan/database';
import { Logger } from '@nestjs/common';

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
            { get: () => 'https://example.invalid' } as unknown as ConfigService,
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
            const service = new AutomationService(
                { ticket: { findUnique: async () => ({ id: 'synthetic', creator: { email: 'customer@example.invalid' } }) } } as unknown as PrismaService,
                { log: async () => undefined } as unknown as AuditService,
                email as unknown as EmailService,
                { get: () => 'https://example.invalid' } as unknown as ConfigService,
            );
            try {
                await expect(service.handleStatusChange({ ticketId: 'synthetic', oldStatus: TicketStatus.NEW,
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
        const ticket = { id: 'synthetic-ticket', ticketNumber: 'TEST-1', subject: 'Synthetic',
            creator: { email: 'customer@example.invalid' }, createdAt: new Date(0), priority: 'LOW' };
        const service = new AutomationService(
            { ticket: { findUnique: async () => ticket }, user: { findMany: async () => [{ email: 'staff@example.invalid' }] } } as unknown as PrismaService,
            { log: async () => undefined } as unknown as AuditService,
            email as unknown as EmailService,
            { get: () => 'https://example.invalid' } as unknown as ConfigService,
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
});

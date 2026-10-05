import { ConfigService } from '@nestjs/config';
import { AutomationService } from './automation.service';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

describe('AutomationService message notification visibility', () => {
    const email = { sendNewMessage: jest.fn().mockResolvedValue(undefined) };
    const config = { get: jest.fn().mockReturnValue('http://localhost:3000') };
    const service = new AutomationService(
        {} as PrismaService,
        {} as AuditService,
        email as unknown as EmailService,
        config as unknown as ConfigService,
    );
    const publicEvent = {
        ticket: { id: 'ticket-1', ticketNumber: 'SUP-TEST' },
        message: {
            id: 'message-1',
            channel: 'WEB',
            message: 'Support reply',
            isInternal: false,
        },
        recipientEmail: 'customer@example.test',
        userName: 'Test customer',
    };

    beforeEach(() => jest.clearAllMocks());

    it('never queues an internal note for the customer, even when a recipient was supplied', async () => {
        await service.handleMessageAdded({
            ...publicEvent,
            message: { ...publicEvent.message, message: 'Staff-only note', isInternal: true },
        });

        expect(email.sendNewMessage).not.toHaveBeenCalled();
    });

    it.each([undefined, null, 'false', 'true', 0])(
        'fails closed when message visibility is not an explicit public boolean: %p',
        async (isInternal) => {
            await service.handleMessageAdded({
                ...publicEvent,
                message: { ...publicEvent.message, isInternal },
            });

            expect(email.sendNewMessage).not.toHaveBeenCalled();
        },
    );

    it('keeps the delayed email notification for an explicitly public web reply', async () => {
        await service.handleMessageAdded(publicEvent);

        expect(email.sendNewMessage).toHaveBeenCalledTimes(1);
        expect(email.sendNewMessage).toHaveBeenCalledWith({
            recipientEmail: 'customer@example.test',
            userName: 'Test customer',
            ticketId: 'SUP-TEST',
            ticketNumber: 'SUP-TEST',
            latestMessage: 'Support reply',
            ticketUrl: 'http://localhost:3000/tickets/ticket-1',
        }, { delay: 60000, jobId: 'email-ntf-msg-message-1' });
    });

    it('keeps the immediate notification for an explicitly public non-web reply', async () => {
        await service.handleMessageAdded({
            ...publicEvent,
            message: { ...publicEvent.message, channel: 'EMAIL' },
        });

        expect(email.sendNewMessage).toHaveBeenCalledTimes(1);
        expect(email.sendNewMessage).toHaveBeenCalledWith(
            expect.objectContaining({ latestMessage: 'Support reply' }),
            undefined,
        );
    });

    it('does not queue a public reply without a notification recipient', async () => {
        await service.handleMessageAdded({ ...publicEvent, recipientEmail: undefined });

        expect(email.sendNewMessage).not.toHaveBeenCalled();
    });

    it('uses the selected licensing category and does not invent a missing ticket type in the receipt email', async () => {
        const sendTicketCreated = jest.fn().mockResolvedValue(undefined);
        const sendNewTicketToStaff = jest.fn().mockResolvedValue(undefined);
        const serviceWithTicketEmail = new AutomationService(
            { user: { findMany: jest.fn().mockResolvedValue([{ email: 'support@example.test' }]) } } as unknown as PrismaService,
            { log: jest.fn().mockResolvedValue(undefined) } as unknown as AuditService,
            { sendTicketCreated, sendNewTicketToStaff } as unknown as EmailService,
            { get: jest.fn().mockReturnValue('http://localhost:3000') } as unknown as ConfigService,
        );

        await serviceWithTicketEmail.handleTicketCreated({
            id: 'bfaa5692-5b7d-40fb-94fd-b6ac12abaaff',
            ticketNumber: 'SUP-TEST',
            subject: 'Synthetic ticket',
            priority: 'MEDIUM',
            status: 'NEW',
            tags: ['licensing'],
            department: { name: 'Billing & Payments' },
            creator: { email: 'customer@example.test', fullName: 'Test Customer' },
            createdAt: new Date(0),
        });

        expect(sendTicketCreated).toHaveBeenCalledWith(expect.objectContaining({
            ticketCategory: 'Lisans ve Aktivasyon',
            ticketType: undefined,
        }));
        expect(sendNewTicketToStaff).toHaveBeenCalledWith('support@example.test', expect.objectContaining({
            ticketCategory: 'Lisans ve Aktivasyon',
            ticketType: undefined,
        }));
    });
});

import { Logger } from '@nestjs/common';
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { EmailInboundService } from './email-inbound.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { TicketsService } from '../tickets/tickets.service';
import { StorageService } from '../common/services/storage.service';
import { PiiMaskingService } from '../common/services/pii-masking.service';

jest.mock('imap-simple', () => ({ __esModule: true, default: { connect: jest.fn() } }));
jest.mock('mailparser', () => ({ simpleParser: jest.fn() }));
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('../settings/settings.service', () => ({ SettingsService: class {} }));
jest.mock('../tickets/tickets.service', () => ({ TicketsService: class {} }));
jest.mock('../common/services/storage.service', () => ({ StorageService: class {} }));
jest.mock('../common/services/pii-masking.service', () => ({ PiiMaskingService: class {} }));
jest.mock('@aluplan/database', () => ({ CommunicationChannel: { EMAIL: 'EMAIL' } }));

const mailFixture = (threaded: boolean, count = 2) => ({
    from: { value: [{ address: 'synthetic-customer@example.invalid' }] },
    subject: threaded ? 'Reply [SUP-123]' : 'Synthetic request',
    text: 'synthetic body',
    attachments: Array.from({ length: count }, (_, i) => ({ filename: `private-name-${i}.txt`, content: Buffer.from('private content'), contentType: 'text/plain', size: 15 })),
});

describe.each([true, false])('inbound attachment durability, threaded=%s', (threaded) => {
    const prisma = {
        inboundEmailLog: { findUnique: jest.fn(), upsert: jest.fn(), update: jest.fn() },
        ticket: { findUnique: jest.fn() },
        user: { findUnique: jest.fn() },
        attachment: { create: jest.fn() },
        ticketMessage: { create: jest.fn() },
    };
    const tickets = { addMessage: jest.fn(), create: jest.fn() };
    const storage = { uploadFile: jest.fn() };
    const connection = { openBox: jest.fn(), search: jest.fn(), end: jest.fn() };
    let service: EmailInboundService;
    let logError: jest.SpyInstance;
    beforeEach(() => {
        jest.resetAllMocks();
        logError = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
        prisma.inboundEmailLog.findUnique.mockResolvedValue(null);
        prisma.inboundEmailLog.upsert.mockResolvedValue({ id: 'inbound-fixture', error: 'stale-error' });
        prisma.inboundEmailLog.update.mockResolvedValue({});
        prisma.ticket.findUnique.mockResolvedValue({ id: 'ticket-fixture', userId: 'customer-fixture' });
        prisma.user.findUnique.mockResolvedValue({ id: 'customer-fixture', status: 'ACTIVE', deletedAt: null, role: { name: 'CUSTOMER' } });
        prisma.attachment.create.mockResolvedValue({ id: 'attachment-fixture' });
        prisma.ticketMessage.create.mockResolvedValue({ id: 'message-fixture' });
        tickets.addMessage.mockResolvedValue({ id: 'message-fixture' });
        tickets.create.mockResolvedValue({ id: 'ticket-fixture' });
        storage.uploadFile.mockResolvedValue('tickets/synthetic-object');
        connection.search.mockResolvedValue([{ attributes: { uid: 1 }, parts: [{ which: '', body: 'synthetic raw mail' }, { which: 'HEADER', body: { 'message-id': ['synthetic-message-id'] } }] }]);
        (imaps.connect as jest.Mock).mockResolvedValue(connection);
        (simpleParser as jest.Mock).mockResolvedValue(mailFixture(threaded));
        service = new EmailInboundService(
            prisma as unknown as PrismaService,
            { getValue: async (key: string) => key === 'email.imap.host' ? 'imap.example.invalid' : undefined } as unknown as SettingsService,
            tickets as unknown as TicketsService,
            storage as unknown as StorageService,
            { maskSensitiveData: (value: string) => value } as unknown as PiiMaskingService,
        );
    });
    afterEach(() => jest.restoreAllMocks());
    const savedData = () => prisma.inboundEmailLog.update.mock.calls.at(-1)?.[0].data;
    const expectFailureMarker = (count: number) => {
        expect(savedData()).toMatchObject({ processed: true, ticketId: 'ticket-fixture', error: `INBOUND_ATTACHMENT_FAILURE count=${count} ticketMessageId=message-fixture` });
        expect(savedData().processedAt).toBeInstanceOf(Date);
        expect(JSON.stringify(savedData())).not.toMatch(/private-name|example.invalid|provider-secret|private content/);
        expect(JSON.stringify(logError.mock.calls)).not.toMatch(/private-name|example.invalid|provider-secret|private content/);
    };
    it('records storage failure durably and continues the other attachment without replaying the message', async () => {
        storage.uploadFile.mockRejectedValueOnce(new Error('provider-secret'));
        await service.handleInboundEmails();
        expectFailureMarker(1);
        expect(storage.uploadFile).toHaveBeenCalledTimes(2);
        expect(prisma.attachment.create).toHaveBeenCalledTimes(1);
        expect(threaded ? tickets.addMessage : prisma.ticketMessage.create).toHaveBeenCalledTimes(1);
        expect(connection.end).toHaveBeenCalledTimes(1);
    });
    it('counts metadata failure independently after a successful object upload', async () => {
        prisma.attachment.create.mockRejectedValueOnce(new Error('provider-secret'));
        await service.handleInboundEmails();
        expectFailureMarker(1);
        expect(prisma.attachment.create).toHaveBeenCalledTimes(2);
    });
    it('reports the total count when both attachments fail', async () => {
        storage.uploadFile.mockRejectedValue(new Error('provider-secret'));
        await service.handleInboundEmails();
        expectFailureMarker(2);
        expect(prisma.attachment.create).not.toHaveBeenCalled();
    });
    it.each([0, 2])('clears stale errors when %s attachments complete successfully', async (count) => {
        (simpleParser as jest.Mock).mockResolvedValue(mailFixture(threaded, count));
        await service.handleInboundEmails();
        expect(savedData()).toMatchObject({ processed: true, error: null });
        expect(storage.uploadFile).toHaveBeenCalledTimes(count);
    });
    it('keeps an existing processed failure marker without recreating the ticket or message', async () => {
        prisma.inboundEmailLog.findUnique.mockResolvedValue({ processed: true, error: 'INBOUND_ATTACHMENT_FAILURE count=1 ticketMessageId=message-fixture' });
        await service.handleInboundEmails();
        expect(prisma.inboundEmailLog.update).not.toHaveBeenCalled();
        expect(prisma.inboundEmailLog.upsert).not.toHaveBeenCalled();
        expect(tickets.addMessage).not.toHaveBeenCalled();
        expect(tickets.create).not.toHaveBeenCalled();
        expect(prisma.ticketMessage.create).not.toHaveBeenCalled();
        expect(storage.uploadFile).not.toHaveBeenCalled();
    });
});

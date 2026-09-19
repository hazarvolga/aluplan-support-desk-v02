import { ForbiddenException, Logger } from '@nestjs/common';
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { EmailInboundService } from './email-inbound.service';
import { OmniChannelService } from '../omni-channel/omni-channel.service';
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

const eligible = { id: 'sender-fixture', status: 'ACTIVE', deletedAt: null, role: { name: 'CUSTOMER' } };
const ineligible = [
    ['unknown', null],
    ['inactive', { ...eligible, status: 'INACTIVE' }],
    ['suspended', { ...eligible, status: 'SUSPENDED' }],
    ['deleted', { ...eligible, deletedAt: new Date('2026-01-01') }],
    ['missing role', { ...eligible, role: null }],
    ['empty role', { ...eligible, role: { name: ' ' } }],
] as const;

describe.each(['imap', 'webhook'] as const)('%s sender eligibility boundary', (channel) => {
    const prisma = {
        inboundEmailLog: { findUnique: jest.fn(), upsert: jest.fn(), update: jest.fn() },
        ticket: { findUnique: jest.fn() }, user: { findUnique: jest.fn(), create: jest.fn() },
        role: { findFirst: jest.fn() }, ticketMessage: { create: jest.fn() }, attachment: { create: jest.fn() },
    };
    const tickets = { addMessage: jest.fn(), create: jest.fn() };
    const storage = { uploadFile: jest.fn() };
    let imap: EmailInboundService;
    let webhook: OmniChannelService;
    beforeEach(() => {
        jest.resetAllMocks();
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
        prisma.inboundEmailLog.findUnique.mockResolvedValue(null);
        prisma.inboundEmailLog.upsert.mockResolvedValue({ id: 'log-fixture' });
        prisma.ticket.findUnique.mockResolvedValue({ id: 'ticket-fixture', userId: 'sender-fixture' });
        prisma.user.findUnique.mockResolvedValue(eligible);
        prisma.user.create.mockResolvedValue({ id: 'provisioned-fixture' });
        prisma.role.findFirst.mockResolvedValue({ id: 'role-fixture' });
        prisma.ticketMessage.create.mockResolvedValue({ id: 'message-fixture' });
        tickets.addMessage.mockResolvedValue({ id: 'message-fixture' });
        tickets.create.mockResolvedValue({ id: 'ticket-fixture' });
        storage.uploadFile.mockResolvedValue('tickets/fixture');
        (imaps.connect as jest.Mock).mockResolvedValue({
            openBox: jest.fn(), end: jest.fn(),
            search: async () => [{ attributes: { uid: 1 }, parts: [{ which: '', body: 'synthetic raw email' }] }],
        });
        imap = new EmailInboundService(prisma as unknown as PrismaService,
            { getValue: async (key: string) => key === 'email.imap.host' ? 'imap.example.invalid' : undefined } as unknown as SettingsService,
            tickets as unknown as TicketsService, storage as unknown as StorageService,
            { maskSensitiveData: (text: string) => text } as unknown as PiiMaskingService);
        webhook = new OmniChannelService(prisma as unknown as PrismaService, tickets as unknown as TicketsService);
    });
    afterEach(() => jest.restoreAllMocks());
    const deliver = async (threaded: boolean) => {
        const payload = { from: 'sender@example.invalid', subject: threaded ? 'Reply [SUP-123]' : 'New request', text: 'Fixture body', messageId: 'fixture-email-id' };
        if (channel === 'webhook') return webhook.handleInboundEmailWebhook(payload);
        (simpleParser as jest.Mock).mockResolvedValue({ ...payload, from: { value: [{ address: payload.from }] }, attachments: [{ filename: 'fixture.txt', content: Buffer.from('fixture'), contentType: 'text/plain', size: 7 }] });
        return imap.handleInboundEmails();
    };
    describe.each([true, false])('threaded=%s', (threaded) => {
        it.each(ineligible)('rejects %s sender before domain writes', async (_name, sender) => {
            prisma.user.findUnique.mockResolvedValue(sender);
            await deliver(threaded);
            expect(prisma.inboundEmailLog.update).toHaveBeenCalledWith({ where: { id: 'log-fixture' }, data: { error: 'INBOUND_SENDER_NOT_ELIGIBLE' } });
            expect(tickets.addMessage).not.toHaveBeenCalled();
            expect(tickets.create).not.toHaveBeenCalled();
            expect(prisma.ticketMessage.create).not.toHaveBeenCalled();
            expect(prisma.attachment.create).not.toHaveBeenCalled();
            expect(prisma.user.create).not.toHaveBeenCalled();
            expect(storage.uploadFile).not.toHaveBeenCalled();
        });
        it('routes an eligible existing account without automatic provisioning', async () => {
            await deliver(threaded);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'sender@example.invalid' }, include: { role: true } });
            if (threaded) expect(tickets.addMessage).toHaveBeenCalledWith('ticket-fixture', expect.any(Object), 'sender-fixture', channel === 'imap' ? 'CUSTOMER' : 'customer');
            else expect(tickets.create).toHaveBeenCalledWith(expect.any(Object), 'sender-fixture');
            expect(prisma.user.create).not.toHaveBeenCalled();
            expect(prisma.inboundEmailLog.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ processed: true, ticketId: 'ticket-fixture' }) }));
        });
    });
    it('keeps downstream message authorization rejection observable without attachment writes', async () => {
        tickets.addMessage.mockRejectedValue(new ForbiddenException('Ticket access denied'));
        await deliver(true);
        expect(prisma.inboundEmailLog.update).toHaveBeenCalledWith({ where: { id: 'log-fixture' }, data: { error: 'Ticket access denied' } });
        expect(storage.uploadFile).not.toHaveBeenCalled();
        expect(prisma.attachment.create).not.toHaveBeenCalled();
    });
    it.each(['CUSTOMER', 'SUPERUSER'])('rejects a different ticket owner even when the sender account role is %s', async (role) => {
        prisma.user.findUnique.mockResolvedValue({ ...eligible, role: { name: role } });
        prisma.ticket.findUnique.mockResolvedValue({ id: 'ticket-fixture', userId: 'different-owner' });
        await deliver(true);
        expect(prisma.inboundEmailLog.update).toHaveBeenCalledWith({ where: { id: 'log-fixture' }, data: { error: 'INBOUND_TICKET_OWNER_MISMATCH' } });
        expect(tickets.addMessage).not.toHaveBeenCalled();
        expect(tickets.create).not.toHaveBeenCalled();
        expect(prisma.ticketMessage.create).not.toHaveBeenCalled();
        expect(prisma.attachment.create).not.toHaveBeenCalled();
        expect(storage.uploadFile).not.toHaveBeenCalled();
    });
    if (channel === 'imap') it('does not pass staff authority from an email From account', async () => {
        prisma.user.findUnique.mockResolvedValue({ ...eligible, role: { name: 'SUPERUSER' } });
        await deliver(true);
        expect(tickets.addMessage).toHaveBeenCalledWith('ticket-fixture', expect.any(Object), 'sender-fixture', 'CUSTOMER');
    });
    if (channel === 'webhook') it('does not elevate a staff account beyond the existing customer-only webhook policy', async () => {
        prisma.user.findUnique.mockResolvedValue({ ...eligible, role: { name: 'SUPERUSER' } });
        await deliver(true);
        expect(tickets.addMessage).toHaveBeenCalledWith('ticket-fixture', expect.any(Object), 'sender-fixture', 'customer');
    });
});

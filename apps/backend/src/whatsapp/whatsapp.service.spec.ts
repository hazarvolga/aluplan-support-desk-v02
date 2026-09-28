import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';

describe('WhatsAppService', () => {
    let service: WhatsAppService;
    let prisma: {
        customerProfile: { findFirst: jest.Mock; findUnique: jest.Mock };
        ticket: { findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
        ticketMessage: { create: jest.Mock };
    };
    let tickets: { create: jest.Mock; addMessage: jest.Mock };
    let settings: { getValue: jest.Mock };
    let config: { get: jest.Mock };

    beforeEach(async () => {
        prisma = {
            customerProfile: { findFirst: jest.fn(), findUnique: jest.fn() },
            ticket: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
            ticketMessage: { create: jest.fn() },
        };
        tickets = { create: jest.fn(), addMessage: jest.fn() };
        settings = { getValue: jest.fn() };
        config = { get: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WhatsAppService,
                { provide: PrismaService, useValue: prisma },
                { provide: TicketsService, useValue: tickets },
                { provide: ConfigService, useValue: config },
                { provide: SettingsService, useValue: settings },
            ],
        }).compile();

        service = module.get<WhatsAppService>(WhatsAppService);
    });

    describe('handleIncoming - Input Validation & Rejection', () => {
        it('returns no_message when payload has no message entry', async () => {
            const result = await service.handleIncoming({ entry: [] });
            expect(result).toEqual({ status: 'no_message' });
            expect(prisma.customerProfile.findFirst).not.toHaveBeenCalled();
            expect(prisma.ticket.findFirst).not.toHaveBeenCalled();
        });

        it('returns no_message for an empty payload', async () => {
            const result = await service.handleIncoming({});
            expect(result).toEqual({ status: 'no_message' });
            expect(prisma.customerProfile.findFirst).not.toHaveBeenCalled();
            expect(prisma.ticket.findFirst).not.toHaveBeenCalled();
        });

        it('rejects unsupported or empty text message payload without querying database or creating tickets', async () => {
            // Non-text message payload (e.g. image, sticker, location without text.body)
            const nonTextResult = await service.handleIncoming({
                entry: [{
                    changes: [{
                        value: {
                            messages: [{ from: '+90 555 111 2233', type: 'image' }],
                        },
                    }],
                }],
            });
            expect(nonTextResult).toEqual({ status: 'no_text', reason: 'unsupported' });

            // Empty whitespace text payload
            const emptyTextResult = await service.handleIncoming({
                entry: [{
                    changes: [{
                        value: {
                            messages: [{ from: '+90 555 111 2233', text: { body: '   ' } }],
                        },
                    }],
                }],
            });
            expect(emptyTextResult).toEqual({ status: 'no_text', reason: 'unsupported' });

            // Verify no DB queries or ticket creation occurred
            expect(prisma.customerProfile.findFirst).not.toHaveBeenCalled();
            expect(prisma.ticket.findFirst).not.toHaveBeenCalled();
            expect(prisma.ticketMessage.create).not.toHaveBeenCalled();
            expect(tickets.create).not.toHaveBeenCalled();
        });

        it('rejects invalid sender phone with no digits without querying database', async () => {
            const result = await service.handleIncoming({
                entry: [{
                    changes: [{
                        value: {
                            messages: [{ from: '+--', text: { body: 'hello' } }],
                        },
                    }],
                }],
            });

            expect(result).toEqual({ status: 'rejected', reason: 'invalid_sender_phone' });
            expect(prisma.customerProfile.findFirst).not.toHaveBeenCalled();
            expect(prisma.ticket.findFirst).not.toHaveBeenCalled();
            expect(prisma.ticketMessage.create).not.toHaveBeenCalled();
            expect(tickets.create).not.toHaveBeenCalled();
        });

        it('looks up the customer profile by normalized phone digits', async () => {
            prisma.customerProfile.findFirst.mockResolvedValue(null);
            const result = await service.handleIncoming({
                entry: [{
                    changes: [{
                        value: {
                            messages: [{ from: '+90 (555) 123-4567', text: { body: 'hi' } }],
                            contacts: [{}],
                        },
                    }],
                }],
            });
            expect(prisma.customerProfile.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { phoneNumber: { contains: '905551234567' } },
                }),
            );
            expect(result).toEqual({ status: 'rejected', reason: 'unrecognized_sender' });
        });
    });

    describe('handleIncoming - SEC-04 Security & Cross-Tenant Isolation', () => {
        it('SEC-04: safely rejects unrecognized phone without querying tickets or appending messages to stranger ticket', async () => {
            // Stranger sends message from an unregistered phone
            prisma.customerProfile.findFirst.mockResolvedValue(null);

            // Even if an active WhatsApp ticket belonging to another customer exists in DB:
            prisma.ticket.findFirst.mockResolvedValue({
                id: 'victim-ticket-999',
                ticketNumber: 'TICK-999',
                userId: 'victim-user-123',
                channel: 'WHATSAPP',
                status: 'OPEN',
            });

            const result = await service.handleIncoming({
                entry: [{
                    changes: [{
                        value: {
                            messages: [{
                                from: '+90 532 000 0000',
                                text: { body: 'I am an attacker trying to inject message' },
                            }],
                        },
                    }],
                }],
            });

            // Must reject early
            expect(result).toEqual({ status: 'rejected', reason: 'unrecognized_sender' });

            // CRITICAL: prisma.ticket.findFirst must NEVER be called with userId: undefined
            expect(prisma.ticket.findFirst).not.toHaveBeenCalled();

            // CRITICAL: message must NEVER be appended to victim's ticket
            expect(prisma.ticketMessage.create).not.toHaveBeenCalled();

            // CRITICAL: anonymous ticket must NOT be created
            expect(tickets.create).not.toHaveBeenCalled();
            expect(prisma.ticket.update).not.toHaveBeenCalled();
        });

        it('SEC-04: safely rejects profile with missing associated userId', async () => {
            // Profile found by phone number but has no userId (orphaned/unlinked profile)
            prisma.customerProfile.findFirst.mockResolvedValue({
                id: 'profile-orphan',
                phoneNumber: '905320001122',
                userId: null,
            });

            prisma.ticket.findFirst.mockResolvedValue({
                id: 'another-ticket',
                userId: 'some-other-user',
            });

            const result = await service.handleIncoming({
                entry: [{
                    changes: [{
                        value: {
                            messages: [{
                                from: '+90 532 000 1122',
                                text: { body: 'Hello from unlinked phone' },
                            }],
                        },
                    }],
                }],
            });

            expect(result).toEqual({ status: 'rejected', reason: 'missing_user_identity' });
            expect(prisma.ticket.findFirst).not.toHaveBeenCalled();
            expect(prisma.ticketMessage.create).not.toHaveBeenCalled();
            expect(tickets.create).not.toHaveBeenCalled();
        });

        it('SEC-04: does not log raw phone numbers, secret text, or customer PII during rejection', async () => {
            const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
            const debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
            const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

            prisma.customerProfile.findFirst.mockResolvedValue(null);

            const rawSecretPhone = '+90 555 999 8877';
            const rawSecretBody = 'SECRET_TOKEN_OR_PII_DATA_12345';

            await service.handleIncoming({
                entry: [{
                    changes: [{
                        value: {
                            messages: [{
                                from: rawSecretPhone,
                                text: { body: rawSecretBody },
                            }],
                        },
                    }],
                }],
            });

            const allLoggedStrings = [
                ...warnSpy.mock.calls.map(c => String(c[0])),
                ...debugSpy.mock.calls.map(c => String(c[0])),
                ...logSpy.mock.calls.map(c => String(c[0])),
            ];

            for (const logMsg of allLoggedStrings) {
                expect(logMsg).not.toContain(rawSecretPhone);
                expect(logMsg).not.toContain('905559998877');
                expect(logMsg).not.toContain(rawSecretBody);
            }

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('unrecognized_sender')
            );

            warnSpy.mockRestore();
            debugSpy.mockRestore();
            logSpy.mockRestore();
        });
    });

    describe('handleIncoming - Recognized Customer Flow', () => {
        it('appends message to existing active WhatsApp ticket for recognized customer', async () => {
            prisma.customerProfile.findFirst.mockResolvedValue({
                id: 'prof-valid-1',
                userId: 'user-valid-1',
                phoneNumber: '905551112233',
                user: { id: 'user-valid-1', email: 'customer@example.com' },
            });

            prisma.ticket.findFirst.mockResolvedValue({
                id: 'ticket-existing-1',
                ticketNumber: 'TICK-101',
                userId: 'user-valid-1',
                channel: 'WHATSAPP',
                status: 'OPEN',
            });

            const result = await service.handleIncoming({
                entry: [{
                    changes: [{
                        value: {
                            messages: [{
                                from: '+90 555 111 2233',
                                text: { body: 'Ek bilgi eklemek istiyorum' },
                            }],
                        },
                    }],
                }],
            });

            expect(result).toEqual({ status: 'success' });
            expect(prisma.ticket.findFirst).toHaveBeenCalledWith({
                where: {
                    userId: 'user-valid-1',
                    status: { notIn: ['RESOLVED', 'CLOSED'] },
                    channel: 'WHATSAPP',
                },
                orderBy: { createdAt: 'desc' },
            });
            expect(prisma.ticketMessage.create).toHaveBeenCalledWith({
                data: {
                    ticketId: 'ticket-existing-1',
                    senderId: 'user-valid-1',
                    message: 'Ek bilgi eklemek istiyorum',
                    channel: 'WHATSAPP',
                },
            });
            expect(tickets.create).not.toHaveBeenCalled();
        });

        it('creates a new WhatsApp ticket for recognized customer when no active ticket exists', async () => {
            prisma.customerProfile.findFirst.mockResolvedValue({
                id: 'prof-valid-2',
                userId: 'user-valid-2',
                phoneNumber: '905554445566',
                user: { id: 'user-valid-2', email: 'customer2@example.com' },
            });

            prisma.ticket.findFirst.mockResolvedValue(null);
            tickets.create.mockResolvedValue({
                id: 'new-ticket-202',
                ticketNumber: 'TICK-202',
            });
            prisma.ticket.update.mockResolvedValue({
                id: 'new-ticket-202',
                channel: 'WHATSAPP',
            });

            const result = await service.handleIncoming({
                entry: [{
                    changes: [{
                        value: {
                            messages: [{
                                from: '+90 555 444 5566',
                                text: { body: 'Yeni teknik destek talebi' },
                            }],
                        },
                    }],
                }],
            });

            expect(result).toEqual({ status: 'success' });
            expect(prisma.ticket.findFirst).toHaveBeenCalledWith({
                where: {
                    userId: 'user-valid-2',
                    status: { notIn: ['RESOLVED', 'CLOSED'] },
                    channel: 'WHATSAPP',
                },
                orderBy: { createdAt: 'desc' },
            });
            expect(tickets.create).toHaveBeenCalledWith(
                {
                    subject: 'WhatsApp Talebi: Yeni teknik destek talebi',
                    description: 'Yeni teknik destek talebi',
                    priority: 'MEDIUM',
                },
                'user-valid-2',
            );
            expect(prisma.ticket.update).toHaveBeenCalledWith({
                where: { id: 'new-ticket-202' },
                data: { channel: 'WHATSAPP' },
            });
        });
    });

    describe('handleOutbound - Agent Reply Outbound Message', () => {
        it('sends outgoing WhatsApp message when agent replies to WhatsApp ticket', async () => {
            settings.getValue.mockImplementation((key: string) => {
                if (key === 'whatsapp.access_token') return Promise.resolve('test-token');
                if (key === 'whatsapp.phone_number_id') return Promise.resolve('test-phone-id');
                return Promise.resolve(null);
            });

            prisma.customerProfile.findUnique.mockResolvedValue({
                id: 'prof-outbound',
                userId: 'cust-user-1',
                phoneNumber: '905551112233',
            });

            const sendSpy = jest.spyOn(service, 'sendOutgoing').mockResolvedValue(undefined as any);

            await service.handleOutbound({
                ticket: { channel: 'WHATSAPP', userId: 'cust-user-1', ticketNumber: 'TICK-303' },
                message: { senderId: 'agent-user-99', isInternal: false, message: 'Çözüm önerimiz ektedir.' },
            });

            expect(prisma.customerProfile.findUnique).toHaveBeenCalledWith({
                where: { userId: 'cust-user-1' },
            });
            expect(sendSpy).toHaveBeenCalledWith('905551112233', 'Çözüm önerimiz ektedir.');
        });

        it('ignores internal notes or customer self-replies', async () => {
            const sendSpy = jest.spyOn(service, 'sendOutgoing');

            // Internal note
            await service.handleOutbound({
                ticket: { channel: 'WHATSAPP', userId: 'cust-user-1' },
                message: { senderId: 'agent-user-99', isInternal: true, message: 'Dahili not' },
            });
            expect(sendSpy).not.toHaveBeenCalled();

            // Customer's own message
            await service.handleOutbound({
                ticket: { channel: 'WHATSAPP', userId: 'cust-user-1' },
                message: { senderId: 'cust-user-1', isInternal: false, message: 'Kendi mesajım' },
            });
            expect(sendSpy).not.toHaveBeenCalled();
        });
    });
});

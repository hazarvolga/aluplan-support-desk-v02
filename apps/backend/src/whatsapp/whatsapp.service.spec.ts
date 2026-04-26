import { Test, TestingModule } from '@nestjs/testing';
import { WhatsAppService } from './whatsapp.service';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';

describe('WhatsAppService.handleIncoming', () => {
    let service: WhatsAppService;
    let prisma: any;
    let tickets: any;
    let settings: any;

    beforeEach(async () => {
        prisma = {
            customerProfile: { findFirst: jest.fn() },
            ticket: { findFirst: jest.fn(), create: jest.fn() },
            ticketMessage: { create: jest.fn() },
        };
        tickets = { create: jest.fn(), addMessage: jest.fn() };
        settings = { getValue: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WhatsAppService,
                { provide: PrismaService, useValue: prisma },
                { provide: TicketsService, useValue: tickets },
                { provide: ConfigService, useValue: { get: jest.fn() } },
                { provide: SettingsService, useValue: settings },
            ],
        }).compile();

        service = module.get<WhatsAppService>(WhatsAppService);
    });

    it('returns no_message when payload has no message entry', async () => {
        const result = await service.handleIncoming({ entry: [] });
        expect(result).toEqual({ status: 'no_message' });
        expect(prisma.customerProfile.findFirst).not.toHaveBeenCalled();
    });

    it('returns no_message for an empty payload', async () => {
        const result = await service.handleIncoming({});
        expect(result).toEqual({ status: 'no_message' });
    });

    it('looks up the customer profile by normalized phone digits', async () => {
        prisma.customerProfile.findFirst.mockResolvedValue(null);
        await service.handleIncoming({
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
    });
});

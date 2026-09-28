import { Test, TestingModule } from '@nestjs/testing';
import { RuleEngineService } from '../rule-engine.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditService } from '../../automation/audit.service';
import { TicketPriority } from '@aluplan/database';

describe('RuleEngineService', () => {
    let service: RuleEngineService;
    let prisma: any;
    let eventEmitter: any;
    let audit: any;

    beforeEach(async () => {
        prisma = {
            ticketRule: {
                findMany: jest.fn(),
            },
            ticket: {
                findUnique: jest.fn(),
                update: jest.fn(),
            },
        };

        eventEmitter = {
            emitAsync: jest.fn().mockResolvedValue([]),
        };

        audit = {
            log: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RuleEngineService,
                { provide: PrismaService, useValue: prisma },
                { provide: EventEmitter2, useValue: eventEmitter },
                { provide: AuditService, useValue: audit },
            ],
        }).compile();

        service = module.get<RuleEngineService>(RuleEngineService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('handleTicketCreated', () => {
        it('should evaluate rules on ticket created', async () => {
            prisma.ticketRule.findMany.mockResolvedValue([]);
            const ticket = { id: 't1', subject: 'Test', priority: TicketPriority.MEDIUM } as any;
            await service.handleTicketCreated(ticket);
            expect(prisma.ticketRule.findMany).toHaveBeenCalledWith({
                where: { isActive: true, triggerOn: 'TICKET_CREATED' },
            });
        });
    });

    describe('handleMessageAdded', () => {
        it('should evaluate rules on message added', async () => {
            prisma.ticketRule.findMany.mockResolvedValue([]);
            const ticket = { id: 't1', subject: 'Test', priority: TicketPriority.MEDIUM } as any;
            const message = { message: 'urgent help needed' } as any;
            await service.handleMessageAdded({ ticket, message });
            expect(prisma.ticketRule.findMany).toHaveBeenCalledWith({
                where: { isActive: true, triggerOn: 'MESSAGE_ADDED' },
            });
        });
    });

    describe('rule evaluation', () => {
        it('should apply setPriority action when subject contains keyword', async () => {
            prisma.ticketRule.findMany.mockResolvedValue([
                {
                    id: 'r1',
                    name: 'Urgent Subject Rule',
                    conditions: { 'subject:contains': 'urgent' },
                    actions: { setPriority: TicketPriority.HIGH },
                },
            ]);
            prisma.ticket.findUnique.mockResolvedValue({ id: 't1', priority: TicketPriority.MEDIUM });

            const ticket = { id: 't1', subject: 'Urgent issue', priority: TicketPriority.MEDIUM } as any;
            await service.handleTicketCreated(ticket);

            expect(prisma.ticket.update).toHaveBeenCalledWith({
                where: { id: 't1' },
                data: { priority: TicketPriority.HIGH },
            });
            expect(audit.log).toHaveBeenCalledTimes(2);
        });

        it('should not apply rule if subject does not match', async () => {
            prisma.ticketRule.findMany.mockResolvedValue([
                {
                    id: 'r1',
                    name: 'Urgent Subject Rule',
                    conditions: { 'subject:contains': 'urgent' },
                    actions: { setPriority: TicketPriority.HIGH },
                },
            ]);

            const ticket = { id: 't1', subject: 'Normal issue', priority: TicketPriority.MEDIUM } as any;
            await service.handleTicketCreated(ticket);

            expect(prisma.ticket.update).not.toHaveBeenCalled();
        });

        it('should apply addTags action', async () => {
            prisma.ticketRule.findMany.mockResolvedValue([
                {
                    id: 'r1',
                    name: 'Tag Rule',
                    conditions: { 'priority:equals': TicketPriority.MEDIUM },
                    actions: { addTags: 'bug,frontend' },
                },
            ]);
            prisma.ticket.findUnique.mockResolvedValue({ id: 't1', tags: ['existing'] });

            const ticket = { id: 't1', subject: 'Test', priority: TicketPriority.MEDIUM } as any;
            await service.handleTicketCreated(ticket);

            expect(prisma.ticket.update).toHaveBeenCalledWith({
                where: { id: 't1' },
                data: { tags: expect.arrayContaining(['existing', 'bug', 'frontend']) },
            });
        });

        it('should apply assignTo action', async () => {
            prisma.ticketRule.findMany.mockResolvedValue([
                {
                    id: 'r1',
                    name: 'Auto Assign',
                    conditions: { 'subject:contains': 'billing' },
                    actions: { assignTo: 'agent-1' },
                },
            ]);
            prisma.ticket.findUnique.mockResolvedValue({ id: 't1' });

            const ticket = { id: 't1', subject: 'Billing issue' } as any;
            await service.handleTicketCreated(ticket);

            expect(prisma.ticket.update).toHaveBeenCalledWith({
                where: { id: 't1' },
                data: { assignedTo: 'agent-1' },
            });
        });

        it('should emit translate event for translateTo action', async () => {
            prisma.ticketRule.findMany.mockResolvedValue([
                {
                    id: 'r1',
                    name: 'Translate Rule',
                    conditions: { 'message:contains': 'turkish' },
                    actions: { translateTo: 'tr' },
                },
            ]);
            prisma.ticket.findUnique.mockResolvedValue({ id: 't1' });

            const ticket = { id: 't1', subject: 'Test' } as any;
            const message = { message: 'turkish text', id: 'msg-1' } as any;
            await service.handleMessageAdded({ ticket, message });

            expect(eventEmitter.emitAsync).toHaveBeenCalledWith('ai.translate_message', {
                ticketId: 't1',
                messageId: 'msg-1',
                targetLanguage: 'tr',
            });
        });

        it('should skip rules with missing conditions or actions', async () => {
            prisma.ticketRule.findMany.mockResolvedValue([
                { id: 'r1', name: 'Broken', conditions: null, actions: null },
            ]);

            const ticket = { id: 't1', subject: 'Test' } as any;
            await service.handleTicketCreated(ticket);

            expect(prisma.ticket.update).not.toHaveBeenCalled();
        });

        it('should handle multiple conditions with AND logic', async () => {
            prisma.ticketRule.findMany.mockResolvedValue([
                {
                    id: 'r1',
                    name: 'Complex Rule',
                    conditions: {
                        'subject:contains': 'bug',
                        'priority:equals': TicketPriority.HIGH,
                    },
                    actions: { setPriority: TicketPriority.URGENT },
                },
            ]);
            prisma.ticket.findUnique.mockResolvedValue({ id: 't1', priority: TicketPriority.HIGH });

            const ticket = { id: 't1', subject: 'bug report', priority: TicketPriority.HIGH } as any;
            await service.handleTicketCreated(ticket);

            expect(prisma.ticket.update).toHaveBeenCalled();
        });

        it('should fail complex rule if one condition does not match', async () => {
            prisma.ticketRule.findMany.mockResolvedValue([
                {
                    id: 'r1',
                    name: 'Complex Rule',
                    conditions: {
                        'subject:contains': 'bug',
                        'priority:equals': TicketPriority.HIGH,
                    },
                    actions: { setPriority: TicketPriority.URGENT },
                },
            ]);

            const ticket = { id: 't1', subject: 'bug report', priority: TicketPriority.MEDIUM } as any;
            await service.handleTicketCreated(ticket);

            expect(prisma.ticket.update).not.toHaveBeenCalled();
        });
    });
});

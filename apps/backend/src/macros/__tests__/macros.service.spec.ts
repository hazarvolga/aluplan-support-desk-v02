import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MacrosService } from '../macros.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MacrosService', () => {
    let service: MacrosService;
    let prisma: any;

    beforeEach(async () => {
        const mockPrismaService = {
            macro: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            ticket: {
                findUnique: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MacrosService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<MacrosService>(MacrosService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a macro with the provided dto and userId', async () => {
            const dto = { name: 'Greeting', content: 'Hello!', tags: ['welcome'] };
            const userId = 'user-1';
            const expected = { id: 'macro-1', ...dto, createdBy: userId };

            prisma.macro.create.mockResolvedValue(expected);

            const result = await service.create(dto as any, userId);

            expect(result).toEqual(expected);
            expect(prisma.macro.create).toHaveBeenCalledWith({
                data: { ...dto, createdBy: userId },
            });
        });
    });

    describe('findAll', () => {
        it('should return all macros with creator info', async () => {
            const macros = [
                { id: 'macro-1', name: 'Greeting', creator: { id: 'user-1', fullName: 'Alice' } },
            ];

            prisma.macro.findMany.mockResolvedValue(macros);

            const result = await service.findAll();

            expect(result).toEqual(macros);
            expect(prisma.macro.findMany).toHaveBeenCalledWith({
                include: {
                    creator: {
                        select: {
                            id: true,
                            fullName: true,
                        },
                    },
                },
            });
        });
    });

    describe('findOne', () => {
        it('should return a macro by id including creator info', async () => {
            const macro = { id: 'macro-1', name: 'Greeting', creator: { id: 'user-1', fullName: 'Alice' } };

            prisma.macro.findUnique.mockResolvedValue(macro);

            const result = await service.findOne('macro-1');

            expect(result).toEqual(macro);
            expect(prisma.macro.findUnique).toHaveBeenCalledWith({
                where: { id: 'macro-1' },
                include: {
                    creator: {
                        select: {
                            id: true,
                            fullName: true,
                        },
                    },
                },
            });
        });

        it('should throw NotFoundException when macro does not exist', async () => {
            prisma.macro.findUnique.mockResolvedValue(null);

            await expect(service.findOne('macro-1')).rejects.toThrow(
                new NotFoundException('Macro with ID "macro-1" not found'),
            );
        });
    });

    describe('update', () => {
        it('should update a macro by id', async () => {
            const dto = { name: 'Updated Greeting' };
            const expected = { id: 'macro-1', name: 'Updated Greeting' };

            prisma.macro.update.mockResolvedValue(expected);

            const result = await service.update('macro-1', dto as any);

            expect(result).toEqual(expected);
            expect(prisma.macro.update).toHaveBeenCalledWith({
                where: { id: 'macro-1' },
                data: dto,
            });
        });
    });

    describe('remove', () => {
        it('should soft-delete a macro by id', async () => {
            const expected = { id: 'macro-1', deletedAt: new Date() };

            prisma.macro.update.mockResolvedValue(expected);

            const result = await service.remove('macro-1');

            expect(result).toEqual(expected);
            expect(prisma.macro.update).toHaveBeenCalledWith({
                where: { id: 'macro-1' },
                data: { deletedAt: expect.any(Date) },
            });
        });
    });

    describe('renderMacro', () => {
        it('should throw NotFoundException when macro is not found', async () => {
            prisma.macro.findUnique.mockResolvedValue(null);

            await expect(service.renderMacro('macro-1')).rejects.toThrow(NotFoundException);
        });

        it('should return macro content when no ticketId is provided', async () => {
            const macro = { id: 'macro-1', content: 'Hello {{customer.name}}!' };
            prisma.macro.findUnique.mockResolvedValue(macro);

            const result = await service.renderMacro('macro-1');

            expect(result).toEqual({ content: 'Hello {{customer.name}}!' });
        });

        it('should replace ticket, customer, and agent placeholders when ticket exists', async () => {
            const macro = {
                id: 'macro-1',
                content: 'Ticket #{{ticket.ticketNumber}}: {{ticket.subject}} for {{customer.name}} ({{customer.email}}) assigned to {{agent.name}} ({{agent.email}})',
            };
            prisma.macro.findUnique.mockResolvedValue(macro);

            const ticket = {
                id: 'ticket-1',
                ticketNumber: 'SUP-001',
                subject: 'Login Issue',
                creator: { fullName: 'John Doe', email: 'john@example.com' },
                assignee: { fullName: 'Agent Smith', email: 'smith@example.com' },
            };
            prisma.ticket.findUnique.mockResolvedValue(ticket);

            const result = await service.renderMacro('macro-1', 'ticket-1');

            expect(result.content).toBe(
                'Ticket #SUP-001: Login Issue for John Doe (john@example.com) assigned to Agent Smith (smith@example.com)',
            );
            expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
                where: { id: 'ticket-1' },
                include: { creator: true, assignee: true },
            });
        });

        it('should return unmodified content when ticket is not found', async () => {
            const macro = { id: 'macro-1', content: 'Ticket #{{ticket.ticketNumber}}' };
            prisma.macro.findUnique.mockResolvedValue(macro);
            prisma.ticket.findUnique.mockResolvedValue(null);

            const result = await service.renderMacro('macro-1', 'ticket-1');

            expect(result.content).toBe('Ticket #{{ticket.ticketNumber}}');
        });

        it('should skip missing creator placeholders', async () => {
            const macro = { id: 'macro-1', content: 'Hello {{customer.name}} / {{customer.email}}' };
            prisma.macro.findUnique.mockResolvedValue(macro);

            const ticket = {
                id: 'ticket-1',
                ticketNumber: 'SUP-001',
                subject: 'Issue',
                creator: null,
                assignee: null,
            };
            prisma.ticket.findUnique.mockResolvedValue(ticket);

            const result = await service.renderMacro('macro-1', 'ticket-1');

            expect(result.content).toBe('Hello {{customer.name}} / {{customer.email}}');
        });

        it('should skip missing assignee placeholders', async () => {
            const macro = { id: 'macro-1', content: 'Agent: {{agent.name}}' };
            prisma.macro.findUnique.mockResolvedValue(macro);

            const ticket = {
                id: 'ticket-1',
                ticketNumber: 'SUP-001',
                subject: 'Issue',
                creator: { fullName: 'John', email: 'john@example.com' },
                assignee: null,
            };
            prisma.ticket.findUnique.mockResolvedValue(ticket);

            const result = await service.renderMacro('macro-1', 'ticket-1');

            expect(result.content).toBe('Agent: {{agent.name}}');
        });
    });
});

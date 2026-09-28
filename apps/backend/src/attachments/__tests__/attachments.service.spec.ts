import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentsService } from '../attachments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TicketAccessService } from '../../common/services/ticket-access.service';

describe('AttachmentsService', () => {
    let service: AttachmentsService;
    let prisma: any;
    let eventEmitter: any;

    const mockPrismaService = {
        attachment: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        ticketMessage: {
            findUnique: jest.fn(),
        },
        ticket: {
            update: jest.fn(),
        },
        $queryRaw: jest.fn(),
    };

    const mockEventEmitter = {
        emit: jest.fn(),
    };
    const mockTicketAccessService = {
        canAccessTicket: jest.fn().mockResolvedValue(true),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AttachmentsService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: EventEmitter2, useValue: mockEventEmitter },
                { provide: TicketAccessService, useValue: mockTicketAccessService },
            ],
        }).compile();

        service = module.get<AttachmentsService>(AttachmentsService);
        prisma = module.get<PrismaService>(PrismaService);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
        mockTicketAccessService.canAccessTicket.mockResolvedValue(true);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create attachment and emit event when message has a ticketId', async () => {
            const mockAttachment = { id: 'a1', messageId: 'm1', fileName: 'doc.pdf' };
            const mockMessage = { ticketId: 't1', isInternal: false };
            mockPrismaService.attachment.create.mockResolvedValue(mockAttachment);
            mockPrismaService.ticketMessage.findUnique.mockResolvedValue(mockMessage);

            const result = await service.create({
                messageId: 'm1',
                fileName: 'doc.pdf',
                fileSize: 1024,
                mimeType: 'application/pdf',
                url: 'https://cdn.example.com/doc.pdf',
            }, undefined, { id: 'customer-1', role: 'CUSTOMER' });

            expect(mockTicketAccessService.canAccessTicket).toHaveBeenCalledWith(
                { id: 'customer-1', role: 'CUSTOMER' },
                't1',
            );

            expect(prisma.attachment.create).toHaveBeenCalledWith({
                data: {
                    messageId: 'm1',
                    fileName: 'doc.pdf',
                    fileSize: 1024,
                    mimeType: 'application/pdf',
                    url: 'https://cdn.example.com/doc.pdf',
                },
            });
            expect(eventEmitter.emit).toHaveBeenCalledWith('attachment.created', {
                ticketId: 't1',
                messageId: 'm1',
                isInternal: false,
                attachment: mockAttachment,
            });
            expect(result).toEqual(mockAttachment);
        });

        it('marks attachments of internal messages as internal in the emitted event', async () => {
            const mockAttachment = { id: 'a1', messageId: 'm1', fileName: 'internal.pdf' };
            mockPrismaService.attachment.create.mockResolvedValue(mockAttachment);
            mockPrismaService.ticketMessage.findUnique.mockResolvedValue({ ticketId: 't1', isInternal: true });

            await service.create({
                messageId: 'm1', fileName: 'internal.pdf', fileSize: 1024,
                mimeType: 'application/pdf', url: 'https://cdn.example.com/internal.pdf',
            }, undefined, { id: 'agent-1', role: 'AGENT' });

            expect(eventEmitter.emit).toHaveBeenCalledWith('attachment.created', expect.objectContaining({
                ticketId: 't1', messageId: 'm1', isInternal: true,
            }));
        });

        it('rejects missing ticket message before creating an attachment', async () => {
            mockPrismaService.ticketMessage.findUnique.mockResolvedValue(null);

            await expect(service.create({
                messageId: 'm1',
                fileName: 'doc.pdf',
                fileSize: 1024,
                mimeType: 'application/pdf',
                url: 'https://cdn.example.com/doc.pdf',
            }, undefined, { id: 'customer-1', role: 'CUSTOMER' })).rejects.toThrow(NotFoundException);

            expect(prisma.attachment.create).not.toHaveBeenCalled();
            expect(eventEmitter.emit).not.toHaveBeenCalled();
        });

        it('rejects unauthorized uploads before creating attachment or updating hotinfo snapshot', async () => {
            mockPrismaService.ticketMessage.findUnique.mockResolvedValue({ ticketId: 'ticket-b', isInternal: false });
            mockTicketAccessService.canAccessTicket.mockResolvedValue(false);

            await expect(service.create({
                messageId: 'message-b',
                fileName: 'hotinfo.hxl',
                fileSize: 1024,
                mimeType: 'application/octet-stream',
                url: 'https://cdn.example.com/hotinfo.hxl',
            }, { raw: 'hotinfo' }, { id: 'customer-a', role: 'CUSTOMER' })).rejects.toThrow(ForbiddenException);

            expect(prisma.attachment.create).not.toHaveBeenCalled();
            expect(prisma.ticket.update).not.toHaveBeenCalled();
            expect(eventEmitter.emit).not.toHaveBeenCalled();
        });

        it('rejects customer uploads to internal messages even on an accessible ticket', async () => {
            mockPrismaService.ticketMessage.findUnique.mockResolvedValue({ ticketId: 'ticket-a', isInternal: true });

            await expect(service.create({
                messageId: 'internal-message',
                fileName: 'note.pdf',
                fileSize: 1024,
                mimeType: 'application/pdf',
                url: 'https://cdn.example.com/note.pdf',
            }, undefined, { id: 'customer-a', role: 'CUSTOMER' })).rejects.toThrow(ForbiddenException);

            expect(mockTicketAccessService.canAccessTicket).toHaveBeenCalledWith(
                { id: 'customer-a', role: 'CUSTOMER' },
                'ticket-a',
            );
            expect(prisma.attachment.create).not.toHaveBeenCalled();
            expect(eventEmitter.emit).not.toHaveBeenCalled();
        });
    });

    describe('findByMessage', () => {
        it('should return attachments for a given message id', async () => {
            const mockAttachments = [
                { id: 'a1', messageId: 'm1', fileName: '1.pdf' },
                { id: 'a2', messageId: 'm1', fileName: '2.pdf' },
            ];
            mockPrismaService.attachment.findMany.mockResolvedValue(mockAttachments);

            const result = await service.findByMessage('m1');

            expect(prisma.attachment.findMany).toHaveBeenCalledWith({ where: { messageId: 'm1' } });
            expect(result).toEqual(mockAttachments);
        });
    });

    describe('findOne', () => {
        it('should return an attachment by id', async () => {
            const mockAttachment = { id: 'a1', fileName: 'image.png' };
            mockPrismaService.attachment.findUnique.mockResolvedValue(mockAttachment);

            const result = await service.findOne('a1');

            expect(prisma.attachment.findUnique).toHaveBeenCalledWith({ where: { id: 'a1' } });
            expect(result).toEqual(mockAttachment);
        });

        it('should throw NotFoundException when attachment does not exist', async () => {
            mockPrismaService.attachment.findUnique.mockResolvedValue(null);
            await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
        });
    });
});

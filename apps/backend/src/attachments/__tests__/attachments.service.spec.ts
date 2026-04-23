import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentsService } from '../attachments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';

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

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AttachmentsService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: EventEmitter2, useValue: mockEventEmitter },
            ],
        }).compile();

        service = module.get<AttachmentsService>(AttachmentsService);
        prisma = module.get<PrismaService>(PrismaService);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create attachment and emit event when message has a ticketId', async () => {
            const mockAttachment = { id: 'a1', messageId: 'm1', fileName: 'doc.pdf' };
            const mockMessage = { ticketId: 't1' };
            mockPrismaService.attachment.create.mockResolvedValue(mockAttachment);
            mockPrismaService.ticketMessage.findUnique.mockResolvedValue(mockMessage);

            const result = await service.create({
                messageId: 'm1',
                fileName: 'doc.pdf',
                fileSize: 1024,
                mimeType: 'application/pdf',
                url: 'https://cdn.example.com/doc.pdf',
            });

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
                attachment: mockAttachment,
            });
            expect(result).toEqual(mockAttachment);
        });

        it('should not emit event when message has no ticketId', async () => {
            const mockAttachment = { id: 'a1', messageId: 'm1', fileName: 'doc.pdf' };
            mockPrismaService.attachment.create.mockResolvedValue(mockAttachment);
            mockPrismaService.ticketMessage.findUnique.mockResolvedValue(null);

            const result = await service.create({
                messageId: 'm1',
                fileName: 'doc.pdf',
                fileSize: 1024,
                mimeType: 'application/pdf',
                url: 'https://cdn.example.com/doc.pdf',
            });

            expect(eventEmitter.emit).not.toHaveBeenCalled();
            expect(result).toEqual(mockAttachment);
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

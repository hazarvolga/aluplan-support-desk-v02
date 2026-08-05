import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TicketAccessService } from '../common/services/ticket-access.service';

type AttachmentRequester = {
    id?: string;
    sub?: string;
    role?: string | { name?: string | null } | null;
};

@Injectable()
export class AttachmentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
        private readonly ticketAccess: TicketAccessService,
    ) { }

    async assertCanCreateForMessage(messageId: string, requester?: AttachmentRequester) {
        const message = await this.prisma.ticketMessage.findUnique({
            where: { id: messageId },
            select: { ticketId: true, isInternal: true },
        });
        if (!message?.ticketId) throw new NotFoundException('Ticket message not found');

        const canAccess = await this.ticketAccess.canAccessTicket(requester, message.ticketId);
        if (!canAccess) throw new ForbiddenException('You do not have access to this ticket');
        if (message.isInternal && this.isCustomerRole(requester?.role)) {
            throw new ForbiddenException('You do not have access to this message');
        }

        return message;
    }

    async create(data: {
        messageId: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        url: string;
    }, hotinfoSnapshot?: any, requester?: AttachmentRequester) {
        const message = await this.assertCanCreateForMessage(data.messageId, requester);
        const attachment = await this.prisma.attachment.create({ data });

        if (message?.ticketId) {
            if (hotinfoSnapshot) {
                await this.prisma.ticket.update({
                    where: { id: message.ticketId },
                    data: { hotinfoSnapshot }
                });
                await this.prisma.$queryRaw`SELECT 1`; // trigger
            }

            this.eventEmitter.emit('attachment.created', {
                ticketId: message.ticketId,
                messageId: data.messageId,
                isInternal: message.isInternal,
                attachment,
            });
        }

        return attachment;
    }

    async findByMessage(messageId: string) {
        return this.prisma.attachment.findMany({
            where: { messageId },
        });
    }

    async findOne(id: string) {
        const attachment = await this.prisma.attachment.findUnique({
            where: { id },
        });
        if (!attachment) throw new NotFoundException('Attachment not found');
        return attachment;
    }

    async findMessageByAttachment(attachmentId: string) {
        const attachment = await this.prisma.attachment.findUnique({
            where: { id: attachmentId },
            include: { message: true }
        });
        return attachment?.message;
    }

    private isCustomerRole(role: AttachmentRequester['role']): boolean {
        const value = typeof role === 'string' ? role : role?.name;
        const normalized = typeof value === 'string' ? value.trim().toUpperCase().replace(/-/g, '_') : '';
        return normalized === 'CUSTOMER' || normalized === 'VIEWER';
    }
}

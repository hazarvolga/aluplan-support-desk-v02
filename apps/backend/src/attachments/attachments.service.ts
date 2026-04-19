import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AttachmentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async create(data: {
        messageId: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        url: string;
    }, hotinfoSnapshot?: any) {
        const attachment = await this.prisma.attachment.create({
            data,
        });

        const message = await this.prisma.ticketMessage.findUnique({
            where: { id: data.messageId },
            select: { ticketId: true }
        });

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
}

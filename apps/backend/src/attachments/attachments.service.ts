import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
    constructor(private readonly prisma: PrismaService) { }

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

        if (hotinfoSnapshot) {
            const message = await this.prisma.ticketMessage.findUnique({
                where: { id: data.messageId },
                select: { ticketId: true }
            });
            if (message?.ticketId) {
                await this.prisma.ticket.update({
                    where: { id: message.ticketId },
                    data: { hotinfoSnapshot }
                });
                this.prisma.$queryRaw`SELECT 1`; // trigger
            }
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
}

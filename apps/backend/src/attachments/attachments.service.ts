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
    }) {
        return this.prisma.attachment.create({
            data,
        });
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

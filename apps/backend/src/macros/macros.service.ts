import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMacroDto } from './dto/create-macro.dto';
import { UpdateMacroDto } from './dto/update-macro.dto';

@Injectable()
export class MacrosService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateMacroDto, userId: string) {
        return this.prisma.macro.create({
            data: {
                ...dto,
                createdBy: userId,
            },
        });
    }

    async findAll() {
        return this.prisma.macro.findMany({
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const macro = await this.prisma.macro.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });

        if (!macro) {
            throw new NotFoundException(`Macro with ID "${id}" not found`);
        }

        return macro;
    }

    async update(id: string, dto: UpdateMacroDto) {
        return this.prisma.macro.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        return this.prisma.macro.delete({
            where: { id },
        });
    }

    async renderMacro(macroId: string, ticketId?: string) {
        const macro = await this.findOne(macroId);
        let content = macro.content;

        if (ticketId) {
            const ticket = await this.prisma.ticket.findUnique({
                where: { id: ticketId },
                include: { creator: true, assignee: true }
            });

            if (ticket) {
                content = content.replace(/\{\{ticket\.ticketNumber\}\}/g, ticket.ticketNumber);
                content = content.replace(/\{\{ticket\.subject\}\}/g, ticket.subject);

                if (ticket.creator) {
                    content = content.replace(/\{\{customer\.name\}\}/g, ticket.creator.fullName);
                    content = content.replace(/\{\{customer\.email\}\}/g, ticket.creator.email);
                }

                if (ticket.assignee) {
                    content = content.replace(/\{\{agent\.name\}\}/g, ticket.assignee.fullName);
                    content = content.replace(/\{\{agent\.email\}\}/g, ticket.assignee.email);
                }
            }
        }

        return { content };
    }
}

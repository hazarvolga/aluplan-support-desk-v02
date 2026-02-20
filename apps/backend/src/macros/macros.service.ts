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
}

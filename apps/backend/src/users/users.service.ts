import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(dto: { email: string; password: string; fullName: string; roles?: string[] }) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) {
            throw new ConflictException('Bu e-posta adresi zaten kayıtlı.');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        let roleConnections: { roleId: string }[] = [];
        if (dto.roles && dto.roles.length > 0) {
            const roles = await this.prisma.role.findMany({
                where: { name: { in: dto.roles } },
            });
            roleConnections = roles.map((r) => ({ roleId: r.id }));
        }

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                fullName: dto.fullName,
                passwordHash,
                status: 'ACTIVE',
                userRoles: {
                    create: roleConnections,
                },
            },
            include: {
                userRoles: { include: { role: true } },
            },
        });

        const { passwordHash: _, ...result } = user;
        return result;
    }

    async findAll() {
        return this.prisma.user.findMany({
            where: { deletedAt: null },
            include: {
                userRoles: { include: { role: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id, deletedAt: null },
            include: {
                userRoles: { include: { role: true } },
            },
        });
        if (!user) throw new NotFoundException(`User ${id} not found`);
        return user;
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async update(id: string, data: any) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'INACTIVE' },
        });
    }
}

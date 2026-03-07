import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
    private readonly logger = new Logger(RolesService.name);

    constructor(
        private prisma: PrismaService,
    ) { }

    async findRoleWithPermissions(roleId: string) {
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        if (!role) {
            throw new NotFoundException(`Role with ID ${roleId} not found`);
        }

        return {
            ...role,
            permissions: role.permissions.map((rp) => rp.permission.name),
        };
    }

    async findAll() {
        return this.prisma.role.findMany({
            include: {
                _count: {
                    select: { users: true },
                },
            },
        });
    }

    async getPermissions() {
        return this.prisma.permission.findMany();
    }
}

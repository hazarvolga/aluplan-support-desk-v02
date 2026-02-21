import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
                customerProfile: true, // Included so customers can see their profile info seamlessly
            },
        });
        if (!user) throw new NotFoundException(`User ${id} not found`);
        const { passwordHash: _, ...result } = user;
        return result;
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const updateData: any = {};
        if (dto.fullName) updateData.fullName = dto.fullName;
        if (dto.password) {
            updateData.passwordHash = await bcrypt.hash(dto.password, 10);
        }

        // Update User
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: { customerProfile: true }
        });

        // Update or Create CustomerProfile
        if (dto.companyName || dto.jobTitle || dto.phone) {
            const firstName = user.fullName.split(' ')[0] || '';
            const lastName = user.fullName.split(' ').slice(1).join(' ') || '';

            if (user.customerProfile) {
                await this.prisma.customerProfile.update({
                    where: { id: user.customerProfile.id },
                    data: {
                        companyName: dto.companyName || user.customerProfile.companyName,
                        industry: dto.industry || user.customerProfile.industry,
                        jobTitle: dto.jobTitle || user.customerProfile.jobTitle,
                        phoneNumber: dto.phone || user.customerProfile.phoneNumber,
                        firstName: dto.fullName ? firstName : user.customerProfile.firstName,
                        lastName: dto.fullName ? lastName : user.customerProfile.lastName,
                    },
                });
            } else {
                // Determine next customer number (fallback to a simple sequence or uuid if no pattern is established)
                // We'll use a placeholder for now as per "can fill themselves"
                const count = await this.prisma.customerProfile.count();
                const customerNo = `CUST-${(count + 1).toString().padStart(5, '0')}`;

                await this.prisma.customerProfile.create({
                    data: {
                        userId: user.id,
                        firstName,
                        lastName,
                        companyName: dto.companyName || '-',
                        industry: dto.industry || null,
                        jobTitle: dto.jobTitle || '-',
                        phoneNumber: dto.phone || null,
                        customerNo,
                    },
                });
            }
        }

        const { passwordHash: _, ...result } = user;
        return result;
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

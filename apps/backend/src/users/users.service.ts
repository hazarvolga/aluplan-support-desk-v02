import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(dto: { email: string; password: string; fullName: string; roles?: string[] }) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email }, include: { role: true } });
        const passwordHash = await bcrypt.hash(dto.password, 10);

        if (existing) {
            // Allow upgrading an existing user (e.g., from CUSTOMER synced via CRM)
            const roleName = dto.roles?.[0];
            if (roleName && roleName.toUpperCase() !== 'CUSTOMER' && existing.role?.name === 'CUSTOMER') {
                const newRole = await this.prisma.role.findFirst({
                    where: {
                        name: {
                            equals: roleName,
                            mode: 'insensitive'
                        }
                    }
                });
                if (newRole) {
                    const updated = await this.prisma.user.update({
                        where: { id: existing.id },
                        data: {
                            roleId: newRole.id,
                            fullName: dto.fullName || existing.fullName,
                            passwordHash: passwordHash // Provide them the newly set password
                        }
                    });
                    const { passwordHash: _passwordHash, ...result } = updated;
                    return result;
                }
            }
            throw new ConflictException('Bu e-posta adresi zaten kayıtlı.');
        }

        let roleId: string | null = null;
        if (dto.roles && dto.roles.length > 0) {
            const role = await this.prisma.role.findFirst({
                where: {
                    name: {
                        equals: dto.roles[0],
                        mode: 'insensitive'
                    }
                }
            });
            roleId = role?.id || null;
        }

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                fullName: dto.fullName,
                passwordHash,
                status: 'ACTIVE',
                roleId,
            },
        });

        const { passwordHash: _passwordHash, ...result } = user;
        return result;
    }

    async findAll(type?: 'agent' | 'customer') {
        const where: any = { deletedAt: null };

        if (type === 'agent') {
            where.role = {
                name: {
                    not: 'CUSTOMER'
                }
            };
        } else if (type === 'customer') {
            where.role = {
                name: 'CUSTOMER'
            };
        }

        return this.prisma.user.findMany({
            where,
            include: {
                role: true,
                customerProfile: true,
                teamMembers: { include: { team: true } }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            include: {
                customerProfile: true,
            },
        });
        if (!user) throw new NotFoundException(`User ${id} not found`);
        const { passwordHash: _passwordHash, ...result } = user;
        return result;
    }

    async findByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });
        if (!user) return null;
        const { passwordHash: _passwordHash, ...result } = user;
        return result;
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const updateData: any = {};
        if (dto.fullName) updateData.fullName = dto.fullName;
        if (dto.password) {
            updateData.passwordHash = await bcrypt.hash(dto.password, 10);
        }
        if (dto.language) updateData.language = dto.language;

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

        const { passwordHash: _passwordHash, ...result } = user;
        return result;
    }

    async update(id: string, data: any) {
        // Intercept 'roles' array from DTO and map to 'roleId'
        if (data.roles && Array.isArray(data.roles) && data.roles.length > 0) {
            const roleName = data.roles[0];
            const role = await this.prisma.role.findFirst({
                where: {
                    name: {
                        equals: roleName,
                        mode: 'insensitive'
                    }
                }
            });

            if (role) {
                data.roleId = role.id;
            }

            // Remove the problematic roles field that Prisma doesn't know about
            delete data.roles;
        }

        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, actorId?: string) {
        const user = await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'INACTIVE' },
        });

        await this.prisma.auditLog.create({
            data: {
                action: 'user.delete',
                actorId: actorId || null,
                entityType: 'USER',
                entityId: id,
                newValue: { status: 'INACTIVE', deletedAt: user.deletedAt },
            },
        });

        return user;
    }
}

import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../auth/security.constants';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { normalizeEmailAddress } from '../common/utils/email-normalization.util';

function durationToSeconds(value: string): number {
    const match = /^(\d+)\s*(s|m|h|d)$/i.exec(value.trim());
    if (!match) return 24 * 60 * 60;
    const amount = Number(match[1]);
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 } as const;
    return amount * multipliers[match[2].toLowerCase() as keyof typeof multipliers];
}

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
        private readonly config: ConfigService,
    ) { }

    async create(dto: { email: string; password: string; fullName: string; roles?: string[] }) {
        const email = normalizeEmailAddress(dto.email);
        const existing = await this.prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
            include: { role: true },
        });
        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

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
                email,
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
            where.status = 'ACTIVE';
            where.teamMembers = {
                some: {
                    team: {
                        isArchived: false,
                        deletedAt: null,
                    },
                },
            };
        } else if (type === 'customer') {
            where.role = {
                name: 'CUSTOMER'
            };
        }

        const users = await this.prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                fullName: true,
                avatarUrl: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                roleId: true,
                agentStatus: true,
                title: true,
                bio: true,
                timezone: true,
                language: true,
                maxActiveTickets: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                ...(type === 'customer' ? {
                    customerProfile: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            companyName: true,
                            customerNo: true,
                            industry: true,
                            jobTitle: true,
                            phoneNumber: true,
                            contractStatus: true,
                            crmVerified: true,
                            isVip: true,
                        },
                    },
                } : {}),
                teamMembers: {
                    select: {
                        id: true,
                        userId: true,
                        teamId: true,
                        roleOverride: true,
                        joinedAt: true,
                        team: {
                            select: {
                                id: true,
                                name: true,
                                departmentId: true,
                                isArchived: true,
                                autoAssignmentEnabled: true,
                                assignmentStrategy: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return users.map((user) => ({
            ...user,
            userRoles: user.role ? [{ role: user.role }] : [],
        }));
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

    private async updateOrCreateCustomerProfile(user: any, dto: UpdateProfileDto, tx?: any) {
        const db = tx ?? this.prisma;
        const effectiveFullName = (dto.fullName !== undefined ? dto.fullName : (user.fullName ?? '')) || '';
        const trimmedFullName = effectiveFullName.trim();
        const firstName = trimmedFullName ? trimmedFullName.split(' ')[0] || '' : '';
        const lastName = trimmedFullName ? trimmedFullName.split(' ').slice(1).join(' ') || '' : '';

        if (user.customerProfile) {
            await db.customerProfile.update({
                where: { id: user.customerProfile.id },
                data: {
                    companyName: dto.companyName || user.customerProfile.companyName,
                    industry: dto.industry || user.customerProfile.industry,
                    jobTitle: dto.jobTitle || user.customerProfile.jobTitle,
                    phoneNumber: dto.phone || user.customerProfile.phoneNumber,
                    ...(dto.fullName !== undefined ? { firstName, lastName } : {}),
                },
            });
        } else {
            const count = await db.customerProfile.count();
            const customerNo = `CUST-${(count + 1).toString().padStart(5, '0')}`;

            await db.customerProfile.create({
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

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { customerProfile: true },
        });

        if (!user || user.status !== 'ACTIVE' || user.deletedAt) {
            throw new NotFoundException('Kullanıcı bulunamadı');
        }

        const rawNewPassword = dto.newPassword !== undefined ? dto.newPassword : dto.password;
        const hasPasswordChangeRequest = rawNewPassword !== undefined && rawNewPassword !== null;

        if (hasPasswordChangeRequest) {
            if (typeof rawNewPassword !== 'string' || rawNewPassword.length < 8 || rawNewPassword.trim().length === 0) {
                throw new BadRequestException('Şifre en az 8 karakter olmalıdır');
            }

            if (!dto.currentPassword || typeof dto.currentPassword !== 'string' || dto.currentPassword.trim().length === 0) {
                throw new BadRequestException('Mevcut şifre zorunludur');
            }

            if (!user.passwordHash) {
                throw new BadRequestException('Kullanıcı için kayıtlı şifre bulunmuyor');
            }

            const isCurrentValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
            if (!isCurrentValid) {
                throw new BadRequestException('Mevcut şifre hatalı');
            }

            const newPasswordHash = await bcrypt.hash(rawNewPassword, BCRYPT_ROUNDS);

            const freshUser = await this.prisma.$transaction(async (tx) => {
                const updated = await tx.user.updateMany({
                    where: {
                        id: userId,
                        status: 'ACTIVE',
                        deletedAt: null,
                        sessionVersion: user.sessionVersion ?? 0,
                        passwordHash: user.passwordHash,
                    },
                    data: {
                        passwordHash: newPasswordHash,
                        sessionVersion: { increment: 1 },
                        refreshTokenHash: null,
                        passwordResetJtiHash: null,
                        ...(dto.fullName ? { fullName: dto.fullName } : {}),
                        ...(dto.language ? { language: dto.language } : {}),
                    },
                });

                if (updated.count !== 1) {
                    throw new ConflictException('Şifre güncelleme sırasında oturum veya parola durumu değişti. Lütfen tekrar deneyin.');
                }

                const shouldSyncCustomerProfile = Boolean(
                    dto.companyName || dto.jobTitle || dto.phone || dto.industry || (dto.fullName && user.customerProfile)
                );
                if (shouldSyncCustomerProfile) {
                    await this.updateOrCreateCustomerProfile(user, dto, tx);
                }

                return tx.user.findUnique({
                    where: { id: userId },
                    include: { customerProfile: true },
                });
            });

            try {
                const accessTtlSeconds = durationToSeconds(this.config.get('JWT_EXPIRES_IN', '24h'));
                await this.redisService.set(
                    `user:${userId}:force_logout_at`,
                    Date.now().toString(),
                    accessTtlSeconds,
                );
            } catch (error) {
                this.logger.warn(`Redis session marker failed after durable password change for user ${userId}`, error);
            }

            const { passwordHash: _ph, refreshTokenHash: _rth, passwordResetJtiHash: _prj, ...result } = freshUser ?? user;
            return { ...result, passwordChanged: true };
        }

        // Normal profile update without password change
        const updateData: any = {};
        if (dto.fullName) updateData.fullName = dto.fullName;
        if (dto.language) updateData.language = dto.language;

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: { customerProfile: true },
        });

        const shouldSyncCustomerProfile = Boolean(
            dto.companyName || dto.jobTitle || dto.phone || dto.industry || (dto.fullName && user.customerProfile)
        );
        if (shouldSyncCustomerProfile) {
            await this.updateOrCreateCustomerProfile(updatedUser, dto);
        }

        const freshUser = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { customerProfile: true },
        });

        const { passwordHash: _ph, refreshTokenHash: _rth, passwordResetJtiHash: _prj, ...result } = freshUser ?? updatedUser;
        return { ...result, passwordChanged: false };
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

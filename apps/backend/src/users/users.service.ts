import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../auth/security.constants';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { normalizeEmailAddress } from '../common/utils/email-normalization.util';
import { ASSIGNABLE_USER_ROLES, normalizeUserRole, type AssignableUserRole } from './dto/create-user.dto';

export interface UserManagementActor {
    id: string;
    role: string;
}

const USER_MANAGEMENT_ROLES = new Set(['ADMIN', 'SUPER_ADMIN', 'SUPERUSER']);
const PROTECTED_USER_ROLES = new Set(['SUPER_ADMIN', 'SUPERUSER']);

const SAFE_MANAGED_USER_SELECT = {
    id: true,
    email: true,
    fullName: true,
    avatarUrl: true,
    status: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
    roleId: true,
    agentStatus: true,
    title: true,
    bio: true,
    timezone: true,
    language: true,
    maxActiveTickets: true,
} as const;

const SAFE_ROLE_SELECT = {
    id: true,
    name: true,
    description: true,
} as const;

const SAFE_CUSTOMER_PROFILE_SELECT = {
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
} as const;

function selectKnownFields(value: unknown, selection: Record<string, true>) {
    if (value === null) return null;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
        Object.keys(selection)
            .filter((key) => Object.prototype.hasOwnProperty.call(record, key))
            .map((key) => [key, record[key]]),
    );
}

function toSafeManagedUser(user: Record<string, unknown>) {
    const safeUser = Object.fromEntries(
        Object.keys(SAFE_MANAGED_USER_SELECT)
            .filter((key) => Object.prototype.hasOwnProperty.call(user, key))
            .map((key) => [key, user[key]]),
    );

    if (Object.prototype.hasOwnProperty.call(user, 'role')) {
        safeUser.role = selectKnownFields(user.role, SAFE_ROLE_SELECT);
    }
    if (Object.prototype.hasOwnProperty.call(user, 'customerProfile')) {
        safeUser.customerProfile = selectKnownFields(user.customerProfile, SAFE_CUSTOMER_PROFILE_SELECT);
    }

    return safeUser;
}

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

    private assertManagementActor(actor: UserManagementActor): void {
        if (!actor?.id || !actor?.role || !USER_MANAGEMENT_ROLES.has(normalizeUserRole(actor.role))) {
            throw new ForbiddenException('You do not have permission to manage users');
        }
    }

    private getRequestedRole(roles?: string[]): AssignableUserRole | null {
        if (!roles?.length) return null;
        if (roles.length !== 1 || typeof roles[0] !== 'string') {
            throw new BadRequestException('Exactly one assignable role may be provided');
        }

        const normalizedRole = normalizeUserRole(roles[0]);
        if (!ASSIGNABLE_USER_ROLES.includes(normalizedRole as AssignableUserRole)) {
            throw new BadRequestException(`Role ${roles[0]} cannot be assigned through user management`);
        }
        return normalizedRole as AssignableUserRole;
    }

    private async resolveRole(roleName: AssignableUserRole) {
        const role = await this.prisma.role.findFirst({
            where: { name: { equals: roleName, mode: 'insensitive' } },
        });
        if (!role) {
            throw new BadRequestException(`Assignable role ${roleName} is not configured`);
        }
        return role;
    }

    private getMutableUserWhere(id: string) {
        return {
            id,
            deletedAt: null,
            NOT: {
                role: {
                    is: {
                        name: {
                            in: Array.from(PROTECTED_USER_ROLES),
                            mode: 'insensitive' as const,
                        },
                    },
                },
            },
        };
    }

    async create(
        dto: { email: string; password: string; fullName: string; roles?: string[] },
        actor: UserManagementActor,
    ) {
        this.assertManagementActor(actor);
        const requestedRole = this.getRequestedRole(dto.roles);
        const email = normalizeEmailAddress(dto.email);
        const existing = await this.prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
            include: { role: true },
        });
        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

        if (existing) {
            // Allow upgrading an existing user (e.g., from CUSTOMER synced via CRM)
            if (requestedRole && normalizeUserRole(existing.role?.name ?? '') === 'CUSTOMER') {
                const newRole = await this.resolveRole(requestedRole);
                try {
                    const updated = await this.prisma.user.update({
                        where: {
                            id: existing.id,
                            deletedAt: null,
                            role: {
                                is: {
                                    name: { equals: 'CUSTOMER', mode: 'insensitive' },
                                },
                            },
                        },
                        data: {
                            roleId: newRole.id,
                            fullName: dto.fullName || existing.fullName,
                            passwordHash,
                            sessionVersion: { increment: 1 },
                            refreshTokenHash: null,
                            passwordResetJtiHash: null,
                        },
                        select: SAFE_MANAGED_USER_SELECT,
                    });
                    return toSafeManagedUser(updated);
                } catch (error) {
                    if ((error as { code?: string })?.code === 'P2025') {
                        throw new ConflictException('User state changed before promotion. Please retry.');
                    }
                    throw error;
                }
            }
            throw new ConflictException('Bu e-posta adresi zaten kayıtlı.');
        }

        let roleId: string | null = null;
        if (requestedRole) {
            const role = await this.resolveRole(requestedRole);
            roleId = role.id;
        }

        let user: Record<string, unknown>;
        try {
            user = await this.prisma.user.create({
                data: {
                    email,
                    fullName: dto.fullName,
                    passwordHash,
                    status: 'ACTIVE',
                    roleId,
                },
                select: SAFE_MANAGED_USER_SELECT,
            });
        } catch (error) {
            if ((error as { code?: string })?.code === 'P2002') {
                throw new ConflictException('Bu e-posta adresi zaten kayıtlı.');
            }
            throw error;
        }

        return toSafeManagedUser(user);
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
            select: {
                ...SAFE_MANAGED_USER_SELECT,
                customerProfile: { select: SAFE_CUSTOMER_PROFILE_SELECT },
            },
        });
        if (!user) throw new NotFoundException(`User ${id} not found`);
        return toSafeManagedUser(user);
    }

    async findByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: normalizeEmailAddress(email) },
            select: {
                ...SAFE_MANAGED_USER_SELECT,
                role: { select: SAFE_ROLE_SELECT },
            },
        });
        if (!user) return null;
        return toSafeManagedUser(user);
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
                    select: {
                        ...SAFE_MANAGED_USER_SELECT,
                        customerProfile: { select: SAFE_CUSTOMER_PROFILE_SELECT },
                    },
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

            return { ...toSafeManagedUser((freshUser ?? user) as Record<string, unknown>), passwordChanged: true };
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
            select: {
                ...SAFE_MANAGED_USER_SELECT,
                customerProfile: { select: SAFE_CUSTOMER_PROFILE_SELECT },
            },
        });

        return { ...toSafeManagedUser((freshUser ?? updatedUser) as Record<string, unknown>), passwordChanged: false };
    }

    async update(
        id: string,
        data: { email?: string; password?: string; fullName?: string; roles?: string[] },
        actor: UserManagementActor,
    ) {
        this.assertManagementActor(actor);
        const target = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            include: { role: true },
        });
        if (!target) throw new NotFoundException(`User ${id} not found`);

        const targetRole = normalizeUserRole(target.role?.name ?? '');
        if (PROTECTED_USER_ROLES.has(targetRole)) {
            throw new ForbiddenException('Protected users cannot be changed through user management');
        }

        const requestedRole = this.getRequestedRole(data.roles);
        if (requestedRole && actor.id === id) {
            throw new ForbiddenException('Administrators cannot change their own role');
        }
        if (data.password !== undefined && actor.id === id) {
            throw new ForbiddenException('Use the profile password flow to change your own password');
        }

        const updateData: Record<string, unknown> = {};
        if (data.fullName !== undefined) updateData.fullName = data.fullName;
        if (data.email !== undefined) updateData.email = normalizeEmailAddress(data.email);
        if (data.password !== undefined) {
            updateData.passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
        }
        if (requestedRole) {
            const role = await this.resolveRole(requestedRole);
            updateData.roleId = role.id;
        }
        if (data.password !== undefined || requestedRole !== null) {
            updateData.sessionVersion = { increment: 1 };
            updateData.refreshTokenHash = null;
            updateData.passwordResetJtiHash = null;
        }

        let updatedUser: Record<string, unknown>;
        try {
            updatedUser = await this.prisma.user.update({
                where: this.getMutableUserWhere(id),
                data: updateData,
                select: SAFE_MANAGED_USER_SELECT,
            });
        } catch (error) {
            if ((error as { code?: string })?.code === 'P2025') {
                throw new ConflictException('User state changed before update. Please retry.');
            }
            if ((error as { code?: string })?.code === 'P2002') {
                throw new ConflictException('Bu e-posta adresi zaten kayıtlı.');
            }
            throw error;
        }

        return toSafeManagedUser(updatedUser);
    }

    async remove(id: string, actor: UserManagementActor) {
        this.assertManagementActor(actor);
        if (actor.id === id) {
            throw new ForbiddenException('Administrators cannot delete their own account');
        }

        return this.prisma.$transaction(async (tx) => {
            const target = await tx.user.findFirst({
                where: { id, deletedAt: null },
                include: { role: true },
            });
            if (!target) throw new NotFoundException(`User ${id} not found`);

            const targetRole = normalizeUserRole(target.role?.name ?? '');
            if (PROTECTED_USER_ROLES.has(targetRole)) {
                throw new ForbiddenException('Protected users cannot be deleted through user management');
            }

            let user: Record<string, unknown>;
            try {
                user = await tx.user.update({
                    where: this.getMutableUserWhere(id),
                    data: { deletedAt: new Date(), status: 'INACTIVE' },
                    select: SAFE_MANAGED_USER_SELECT,
                });
            } catch (error) {
                if ((error as { code?: string })?.code === 'P2025') {
                    throw new ConflictException('User state changed before deletion. Please retry.');
                }
                throw error;
            }

            await tx.auditLog.create({
                data: {
                    action: 'user.delete',
                    actorId: actor.id,
                    entityType: 'USER',
                    entityId: id,
                    newValue: {
                        status: 'INACTIVE',
                        deletedAt: user.deletedAt instanceof Date ? user.deletedAt.toISOString() : null,
                    },
                },
            });

            return toSafeManagedUser(user);
        });
    }
}

import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
        private readonly emailService: EmailService,
    ) { }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                rolePermissions: { include: { permission: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!user || user.deletedAt) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Account is not active');
        }

        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const roles = user.userRoles.map((ur) => ur.role.name);
        const permissions = [
            ...new Set(
                user.userRoles.flatMap((ur) =>
                    ur.role.rolePermissions.map((rp) => rp.permission.name),
                ),
            ),
        ];

        const tokens = await this.generateTokens(user.id, user.email, user.fullName, roles, permissions);

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                roles,
                permissions,
            },
            ...tokens,
        };
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.status !== 'ACTIVE') {
            throw new ForbiddenException('Access denied');
        }

        // In production, validate stored refresh token hash
        const roles = await this.getUserRoles(userId);
        const permissions = await this.getUserPermissions(userId);
        return this.generateTokens(userId, user.email, user.fullName, roles, permissions);
    }

    async logout(userId: string) {
        // In production: invalidate refresh token in DB
        return { success: true };
    }

    async lookupEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            return { action: 'CLAIM' };
        }

        const domain = email.split('@')[1];
        if (!domain) return { action: 'NEW', companyName: null };

        const publicDomains = [
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
            'icloud.com', 'live.com', 'yandex.com', 'yandex.com.tr', 'mynet.com'
        ];

        if (publicDomains.includes(domain.toLowerCase())) {
            return { action: 'NEW', companyName: null };
        }

        const matchedProfile = await this.prisma.customerProfile.findFirst({
            where: {
                user: {
                    email: {
                        endsWith: `@${domain}`,
                        mode: 'insensitive'
                    }
                }
            },
            select: {
                companyName: true
            }
        });

        if (matchedProfile?.companyName) {
            return { action: 'NEW_MATCHED_COMPANY', companyName: matchedProfile.companyName };
        }

        return { action: 'NEW', companyName: null };
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Return generic success to prevent email enumeration
            return { success: true };
        }

        // Generate a random 8-character password
        const newPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash },
        });

        // Send email with new password
        await this.emailService.sendPasswordReset({
            recipientEmail: user.email,
            recipientName: user.fullName || 'Değerli Müşterimiz',
            newPassword
        });

        return { success: true };
    }

    private async generateTokens(
        userId: string,
        email: string,
        fullName: string,
        roles: string[],
        permissions: string[],
    ) {
        const payload = { sub: userId, email, fullName, roles, permissions };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_SECRET'),
                expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
            }),
        ]);

        return { access_token: accessToken, refresh_token: refreshToken };
    }

    private async getUserRoles(userId: string): Promise<string[]> {
        const userRoles = await this.prisma.userRole.findMany({
            where: { userId },
            include: { role: true },
        });
        return userRoles.map((ur) => ur.role.name);
    }

    private async getUserPermissions(userId: string): Promise<string[]> {
        const userRoles = await this.prisma.userRole.findMany({
            where: { userId },
            include: {
                role: {
                    include: { rolePermissions: { include: { permission: true } } },
                },
            },
        });
        return [
            ...new Set(
                userRoles.flatMap((ur) =>
                    ur.role.rolePermissions.map((rp) => rp.permission.name),
                ),
            ),
        ];
    }
}

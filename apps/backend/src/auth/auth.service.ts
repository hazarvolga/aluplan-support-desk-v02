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

        const role = user.role;
        const permissions = this.getPermissionsForRole(role);

        const tokens = await this.generateTokens(user.id, user.email, user.fullName, role, permissions);
        await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                role,
                permissions,
            },
            ...tokens,
        };
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.status !== 'ACTIVE' || !user.refreshTokenHash) {
            throw new ForbiddenException('Access denied');
        }

        const rtMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!rtMatches) {
            throw new ForbiddenException('Access denied');
        }

        const role = user.role;
        const permissions = this.getPermissionsForRole(role);
        const tokens = await this.generateTokens(userId, user.email, user.fullName, role, permissions);
        await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

        return tokens;
    }

    async logout(userId: string) {
        await this.prisma.user.updateMany({
            where: { id: userId, refreshTokenHash: { not: null } },
            data: { refreshTokenHash: null }
        });
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

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                customerProfile: {
                    select: {
                        id: true,
                        hotinfoData: true,
                        hotinfoUpdatedAt: true,
                    }
                }
            }
        });

        if (!user) return null;

        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            status: user.status,
            role: user.role,
            customerProfile: user.customerProfile
        };
    }

    private async generateTokens(
        userId: string,
        email: string,
        fullName: string,
        role: string,
        permissions: string[],
    ) {
        const payload = { sub: userId, email, fullName, role, permissions };

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

    private getPermissionsForRole(role: string): string[] {
        const basePermissions = [
            'ticket:create', 'ticket:read', 'ticket:update',
            'kb:read', 'faq:read'
        ];

        if (role === 'ADMIN') return ['*']; // Full access
        if (role === 'DEPARTMENT_MANAGER') return [...basePermissions, 'ticket:assign', 'reports:read', 'settings:read'];
        if (role === 'TEAM_LEAD') return [...basePermissions, 'ticket:assign', 'reports:read'];
        if (role === 'SENIOR_AGENT') return [...basePermissions, 'ticket:escalate'];
        if (role === 'AGENT') return basePermissions;
        if (role === 'VIEWER') return ['ticket:read', 'kb:read', 'faq:read'];

        return basePermissions;
    }

    private async updateRefreshTokenHash(userId: string, refreshToken: string) {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(refreshToken, salt);
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash: hash },
        });
    }
}

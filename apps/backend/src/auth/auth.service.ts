import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
        private readonly emailService: EmailService,
        private readonly settings: SettingsService,
    ) { }

    async login(dto: LoginDto) {
        console.log(`[DEBUG] Attempting login for: [${dto.email}]`);
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) console.log(`[DEBUG] User NOT found in DB for email: [${dto.email}]`);

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

        const roleWithPerms = user.roleId ? await this.prisma.role.findUnique({
            where: { id: user.roleId },
            include: { permissions: { include: { permission: true } } }
        }) : null;

        const role = roleWithPerms?.name || 'CUSTOMER';
        const rolePermissions = roleWithPerms?.permissions.map(p => p.permission.name) || [];
        const permissions = rolePermissions.length > 0 ? rolePermissions : this.getPermissionsForRole(role);

        /* 
        // MFA logic temporarily disabled for local stability
        if (user.mfaEnabled) {
            return {
                mfa_required: true,
                userId: user.id,
                email: user.email,
            };
        }
        */

        const tokens = await this.generateTokens(user.id, user.email, user.fullName, role, permissions);
        await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                role: roleWithPerms || { name: role, permissions: permissions.map(p => ({ permission: { name: p } })) },
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

        const roleWithPerms = user.roleId ? await this.prisma.role.findUnique({
            where: { id: user.roleId },
            include: { permissions: { include: { permission: true } } }
        }) : null;

        const role = roleWithPerms?.name || 'CUSTOMER';
        const permissions = roleWithPerms?.permissions.map(p => p.permission.name) || this.getPermissionsForRole(role);

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

        // Generate a secure reset token (JWT)
        const resetToken = this.jwtService.sign(
            { sub: user.id, email: user.email, type: 'password-reset' },
            {
                secret: this.config.get('JWT_SECRET'),
                expiresIn: '1h'
            }
        );

        const frontendUrl = (await this.settings.getValue('general.frontend_url')) || this.config.get('FRONTEND_URL') || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        // Send email with reset link
        await this.emailService.sendPasswordReset({
            recipientEmail: user.email,
            recipientName: user.fullName || 'Değerli Müşterimiz',
            resetUrl
        });

        return { success: true };
    }

    async resetPassword(token: string, newPasswordStr: string) {
        if (!token || !newPasswordStr) {
            throw new UnauthorizedException('Token ve yeni şifre gerekli.');
        }

        try {
            const decoded = this.jwtService.verify(token, { secret: this.config.get('JWT_SECRET') });
            if (decoded.type !== 'password-reset') {
                throw new UnauthorizedException('Geçersiz token türü.');
            }

            const userId = decoded.sub;
            const user = await this.prisma.user.findUnique({ where: { id: userId } });

            if (!user) {
                throw new UnauthorizedException('Kullanıcı bulunamadı.');
            }

            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(newPasswordStr, salt);

            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    passwordHash,
                    refreshTokenHash: null // Invalidate existing sessions
                }
            });

            return { success: true, message: 'Şifreniz başarıyla güncellendi.' };

        } catch (err) {
            throw new UnauthorizedException('Geçersiz veya süresi dolmuş sıfırlama bağlantısı.');
        }
    }

    async verifyEmail(token: string) {
        if (!token) throw new UnauthorizedException('Token gerekli');
        try {
            const decoded = this.jwtService.verify(token, { secret: this.config.get('JWT_SECRET') });
            const userId = decoded.sub;

            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user) throw new UnauthorizedException('Kullanıcı bulunamadı');

            if (user.status !== 'ACTIVE') {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { status: 'ACTIVE' }
                });
            }
            return { success: true, message: 'Hesabınız başarıyla doğrulandı. Artık giriş yapabilirsiniz.' };
        } catch (err) {
            throw new UnauthorizedException('Geçersiz veya süresi dolmuş doğrulama bağlantısı.');
        }
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: true,
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
            role: user.role?.name || 'customer',
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

        const r = role.toLowerCase();

        if (r === 'admin' || r === 'super-admin') return ['*']; // Full access
        if (r === 'department-manager') return [...basePermissions, 'ticket:assign', 'reports:read', 'settings:read'];
        if (r === 'team-lead') return [...basePermissions, 'ticket:assign', 'reports:read'];
        if (r === 'senior-agent') return [...basePermissions, 'ticket:escalate'];
        if (r === 'agent') return basePermissions;
        if (r === 'customer') return ['ticket:create', 'ticket:update', 'ticket:read', 'kb:read', 'faq:read'];

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

    async testEmailConfig() {
        const health = await this.emailService.healthCheck();
        const envKey = this.config.get('RESEND_API_KEY');
        const mailFrom = this.config.get('MAIL_FROM');
        const frontendUrlEnv = this.config.get('FRONTEND_URL');

        const dbSettings = await this.prisma.setting.findMany({
            where: {
                key: {
                    in: [
                        'email.active_provider',
                        'general.frontend_url',
                        'branding.logo_url',
                        'branding.help_center_url'
                    ]
                }
            }
        });

        return {
            health,
            config: {
                env: {
                    hasResendKey: !!envKey,
                    resendKeyPrefix: envKey ? `${envKey.substring(0, 10)}...` : null,
                    mailFrom,
                    frontendUrl: frontendUrlEnv,
                },
                db: dbSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}),
                sourceReminder: 'If DATABASE holds a key, it overrides .env'
            },
            timestamp: new Date().toISOString()
        };
    }
}

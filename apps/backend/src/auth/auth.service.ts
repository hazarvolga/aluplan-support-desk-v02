import { Injectable, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';
import { SettingsService } from '../settings/settings.service';
import { RedisService } from '../redis/redis.service';
import { CrmEmailValidatorService } from '../crm/crm-email-validator.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
        private readonly emailService: EmailService,
        private readonly settings: SettingsService,
        private readonly redisService: RedisService,
        private readonly crmEmailValidator: CrmEmailValidatorService,
    ) { }

    async login(dto: LoginDto): Promise<any> {
        this.logger.debug(`Attempting login for user ID resolution (email masked)`);
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });

            if (!user) {
                this.logger.warn(`Login failed: User NOT found in DB`);
                throw new UnauthorizedException('Invalid credentials');
            }

            if (user.deletedAt) {
                this.logger.warn(`Login failed: User is SOFT-DELETED`);
                throw new UnauthorizedException('Invalid credentials');
            }

            if (user.status !== 'ACTIVE') {
                this.logger.warn(`Login failed: User has status: [${user.status}]`);
                throw new UnauthorizedException('Account is not active');
            }

            const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
            if (!passwordValid) {
                this.logger.warn(`Login failed: Password mismatch`);
                throw new UnauthorizedException('Invalid credentials');
            }

            const roleWithPerms = user.roleId ? await this.prisma.role.findUnique({
                where: { id: user.roleId },
                include: { permissions: { include: { permission: true } } }
            }) : null;

            const role = roleWithPerms?.name || 'CUSTOMER';
            const rolePermissions = roleWithPerms?.permissions.map(p => p.permission.name) || [];
            const permissions = rolePermissions.length > 0 ? rolePermissions : this.getPermissionsForRole(role);

            const tokens = await this.generateTokens(user.id, user.email, user.fullName, role, permissions);

            await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

            this.logger.log(`Login SUCCESS for user ID: ${user.id}`);
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
        } catch (error) {
            this.logger.error(`[CRITICAL] Login Exception:`, error);
            throw error;
        }
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

    async logout(userId: string, jti?: string) {
        await this.prisma.user.updateMany({
            where: { id: userId, refreshTokenHash: { not: null } },
            data: { refreshTokenHash: null }
        });

        if (jti) {
            // Blacklist the token for its remaining max life (15 mins)
            await this.redisService.set(`jwt:blacklist:${jti}`, 'revoked', 15 * 60);
        }

        return { success: true };
    }

    async forceLogout(userId: string) {
        // 1. Clear all refresh tokens — prevents token refresh
        await this.prisma.user.updateMany({
            where: { id: userId },
            data: { refreshTokenHash: null }
        });

        // 2. Mark all existing sessions as invalidated via Redis
        // Any JWT issued before this timestamp will be rejected by JwtStrategy
        await this.redisService.set(
            `user:${userId}:force_logout_at`,
            Date.now().toString(),
            15 * 60 // 15 min TTL — matches max JWT lifetime
        );

        this.logger.warn(`🔒 Admin force-logout executed for user ${userId}`);

        return { success: true, message: 'All sessions invalidated', userId };
    }

    async lookupEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            // Check if user was soft-deleted
            if (user.deletedAt) {
                this.logger.debug(`lookupEmail: User found but SOFT-DELETED`);
                return { action: 'DELETED', companyName: null };
            }
            // Check if user is not active (PENDING, SUSPENDED, etc.)
            if (user.status !== 'ACTIVE') {
                this.logger.debug(`lookupEmail: User found but status is ${user.status}`);
                return { action: 'INACTIVE', status: user.status, companyName: null };
            }
            return { action: 'CLAIM' };
        }

        // ── User does NOT exist in DB — new registration path ────────────────
        // Determine the intended action (NEW or NEW_MATCHED_COMPANY) first,
        // then gate it behind CRM validation (unless admin bypass applies).

        const domain = email.split('@')[1];
        if (!domain) {
            // Malformed email — run CRM check before allowing registration
            return await this.validateNewUserWithCrm(email, 'NEW', null);
        }

        const publicDomains = [
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
            'icloud.com', 'live.com', 'yandex.com', 'yandex.com.tr', 'mynet.com'
        ];

        if (publicDomains.includes(domain.toLowerCase())) {
            return await this.validateNewUserWithCrm(email, 'NEW', null);
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
            return await this.validateNewUserWithCrm(email, 'NEW_MATCHED_COMPANY', matchedProfile.companyName);
        }

        return await this.validateNewUserWithCrm(email, 'NEW', null);
    }

    /**
     * Runs CRM validation for a new (not-yet-registered) user.
     * Admin bypass emails skip the CRM check entirely.
     *
     * @param email       - The email address being looked up
     * @param action      - The intended action ('NEW' | 'NEW_MATCHED_COMPANY')
     * @param companyName - Company name for NEW_MATCHED_COMPANY, null otherwise
     */
    private async validateNewUserWithCrm(
        email: string,
        action: 'NEW' | 'NEW_MATCHED_COMPANY',
        companyName: string | null,
    ) {
        // Admin bypass — skip CRM check
        if (this.crmEmailValidator.isAdminBypass(email)) {
            this.logger.debug(`lookupEmail: Admin bypass — skipping CRM check for ${action}`);
            return { action, companyName };
        }

        // CRM validation
        const result = await this.crmEmailValidator.validateEmailInCrm(email);

        if (!result.isValid) {
            this.logger.debug(`lookupEmail: CRM rejected email — errorCode: ${result.errorCode}`);
            return { action: 'CRM_REJECTED', errorMessage: result.errorMessage };
        }

        return { action, companyName };
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

        } catch (_err) {
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
        } catch (_err) {
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
            role: user.role?.name || 'CUSTOMER',
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
        const jti = crypto.randomUUID();
        const payload = { sub: userId, email, fullName, role, permissions, jti };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_SECRET'),
                expiresIn: this.config.get('JWT_EXPIRES_IN', '1h'),
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
        const _health = await this.emailService.healthCheck();
        const _envKey = this.config.get('RESEND_API_KEY');
        const _mailFrom = this.config.get('MAIL_FROM');
        const _frontendUrlEnv = this.config.get('FRONTEND_URL');

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
            _health,
            config: {
                env: {
                    hasResendKey: !!_envKey,
                    resendKeyPrefix: _envKey ? `${_envKey.substring(0, 10)}...` : null,
                    mailFrom: _mailFrom,
                    frontendUrl: _frontendUrlEnv,
                },
                db: dbSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}),
                sourceReminder: 'If DATABASE holds a key, it overrides .env'
            },
            timestamp: new Date().toISOString()
        };
    }

    async getSystemRequirements(locale: string = 'en') {
        const rawJson = await this.settings.getValue('SYSTEM_REQUIREMENTS');
        if (!rawJson) return [];

        try {
            const allReqs = JSON.parse(rawJson);
            // Return requirements for requested locale or fallback to 'en'
            return allReqs[locale] || allReqs['en'] || [];
        } catch (e) {
            console.error('Failed to parse SYSTEM_REQUIREMENTS setting', e);
            return [];
        }
    }
}

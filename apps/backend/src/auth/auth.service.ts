import { Injectable, UnauthorizedException, ForbiddenException, ServiceUnavailableException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from './security.constants';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';
import { SettingsService } from '../settings/settings.service';
import { RedisService } from '../redis/redis.service';
import { CrmEmailValidatorService } from '../crm/crm-email-validator.service';
import * as crypto from 'crypto';
import { normalizeEmailAddress } from '../common/utils/email-normalization.util';
import { resolveSessionAuthority } from './session-authority';

const AUTH_ACTION_SECRET = 'AUTH_ACTION_JWT_SECRET';
const EMAIL_VERIFICATION_AUDIENCE = 'aluplan:email-verification';
const PASSWORD_RESET_AUDIENCE = 'aluplan:password-reset';
const AUTH_ACTION_ISSUER = 'aluplan-support';
const AUTH_ACTION_ALGORITHM = 'HS256' as const;

function hashActionTokenJti(jti: string): string {
    return crypto.createHash('sha256').update(jti).digest('hex');
}

function durationToSeconds(value: string): number {
    const match = /^(\d+)\s*(s|m|h|d)$/i.exec(value.trim());
    if (!match) return 24 * 60 * 60;
    const amount = Number(match[1]);
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 } as const;
    return amount * multipliers[match[2].toLowerCase() as keyof typeof multipliers];
}

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
        const email = normalizeEmailAddress(dto.email);
        this.logger.debug(`Attempting login for user ID resolution (email masked)`);
        try {
            const user = await this.findUserByEmail(email);

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

            const authority = resolveSessionAuthority(roleWithPerms);
            if (!authority) {
                throw new UnauthorizedException('Invalid credentials');
            }
            const { role, permissions } = authority;

            const tokens = await this.generateTokens(
                user.id, user.email, user.fullName, role, permissions, user.sessionVersion ?? 0,
            );

            await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

            this.logger.log(`Login SUCCESS for user ID: ${user.id}`);
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    avatarUrl: user.avatarUrl,
                    role: roleWithPerms,
                },
                ...tokens,
            };
        } catch (error) {
            this.logger.error(`[CRITICAL] Login Exception:`, error);
            throw error;
        }
    }

    async refreshTokens(userId: string, refreshToken: string, tokenSessionVersion = 0) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (
            !user
            || user.status !== 'ACTIVE'
            || user.deletedAt
            || !user.refreshTokenHash
            || (user.sessionVersion ?? 0) !== tokenSessionVersion
        ) {
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

        const authority = resolveSessionAuthority(roleWithPerms);
        if (!authority) {
            throw new ForbiddenException('Access denied');
        }
        const { role, permissions } = authority;

        const tokens = await this.generateTokens(
            userId, user.email, user.fullName, role, permissions, user.sessionVersion ?? 0,
        );
        const nextRefreshTokenHash = await bcrypt.hash(tokens.refresh_token, BCRYPT_ROUNDS);
        const rotated = await this.prisma.user.updateMany({
            where: {
                id: user.id,
                status: 'ACTIVE',
                deletedAt: null,
                sessionVersion: user.sessionVersion ?? 0,
                refreshTokenHash: user.refreshTokenHash,
            },
            data: { refreshTokenHash: nextRefreshTokenHash },
        });
        if (rotated.count !== 1) {
            throw new ForbiddenException('Access denied');
        }

        return tokens;
    }

    async logout(userId: string, jti?: string, expiration?: number) {
        const nowSeconds = Date.now() / 1000;
        if (typeof expiration !== 'number' || !Number.isFinite(expiration) || expiration <= nowSeconds) {
            throw new UnauthorizedException('Invalid session');
        }

        // A legacy token has no per-token revocation key; invalidate all its user's sessions durably.
        if (!jti) {
            await this.prisma.user.updateMany({
                where: { id: userId },
                data: { refreshTokenHash: null, sessionVersion: { increment: 1 } },
            });
            return { success: true };
        }

        await this.prisma.user.updateMany({
            where: { id: userId, refreshTokenHash: { not: null } },
            data: { refreshTokenHash: null }
        });

        // Retain revocation until the verified token actually expires, including long-lived tokens.
        const remainingLifetime = Math.max(1, Math.ceil(expiration - nowSeconds));
        await this.redisService.set(`jwt:blacklist:${jti}`, 'revoked', remainingLifetime);

        return { success: true };
    }

    async forceLogout(userId: string) {
        // Durable session version invalidates both access and refresh tokens.
        await this.prisma.user.updateMany({
            where: { id: userId },
            data: { refreshTokenHash: null, sessionVersion: { increment: 1 } }
        });

        // Redis is an optimization/legacy compatibility marker, not the security boundary.
        try {
            await this.invalidateAccessSessions(userId);
        } catch (error) {
            this.logger.warn(`Redis force-logout marker failed after durable invalidation for user ${userId}`, error);
        }

        this.logger.warn(`🔒 Admin force-logout executed for user ${userId}`);

        return { success: true, message: 'All sessions invalidated', userId };
    }

    private async invalidateAccessSessions(userId: string) {
        const accessTtlSeconds = durationToSeconds(this.config.get('JWT_EXPIRES_IN', '24h'));
        await this.redisService.set(
            `user:${userId}:force_logout_at`,
            Date.now().toString(),
            accessTtlSeconds,
        );
    }

    async lookupEmail(email: string) {
        const normalizedEmail = normalizeEmailAddress(email);
        const user = await this.findUserByEmail(normalizedEmail);

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
        // then gate it behind CRM validation for every new customer.

        const domain = normalizedEmail.split('@')[1];
        if (!domain) {
            // Malformed email — run CRM check before allowing registration
            return await this.validateNewUserWithCrm(normalizedEmail, 'NEW', null);
        }

        const publicDomains = [
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
            'icloud.com', 'live.com', 'yandex.com', 'yandex.com.tr', 'mynet.com'
        ];

        if (publicDomains.includes(domain.toLowerCase())) {
            return await this.validateNewUserWithCrm(normalizedEmail, 'NEW', null);
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
            return await this.validateNewUserWithCrm(normalizedEmail, 'NEW_MATCHED_COMPANY', matchedProfile.companyName);
        }

        return await this.validateNewUserWithCrm(normalizedEmail, 'NEW', null);
    }

    /**
     * Runs CRM validation for a new (not-yet-registered) user.
     * Submitted email addresses never establish staff authority or bypass customer CRM membership.
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
        const unavailableMessage = 'CRM kaydı şu anda doğrulanamıyor. Lütfen daha sonra tekrar deneyin.';
        let result: Awaited<ReturnType<CrmEmailValidatorService['validateEmailInCrm']>>;
        try {
            result = await this.crmEmailValidator.validateEmailInCrm(email);
        } catch {
            this.logger.warn('lookupEmail: CRM validation unavailable');
            throw new ServiceUnavailableException(unavailableMessage);
        }

        if (result?.isValid !== true) {
            if (result?.errorCode === 'NOT_FOUND') {
                this.logger.debug('lookupEmail: CRM customer membership not found');
                return {
                    action: 'CRM_REJECTED',
                    errorMessage: 'Bu e-posta adresi CRM sisteminde kayıtlı değil.',
                };
            }
            this.logger.warn('lookupEmail: CRM validation unavailable or malformed');
            throw new ServiceUnavailableException(unavailableMessage);
        }

        return { action, companyName };
    }

    async forgotPassword(email: string) {
        const user = await this.findUserByEmail(email);

        if (!user) {
            // Return generic success to prevent email enumeration
            return { success: true };
        }

        const resetCooldownMs = 2 * 60 * 1000;
        const cutoff = new Date(Date.now() - resetCooldownMs);
        if (user.passwordResetSentAt && user.passwordResetSentAt > cutoff) {
            return { success: true };
        }

        const previousJtiHash = user.passwordResetJtiHash;
        const previousSentAt = user.passwordResetSentAt;
        const jti = crypto.randomUUID();
        const jtiHash = hashActionTokenJti(jti);
        const sentAt = new Date();
        const claimed = await this.prisma.user.updateMany({
            where: {
                id: user.id,
                deletedAt: null,
                OR: [
                    { passwordResetSentAt: null },
                    { passwordResetSentAt: { lte: cutoff } },
                ],
            },
            data: { passwordResetJtiHash: jtiHash, passwordResetSentAt: sentAt },
        });
        if (claimed.count !== 1) return { success: true };

        const resetToken = this.jwtService.sign(
            { sub: user.id, email: user.email, purpose: 'password_reset', jti },
            {
                secret: this.config.get(AUTH_ACTION_SECRET),
                audience: PASSWORD_RESET_AUDIENCE,
                issuer: AUTH_ACTION_ISSUER,
                algorithm: AUTH_ACTION_ALGORITHM,
                expiresIn: '30m'
            }
        );

        const frontendUrl = (await this.settings.getValue('general.frontend_url')) || this.config.get('FRONTEND_URL') || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password#token=${resetToken}`;

        try {
            await this.emailService.sendPasswordReset({
                recipientEmail: user.email,
                recipientName: user.fullName || 'Değerli Müşterimiz',
                resetUrl
            });
        } catch (error) {
            await this.prisma.user.updateMany({
                where: { id: user.id, passwordResetJtiHash: jtiHash },
                data: { passwordResetJtiHash: previousJtiHash, passwordResetSentAt: previousSentAt },
            });
            this.logger.error('Password reset email enqueue failed; previous challenge restored', error);
        }

        return { success: true };
    }

    async resendVerification(email: string) {
        const user = await this.findUserByEmail(email);
        if (!user || user.deletedAt || user.status !== 'INACTIVE') {
            return { success: true };
        }

        const resendCooldownMs = 2 * 60 * 1000;
        const cutoff = new Date(Date.now() - resendCooldownMs);
        if (user.emailVerificationSentAt && user.emailVerificationSentAt > cutoff) {
            return { success: true };
        }

        const previousJtiHash = user.emailVerificationJtiHash;
        const previousSentAt = user.emailVerificationSentAt;
        const jti = crypto.randomUUID();
        const jtiHash = hashActionTokenJti(jti);
        const sentAt = new Date();
        const updated = await this.prisma.user.updateMany({
            where: {
                id: user.id,
                status: 'INACTIVE',
                deletedAt: null,
                OR: [
                    { emailVerificationSentAt: null },
                    { emailVerificationSentAt: { lte: cutoff } },
                ],
            },
            data: { emailVerificationJtiHash: jtiHash, emailVerificationSentAt: sentAt },
        });
        if (updated.count !== 1) return { success: true };

        const token = this.jwtService.sign(
            { sub: user.id, email: user.email, purpose: 'email_verify', jti },
            {
                secret: this.config.get(AUTH_ACTION_SECRET),
                audience: EMAIL_VERIFICATION_AUDIENCE,
                issuer: AUTH_ACTION_ISSUER,
                algorithm: AUTH_ACTION_ALGORITHM,
                expiresIn: '30m',
            },
        );
        const frontendUrl = (await this.settings.getValue('general.frontend_url'))
            || this.config.get('FRONTEND_URL')
            || 'http://localhost:3000';

        try {
            await this.emailService.sendEmailVerification({
                recipientEmail: user.email,
                recipientName: user.fullName || 'Değerli Müşterimiz',
                verificationUrl: `${frontendUrl}/verify-email#token=${token}`,
            });
        } catch (error) {
            await this.prisma.user.updateMany({
                where: { id: user.id, emailVerificationJtiHash: jtiHash },
                data: {
                    emailVerificationJtiHash: previousJtiHash,
                    emailVerificationSentAt: previousSentAt,
                },
            });
            this.logger.error('Verification email enqueue failed; previous challenge restored', error);
        }
        return { success: true };
    }

    async resetPassword(token: string, newPasswordStr: string) {
        if (!token || !newPasswordStr) {
            throw new UnauthorizedException('Token ve yeni şifre gerekli.');
        }

        try {
            const decoded = this.jwtService.verify(token, {
                secret: this.config.get(AUTH_ACTION_SECRET),
                audience: PASSWORD_RESET_AUDIENCE,
                issuer: AUTH_ACTION_ISSUER,
                algorithms: [AUTH_ACTION_ALGORITHM],
            });
            if (decoded.purpose !== 'password_reset' || !decoded.sub || !decoded.jti || !decoded.email) {
                throw new UnauthorizedException('Geçersiz token türü.');
            }

            const userId = decoded.sub;
            const passwordHash = await bcrypt.hash(newPasswordStr, BCRYPT_ROUNDS);

            const updated = await this.prisma.user.updateMany({
                where: {
                    id: userId,
                    email: normalizeEmailAddress(decoded.email),
                    deletedAt: null,
                    passwordResetJtiHash: hashActionTokenJti(decoded.jti),
                },
                data: {
                    passwordHash,
                    refreshTokenHash: null,
                    passwordResetJtiHash: null,
                    sessionVersion: { increment: 1 },
                }
            });
            if (updated.count !== 1) {
                throw new UnauthorizedException('Token daha önce kullanılmış veya geçersiz.');
            }

            try {
                await this.invalidateAccessSessions(userId);
            } catch (error) {
                this.logger.warn(`Redis session marker failed after durable reset for user ${userId}`, error);
            }

            return { success: true, message: 'Şifreniz başarıyla güncellendi.' };

        } catch (_err) {
            throw new UnauthorizedException('Geçersiz veya süresi dolmuş sıfırlama bağlantısı.');
        }
    }

    async verifyEmail(token: string) {
        if (!token) throw new UnauthorizedException('Token gerekli');
        try {
            const decoded = this.jwtService.verify(token, {
                secret: this.config.get(AUTH_ACTION_SECRET),
                audience: EMAIL_VERIFICATION_AUDIENCE,
                issuer: AUTH_ACTION_ISSUER,
                algorithms: [AUTH_ACTION_ALGORITHM],
            });
            if (decoded.purpose !== 'email_verify' || !decoded.sub || !decoded.jti || !decoded.email) {
                throw new UnauthorizedException('Geçersiz token amacı.');
            }

            const updated = await this.prisma.user.updateMany({
                where: {
                    id: decoded.sub,
                    email: normalizeEmailAddress(decoded.email),
                    status: 'INACTIVE',
                    deletedAt: null,
                    emailVerificationJtiHash: hashActionTokenJti(decoded.jti),
                },
                data: {
                    status: 'ACTIVE',
                    emailVerificationJtiHash: null,
                },
            });
            if (updated.count !== 1) {
                throw new UnauthorizedException('Token daha önce kullanılmış veya hesap doğrulanamaz.');
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
                role: { include: { permissions: { include: { permission: true } } } },
                customerProfile: {
                    select: {
                        id: true,
                        isVip: true,
                        hotinfoData: true,
                        hotinfoUpdatedAt: true,
                    }
                }
            }
        });

        if (!user) return null;

        const authority = resolveSessionAuthority(user.role);

        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            status: user.status,
            role: authority?.role || 'CUSTOMER',
            permissions: authority?.permissions || [],
            agentStatus: user.agentStatus,
            isSupportTeamMember: await this.isActiveSupportTeamMember(user.id),
            customerProfile: user.customerProfile
        };
    }

    private async isActiveSupportTeamMember(userId: string): Promise<boolean> {
        const count = await this.prisma.teamMember.count({
            where: {
                userId,
                team: {
                    isArchived: false,
                    deletedAt: null,
                },
            },
        });

        return count > 0;
    }

    private async generateTokens(
        userId: string,
        email: string,
        fullName: string,
        role: string,
        permissions: string[],
        sessionVersion: number,
    ) {
        const jti = crypto.randomUUID();
        const payload = {
            sub: userId, email, fullName, role, permissions, jti,
            sessionIssuedAt: Date.now(), sessionVersion,
        };

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

    private async findUserByEmail(email: string) {
        const normalizedEmail = normalizeEmailAddress(email);
        const exact = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (exact) return exact;

        return this.prisma.user.findFirst({
            where: {
                email: {
                    equals: normalizedEmail,
                    mode: 'insensitive',
                },
            },
        });
    }

    private async updateRefreshTokenHash(userId: string, refreshToken: string) {
const hash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
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
            this.logger.error('Failed to parse SYSTEM_REQUIREMENTS setting', e);
            return [];
        }
    }
}

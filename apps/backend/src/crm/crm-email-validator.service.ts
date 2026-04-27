import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CrmService } from './crm.service';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ICrmEmailValidator {
    validateEmailInCrm(email: string): Promise<CrmValidationResult>;
    isAdminBypass(email: string): boolean;
}

export interface CrmValidationResult {
    isValid: boolean;
    contactId?: string;
    errorCode?: 'NOT_FOUND' | 'CRM_ERROR' | 'NETWORK_ERROR';
    errorMessage?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class CrmEmailValidatorService implements ICrmEmailValidator {
    private readonly logger = new Logger(CrmEmailValidatorService.name);

    /** Basic RFC-5322-inspired email format check (no CRM query needed for malformed input) */
    private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    /**
     * In-memory cache of the parsed admin bypass email list.
     * Populated lazily on first call to isAdminBypass().
     */
    private adminBypassEmails: string[] | null = null;

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly config: ConfigService,
        @Inject(forwardRef(() => CrmService))
        private readonly crmService: CrmService,
    ) {}

    // ─── Private Helpers ─────────────────────────────────────────────────────

    /**
     * Returns a SHA-256 hex digest of the lowercased email address.
     * Used as the cache key suffix to avoid storing raw email addresses in Redis.
     */
    private hashEmail(email: string): string {
        return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
    }

    /**
     * Retries an async operation with configurable delays between attempts.
     * Only retries on errors — if the operation resolves (even with a null
     * result) it is considered successful and returned immediately.
     *
     * @param fn          - The async operation to execute
     * @param maxAttempts - Maximum number of total attempts (including the first)
     * @param delays      - Array of millisecond delays between attempts.
     *                      delays[0] is used between attempt 1 and 2, etc.
     * @returns The resolved value of the first successful attempt
     * @throws  The last error encountered after all attempts are exhausted
     */
    private async retryWithBackoff<T>(
        fn: () => Promise<T>,
        maxAttempts: number,
        delays: number[],
    ): Promise<T> {
        let lastError: unknown;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (err) {
                lastError = err;

                if (attempt < maxAttempts) {
                    const delay = delays[attempt - 1] ?? delays[delays.length - 1];
                    this.logger.warn(
                        `CRM lookup attempt ${attempt}/${maxAttempts} failed — retrying in ${delay}ms`,
                    );
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError;
    }

    /**
     * Loads and caches the admin bypass email list from the ADMIN_BYPASS_EMAILS
     * environment variable (comma-separated). Falls back to the default admin
     * address when the variable is not set.
     *
     * Security: each entry is trimmed and lowercased; empty strings are dropped.
     */
    private getAdminBypassEmails(): string[] {
        if (this.adminBypassEmails !== null) {
            return this.adminBypassEmails;
        }

        const raw = this.config.get<string>('ADMIN_BYPASS_EMAILS');

        if (raw && raw.trim().length > 0) {
            this.adminBypassEmails = raw
                .split(',')
                .map((e) => e.trim().toLowerCase())
                .filter((e) => e.length > 0 && this.emailRegex.test(e));

            // Security: warn if any entry was dropped due to invalid format
            const rawCount = raw.split(',').filter((e) => e.trim().length > 0).length;
            if (this.adminBypassEmails.length !== rawCount) {
                this.logger.warn(
                    `ADMIN_BYPASS_EMAILS contains ${rawCount - this.adminBypassEmails.length} invalid entry/entries that were ignored.`,
                );
            }
        } else {
            this.adminBypassEmails = ['hazarvolga@gmail.com'];
        }

        return this.adminBypassEmails;
    }

    /**
     * Masks an email address for safe inclusion in audit logs.
     * Shows the first 2 characters of the local part, then "***", then the full domain.
     *
     * Examples:
     *   hazarvolga@gmail.com  →  ha***@gmail.com
     *   a@example.com         →  a***@example.com
     */
    private maskEmail(email: string): string {
        const atIndex = email.indexOf('@');
        if (atIndex < 0) {
            // Malformed — return a fully masked placeholder
            return '***';
        }

        const local = email.slice(0, atIndex);
        const domain = email.slice(atIndex); // includes the '@'
        const visiblePrefix = local.slice(0, Math.min(2, local.length));

        return `${visiblePrefix}***${domain}`;
    }

    // ─── Public API ──────────────────────────────────────────────────────────

    /**
     * Validates whether the given email address exists in the CRM system.
     *
     * Steps:
     *  1. Reject malformed email addresses immediately (no CRM query).
     *  2. Call CrmService.findContactByEmail with up to 3 attempts using
     *     exponential backoff (500 ms → 1 000 ms → 2 000 ms).
     *  3. Return a structured CrmValidationResult:
     *     - Contact found     → { isValid: true, contactId }
     *     - Contact not found → { isValid: false, errorCode: 'NOT_FOUND' }
     *     - DB / network error → { isValid: false, errorCode: 'CRM_ERROR' }
     *  4. Log performance metrics (start time, end time, outcome).
     */
    async validateEmailInCrm(email: string): Promise<CrmValidationResult> {
        // Input format guard — prevents unnecessary CRM queries for malformed emails
        if (!this.emailRegex.test(email)) {
            this.logger.warn(`Invalid email format rejected before CRM query: ${email}`);
            return {
                isValid: false,
                errorCode: 'NOT_FOUND',
                errorMessage: 'Geçersiz e-posta formatı',
            };
        }

        const maskedEmail = this.maskEmail(email);
        const emailHash = this.hashEmail(email);
        const cacheKeyValid = `crm:email:valid:${emailHash}`;
        const cacheKeyInvalid = `crm:email:invalid:${emailHash}`;

        // ── Cache check ──────────────────────────────────────────────────────
        const cacheStart = Date.now();

        const cachedValid = await this.redis.get(cacheKeyValid);
        if (cachedValid !== null) {
            this.logger.log({
                action: 'crm_cache_hit',
                email: maskedEmail,
                result: 'valid',
                durationMs: Date.now() - cacheStart,
            });
            return { isValid: true, contactId: cachedValid };
        }

        const cachedInvalid = await this.redis.get(cacheKeyInvalid);
        if (cachedInvalid !== null) {
            this.logger.log({
                action: 'crm_cache_hit',
                email: maskedEmail,
                result: 'invalid',
                durationMs: Date.now() - cacheStart,
            });
            return {
                isValid: false,
                errorCode: 'NOT_FOUND',
                errorMessage:
                    'Bu e-posta adresi CRM sisteminde kayıtlı değil. Lütfen şirketinizin CRM sisteminde kayıtlı e-posta adresinizi kullanın.',
            };
        }

        // ── CRM lookup ───────────────────────────────────────────────────────
        const startTime = Date.now();

        try {
            const contact = await this.retryWithBackoff(
                () => this.crmService.findContactByEmail(email),
                3,
                [500, 1000, 2000],
            );

            const endTime = Date.now();
            const durationMs = endTime - startTime;

            if (contact) {
                // Cache the valid result for 1 hour
                await this.redis.set(cacheKeyValid, contact.contactId, 3600);

                this.logger.log({
                    action: 'crm_cache_miss',
                    email: maskedEmail,
                    result: 'valid',
                    contactId: contact.contactId,
                    durationMs,
                    timestamp: new Date(endTime).toISOString(),
                });

                return {
                    isValid: true,
                    contactId: contact.contactId,
                };
            }

            // Cache the invalid result for 15 minutes
            await this.redis.set(cacheKeyInvalid, '1', 900);

            this.logger.log({
                action: 'crm_cache_miss',
                email: maskedEmail,
                result: 'not_found',
                durationMs,
                timestamp: new Date(endTime).toISOString(),
            });

            return {
                isValid: false,
                errorCode: 'NOT_FOUND',
                errorMessage:
                    'Bu e-posta adresi CRM sisteminde kayıtlı değil. Lütfen şirketinizin CRM sisteminde kayıtlı e-posta adresinizi kullanın.',
            };
        } catch (err) {
            const endTime = Date.now();
            const durationMs = endTime - startTime;

            // Do NOT cache errors — let the next request retry the CRM
            this.logger.error({
                action: 'crm_validation',
                email: maskedEmail,
                result: 'error',
                durationMs,
                timestamp: new Date(endTime).toISOString(),
                error: err instanceof Error ? err.message : String(err),
            });

            return {
                isValid: false,
                errorCode: 'CRM_ERROR',
                errorMessage: 'Sistem geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
            };
        }
    }

    /**
     * Returns true when the email matches a configured admin bypass address,
     * allowing registration to proceed without CRM validation.
     *
     * The bypass list is loaded from the ADMIN_BYPASS_EMAILS environment variable
     * (comma-separated) and cached in memory. Falls back to ['hazarvolga@gmail.com']
     * when the variable is not set.
     *
     * Emits a structured audit log entry whenever a bypass is triggered.
     */
    isAdminBypass(email: string): boolean {
        const normalised = email.toLowerCase();
        const bypassList = this.getAdminBypassEmails();
        const isBypass = bypassList.includes(normalised);

        if (isBypass) {
            this.logger.log({
                action: 'admin_bypass',
                email: this.maskEmail(normalised),
                timestamp: new Date().toISOString(),
            });
        }

        return isBypass;
    }
}

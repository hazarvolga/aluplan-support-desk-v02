import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { CrmEmailValidatorService } from './crm-email-validator.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CrmService } from './crm.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildService(adminBypassEmails?: string): CrmEmailValidatorService {
    const configGet = jest.fn((key: string) => {
        if (key === 'ADMIN_BYPASS_EMAILS') return adminBypassEmails;
        return undefined;
    });

    const service = new CrmEmailValidatorService(
        {} as PrismaService,
        {} as RedisService,
        { get: configGet } as unknown as ConfigService,
        {} as CrmService,
    );

    // Silence logger output during tests
    jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);

    return service;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CrmEmailValidatorService — isAdminBypass', () => {
    describe('no bypass list configured (env var not set)', () => {
        let service: CrmEmailValidatorService;

        beforeEach(() => {
            service = buildService(undefined);
        });

        it('returns false when no bypass emails are configured', () => {
            expect(service.isAdminBypass('admin@example.com')).toBe(false);
        });

        it('returns false for any email when no config', () => {
            expect(service.isAdminBypass('HAZARVOLGA@GMAIL.COM')).toBe(false);
        });

        it('returns false for non-configured emails', () => {
            expect(service.isAdminBypass('HazarVolga@Gmail.Com')).toBe(false);
        });

        it('returns false for a non-admin email', () => {
            expect(service.isAdminBypass('user@example.com')).toBe(false);
        });

        it('returns false for an empty string', () => {
            expect(service.isAdminBypass('')).toBe(false);
        });
    });

    describe('custom bypass list from ADMIN_BYPASS_EMAILS env var', () => {
        it('returns true for an email in the custom list', () => {
            const service = buildService('admin@example.com,ops@company.io');
            expect(service.isAdminBypass('admin@example.com')).toBe(true);
            expect(service.isAdminBypass('ops@company.io')).toBe(true);
        });

        it('is case-insensitive for custom list entries', () => {
            const service = buildService('Admin@Example.COM');
            expect(service.isAdminBypass('admin@example.com')).toBe(true);
        });

        it('trims whitespace around entries', () => {
            const service = buildService('  admin@example.com , ops@company.io  ');
            expect(service.isAdminBypass('admin@example.com')).toBe(true);
            expect(service.isAdminBypass('ops@company.io')).toBe(true);
        });

        it('ignores invalid email entries in the env var', () => {
            const service = buildService('not-an-email,valid@example.com');
            expect(service.isAdminBypass('not-an-email')).toBe(false);
            expect(service.isAdminBypass('valid@example.com')).toBe(true);
        });

        it('returns true for configured admin when a custom list is set', () => {
            const service = buildService('admin@example.com');
            expect(service.isAdminBypass('admin@example.com')).toBe(true);
        });

        it('falls back to empty list when env var is an empty string', () => {
            const service = buildService('');
            expect(service.isAdminBypass('admin@example.com')).toBe(false);
        });

        it('falls back to empty list when env var contains only whitespace', () => {
            const service = buildService('   ');
            expect(service.isAdminBypass('admin@example.com')).toBe(false);
        });
    });

    describe('in-memory caching of bypass list', () => {
        it('reads the config only once across multiple calls', () => {
            const configGet = jest.fn().mockReturnValue('admin@example.com');
            const service = new CrmEmailValidatorService(
                {} as PrismaService,
                {} as RedisService,
                { get: configGet } as unknown as ConfigService,
                {} as CrmService,
            );
            jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);

            service.isAdminBypass('admin@example.com');
            service.isAdminBypass('admin@example.com');
            service.isAdminBypass('other@example.com');

            // ConfigService.get should be called exactly once (lazy init + cache)
            expect(configGet).toHaveBeenCalledTimes(1);
        });
    });

    describe('audit logging on bypass', () => {
        it('logs a structured audit event when bypass is triggered', () => {
            const service = buildService('admin@example.com');
            const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);

            service.isAdminBypass('admin@example.com');

            expect(logSpy).toHaveBeenCalledTimes(1);
            const logArg = logSpy.mock.calls[0][0] as Record<string, unknown>;
            expect(logArg).toMatchObject({
                action: 'admin_bypass',
                timestamp: expect.any(String),
            });
            // Email must be masked — should NOT contain the full local part
            expect(logArg.email).toMatch(/^ad\*\*\*@/);
        });

        it('does NOT log when bypass is not triggered', () => {
            const service = buildService(undefined);
            const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);

            service.isAdminBypass('regular@example.com');

            expect(logSpy).not.toHaveBeenCalled();
        });
    });
});

describe('CrmEmailValidatorService — maskEmail (via audit log)', () => {
    it('masks to first 2 chars + *** + @domain', () => {
        const service = buildService('admin@example.com');
        const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);

        service.isAdminBypass('admin@example.com');

        const logArg = logSpy.mock.calls[0][0] as Record<string, unknown>;
        expect(logArg.email).toBe('ad***@example.com');
    });

    it('handles single-char local part gracefully', () => {
        const service = buildService('a@example.com');
        const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);

        service.isAdminBypass('a@example.com');

        const logArg = logSpy.mock.calls[0][0] as Record<string, unknown>;
        expect(logArg.email).toBe('a***@example.com');
    });
});

// ─── Helper: buildServiceWithCrm ─────────────────────────────────────────────

function buildServiceWithCrm(crmService: any): CrmEmailValidatorService {
    const configGet = jest.fn().mockReturnValue(undefined);
    const redisGet = jest.fn().mockResolvedValue(null);
    const redisSet = jest.fn().mockResolvedValue(undefined);

    const service = new CrmEmailValidatorService(
        {} as PrismaService,
        { get: redisGet, set: redisSet } as unknown as RedisService,
        { get: configGet } as unknown as ConfigService,
        crmService,
    );

    jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
    jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);

    return service;
}

// ─── Property 1: Email Validation Consistency ────────────────────────────────

describe('CrmEmailValidatorService — validateEmailInCrm', () => {
    /**
     * Property 1: Email Validation Consistency
     * Validates: Requirements 1.1, 1.5
     *
     * For any email address input to the registration system, the Email_Validator
     * SHALL return a consistent boolean result structure indicating CRM contact
     * existence, and SHALL trigger appropriate CRM lookup operations.
     */
    describe('Property 1: Email Validation Consistency', () => {
        it('always returns a CrmValidationResult with isValid boolean for any email input', async () => {
            // Test with valid email format - CRM not found
            const crmService = { findContactByEmail: jest.fn().mockResolvedValue(null) } as any;
            const service = buildServiceWithCrm(crmService);

            const result = await service.validateEmailInCrm('test@example.com');
            expect(result).toHaveProperty('isValid');
            expect(typeof result.isValid).toBe('boolean');
        });

        it('returns isValid: false with NOT_FOUND errorCode for malformed email', async () => {
            const service = buildService(undefined);
            const result = await service.validateEmailInCrm('not-an-email');
            expect(result.isValid).toBe(false);
            expect(result.errorCode).toBe('NOT_FOUND');
        });

        it('returns isValid: true with contactId when CRM contact found', async () => {
            const mockContact = {
                contactId: 'contact-123',
                emailAddress: 'user@example.com',
                crmVerified: true,
            };
            const crmService = { findContactByEmail: jest.fn().mockResolvedValue(mockContact) } as any;
            const service = buildServiceWithCrm(crmService);

            const result = await service.validateEmailInCrm('user@example.com');
            expect(result.isValid).toBe(true);
            expect(result.contactId).toBe('contact-123');
        });

        it('returns isValid: false with NOT_FOUND when CRM contact not found', async () => {
            const crmService = { findContactByEmail: jest.fn().mockResolvedValue(null) } as any;
            const service = buildServiceWithCrm(crmService);

            const result = await service.validateEmailInCrm('unknown@example.com');
            expect(result.isValid).toBe(false);
            expect(result.errorCode).toBe('NOT_FOUND');
        });

        it('returns isValid: false with CRM_ERROR when CRM throws', async () => {
            jest.useFakeTimers();

            const crmService = {
                findContactByEmail: jest.fn().mockRejectedValue(new Error('DB error')),
            } as any;
            const service = buildServiceWithCrm(crmService);

            const resultPromise = service.validateEmailInCrm('user@example.com');

            // Advance timers to skip retry backoff delays (500ms + 1000ms + 2000ms)
            await jest.runAllTimersAsync();

            const result = await resultPromise;
            expect(result.isValid).toBe(false);
            expect(result.errorCode).toBe('CRM_ERROR');

            jest.useRealTimers();
        });

        it('triggers CRM lookup for a valid email format', async () => {
            const findContactByEmail = jest.fn().mockResolvedValue(null);
            const crmService = { findContactByEmail } as any;
            const service = buildServiceWithCrm(crmService);

            await service.validateEmailInCrm('lookup@example.com');

            expect(findContactByEmail).toHaveBeenCalledWith('lookup@example.com');
        });

        it('does NOT trigger CRM lookup for a malformed email', async () => {
            const findContactByEmail = jest.fn();
            const crmService = { findContactByEmail } as any;
            const service = buildServiceWithCrm(crmService);

            await service.validateEmailInCrm('not-valid');

            expect(findContactByEmail).not.toHaveBeenCalled();
        });
    });
});

// ─── Property 4: Admin Bypass Audit Logging ──────────────────────────────────

describe('CrmEmailValidatorService — isAdminBypass (Property 4: Admin Bypass Audit Logging)', () => {
    /**
     * Property 4: Admin Bypass Audit Logging
     * Validates: Requirements 2.3
     *
     * For any registration attempt using admin bypass functionality, the system
     * SHALL create audit log entries for security and compliance tracking.
     */
    describe('Property 4: Admin Bypass Audit Logging', () => {
        it('creates an audit log entry when admin bypass is triggered', () => {
            const service = buildService('admin@example.com');
            const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);

            service.isAdminBypass('admin@example.com');

            expect(logSpy).toHaveBeenCalledTimes(1);
            const logArg = logSpy.mock.calls[0][0] as Record<string, unknown>;
            expect(logArg).toMatchObject({
                action: 'admin_bypass',
                timestamp: expect.any(String),
            });
        });

        it('audit log entry contains a masked email (not the raw address)', () => {
            const service = buildService('admin@example.com');
            const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);

            service.isAdminBypass('admin@example.com');

            const logArg = logSpy.mock.calls[0][0] as Record<string, unknown>;
            // Must be masked — raw local part must not appear
            expect(logArg.email).not.toContain('hazarvolga');
            expect(logArg.email).toMatch(/\*\*\*/);
        });

        it('audit log entry contains a valid ISO timestamp', () => {
            const service = buildService('admin@example.com');
            const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);

            const before = new Date().toISOString();
            service.isAdminBypass('admin@example.com');
            const after = new Date().toISOString();

            const logArg = logSpy.mock.calls[0][0] as Record<string, unknown>;
            const ts = logArg.timestamp as string;
            expect(ts >= before).toBe(true);
            expect(ts <= after).toBe(true);
        });

        it('creates an audit log entry for each distinct bypass call', () => {
            const service = buildService('admin@example.com,ops@company.io');
            const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);

            service.isAdminBypass('admin@example.com');
            service.isAdminBypass('ops@company.io');

            expect(logSpy).toHaveBeenCalledTimes(2);
            const actions = logSpy.mock.calls.map((c) => (c[0] as Record<string, unknown>).action);
            expect(actions).toEqual(['admin_bypass', 'admin_bypass']);
        });

        it('does NOT create an audit log entry for non-bypass emails', () => {
            const service = buildService(undefined);
            const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);

            service.isAdminBypass('regular@example.com');

            expect(logSpy).not.toHaveBeenCalled();
        });

        it('creates an audit log entry for bypass regardless of email casing', () => {
            const service = buildService('hazarvolga@gmail.com');
            const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);

            service.isAdminBypass('HAZARVOLGA@GMAIL.COM');

            expect(logSpy).toHaveBeenCalledTimes(1);
            const logArg = logSpy.mock.calls[0][0] as Record<string, unknown>;
            expect(logArg.action).toBe('admin_bypass');
        });
    });
});

// ─── Property 8: Cache Performance Optimization ──────────────────────────────

describe('CrmEmailValidatorService — validateEmailInCrm (Property 8: Cache Performance)', () => {
  /**
   * Property 8: Cache Performance Optimization
   * Validates: Requirements 3.1
   *
   * For any repeated CRM contact lookup requests, the Email_Validator SHALL
   * utilize caching mechanisms while maintaining data freshness according to
   * configured TTL policies.
   */
  describe('Property 8: Cache Performance Optimization', () => {
    it('returns cached valid result without calling CRM on second request', async () => {
      const findContactByEmail = jest.fn().mockResolvedValue({
        contactId: 'contact-123', emailAddress: 'user@example.com', crmVerified: true
      });
      const crmService = { findContactByEmail } as any;

      // Use a stateful in-memory redis mock so the second call gets a cache hit
      const store = new Map<string, string>();
      const redisGet = jest.fn((key: string) => Promise.resolve(store.get(key) ?? null));
      const redisSet = jest.fn((key: string, value: string) => { store.set(key, value); return Promise.resolve(undefined); });
      const service = new CrmEmailValidatorService(
        {} as any,
        { get: redisGet, set: redisSet } as any,
        { get: jest.fn().mockReturnValue(undefined) } as any,
        crmService,
      );
      jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
      jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
      jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);

      // First call: cache miss, calls CRM
      const result1 = await service.validateEmailInCrm('user@example.com');
      expect(result1.isValid).toBe(true);
      expect(findContactByEmail).toHaveBeenCalledTimes(1);

      // Second call: cache hit, should NOT call CRM again
      const result2 = await service.validateEmailInCrm('user@example.com');
      expect(result2.isValid).toBe(true);
      expect(result2.contactId).toBe('contact-123');
      expect(findContactByEmail).toHaveBeenCalledTimes(1); // still 1, not 2
    });

    it('returns cached invalid result without calling CRM on second request', async () => {
      const findContactByEmail = jest.fn().mockResolvedValue(null);
      const crmService = { findContactByEmail } as any;

      // Use a stateful in-memory redis mock so the second call gets a cache hit
      const store = new Map<string, string>();
      const redisGet = jest.fn((key: string) => Promise.resolve(store.get(key) ?? null));
      const redisSet = jest.fn((key: string, value: string) => { store.set(key, value); return Promise.resolve(undefined); });
      const service = new CrmEmailValidatorService(
        {} as any,
        { get: redisGet, set: redisSet } as any,
        { get: jest.fn().mockReturnValue(undefined) } as any,
        crmService,
      );
      jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
      jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
      jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);

      await service.validateEmailInCrm('unknown@example.com');
      await service.validateEmailInCrm('unknown@example.com');

      expect(findContactByEmail).toHaveBeenCalledTimes(1);
    });

    it('caches valid result with 3600s TTL', async () => {
      const mockContact = { contactId: 'c-1', emailAddress: 'user@example.com', crmVerified: true };
      const crmService = { findContactByEmail: jest.fn().mockResolvedValue(mockContact) } as any;

      const redisSet = jest.fn().mockResolvedValue(undefined);
      const configGet = jest.fn().mockReturnValue(undefined);
      const service = new CrmEmailValidatorService(
        {} as any,
        { get: jest.fn().mockResolvedValue(null), set: redisSet } as any,
        { get: configGet } as any,
        crmService,
      );
      jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
      jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
      jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);

      await service.validateEmailInCrm('user@example.com');

      // Should have called redis.set with 3600s TTL for valid result
      const validCacheCall = redisSet.mock.calls.find(c => c[2] === 3600);
      expect(validCacheCall).toBeDefined();
      expect(validCacheCall[1]).toBe('c-1'); // contactId stored as value
    });

    it('caches invalid result with 900s TTL', async () => {
      const crmService = { findContactByEmail: jest.fn().mockResolvedValue(null) } as any;

      const redisSet = jest.fn().mockResolvedValue(undefined);
      const configGet = jest.fn().mockReturnValue(undefined);
      const service = new CrmEmailValidatorService(
        {} as any,
        { get: jest.fn().mockResolvedValue(null), set: redisSet } as any,
        { get: configGet } as any,
        crmService,
      );
      jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
      jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
      jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);

      await service.validateEmailInCrm('unknown@example.com');

      const invalidCacheCall = redisSet.mock.calls.find(c => c[2] === 900);
      expect(invalidCacheCall).toBeDefined();
    });

    it('does NOT cache CRM errors', async () => {
      jest.useFakeTimers();
      const crmService = { findContactByEmail: jest.fn().mockRejectedValue(new Error('DB error')) } as any;

      const redisSet = jest.fn().mockResolvedValue(undefined);
      const configGet = jest.fn().mockReturnValue(undefined);
      const service = new CrmEmailValidatorService(
        {} as any,
        { get: jest.fn().mockResolvedValue(null), set: redisSet } as any,
        { get: configGet } as any,
        crmService,
      );
      jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
      jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
      jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);

      const resultPromise = service.validateEmailInCrm('user@example.com');
      await jest.runAllTimersAsync();
      await resultPromise;

      expect(redisSet).not.toHaveBeenCalled();
      jest.useRealTimers();
    });
  });
});

// ─── Property 10: Retry Logic Consistency ────────────────────────────────────

describe('CrmEmailValidatorService — validateEmailInCrm (Property 10: Retry Logic)', () => {
  /**
   * Property 10: Retry Logic Consistency
   * Validates: Requirements 3.3
   *
   * For any transient CRM connection failure, the Email_Validator SHALL
   * implement consistent retry logic with exponential backoff according to
   * configured retry policies.
   */
  describe('Property 10: Retry Logic Consistency', () => {
    it('retries up to 3 times on transient CRM failure', async () => {
      jest.useFakeTimers();
      const findContactByEmail = jest.fn().mockRejectedValue(new Error('transient error'));
      const crmService = { findContactByEmail } as any;
      const service = buildServiceWithCrm(crmService);

      const resultPromise = service.validateEmailInCrm('user@example.com');
      await jest.runAllTimersAsync();
      await resultPromise;

      expect(findContactByEmail).toHaveBeenCalledTimes(3);
      jest.useRealTimers();
    });

    it('succeeds on second attempt after first failure', async () => {
      jest.useFakeTimers();
      const mockContact = { contactId: 'c-1', emailAddress: 'user@example.com', crmVerified: true };
      const findContactByEmail = jest.fn()
        .mockRejectedValueOnce(new Error('transient'))
        .mockResolvedValueOnce(mockContact);
      const crmService = { findContactByEmail } as any;
      const service = buildServiceWithCrm(crmService);

      const resultPromise = service.validateEmailInCrm('user@example.com');
      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.isValid).toBe(true);
      expect(findContactByEmail).toHaveBeenCalledTimes(2);
      jest.useRealTimers();
    });

    it('returns CRM_ERROR after all 3 attempts fail', async () => {
      jest.useFakeTimers();
      const crmService = { findContactByEmail: jest.fn().mockRejectedValue(new Error('persistent error')) } as any;
      const service = buildServiceWithCrm(crmService);

      const resultPromise = service.validateEmailInCrm('user@example.com');
      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('CRM_ERROR');
      jest.useRealTimers();
    });
  });
});

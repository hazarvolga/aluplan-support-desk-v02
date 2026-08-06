import { CustomersService } from './customers.service';
import { CrmEmailValidatorService } from '../crm/crm-email-validator.service';

// Direct instantiation — avoids NestJS DI circular dependency issues in tests
function buildService(overrides: Partial<{
  crmIsAdminBypass: boolean;
  crmValidationResult: { isValid: boolean; errorCode?: string; errorMessage?: string };
}> = {}) {
  const mockPrisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    role: {
      findUnique: jest.fn().mockResolvedValue({ id: 'role-id', name: 'CUSTOMER' }),
      findFirst: jest.fn().mockResolvedValue({ id: 'role-id', name: 'CUSTOMER' }),
      create: jest.fn(),
    },
    customerProfile: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
    },
    setting: { findUnique: jest.fn().mockResolvedValue(null) },
    $transaction: jest.fn().mockImplementation(async (fn: any) => {
      const txPrisma = {
        user: {
          findUnique: jest.fn().mockResolvedValue(null),
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({
            id: 'user-id',
            email: 'test@example.com',
            fullName: 'Test User',
            passwordHash: 'hash',
            customerProfile: null,
          }),
          update: jest.fn(),
        },
        customerProfile: {
          create: jest.fn().mockResolvedValue({ id: 'profile-id' }),
          update: jest.fn(),
          upsert: jest.fn(),
        },
      };
      return fn(txPrisma);
    }),
  } as any;

  const mockHotinfoParser = { parseHotinfo: jest.fn() } as any;
  const mockEmailService = { enqueueEmail: jest.fn().mockResolvedValue(undefined) } as any;
  const mockJwtService = { sign: jest.fn().mockReturnValue('token') } as any;
  const mockConfigService = {
    get: jest.fn((key: string, fallback?: string) => {
      if (key === 'AUTH_ACTION_JWT_SECRET') return 'test-action-secret';
      if (key === 'FRONTEND_URL') return 'http://localhost:3000';
      return fallback;
    }),
  } as any;
  const mockErrorLogger = { logError: jest.fn().mockResolvedValue(undefined) } as any;
  const mockCrmValidator = {
    isAdminBypass: jest.fn().mockReturnValue(overrides.crmIsAdminBypass ?? false),
    validateEmailInCrm: jest.fn().mockResolvedValue(
      overrides.crmValidationResult ?? { isValid: true, contactId: 'contact-id' }
    ),
  } as unknown as CrmEmailValidatorService;

  const service = new CustomersService(
    mockPrisma,
    mockHotinfoParser,
    mockEmailService,
    mockJwtService,
    mockConfigService,
    mockErrorLogger,
    mockCrmValidator,
  );

  return { service, mockPrisma, mockCrmValidator, mockEmailService, mockErrorLogger, mockJwtService };
}

describe('CustomersService', () => {
  it('should be defined', () => {
    const { service } = buildService();
    expect(service).toBeDefined();
  });

  it('never includes the plaintext registration password in the welcome email payload', async () => {
    const { service, mockEmailService } = buildService();
    await service.registerCustomer({
      email: 'safe-email@example.com', firstName: 'Safe', lastName: 'User',
      password: 'NeverEmailThis123!', usedProducts: [], isAllplanUser: false,
    } as any);

    const payload = mockEmailService.enqueueEmail.mock.calls[0]?.[0];
    expect(JSON.stringify(payload)).not.toContain('NeverEmailThis123!');
    expect(payload?.data).not.toHaveProperty('password');
  });

  describe('registerCustomer — CRM validation', () => {
    it('rejects re-registration of a suspended account', async () => {
      const { service, mockPrisma } = buildService();
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'suspended-user',
        status: 'SUSPENDED',
        deletedAt: null,
      });

      await expect(service.registerCustomer({ email: 'suspended@example.com' } as any))
        .rejects.toThrow('Askıya alınmış hesap yeniden kaydedilemez');
    });

    it('rejects a soft-deleted suspended account before CRM or profile writes', async () => {
      const { service, mockPrisma, mockCrmValidator } = buildService();
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'suspended-user',
        status: 'SUSPENDED',
        deletedAt: new Date(),
      });

      await expect(service.registerCustomer({ email: 'suspended@example.com' } as any))
        .rejects.toThrow('Askıya alınmış hesap yeniden kaydedilemez');
      expect(mockCrmValidator.validateEmailInCrm).not.toHaveBeenCalled();
    });

    it('cannot overwrite a user suspended between the initial read and transaction', async () => {
      const { service, mockPrisma } = buildService({ crmIsAdminBypass: true });
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-id', status: 'INACTIVE', deletedAt: null,
      });
      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn({
        user: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'user-id', status: 'SUSPENDED', deletedAt: null, customerProfile: null,
          }),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        customerProfile: { upsert: jest.fn() },
      }));

      await expect(service.registerCustomer({
        email: 'user@example.com', firstName: 'Test', lastName: 'User',
        password: 'password123', usedProducts: [], isAllplanUser: false,
      } as any)).rejects.toThrow('Hesap durumu değişti');
    });

    it('issues a short-lived purpose-bound verification token with a separate secret', async () => {
      const { service, mockPrisma, mockJwtService } = buildService({ crmIsAdminBypass: true });
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await service.registerCustomer({
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'password123',
        usedProducts: [],
        isAllplanUser: false,
      } as any);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-id',
          purpose: 'email_verify',
          jti: expect.any(String),
        }),
        {
          secret: 'test-action-secret',
          audience: 'aluplan:email-verification',
          issuer: 'aluplan-support',
          algorithm: 'HS256',
          expiresIn: '30m',
        },
      );
    });

    it('allows registration when CRM validation passes', async () => {
      const { service, mockPrisma } = buildService({
        crmValidationResult: { isValid: true, contactId: 'c-1' },
      });

      mockPrisma.user.findUnique.mockResolvedValue(null); // email not taken

      const dto = {
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        company: 'Test Co',
        phone: '555-0000',
        usedProducts: [],
        isAllplanUser: false,
      };

      // Should not throw
      await expect(service.registerCustomer(dto as any)).resolves.toBeDefined();
    });

    it('rejects registration when CRM returns NOT_FOUND', async () => {
      const { service, mockPrisma } = buildService({
        crmValidationResult: {
          isValid: false,
          errorCode: 'NOT_FOUND',
          errorMessage: 'Bu e-posta adresi CRM sisteminde kayıtlı değil.',
        },
      });

      mockPrisma.user.findUnique.mockResolvedValue(null);

      const dto = {
        email: 'unknown@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        company: 'Test Co',
        phone: '555-0000',
        usedProducts: [],
        isAllplanUser: false,
      };

      await expect(service.registerCustomer(dto as any)).rejects.toThrow(
        'Bu e-posta adresi CRM sisteminde kayıtlı değil.'
      );
    });

    it('allows registration when CRM returns CRM_ERROR (fail-open)', async () => {
      const { service, mockPrisma, mockErrorLogger } = buildService({
        crmValidationResult: {
          isValid: false,
          errorCode: 'CRM_ERROR',
          errorMessage: 'Sistem geçici olarak kullanılamıyor.',
        },
      });

      mockPrisma.user.findUnique.mockResolvedValue(null);

      const dto = {
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        company: 'Test Co',
        phone: '555-0000',
        usedProducts: [],
        isAllplanUser: false,
      };

      // Should NOT throw — fail-open behavior
      await expect(service.registerCustomer(dto as any)).resolves.toBeDefined();
      // Should log the error
      expect(mockErrorLogger.logError).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'crm_validation_fail_open' })
      );
    });

    it('skips CRM validation for admin bypass emails', async () => {
      const { service, mockPrisma, mockCrmValidator } = buildService({
        crmIsAdminBypass: true,
      });

      mockPrisma.user.findUnique.mockResolvedValue(null);

      const dto = {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'password123',
        company: 'Admin Co',
        phone: '555-0000',
        usedProducts: [],
        isAllplanUser: false,
      };

      await expect(service.registerCustomer(dto as any)).resolves.toBeDefined();
      // CRM validation should NOT be called for admin bypass
      expect(mockCrmValidator.validateEmailInCrm).not.toHaveBeenCalled();
    });
  });

  describe('CRM placeholder emails', () => {
    it('hides internal CRM placeholder emails in customer detail responses', async () => {
      const { service, mockPrisma } = buildService();

      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'no-email-75047b54-c652-f111-a824-70a8a52bb11e@internal.aluplan',
        fullName: 'CRM Contact',
        passwordHash: 'hash',
        status: 'INACTIVE',
        customerProfile: {
          id: 'profile-1',
          firstName: 'CRM',
          lastName: 'Contact',
          account: null,
        },
      });

      const result = await service.getCustomerById('user-1') as any;

      expect(result.email).toBeNull();
      expect(result.hasRealEmail).toBe(false);
    });

    it('rejects password reset for CRM contacts without a real email', async () => {
      const { service, mockPrisma, mockEmailService } = buildService();

      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'no-email-75047b54-c652-f111-a824-70a8a52bb11e@internal.aluplan',
        fullName: 'CRM Contact',
        passwordHash: 'hash',
        status: 'INACTIVE',
        customerProfile: {
          firstName: 'CRM',
          lastName: 'Contact',
        },
      });

      await expect(service.resetPassword('user-1')).rejects.toThrow('gerçek e-posta adresi yok');
      expect(mockEmailService.enqueueEmail).not.toHaveBeenCalled();
    });
  });

  describe('getAllCustomers', () => {
    it('searches linked CRM account names as well as contact fields', async () => {
      const { service, mockPrisma } = buildService();

      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await service.getAllCustomers(1, 20, 'LGN Proje');

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          roleId: 'role-id',
          deletedAt: null,
          OR: expect.arrayContaining([
            { customerProfile: { account: { is: { name: { contains: 'LGN Proje', mode: 'insensitive' } } } } },
          ]),
        }),
      }));
    });
  });
});

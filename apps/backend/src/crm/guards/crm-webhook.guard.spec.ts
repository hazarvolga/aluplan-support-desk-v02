// P0 — Güvenlik: CrmWebhookGuard x-api-key doğrulama
import { Test, TestingModule } from '@nestjs/testing';
import { CrmWebhookGuard } from './crm-webhook.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../utils/crypto.service';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

const VALID_SECRET = 'my-webhook-secret';
const ENCRYPTED_SECRET = 'iv:tag:cipher'; // mock — decrypt will return VALID_SECRET

function buildContext(headers: Record<string, string>): ExecutionContext {
    return {
        switchToHttp: () => ({
            getRequest: () => ({ headers }),
        }),
    } as unknown as ExecutionContext;
}

describe('CrmWebhookGuard', () => {
    let guard: CrmWebhookGuard;
    let prisma: any;
    let crypto: any;

    const mockPrisma = {
        crmConnection: { findUnique: jest.fn() },
    };

    const mockCrypto = {
        decrypt: jest.fn().mockReturnValue(VALID_SECRET),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CrmWebhookGuard,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: CryptoService, useValue: mockCrypto },
            ],
        }).compile();

        guard = module.get<CrmWebhookGuard>(CrmWebhookGuard);
        prisma = module.get<PrismaService>(PrismaService);
        crypto = module.get<CryptoService>(CryptoService);

        jest.clearAllMocks();
        mockCrypto.decrypt.mockReturnValue(VALID_SECRET);
    });

    it('should allow request with valid x-api-key', async () => {
        mockPrisma.crmConnection.findUnique.mockResolvedValue({
            webhookSecret: ENCRYPTED_SECRET,
        });

        const ctx = buildContext({ 'x-api-key': VALID_SECRET });
        await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });

    it('should throw UnauthorizedException when x-api-key header is missing', async () => {
        const ctx = buildContext({});
        await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when no CRM connection exists', async () => {
        mockPrisma.crmConnection.findUnique.mockResolvedValue(null);
        const ctx = buildContext({ 'x-api-key': VALID_SECRET });
        await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when connection has no webhookSecret', async () => {
        mockPrisma.crmConnection.findUnique.mockResolvedValue({ webhookSecret: null });
        const ctx = buildContext({ 'x-api-key': VALID_SECRET });
        await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when api-key does not match', async () => {
        mockPrisma.crmConnection.findUnique.mockResolvedValue({
            webhookSecret: ENCRYPTED_SECRET,
        });
        const ctx = buildContext({ 'x-api-key': 'wrong-key' });
        await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('should call crypto.decrypt with the stored webhookSecret', async () => {
        mockPrisma.crmConnection.findUnique.mockResolvedValue({
            webhookSecret: ENCRYPTED_SECRET,
        });
        const ctx = buildContext({ 'x-api-key': VALID_SECRET });
        await guard.canActivate(ctx);
        expect(mockCrypto.decrypt).toHaveBeenCalledWith(ENCRYPTED_SECRET);
    });
});

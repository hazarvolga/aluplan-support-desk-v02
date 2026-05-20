// P0 — Güvenlik: CrmWebhookGuard x-signature doğrulama
import { Test, TestingModule } from '@nestjs/testing';
import { CrmWebhookGuard } from './crm-webhook.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../utils/crypto.service';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import * as crypto from 'crypto';

const VALID_SECRET = 'my-webhook-secret';
const ENCRYPTED_SECRET = 'iv:tag:cipher'; // mock — decrypt will return VALID_SECRET

function buildContext(headers: Record<string, string>, body?: any): ExecutionContext {
    return {
        switchToHttp: () => ({
            getRequest: () => ({ headers, body }),
        }),
    } as unknown as ExecutionContext;
}

function calculateHmac(secret: string, body: any): string {
    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

describe('CrmWebhookGuard', () => {
    let guard: CrmWebhookGuard;
    let prisma: any;
    let cryptoService: any;

    const mockPrisma = {
        crmConnection: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
        },
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
        cryptoService = module.get<CryptoService>(CryptoService);

        jest.clearAllMocks();
        mockCrypto.decrypt.mockReturnValue(VALID_SECRET);
    });

    it('should allow request with valid x-signature and payload', async () => {
        mockPrisma.crmConnection.findFirst.mockResolvedValue({
            webhookSecret: ENCRYPTED_SECRET,
        });

        const body = { entity: 'account', id: '123' };
        const signature = calculateHmac(VALID_SECRET, body);

        const ctx = buildContext({ 'x-signature': signature }, body);
        await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });

    it('should throw UnauthorizedException when x-signature header is missing', async () => {
        const ctx = buildContext({}, { entity: 'account' });
        await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when no CRM connection exists', async () => {
        mockPrisma.crmConnection.findFirst.mockResolvedValue(null);
        const body = { entity: 'account' };
        const signature = calculateHmac(VALID_SECRET, body);

        const ctx = buildContext({ 'x-signature': signature }, body);
        await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when connection has no webhookSecret', async () => {
        mockPrisma.crmConnection.findFirst.mockResolvedValue({ webhookSecret: null });
        const body = { entity: 'account' };
        const signature = calculateHmac(VALID_SECRET, body);

        const ctx = buildContext({ 'x-signature': signature }, body);
        await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when signature does not match', async () => {
        mockPrisma.crmConnection.findFirst.mockResolvedValue({
            webhookSecret: ENCRYPTED_SECRET,
        });
        const body = { entity: 'account' };
        const ctx = buildContext({ 'x-signature': 'wrong-signature' }, body);
        await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('should call crypto.decrypt with the stored webhookSecret', async () => {
        mockPrisma.crmConnection.findFirst.mockResolvedValue({
            webhookSecret: ENCRYPTED_SECRET,
        });
        const body = { entity: 'account' };
        const signature = calculateHmac(VALID_SECRET, body);
        const ctx = buildContext({ 'x-signature': signature }, body);

        await guard.canActivate(ctx);
        expect(mockCrypto.decrypt).toHaveBeenCalledWith(ENCRYPTED_SECRET);
    });
});

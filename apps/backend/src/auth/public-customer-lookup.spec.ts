import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { SettingsService } from '../settings/settings.service';
import { RedisService } from '../redis/redis.service';
import { CrmEmailValidatorService } from '../crm/crm-email-validator.service';

describe('Public customer lookup CRM admission', () => {
    let service: AuthService;
    const prisma = {
        user: { findUnique: jest.fn(), findFirst: jest.fn() },
        customerProfile: { findFirst: jest.fn() },
    };
    const crm = { isAdminBypass: jest.fn(), validateEmailInCrm: jest.fn() };

    beforeEach(async () => {
        jest.resetAllMocks();
        prisma.user.findUnique.mockResolvedValue(null);
        prisma.user.findFirst.mockResolvedValue(null);
        prisma.customerProfile.findFirst.mockResolvedValue(null);
        crm.isAdminBypass.mockReturnValue(false);
        crm.validateEmailInCrm.mockResolvedValue({ isValid: true, contactId: 'local-contact' });
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: prisma },
                { provide: JwtService, useValue: {} },
                { provide: ConfigService, useValue: {} },
                { provide: EmailService, useValue: {} },
                { provide: SettingsService, useValue: {} },
                { provide: RedisService, useValue: {} },
                { provide: CrmEmailValidatorService, useValue: crm },
            ],
        }).compile();
        service = module.get(AuthService);
    });

    it.each(['person@aluplan.com.tr', 'configured-admin@example.com'])(
        'does not accept a submitted bypass email as customer admission authority: %s',
        async email => {
            crm.isAdminBypass.mockReturnValue(true);
            crm.validateEmailInCrm.mockResolvedValue({ isValid: false, errorCode: 'NOT_FOUND' });
            await expect(service.lookupEmail(email)).resolves.toEqual({
                action: 'CRM_REJECTED',
                errorMessage: 'Bu e-posta adresi CRM sisteminde kayıtlı değil.',
            });
            expect(crm.validateEmailInCrm).toHaveBeenCalledWith(email);
            expect(crm.isAdminBypass).not.toHaveBeenCalled();
        },
    );

    it('retains NEW for a CRM member without a contract or licence requirement', async () => {
        await expect(service.lookupEmail(' MEMBER@GMAIL.COM ')).resolves.toEqual({
            action: 'NEW', companyName: null,
        });
        expect(crm.validateEmailInCrm).toHaveBeenCalledWith('member@gmail.com');
    });

    it('retains matched company guidance only after affirmative CRM validation', async () => {
        prisma.customerProfile.findFirst.mockResolvedValue({ companyName: 'Example Company' });
        await expect(service.lookupEmail('member@example.com')).resolves.toEqual({
            action: 'NEW_MATCHED_COMPANY', companyName: 'Example Company',
        });
    });

    it('does not leak a matched company or provider detail when CRM membership is absent', async () => {
        prisma.customerProfile.findFirst.mockResolvedValue({ companyName: 'Private Company' });
        crm.validateEmailInCrm.mockResolvedValue({
            isValid: false, errorCode: 'NOT_FOUND', errorMessage: 'Sensitive provider detail',
        });
        await expect(service.lookupEmail('outsider@example.com')).resolves.toEqual({
            action: 'CRM_REJECTED',
            errorMessage: 'Bu e-posta adresi CRM sisteminde kayıtlı değil.',
        });
    });

    it.each([
        undefined, null, {}, { isValid: false },
        { isValid: 'true' }, { isValid: 1 },
        { isValid: false, errorCode: 'CRM_ERROR', errorMessage: 'Sensitive provider detail' },
        { isValid: false, errorCode: 'NETWORK_ERROR' },
    ])('fails closed with a generic 503 for malformed or unavailable CRM results: %p', async result => {
        prisma.customerProfile.findFirst.mockResolvedValue({ companyName: 'Private Company' });
        crm.validateEmailInCrm.mockResolvedValue(result);
        const attempt = service.lookupEmail('outsider@example.com');
        await expect(attempt).rejects.toThrow(ServiceUnavailableException);
        await expect(attempt).rejects.toMatchObject({
            status: 503,
            message: 'CRM kaydı şu anda doğrulanamıyor. Lütfen daha sonra tekrar deneyin.',
        });
    });

    it('normalizes rejected CRM dependencies without exposing their error', async () => {
        crm.validateEmailInCrm.mockRejectedValue(new Error('Sensitive provider detail'));
        await expect(service.lookupEmail('outsider@gmail.com')).rejects.toMatchObject({
            status: 503,
            message: 'CRM kaydı şu anda doğrulanamıyor. Lütfen daha sonra tekrar deneyin.',
        });
    });

    it.each(['CUSTOMER', 'ADMIN', 'SUPPORT_AGENT'])(
        'does not change existing active %s CLAIM routing', async role => {
            prisma.user.findUnique.mockResolvedValue({
                id: 'existing-user', status: 'ACTIVE', deletedAt: null, role: { name: role },
            });
            await expect(service.lookupEmail('existing@example.com')).resolves.toEqual({ action: 'CLAIM' });
            expect(crm.validateEmailInCrm).not.toHaveBeenCalled();
        },
    );
});

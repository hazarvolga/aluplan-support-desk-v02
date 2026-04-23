import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from '../settings.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../utils/crypto.service';

describe('SettingsService', () => {
    let service: SettingsService;
    let prisma: any;
    let crypto: any;

    beforeEach(async () => {
        const mockPrismaService = {
            setting: {
                findUnique: jest.fn(),
                findMany: jest.fn(),
                upsert: jest.fn(),
                delete: jest.fn(),
            },
            $transaction: jest.fn(),
        };

        const mockCryptoService = {
            encrypt: jest.fn((val) => `encrypted-${val}`),
            decrypt: jest.fn((val) => val.replace('encrypted-', '')),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SettingsService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: CryptoService, useValue: mockCryptoService },
            ],
        }).compile();

        service = module.get<SettingsService>(SettingsService);
        prisma = module.get<PrismaService>(PrismaService);
        crypto = module.get<CryptoService>(CryptoService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('setValue', () => {
        it('should upsert a non-secret setting', async () => {
            prisma.setting.upsert.mockResolvedValue({ id: 's1', key: 'my.key', value: 'my-val', isSecret: false });

            await service.setValue('my.key', 'my-val');

            expect(prisma.setting.upsert).toHaveBeenCalledWith({
                where: { key: 'my.key' },
                update: {
                    value: 'my-val',
                    isSecret: false,
                    updatedBy: undefined,
                },
                create: {
                    key: 'my.key',
                    value: 'my-val',
                    isSecret: false,
                    updatedBy: undefined,
                },
            });
        });
    });

    describe('getValue', () => {
        it('should return plaintext value for a setting', async () => {
            const dbSetting = { id: 's1', key: 'val.key', value: 'plain', isSecret: false };
            prisma.setting.findUnique.mockResolvedValue(dbSetting);

            const result = await service.getValue('val.key');

            expect(result).toBe('plain');
        });

        it('should return null if setting does not exist', async () => {
            prisma.setting.findUnique.mockResolvedValue(null);

            const result = await service.getValue('missing');

            expect(result).toBeNull();
        });
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from '../settings.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../utils/crypto.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

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
                update: jest.fn(),
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
                { provide: EventEmitter2, useValue: { emit: jest.fn() } },
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

        it('should mirror chat provider to legacy active provider', async () => {
            prisma.setting.upsert.mockResolvedValue({ id: 's1', key: 'ai.chat_provider', value: 'gemini', isSecret: false });
            prisma.setting.findUnique.mockImplementation(({ where }: any) => {
                if (where.key === 'ai.gemini.api_key') {
                    return Promise.resolve({ key: 'ai.gemini.api_key', value: 'encrypted-key', isSecret: true });
                }
                if (where.key === 'ai.gemini.chat_model') {
                    return Promise.resolve({ key: 'ai.gemini.chat_model', value: 'gemini-2.5-flash', isSecret: false });
                }
                return Promise.resolve(null);
            });

            await service.upsert({ key: 'ai.chat_provider', value: 'gemini', isSecret: false });

            expect(prisma.setting.upsert).toHaveBeenCalledWith({
                where: { key: 'ai.active_provider' },
                update: {
                    value: 'gemini',
                    isSecret: false,
                    updatedBy: undefined,
                },
                create: {
                    key: 'ai.active_provider',
                    value: 'gemini',
                    isSecret: false,
                    updatedBy: undefined,
                },
            });
        });

        it('should coerce stale active provider during bulk AI save', async () => {
            prisma.setting.findMany.mockResolvedValue([]);
            prisma.setting.findUnique.mockResolvedValue(null);
            prisma.setting.upsert.mockImplementation((args: any) => Promise.resolve(args));
            prisma.$transaction.mockImplementation((operations: Array<Promise<unknown>>) => Promise.all(operations));

            await service.bulkUpsert({
                settings: [
                    { key: 'ai.chat_provider', value: 'gemini', isSecret: false },
                    { key: 'ai.active_provider', value: 'openai', isSecret: false },
                    { key: 'ai.gemini.api_key', value: 'gemini-key', isSecret: true },
                    { key: 'ai.gemini.chat_model', value: 'gemini-2.5-flash', isSecret: false },
                    { key: 'ai.gemini.embed_model', value: 'gemini-embedding-2', isSecret: false },
                ],
            });

            expect(prisma.setting.upsert).toHaveBeenCalledWith(expect.objectContaining({
                where: { key: 'ai.active_provider' },
                update: expect.objectContaining({ value: 'gemini' }),
                create: expect.objectContaining({ value: 'gemini' }),
            }));
        });

        it('should force API keys to be stored as encrypted secrets', async () => {
            prisma.setting.upsert.mockResolvedValue({ id: 's1', key: 'ai.gemini.api_key', value: 'encrypted-gemini-key', isSecret: true });

            await service.upsert({ key: 'ai.gemini.api_key', value: 'gemini-key', isSecret: false });

            expect(crypto.encrypt).toHaveBeenCalledWith('gemini-key');
            expect(prisma.setting.upsert).toHaveBeenCalledWith({
                where: { key: 'ai.gemini.api_key' },
                update: {
                    value: 'encrypted-gemini-key',
                    isSecret: true,
                    updatedBy: undefined,
                },
                create: {
                    key: 'ai.gemini.api_key',
                    value: 'encrypted-gemini-key',
                    isSecret: true,
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

        it('should migrate plaintext API keys to encrypted secret storage on read', async () => {
            const dbSetting = { id: 's1', key: 'ai.gemini.api_key', value: 'plain-key', isSecret: false };
            prisma.setting.findUnique.mockResolvedValue(dbSetting);
            prisma.setting.update.mockResolvedValue({ ...dbSetting, value: 'encrypted-plain-key', isSecret: true });

            const result = await service.getValue('ai.gemini.api_key');

            expect(result).toBe('plain-key');
            expect(prisma.setting.update).toHaveBeenCalledWith({
                where: { key: 'ai.gemini.api_key' },
                data: {
                    value: 'encrypted-plain-key',
                    isSecret: true,
                },
            });
        });

        it('should return null if setting does not exist', async () => {
            prisma.setting.findUnique.mockResolvedValue(null);

            const result = await service.getValue('missing');

            expect(result).toBeNull();
        });
    });
});

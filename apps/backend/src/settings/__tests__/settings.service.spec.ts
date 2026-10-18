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
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
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

        it.each([
            'ai.chat_provider',
            'ai.embed_provider',
            'ai.active_provider',
            'ai.fallback_provider',
            'ai.embed_fallback_provider',
            'ai.specialized.summarization_provider',
        ])('rejects removed Ollama selection for %s before persistence', async (key) => {
            await expect(service.upsert({ key, value: 'ollama', isSecret: false }))
                .rejects.toMatchObject({ status: 400 });
            expect(prisma.setting.upsert).not.toHaveBeenCalled();
        });

        it('should coerce stale active provider during bulk AI save', async () => {
            prisma.setting.findMany.mockResolvedValue([]);
            prisma.setting.findUnique.mockResolvedValue(null);
            prisma.setting.upsert.mockImplementation((args: any) => Promise.resolve(args));
            prisma.$transaction.mockImplementation((operations: Array<Promise<unknown>>) => Promise.all(operations));

            const previousApproval = process.env.EMBEDDING_MIGRATION_APPROVED;
            process.env.EMBEDDING_MIGRATION_APPROVED = 'true';
            try {
                await service.bulkUpsert({
                    settings: [
                        { key: 'ai.chat_provider', value: 'gemini', isSecret: false },
                        { key: 'ai.active_provider', value: 'openai', isSecret: false },
                        { key: 'ai.gemini.api_key', value: 'gemini-key', isSecret: true },
                        { key: 'ai.gemini.chat_model', value: 'gemini-2.5-flash', isSecret: false },
                        { key: 'ai.gemini.embed_model', value: 'gemini-embedding-2', isSecret: false },
                    ],
                });
            } finally {
                if (previousApproval === undefined) delete process.env.EMBEDDING_MIGRATION_APPROVED;
                else process.env.EMBEDDING_MIGRATION_APPROVED = previousApproval;
            }

            expect(prisma.setting.upsert).toHaveBeenCalledWith(expect.objectContaining({
                where: { key: 'ai.active_provider' },
                update: expect.objectContaining({ value: 'gemini' }),
                create: expect.objectContaining({ value: 'gemini' }),
            }));
        });

        it('blocks embedding model changes without explicit operator approval', async () => {
            await expect(service.upsert({ key: 'ai.gemini.embed_model', value: 'gemini-embedding-2', isSecret: false }))
                .rejects.toThrow('operator approval');
            expect(prisma.setting.upsert).not.toHaveBeenCalled();
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

        it('never returns plaintext or ciphertext from a secret upsert response', async () => {
            prisma.setting.findUnique.mockResolvedValue(null);
            prisma.setting.upsert.mockResolvedValue({
                id: 's1',
                key: 'dynamics_api_key',
                value: 'encrypted-new-secret',
                isSecret: true,
            });

            const created = await service.upsert({
                key: 'dynamics_api_key',
                value: 'new-secret',
                isSecret: true,
            });

            expect(created).toEqual(expect.objectContaining({
                key: 'dynamics_api_key',
                value: '********',
                isSecret: true,
            }));
            expect(JSON.stringify(created)).not.toContain('new-secret');
            expect(JSON.stringify(created)).not.toContain('encrypted-');
        });

        it('masks a preserved secret when the placeholder is submitted', async () => {
            prisma.setting.findUnique.mockResolvedValue({
                id: 's1',
                key: 'dynamics_api_key',
                value: 'encrypted-existing-secret',
                isSecret: true,
            });

            const preserved = await service.upsert({
                key: 'dynamics_api_key',
                value: '********',
                isSecret: true,
            });

            expect(preserved.value).toBe('********');
            expect(JSON.stringify(preserved)).not.toContain('existing-secret');
            expect(prisma.setting.upsert).not.toHaveBeenCalled();
        });

        it('masks secret values returned by bulk upsert', async () => {
            prisma.setting.findMany.mockResolvedValue([]);
            prisma.setting.upsert.mockResolvedValue({
                id: 's1',
                key: 'dynamics_api_key',
                value: 'encrypted-bulk-secret',
                isSecret: true,
            });
            prisma.$transaction.mockImplementation((operations: Array<Promise<unknown>>) => Promise.all(operations));

            const result = await service.bulkUpsert({
                settings: [{ key: 'dynamics_api_key', value: 'bulk-secret', isSecret: true }],
            });

            expect(result[0]).toEqual(expect.objectContaining({ value: '********', isSecret: true }));
            expect(JSON.stringify(result)).not.toContain('bulk-secret');
            expect(JSON.stringify(result)).not.toContain('encrypted-');
        });
    });

    describe.each(['email.imap.pass', 'email.smtp.pass'])('mail credential %s', (key) => {
        const plaintext = 'synthetic-mail-password';
        const stored = (isSecret: boolean) => ({
            id: 'mail-setting', key, isSecret,
            value: isSecret ? `encrypted-${plaintext}` : plaintext,
        });

        function mockWrites() {
            prisma.setting.findUnique.mockResolvedValue(null);
            prisma.setting.findMany.mockResolvedValue([]);
            prisma.setting.upsert.mockImplementation(({ create }: any) => Promise.resolve({ id: 'mail-setting', ...create }));
            prisma.$transaction.mockImplementation((operations: Array<Promise<unknown>>) => Promise.all(operations));
        }

        it.each(['single', 'bulk'])('forces encryption despite isSecret false in %s save and masks response/cache reads', async (mode) => {
            mockWrites();
            const input = { key, value: plaintext, isSecret: false };
            const result = mode === 'single'
                ? await service.upsert(input)
                : (await service.bulkUpsert({ settings: [input] }))[0];

            expect(crypto.encrypt).toHaveBeenCalledWith(plaintext);
            expect(prisma.setting.upsert).toHaveBeenCalledWith(expect.objectContaining({
                create: expect.objectContaining({ key, value: `encrypted-${plaintext}`, isSecret: true }),
                update: expect.objectContaining({ value: `encrypted-${plaintext}`, isSecret: true }),
            }));
            expect(result).toEqual(expect.objectContaining({ key, value: '********', isSecret: true }));
            expect(await service.get(key)).toEqual(expect.objectContaining({ value: '********', isSecret: true }));
            expect(await service.getValue(key)).toBe(plaintext);
        });

        it.each([
            ['single', true], ['bulk', true], ['single', false], ['bulk', false],
        ] as const)('preserves password on masked %s save with stored secret flag %s', async (mode, isSecret) => {
            prisma.setting.findUnique.mockImplementation(() => Promise.resolve(stored(isSecret)));
            prisma.setting.findMany.mockResolvedValue([stored(isSecret)]);
            prisma.$transaction.mockImplementation((operations: Array<Promise<unknown>>) => Promise.all(operations));
            const input = { key, value: '********', isSecret: false };
            const result = mode === 'single'
                ? await service.upsert(input)
                : (await service.bulkUpsert({ settings: [input] }))[0];

            expect(result.value).toBe('********');
            expect(await service.getValue(key)).toBe(plaintext);
            expect(prisma.setting.upsert).not.toHaveBeenCalled();
            expect(prisma.setting.update).not.toHaveBeenCalled();
            expect(crypto.encrypt).not.toHaveBeenCalled();
        });

        it.each(['get', 'getAll'])('masks historical unflagged password through %s without read-time migration', async (mode) => {
            prisma.setting.findUnique.mockImplementation(() => Promise.resolve(stored(false)));
            prisma.setting.findMany.mockImplementation(() => Promise.resolve([stored(false)]));
            const result = mode === 'get' ? await service.get(key) : (await service.getAll())[0];

            expect(result).toEqual(expect.objectContaining({ key, value: '********', isSecret: true }));
            expect(await service.get(key)).toEqual(expect.objectContaining({ value: '********', isSecret: true }));
            expect(await service.getValue(key)).toBe(plaintext);
            expect(prisma.setting.update).not.toHaveBeenCalled();
            expect(prisma.setting.upsert).not.toHaveBeenCalled();
            expect(crypto.encrypt).not.toHaveBeenCalled();
            expect(crypto.decrypt).not.toHaveBeenCalled();
        });

        it.each(['get', 'getAll'])('keeps existing encrypted password usable through %s without writes', async (mode) => {
            prisma.setting.findUnique.mockImplementation(() => Promise.resolve(stored(true)));
            prisma.setting.findMany.mockImplementation(() => Promise.resolve([stored(true)]));
            const result = mode === 'get' ? await service.get(key) : (await service.getAll())[0];

            expect(result.value).toBe('********');
            expect(await service.getValue(key)).toBe(plaintext);
            expect(crypto.decrypt).toHaveBeenCalledWith(`encrypted-${plaintext}`);
            expect(crypto.encrypt).not.toHaveBeenCalled();
            expect(prisma.setting.update).not.toHaveBeenCalled();
            expect(prisma.setting.upsert).not.toHaveBeenCalled();
        });

        it('retains historical plaintext for an internal cold read without automatic migration', async () => {
            prisma.setting.findUnique.mockImplementation(() => Promise.resolve(stored(false)));
            expect(await service.getValue(key)).toBe(plaintext);
            expect(await service.get(key)).toEqual(expect.objectContaining({ value: '********', isSecret: true }));
            expect(prisma.setting.update).not.toHaveBeenCalled();
            expect(prisma.setting.upsert).not.toHaveBeenCalled();
            expect(crypto.encrypt).not.toHaveBeenCalled();
            expect(crypto.decrypt).not.toHaveBeenCalled();
        });
    });

    describe.each([
        'mail.gmail.access_token_cache',
        'mail.gmail.refresh_token',
        'r2_access_key_id',
        'r2_secret_access_key',
        'storage.access_key',
        'storage.r2.access_key_id',
        'storage.r2.secret_access_key',
        'whatsapp.access_token',
        'whatsapp.verify_token',
    ])('server-classified R2 credential %s', (key) => {
        const plaintext = 'synthetic-r2-credential';

        function mockWrites() {
            prisma.setting.findUnique.mockResolvedValue(null);
            prisma.setting.findMany.mockResolvedValue([]);
            prisma.setting.upsert.mockImplementation(({ create }: any) => Promise.resolve({ id: 'r2-setting', ...create }));
            prisma.$transaction.mockImplementation((operations: Array<Promise<unknown>>) => Promise.all(operations));
        }

        it.each(['single', 'bulk'])('encrypts and masks %s saves even when the client marks it non-secret', async (mode) => {
            mockWrites();
            const input = { key, value: plaintext, isSecret: false };

            const result = mode === 'single'
                ? await service.upsert(input)
                : (await service.bulkUpsert({ settings: [input] }))[0];

            expect(crypto.encrypt).toHaveBeenCalledWith(plaintext);
            expect(prisma.setting.upsert).toHaveBeenCalledWith(expect.objectContaining({
                create: expect.objectContaining({ key, value: `encrypted-${plaintext}`, isSecret: true }),
                update: expect.objectContaining({ value: `encrypted-${plaintext}`, isSecret: true }),
            }));
            expect(result).toEqual(expect.objectContaining({ key, value: '********', isSecret: true }));
            expect(await service.get(key)).toEqual(expect.objectContaining({ value: '********', isSecret: true }));
            expect(await service.getValue(key)).toBe(plaintext);
        });

        it.each(['get', 'getAll'])('secures a historical unflagged row through %s while keeping internal access and public reads redacted', async (mode) => {
            const stored = {
                id: 'legacy-r2-setting',
                key,
                value: plaintext,
                isSecret: false,
            };
            prisma.setting.findUnique.mockResolvedValue(stored);
            prisma.setting.findMany.mockResolvedValue([stored]);

            const result = mode === 'get' ? await service.get(key) : (await service.getAll())[0];

            expect(result).toEqual(expect.objectContaining({
                key,
                value: '********',
                isSecret: true,
            }));
            expect(prisma.setting.updateMany).toHaveBeenCalledWith({
                where: { key, value: plaintext, isSecret: false },
                data: {
                    value: `encrypted-${plaintext}`,
                    isSecret: true,
                },
            });
            expect(await service.getValue(key)).toBe(plaintext);
        });
    });

    it('does not classify similar non-credential R2 keys as secrets', async () => {
        prisma.setting.upsert.mockImplementation(({ create }: any) => Promise.resolve({ id: 'r2-label', ...create }));

        const result = await service.upsert({
            key: 'storage.r2.access_key_identifier',
            value: 'display-label',
            isSecret: false,
        });

        expect(result).toEqual(expect.objectContaining({ value: 'display-label', isSecret: false }));
        expect(crypto.encrypt).not.toHaveBeenCalled();
    });

    it('deletes a secret without returning its stored value', async () => {
        prisma.setting.delete.mockResolvedValue({
            id: 'legacy-secret',
            key: 'email.smtp.pass',
            value: 'synthetic-plaintext-password',
            isSecret: false,
        });

        await expect(service.delete('email.smtp.pass')).resolves.toEqual({
            key: 'email.smtp.pass',
            deleted: true,
        });
        expect(prisma.setting.delete).toHaveBeenCalledWith({ where: { key: 'email.smtp.pass' } });
    });

    it.each(['email.imap.host', 'email.smtp.host'])('keeps %s non-secret', async (key) => {
        prisma.setting.upsert.mockImplementation(({ create }: any) => Promise.resolve({ id: 'host-setting', ...create }));
        const result = await service.upsert({ key, value: 'mail.example.test', isSecret: false });
        expect(result).toEqual(expect.objectContaining({ value: 'mail.example.test', isSecret: false }));
        expect(await service.getValue(key)).toBe('mail.example.test');
        expect(crypto.encrypt).not.toHaveBeenCalled();
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
            const result = await service.getValue('ai.gemini.api_key');

            expect(result).toBe('plain-key');
            expect(prisma.setting.updateMany).toHaveBeenCalledWith({
                where: { key: 'ai.gemini.api_key', value: 'plain-key', isSecret: false },
                data: {
                    value: 'encrypted-plain-key',
                    isSecret: true,
                },
            });
        });

        it('does not overwrite a credential that changed after the initial read', async () => {
            const stale = { id: 's1', key: 'storage.access_key', value: 'stale-access', isSecret: false };
            const latest = { id: 's1', key: 'storage.access_key', value: 'encrypted-current-access', isSecret: true };
            prisma.setting.findUnique
                .mockResolvedValueOnce(stale)
                .mockResolvedValueOnce(latest);
            prisma.setting.updateMany.mockResolvedValueOnce({ count: 0 });

            await expect(service.getValue('storage.access_key')).resolves.toBe('current-access');

            expect(prisma.setting.updateMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { key: 'storage.access_key', value: 'stale-access', isSecret: false },
            }));
            expect(crypto.decrypt).toHaveBeenCalledWith('encrypted-current-access');
        });

        it('should return null if setting does not exist', async () => {
            prisma.setting.findUnique.mockResolvedValue(null);

            const result = await service.getValue('missing');

            expect(result).toBeNull();
        });
    });
});

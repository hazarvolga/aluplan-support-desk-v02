import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs-extra';
import { StorageService } from './storage.service';
import { SettingsService } from '../../settings/settings.service';

jest.mock('../../settings/settings.service', () => ({ SettingsService: class {} }));
jest.mock('@aws-sdk/client-s3', () => {
    const actual = jest.requireActual('@aws-sdk/client-s3');
    return { ...actual, S3Client: jest.fn() };
});
jest.mock('fs-extra', () => ({ ensureDir: jest.fn(), writeFile: jest.fn() }));

const fixture = {
    originalname: 'fixture.txt', mimetype: 'text/plain', buffer: Buffer.from('synthetic support file'),
} as Express.Multer.File;

describe('StorageService upload durability', () => {
    const send = jest.fn();
    const getValue = jest.fn();
    const config = {
        endpoint: 'https://storage.example.invalid', region: 'auto', accessKey: 'synthetic-key',
        secretKey: 'synthetic-secret', bucket: 'fixture-bucket', localPath: '/synthetic-uploads',
    };
    function service(type: 'S3' | 'LOCAL', overrides = {}) {
        const values: Record<string, string> = { ...config, ...overrides, type };
        const get = jest.fn((key: string) => key === 'storage' ? values : values[key.replace('storage.', '')]);
        return new StorageService({ get } as unknown as ConfigService, { getValue } as unknown as SettingsService);
    }
    beforeEach(() => {
        jest.resetAllMocks();
        getValue.mockResolvedValue(undefined);
        send.mockResolvedValue({});
        (S3Client as jest.Mock).mockImplementation(() => ({ send }));
        (fs.ensureDir as jest.Mock).mockResolvedValue(undefined);
        (fs.writeFile as unknown as jest.Mock).mockResolvedValue(undefined);
    });
    afterEach(() => jest.restoreAllMocks());
    async function expectUnavailable(operation: Promise<string>) {
        const error = await operation.catch((caught) => caught);
        expect(error).toBeInstanceOf(ServiceUnavailableException);
        expect(error.getStatus()).toBe(503);
        expect(error.message).toBe('File storage is temporarily unavailable. Please retry.');
        expect(JSON.stringify(error.getResponse())).not.toContain('provider-secret-detail');
    }
    it('returns the existing key contract only after PutObject succeeds', async () => {
        const key = await service('S3').uploadFile(fixture, 'tickets/message-fixture');
        expect(key).toMatch(/^tickets\/message-fixture\/\d+-[0-9a-f-]{36}-fixture\.txt$/);
        expect(send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
        expect(send.mock.calls[0][0].input).toMatchObject({ Bucket: 'fixture-bucket', Key: key, Body: fixture.buffer });
        expect(fs.writeFile).not.toHaveBeenCalled();
    });
    it('uses distinct S3 keys for same-name uploads at the same timestamp', async () => {
        jest.spyOn(Date, 'now').mockReturnValue(123456789);
        const storage = service('S3');
        const keys = await Promise.all([
            storage.uploadFile(fixture, 'tickets/message-fixture'),
            storage.uploadFile({ ...fixture, buffer: Buffer.from('different bytes') }, 'tickets/message-fixture'),
        ]);
        expect(new Set(keys).size).toBe(2);
        expect(send.mock.calls.map(([command]) => command.input.Key).sort()).toEqual([...keys].sort());
        expect(send.mock.calls[0][0].input.Body).toEqual(fixture.buffer);
        expect(send.mock.calls[1][0].input.Body).toEqual(Buffer.from('different bytes'));
    });
    it('does not acknowledge success while PutObject is still pending', async () => {
        let release!: () => void;
        const pending = new Promise<void>((resolve) => { release = resolve; });
        send.mockReturnValue(pending);
        let settled = false;
        const upload = service('S3').uploadFile(fixture, 'tickets').then((key) => { settled = true; return key; });
        await new Promise<void>((resolve) => setImmediate(resolve));
        expect(send).toHaveBeenCalledTimes(1);
        expect(settled).toBe(false);
        release();
        await expect(upload).resolves.toMatch(/^tickets\//);
    });
    it.each(['endpoint', 'accessKey', 'secretKey', 'bucket'])('rejects missing S3 %s without a local fallback', async (field) => {
        await expectUnavailable(service('S3', { [field]: '' }).uploadFile(fixture, 'tickets'));
        expect(send).not.toHaveBeenCalled();
        expect(fs.ensureDir).not.toHaveBeenCalled();
        expect(fs.writeFile).not.toHaveBeenCalled();
    });
    it('rejects PutObject failure without writing a local copy', async () => {
        send.mockRejectedValue(new Error('provider-secret-detail'));
        await expectUnavailable(service('S3').uploadFile(fixture, 'tickets'));
        expect(fs.ensureDir).not.toHaveBeenCalled();
        expect(fs.writeFile).not.toHaveBeenCalled();
    });
    it('sanitizes configuration lookup failures without local fallback', async () => {
        getValue.mockRejectedValue(new Error('provider-secret-detail'));
        await expectUnavailable(service('S3').uploadFile(fixture, 'tickets'));
        expect(fs.writeFile).not.toHaveBeenCalled();
    });
    it('preserves explicitly configured local storage', async () => {
        const key = await service('LOCAL').uploadFile(fixture, 'tickets');
        expect(fs.writeFile).toHaveBeenCalledWith(`/synthetic-uploads/${key}`, fixture.buffer);
        expect(send).not.toHaveBeenCalled();
        expect(getValue).not.toHaveBeenCalled();
    });
    it.each(['ensureDir', 'writeFile'] as const)('sanitizes local %s failures', async (operation) => {
        (fs[operation] as jest.Mock).mockRejectedValue(new Error('provider-secret-detail'));
        await expectUnavailable(service('LOCAL').uploadFile(fixture, 'tickets'));
    });
});

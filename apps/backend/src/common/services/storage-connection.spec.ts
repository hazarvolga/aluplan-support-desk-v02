import { ConfigService } from '@nestjs/config';
import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { OutboundUrlSafetyService } from '../../knowledge-pool/outbound-url-safety.service';
import { SettingsService } from '../../settings/settings.service';
import { StorageService } from './storage.service';

const send = jest.fn();
const s3Client = jest.fn(() => ({ send }));

jest.mock('@aws-sdk/client-s3', () => ({
    HeadBucketCommand: jest.fn((input) => input),
    S3Client: jest.fn((config) => s3Client(config)),
}));

type TestConfig = {
    endpoint: string;
    region: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
};

describe('StorageService custom connection boundary', () => {
    const saved: Record<string, string> = {
        'storage.endpoint': 'https://storage.example.com',
        'storage.bucket': 'fixture-bucket',
        'storage.access_key': 'stored-access-key',
        'storage.secret_key': 'stored-secret-key',
    };
    const getValue = jest.fn(async (key: string) => saved[key] ?? null);
    const get = jest.fn((key: string) => {
        if (key === 'storage') return { type: 'S3', localPath: './uploads', publicEndpoint: '' };
        if (key === 'storage.usePathStyle') return true;
        return undefined;
    });
    const publicLookup = jest.fn().mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);

    const createService = (lookup = publicLookup) => new StorageService(
        { get } as unknown as ConfigService,
        { getValue } as unknown as SettingsService,
        new OutboundUrlSafetyService(lookup),
    );
    const explicitConfig = (endpoint = 'https://storage.example.com'): TestConfig => ({
        endpoint,
        region: 'auto',
        accessKey: 'request-access-key',
        secretKey: 'request-secret-key',
        bucket: 'fixture-bucket',
    });

    beforeEach(() => {
        jest.clearAllMocks();
        saved['storage.endpoint'] = 'https://storage.example.com';
        publicLookup.mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);
        send.mockResolvedValue({});
    });

    it('rejects an unsafe saved endpoint before constructing the runtime SDK client', async () => {
        saved['storage.endpoint'] = 'https://169.254.169.254';

        await expect(createService().testConnection()).resolves.toEqual({
            success: false,
            message: 'S3 Client not initialized. Check your credentials in settings or environment.',
        });
        expect(S3Client).not.toHaveBeenCalled();
    });

    it('pins validated DNS answers for the saved endpoint used by the runtime SDK client', async () => {
        await expect(createService().testConnection()).resolves.toEqual(expect.objectContaining({
            success: true,
        }));

        const clientConfig = s3Client.mock.calls[0][0] as any;
        expect(clientConfig).toEqual(expect.objectContaining({
            endpoint: 'https://storage.example.com',
            followRegionRedirects: false,
            requestHandler: expect.objectContaining({ httpsAgent: expect.anything() }),
        }));
        const callback = jest.fn();
        clientConfig.requestHandler.httpsAgent.options.lookup('storage.example.com', {}, callback);
        expect(callback).toHaveBeenCalledWith(null, '8.8.8.8', 4);
    });

    it('rejects a saved runtime hostname when DNS returns any private answer', async () => {
        const mixedLookup = jest.fn().mockResolvedValue([
            { address: '8.8.8.8', family: 4 },
            { address: '192.168.1.20', family: 4 },
        ]);

        await expect(createService(mixedLookup).testConnection()).resolves.toEqual(expect.objectContaining({
            success: false,
        }));
        expect(S3Client).not.toHaveBeenCalled();
        expect(send).not.toHaveBeenCalled();
    });

    it('preserves trusted config-only internal S3 endpoints', async () => {
        const configOnlyGetValue = jest.fn().mockResolvedValue(null);
        const configOnlyGet = jest.fn((key: string) => {
            const values: Record<string, unknown> = {
                storage: { type: 'S3', localPath: './uploads', publicEndpoint: '' },
                'storage.endpoint': 'http://minio:9000',
                'storage.accessKey': 'config-access-key',
                'storage.secretKey': 'config-secret-key',
                'storage.bucket': 'config-bucket',
                'storage.usePathStyle': true,
            };
            return values[key];
        });
        const service = new StorageService(
            { get: configOnlyGet } as unknown as ConfigService,
            { getValue: configOnlyGetValue } as unknown as SettingsService,
            new OutboundUrlSafetyService(publicLookup),
        );

        await expect(service.testConnection()).resolves.toEqual(expect.objectContaining({ success: true }));
        expect(S3Client).toHaveBeenCalledWith(expect.objectContaining({
            endpoint: 'http://minio:9000',
        }));
        expect(publicLookup).not.toHaveBeenCalled();
    });

    it('fails closed on upload when the saved endpoint is unsafe', async () => {
        saved['storage.endpoint'] = 'https://169.254.169.254';
        const file = {
            originalname: 'customer.txt',
            mimetype: 'text/plain',
            buffer: Buffer.from('fixture'),
        } as Express.Multer.File;

        await expect(createService().uploadFile(file, 'tickets')).rejects.toMatchObject({
            status: 503,
            message: 'File storage is temporarily unavailable. Please retry.',
        });
        expect(S3Client).not.toHaveBeenCalled();
        expect(send).not.toHaveBeenCalled();
    });

    it('fails closed on download and delete when the saved endpoint is unsafe', async () => {
        saved['storage.endpoint'] = 'https://169.254.169.254';
        const service = createService();

        await expect(service.getDownloadUrl('tickets/customer.txt')).rejects.toMatchObject({ status: 503 });
        await expect(service.deleteFile('tickets/customer.txt')).rejects.toMatchObject({ status: 503 });
        expect(S3Client).not.toHaveBeenCalled();
        expect(send).not.toHaveBeenCalled();
    });

    it('does not read local storage when the saved S3 endpoint is unsafe', async () => {
        saved['storage.endpoint'] = 'https://169.254.169.254';

        await expect(createService().getFile('tickets/customer.txt')).resolves.toBeNull();
        expect(S3Client).not.toHaveBeenCalled();
        expect(send).not.toHaveBeenCalled();
    });

    it('returns a stable sanitized runtime connection error', async () => {
        send.mockRejectedValue(new Error(
            'redirected to https://169.254.169.254 with stored-secret-key for fixture-bucket',
        ));

        const result = await createService().testConnection();
        expect(result).toEqual({
            success: false,
            message: 'Storage connection test failed. Verify the endpoint, bucket, and credentials.',
            details: { code: 'STORAGE_CONNECTION_FAILED' },
        });
        expect(JSON.stringify(result)).not.toContain('169.254.169.254');
        expect(JSON.stringify(result)).not.toContain('stored-secret-key');
        expect(JSON.stringify(result)).not.toContain('fixture-bucket');
    });

    it.each([
        'http://storage.example.com',
        'https://user:password@storage.example.com',
        'https://storage.example.com?target=https://169.254.169.254',
        'https://storage.example.com#private-target',
        'https://127.0.0.1',
        'https://[::1]',
        'https://169.254.169.254',
        'https://10.20.30.40',
        'https://[::ffff:127.0.0.1]',
        'https://[ff02::1]',
    ])('rejects unsafe endpoint %s before constructing an SDK client', async endpoint => {
        const result = await createService().testCustomConnection(explicitConfig(endpoint));
        expect(result).toEqual({
            success: false,
            message: 'Storage connection test was rejected by the outbound network policy.',
        });
        expect(S3Client).not.toHaveBeenCalled();
        expect(getValue).not.toHaveBeenCalled();
    });

    it('rejects a hostname when DNS returns any private answer', async () => {
        const lookup = jest.fn().mockResolvedValue([
            { address: '8.8.8.8', family: 4 },
            { address: '192.168.1.20', family: 4 },
        ]);
        const result = await createService(lookup).testCustomConnection(explicitConfig());
        expect(result.success).toBe(false);
        expect(S3Client).not.toHaveBeenCalled();
    });

    it('does not resolve stored credentials for a different endpoint', async () => {
        const result = await createService().testCustomConnection({
            ...explicitConfig('https://attacker.example'),
            accessKey: '********',
            secretKey: '********',
        });
        expect(result).toEqual({
            success: false,
            message: 'Masked credentials may only be used with the saved storage endpoint.',
        });
        expect(getValue).toHaveBeenCalledTimes(1);
        expect(getValue).toHaveBeenCalledWith('storage.endpoint');
        expect(getValue).not.toHaveBeenCalledWith('storage.access_key');
        expect(getValue).not.toHaveBeenCalledWith('storage.secret_key');
        expect(S3Client).not.toHaveBeenCalled();
    });

    it('requires explicit credentials for a custom endpoint when either credential is masked', async () => {
        const result = await createService().testCustomConnection({
            ...explicitConfig('https://custom.example'),
            secretKey: '********',
        });
        expect(result.success).toBe(false);
        expect(result.message).toContain('Masked credentials');
        expect(getValue).toHaveBeenCalledTimes(1);
        expect(S3Client).not.toHaveBeenCalled();
    });

    it('resolves masked credentials only for the canonically identical saved endpoint', async () => {
        await expect(createService().testCustomConnection({
            ...explicitConfig('https://STORAGE.example.com/'),
            accessKey: '********',
            secretKey: '********',
        })).resolves.toEqual(expect.objectContaining({ success: true }));
        expect(getValue).toHaveBeenCalledWith('storage.endpoint');
        expect(getValue).toHaveBeenCalledWith('storage.access_key');
        expect(getValue).toHaveBeenCalledWith('storage.secret_key');
        expect(S3Client).toHaveBeenCalledWith(expect.objectContaining({
            endpoint: 'https://storage.example.com',
            credentials: { accessKeyId: 'stored-access-key', secretAccessKey: 'stored-secret-key' },
            followRegionRedirects: false,
            requestHandler: expect.objectContaining({ httpsAgent: expect.anything() }),
        }));
        expect(HeadBucketCommand).toHaveBeenCalledWith({ Bucket: 'fixture-bucket' });
    });

    it('uses caller-provided credentials for a public custom endpoint without reading saved secrets', async () => {
        await expect(createService().testCustomConnection(explicitConfig('https://custom.example')))
            .resolves.toEqual(expect.objectContaining({ success: true }));
        expect(getValue).not.toHaveBeenCalled();
        expect(S3Client).toHaveBeenCalledWith(expect.objectContaining({
            endpoint: 'https://custom.example',
            credentials: { accessKeyId: 'request-access-key', secretAccessKey: 'request-secret-key' },
        }));
    });

    it('classifies R2 only from the exact hostname or a subdomain', async () => {
        await createService().testCustomConnection({
            ...explicitConfig('https://account.r2.cloudflarestorage.com'),
            region: '',
        });
        expect(s3Client.mock.calls[0][0]).toEqual(expect.objectContaining({
            region: 'auto',
            forcePathStyle: true,
        }));

        jest.clearAllMocks();
        send.mockResolvedValue({});

        await createService().testCustomConnection({
            ...explicitConfig('https://storage.example.com/cloudflarestorage.com'),
            region: '',
        });
        expect(s3Client.mock.calls[0][0]).toEqual(expect.objectContaining({
            region: 'us-east-1',
        }));
    });

    it('pins validated DNS answers and disables region redirects in the SDK transport', async () => {
        await createService().testCustomConnection(explicitConfig());
        const clientConfig = s3Client.mock.calls[0][0] as any;
        const pinnedLookup = clientConfig.requestHandler.httpsAgent.options.lookup;
        const callback = jest.fn();
        pinnedLookup('storage.example.com', {}, callback);
        expect(callback).toHaveBeenCalledWith(null, '8.8.8.8', 4);

        const redirectCallback = jest.fn();
        pinnedLookup('redirected.example', {}, redirectCallback);
        expect(redirectCallback.mock.calls[0][0]).toEqual(expect.objectContaining({
            message: 'Pinned outbound agent host mismatch',
        }));
        expect(clientConfig.followRegionRedirects).toBe(false);
    });

    it('returns a stable sanitized error without provider, endpoint, bucket, or credential detail', async () => {
        send.mockRejectedValue(new Error(
            'redirected to https://169.254.169.254 with request-secret-key for fixture-bucket',
        ));
        const result = await createService().testCustomConnection(explicitConfig());
        expect(result).toEqual({
            success: false,
            message: 'Storage connection test failed. Verify the endpoint, bucket, and credentials.',
            details: { code: 'STORAGE_CONNECTION_FAILED' },
        });
        expect(JSON.stringify(result)).not.toContain('169.254.169.254');
        expect(JSON.stringify(result)).not.toContain('request-secret-key');
        expect(JSON.stringify(result)).not.toContain('fixture-bucket');
    });
});

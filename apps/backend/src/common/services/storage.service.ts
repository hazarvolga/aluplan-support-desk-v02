import { Injectable, Logger, OnModuleInit, Optional, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadBucketCommand,
    CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs-extra';
import * as path from 'path';
import sanitize from 'sanitize-filename';
import { SettingsService } from '../../settings/settings.service';
import { openLocalStorageFile } from '../utils/storage-path.util';
import { randomUUID } from 'node:crypto';
import type { Agent } from 'node:https';
import { OutboundUrlSafetyService } from '../../knowledge-pool/outbound-url-safety.service';

@Injectable()
export class StorageService implements OnModuleInit {
    private readonly logger = new Logger(StorageService.name);
    private readonly storageType: 'S3' | 'LOCAL';
    private readonly localPath: string;
    private readonly publicEndpoint: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly settingsService: SettingsService,
        @Optional() private readonly outboundUrlSafety = new OutboundUrlSafetyService(),
    ) {
        const storageConfig = this.configService.get('storage');
        this.storageType = storageConfig.type || 'LOCAL';
        this.localPath = path.resolve(storageConfig.localPath || './uploads');
        this.publicEndpoint = storageConfig.publicEndpoint;
    }

    isS3(): boolean {
        return this.storageType === 'S3';
    }


    private async getS3Config() {
        const storedEndpoint = (await this.settingsService.getValue('storage.endpoint') || '').trim();
        const endpointSource: 'settings' | 'config' = storedEndpoint ? 'settings' : 'config';
        const endpoint = (storedEndpoint || this.configService.get('storage.endpoint') || '').trim().replace(/\/+$/, '');
        const regionStr = (await this.settingsService.getValue('storage.region') || this.configService.get('storage.region') || '').trim();
        const accessKey = (await this.settingsService.getValue('storage.access_key') || this.configService.get('storage.accessKey') || '').trim();
        const secretKey = (await this.settingsService.getValue('storage.secret_key') || this.configService.get('storage.secretKey') || '').trim();
        const dbBucket = await this.settingsService.getValue('storage.bucket');
        const bucket = (dbBucket || this.configService.get('storage.bucket') || '').trim();

        return { endpoint, endpointSource, regionStr, accessKey, secretKey, bucket };
    }

    private async getS3Client(): Promise<{ client: S3Client | null, bucket: string, endpoint: string }> {
        if (this.storageType !== 'S3') return { client: null, bucket: '', endpoint: '' };

        const { endpoint: configuredEndpoint, endpointSource, regionStr, accessKey, secretKey, bucket } = await this.getS3Config();

        if (!configuredEndpoint || !accessKey || !secretKey || !bucket) {
            this.logger.warn('S3 Storage is enabled but missing required credentials in DB or ENV.');
            return { client: null, bucket: '', endpoint: '' };
        }

        let endpoint = configuredEndpoint;
        let httpsAgent: Agent | undefined;
        if (endpointSource === 'settings') {
            try {
                endpoint = this.normalizeStorageEndpoint(configuredEndpoint);
                ({ httpsAgent } = await this.outboundUrlSafety.validatePublicHttpsUrl(endpoint));
            } catch {
                this.logger.warn('Saved S3 endpoint was rejected by the outbound network policy.');
                return { client: null, bucket: '', endpoint: '' };
            }
        }

        const isR2 = this.isCloudflareR2Endpoint(endpoint);
        const region = regionStr || (isR2 ? 'auto' : 'us-east-1');
        const forcePathStyle = isR2 ? true : (this.configService.get('storage.usePathStyle') ?? true);

        const client = new S3Client({
            endpoint,
            region,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
            forcePathStyle,
            ...(httpsAgent ? {
                maxAttempts: 2,
                followRegionRedirects: false,
                requestHandler: {
                    httpsAgent,
                    connectionTimeout: 5_000,
                    requestTimeout: 10_000,
                    throwOnRequestTimeout: true,
                },
            } : {}),
        });

        return { client, bucket, endpoint };
    }

    async onModuleInit() {
        if (this.storageType === 'S3') {
            await this.ensureBucketExists();
        } else {
            await fs.ensureDir(this.localPath);
            this.logger.log(`Local storage directory "${this.localPath}" is ready.`);
        }
    }

    private async ensureBucketExists() {
        const { client, bucket } = await this.getS3Client();
        if (!client) return;
        try {
            await client.send(new HeadBucketCommand({ Bucket: bucket }));
            this.logger.log(`Storage bucket "${bucket}" is ready.`);
        } catch (error) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                this.logger.warn(`Bucket "${bucket}" not found. Creating...`);
                try {
                    await client.send(new CreateBucketCommand({ Bucket: bucket }));
                    this.logger.log(`Bucket "${bucket}" created successfully.`);
                } catch {
                    this.logger.error('Failed to create the configured storage bucket.');
                }
            } else {
                this.logger.error('Failed to verify the configured storage bucket.');
            }
        }
    }

    async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
        const sanitizedFolder = folder.split('/').map(s => sanitize(s)).join('/');
        const sanitizedName = sanitize(file.originalname);
        const prefix = `${Date.now()}-${randomUUID()}-`;
        const extension = path.extname(sanitizedName);
        // Preserve normal extensions without exceeding filesystem UTF-8 byte limits.
        const suffix = Buffer.byteLength(extension) <= 32 ? extension : '';
        const stem = suffix ? sanitizedName.slice(0, -suffix.length) : sanitizedName;
        const budget = 255 - Buffer.byteLength(prefix + suffix);
        let boundedStem = '';
        for (const character of stem) {
            if (Buffer.byteLength(boundedStem + character) > budget) break;
            boundedStem += character;
        }
        const key = `${sanitizedFolder}/${prefix}${boundedStem}${suffix}`;

        try {
            if (this.storageType === 'S3') {
                const { client, bucket } = await this.getS3Client();
                if (!client || !bucket) throw new Error('S3 upload configuration is incomplete');
                await client.send(
                    new PutObjectCommand({
                        Bucket: bucket,
                        Key: key,
                        Body: file.buffer,
                        ContentType: file.mimetype,
                    }),
                );
            } else {
                const filePath = path.join(this.localPath, key);
                await fs.ensureDir(path.dirname(filePath));
                await fs.writeFile(filePath, file.buffer);
            }
        } catch {
            // Never acknowledge an S3 upload by silently writing to ephemeral local disk.
            // Provider errors can include credentials, endpoints or customer filenames.
            this.logger.error(`File upload failed for configured ${this.storageType} storage.`);
            throw new ServiceUnavailableException('File storage is temporarily unavailable. Please retry.');
        }

        return key;
    }

    async getDownloadUrl(key: string): Promise<string> {
        const { client, bucket } = await this.getS3Client();

        if (this.storageType === 'S3') {
            if (!client || !bucket) {
                throw new ServiceUnavailableException('File storage is temporarily unavailable. Please retry.');
            }
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });
            // Presigned URL valid for 1 hour
            const url = await getSignedUrl(client, command, { expiresIn: 3600 });

            const internalEndpoint = (await this.getS3Config()).endpoint;
            if (this.publicEndpoint && internalEndpoint && this.publicEndpoint !== internalEndpoint) {
                return url.replace(internalEndpoint, this.publicEndpoint);
            }

            return url;
        }

        // Serve via relative backend URL
        return `/api/v1/storage/${key}`;
    }


    async getFile(key: string): Promise<Buffer | null> {
        try {
            const { client, bucket } = await this.getS3Client();
            if (this.storageType === 'S3') {
                if (!client || !bucket) return null;
                const command = new GetObjectCommand({
                    Bucket: bucket,
                    Key: key,
                });
                const response = await client.send(command);
                const byteArray = await response.Body?.transformToByteArray();
                return byteArray ? Buffer.from(byteArray) : null;
            }

            const { file } = await openLocalStorageFile(this.localPath, key);
            try {
                return await file.readFile();
            } finally {
                await file.close();
            }
        } catch {
            this.logger.error(`Failed to read a file from configured ${this.storageType} storage.`);
            return null;
        }
    }

    async deleteFile(key: string): Promise<void> {
        const { client, bucket } = await this.getS3Client();
        if (this.storageType === 'S3') {
            if (!client || !bucket) {
                throw new ServiceUnavailableException('File storage is temporarily unavailable. Please retry.');
            }
            await client.send(
                new DeleteObjectCommand({
                    Bucket: bucket,
                    Key: key,
                }),
            );
            return;
        }

        const filePath = path.join(this.localPath, key);
        if (await fs.pathExists(filePath)) {
            await fs.unlink(filePath);
        }
    }

    async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
        if (this.storageType !== 'S3') {
            return { success: true, message: 'Local storage is active and ready.' };
        }

        const { client, bucket } = await this.getS3Client();

        if (!client) {
            return { success: false, message: 'S3 Client not initialized. Check your credentials in settings or environment.' };
        }

        try {
            // 1. Try to list bucket (lightweight check)
            await client.send(new HeadBucketCommand({ Bucket: bucket }));
            return {
                success: true,
                message: `Successfully connected to Minio/S3/R2. Bucket "${bucket}" is accessible.`,
            };
        } catch {
            return {
                success: false,
                message: 'Storage connection test failed. Verify the endpoint, bucket, and credentials.',
                details: { code: 'STORAGE_CONNECTION_FAILED' },
            };
        }
    }

    async testCustomConnection(config: { endpoint: string, region: string, accessKey: string, secretKey: string, bucket: string }): Promise<{ success: boolean; message: string; details?: any }> {
        let endpoint: string;
        let httpsAgent: Agent;
        try {
            endpoint = this.normalizeStorageEndpoint(config.endpoint);
            ({ httpsAgent } = await this.outboundUrlSafety.validatePublicHttpsUrl(endpoint));
        } catch {
            return {
                success: false,
                message: 'Storage connection test was rejected by the outbound network policy.',
            };
        }

        let accessKey = (config.accessKey || '').trim();
        let secretKey = (config.secretKey || '').trim();
        const bucket = (config.bucket || '').trim();
        const usesMaskedCredential = accessKey === '********' || secretKey === '********';

        if (usesMaskedCredential) {
            const savedEndpointValue = await this.settingsService.getValue('storage.endpoint')
                || this.configService.get('storage.endpoint')
                || '';
            let savedEndpoint = '';
            try {
                savedEndpoint = this.normalizeStorageEndpoint(savedEndpointValue);
            } catch {
                // An invalid saved endpoint can never authorize reuse of stored credentials.
            }
            if (!savedEndpoint || savedEndpoint !== endpoint) {
                return {
                    success: false,
                    message: 'Masked credentials may only be used with the saved storage endpoint.',
                };
            }

            if (accessKey === '********') {
                const savedAccessKey = await this.settingsService.getValue('storage.access_key')
                    || this.configService.get('storage.accessKey')
                    || '';
                accessKey = savedAccessKey.trim();
            }
            if (secretKey === '********') {
                const savedSecretKey = await this.settingsService.getValue('storage.secret_key')
                    || this.configService.get('storage.secretKey')
                    || '';
                secretKey = savedSecretKey.trim();
            }
        }

        if (!accessKey || !secretKey || !bucket) {
            return {
                success: false,
                message: 'Storage endpoint, bucket, and explicit test credentials are required.',
            };
        }

        const isR2 = this.isCloudflareR2Endpoint(endpoint);
        const region = (config.region || '').trim() || (isR2 ? 'auto' : 'us-east-1');
        const forcePathStyle = isR2 ? true : (this.configService.get('storage.usePathStyle') ?? true);

        try {
            const client = new S3Client({
                endpoint,
                region,
                credentials: {
                    accessKeyId: accessKey,
                    secretAccessKey: secretKey,
                },
                forcePathStyle,
                maxAttempts: 2,
                followRegionRedirects: false,
                requestHandler: {
                    httpsAgent,
                    connectionTimeout: 5_000,
                    requestTimeout: 10_000,
                    throwOnRequestTimeout: true,
                },
            });

            await client.send(new HeadBucketCommand({ Bucket: bucket }));
            return {
                success: true,
                message: 'Storage connection test succeeded.',
            };
        } catch {
            return {
                success: false,
                message: 'Storage connection test failed. Verify the endpoint, bucket, and credentials.',
                details: { code: 'STORAGE_CONNECTION_FAILED' },
            };
        }
    }

    private isCloudflareR2Endpoint(endpoint: string): boolean {
        try {
            const hostname = new URL(endpoint).hostname.toLowerCase();
            return hostname === 'cloudflarestorage.com'
                || hostname.endsWith('.cloudflarestorage.com');
        } catch {
            return false;
        }
    }

    private normalizeStorageEndpoint(value: string): string {
        const url = new URL((value || '').trim());
        if (url.username || url.password || url.search || url.hash) {
            throw new Error('Storage endpoint credentials, query strings, and fragments are not allowed');
        }
        const pathname = url.pathname.replace(/\/+$/, '');
        return `${url.origin}${pathname && pathname !== '/' ? pathname : ''}`;
    }
}

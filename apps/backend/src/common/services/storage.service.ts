import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
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

@Injectable()
export class StorageService implements OnModuleInit {
    private readonly logger = new Logger(StorageService.name);
    private readonly storageType: 'S3' | 'LOCAL';
    private readonly localPath: string;
    private readonly publicEndpoint: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly settingsService: SettingsService
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
        const endpoint = (await this.settingsService.getValue('storage.endpoint') || this.configService.get('storage.endpoint') || '').trim().replace(/\/+$/, '');
        const regionStr = (await this.settingsService.getValue('storage.region') || this.configService.get('storage.region') || '').trim();
        const accessKey = (await this.settingsService.getValue('storage.access_key') || this.configService.get('storage.accessKey') || '').trim();
        const secretKey = (await this.settingsService.getValue('storage.secret_key') || this.configService.get('storage.secretKey') || '').trim();
        const dbBucket = await this.settingsService.getValue('storage.bucket');
        const bucket = (dbBucket || this.configService.get('storage.bucket') || '').trim();

        return { endpoint, regionStr, accessKey, secretKey, bucket };
    }

    private async getS3Client(): Promise<{ client: S3Client | null, bucket: string, endpoint: string }> {
        if (this.storageType !== 'S3') return { client: null, bucket: '', endpoint: '' };

        const { endpoint, regionStr, accessKey, secretKey, bucket } = await this.getS3Config();

        if (!endpoint || !accessKey || !secretKey || !bucket) {
            this.logger.warn('S3 Storage is enabled but missing required credentials in DB or ENV.');
            return { client: null, bucket: '', endpoint: '' };
        }

        const isR2 = endpoint.includes('cloudflarestorage.com');
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
                } catch (createError) {
                    this.logger.error(`Failed to create bucket: ${createError.message}`);
                }
            } else {
                this.logger.error(`Error checking bucket: ${error.message}`);
            }
        }
    }

    async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
        const sanitizedFolder = folder.split('/').map(s => sanitize(s)).join('/');
        const sanitizedName = sanitize(file.originalname);
        const key = `${sanitizedFolder}/${Date.now()}-${sanitizedName}`;

        const { client, bucket, endpoint } = await this.getS3Client();

        if (this.storageType === 'S3' && client) {
            try {
                await client.send(
                    new PutObjectCommand({
                        Bucket: bucket,
                        Key: key,
                        Body: file.buffer,
                        ContentType: file.mimetype,
                    }),
                );
            } catch (error: any) {
                this.logger.error(`S3 Upload Failed: [Bucket: ${bucket}] [Key: ${key}] [Endpoint: ${endpoint}]`);
                this.logger.error(`Error Details: ${error.message}${error.$metadata ? ` (Status: ${error.$metadata.httpStatusCode})` : ''}`);
                this.logger.warn(`Falling back to local storage for key ${key} due to S3 failure.`);
                const filePath = path.join(this.localPath, key);
                await fs.ensureDir(path.dirname(filePath));
                await fs.writeFile(filePath, file.buffer);
            }
        } else {
            const filePath = path.join(this.localPath, key);
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, file.buffer);
        }

        return key;
    }

    async getDownloadUrl(key: string): Promise<string> {
        const { client, bucket } = await this.getS3Client();

        if (this.storageType === 'S3' && client) {
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
        } else {
            // Serve via relative backend URL
            return `/api/v1/storage/${key}`;
        }
    }


    async getFile(key: string): Promise<Buffer | null> {
        try {
            const { client, bucket } = await this.getS3Client();
            if (this.storageType === 'S3' && client) {
                const command = new GetObjectCommand({
                    Bucket: bucket,
                    Key: key,
                });
                const response = await client.send(command);
                const byteArray = await response.Body?.transformToByteArray();
                return byteArray ? Buffer.from(byteArray) : null;
            } else {
                const filePath = path.join(this.localPath, key);
                if (await fs.pathExists(filePath)) {
                    return fs.readFile(filePath);
                }
                return null;
            }
        } catch (e) {
            this.logger.error(`Failed to get file [${key}]: ${e.message}`);
            return null;
        }
    }

    async deleteFile(key: string): Promise<void> {
        const { client, bucket } = await this.getS3Client();
        if (this.storageType === 'S3' && client) {
            await client.send(
                new DeleteObjectCommand({
                    Bucket: bucket,
                    Key: key,
                }),
            );
        } else {
            const filePath = path.join(this.localPath, key);
            if (await fs.pathExists(filePath)) {
                await fs.unlink(filePath);
            }
        }
    }

    async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
        if (this.storageType !== 'S3') {
            return { success: true, message: 'Local storage is active and ready.' };
        }

        const { client, bucket, endpoint } = await this.getS3Client();

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
        } catch (error: any) {
            const host = endpoint?.split('//')[1]?.split(':')[0] || 'unknown';
            let errorMsg = error.message;
            let advice = 'Check if storage endpoint is running and reachabe.';

            if (error.code === 'ENOTFOUND' || error.name === 'UnknownError' || error.message.includes('getaddrinfo')) {
                errorMsg = `DNS Resolution Failed: Cannot find host "${host}"`;
                advice = `Ensure the backend container is in the same Docker network as Minio. Try using "http://172.17.0.1:9000" (Docker Gateway) in .env if the internal name fails, or check if Cloudflare R2 URL is correct.`;
            } else if (error.$metadata?.httpStatusCode === 403 || error.$metadata?.httpStatusCode === 401) {
                errorMsg = `Permission Denied (${error.$metadata?.httpStatusCode})`;
                advice = 'Check your Access Key and Secret Key for validity and correctness.';
            }

            return {
                success: false,
                message: errorMsg,
                details: {
                    endpoint: endpoint,
                    bucket: bucket,
                    advice: advice,
                    originalError: error.name || error.code
                }
            };
        }
    }

    async testCustomConnection(config: { endpoint: string, region: string, accessKey: string, secretKey: string, bucket: string }): Promise<{ success: boolean; message: string; details?: any }> {
        const endpoint = (config.endpoint || '').trim().replace(/\/+$/, '');
        const accessKey = (config.accessKey || '').trim();
        let secretKey = (config.secretKey || '').trim();
        const bucket = (config.bucket || '').trim();

        if (secretKey === '********') {
            const dbSecret = await this.settingsService.getValue('storage.secret_key') || this.configService.get('storage.secretKey') || '';
            secretKey = dbSecret.trim();
        }

        const isR2 = endpoint.includes('cloudflarestorage.com');
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
                maxAttempts: 2
            });

            await client.send(new HeadBucketCommand({ Bucket: config.bucket }));
            return {
                success: true,
                message: `Successfully connected to storage. Bucket "${config.bucket}" is accessible.`,
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Connection failed: ${error.message}`,
                details: {
                    statusCode: error.$metadata?.httpStatusCode,
                    name: error.name,
                    advice: error.$metadata?.httpStatusCode === 403 || error.$metadata?.httpStatusCode === 401 ? 'Check your Access Key and Secret Key.' : 'Check endpoint URL and network connectivity.'
                }
            };
        }
    }
}

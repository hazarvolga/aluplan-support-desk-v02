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

@Injectable()
export class StorageService implements OnModuleInit {
    private readonly logger = new Logger(StorageService.name);
    private s3Client: S3Client | null = null;
    private readonly bucket: string;
    private readonly storageType: 'S3' | 'LOCAL';
    private readonly localPath: string;
    private readonly publicEndpoint: string;

    constructor(private readonly configService: ConfigService) {
        const storageConfig = this.configService.get('storage');
        this.storageType = storageConfig.type || 'LOCAL';
        this.bucket = storageConfig.bucket;
        this.localPath = path.resolve(storageConfig.localPath || './uploads');
        this.publicEndpoint = storageConfig.publicEndpoint;

        if (this.storageType === 'S3') {
            this.logger.log(`Initializing S3 Storage with endpoint: ${storageConfig.endpoint}`);
            this.s3Client = new S3Client({
                endpoint: storageConfig.endpoint,
                region: storageConfig.region,
                credentials: {
                    accessKeyId: storageConfig.accessKey,
                    secretAccessKey: storageConfig.secretKey,
                },
                forcePathStyle: storageConfig.usePathStyle,
            });
        }
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
        if (!this.s3Client) return;
        try {
            await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
            this.logger.log(`Storage bucket "${this.bucket}" is ready.`);
        } catch (error) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                this.logger.warn(`Bucket "${this.bucket}" not found. Creating...`);
                try {
                    await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucket }));
                    this.logger.log(`Bucket "${this.bucket}" created successfully.`);
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

        if (this.storageType === 'S3' && this.s3Client) {
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
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

        return key;
    }

    async getDownloadUrl(key: string): Promise<string> {
        if (this.storageType === 'S3' && this.s3Client) {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            // Presigned URL valid for 1 hour
            const url = await getSignedUrl(this.s3Client as any, command as any, { expiresIn: 3600 });

            const internalEndpoint = this.configService.get('storage.endpoint');
            if (this.publicEndpoint && internalEndpoint && this.publicEndpoint !== internalEndpoint) {
                return url.replace(internalEndpoint, this.publicEndpoint);
            }

            return url;
        } else {
            // Serve via backend URL
            const port = this.configService.get('port') || 4000;
            const apiBase = `http://localhost:${port}/api/v1`;
            return `${apiBase}/storage/${key}`;
        }
    }

    async getFile(key: string): Promise<Buffer | null> {
        try {
            if (this.storageType === 'S3' && this.s3Client) {
                const command = new GetObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                });
                const response = await this.s3Client.send(command);
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
        if (this.storageType === 'S3' && this.s3Client) {
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
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

        if (!this.s3Client) {
            return { success: false, message: 'S3 Client not initialized. Check your credentials.' };
        }

        try {
            // 1. Try to list bucket (lightweight check)
            await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
            return {
                success: true,
                message: `Successfully connected to Minio/S3. Bucket "${this.bucket}" is accessible.`,
            };
        } catch (error: any) {
            const host = this.configService.get('storage.endpoint').split('//')[1]?.split(':')[0];
            let errorMsg = error.message;
            let advice = 'Check if Minio is running and reachabe.';

            if (error.code === 'ENOTFOUND' || error.name === 'UnknownError' || error.message.includes('getaddrinfo')) {
                errorMsg = `DNS Resolution Failed: Cannot find host "${host}"`;
                advice = `Ensure the backend container is in the same Docker network as Minio. Try using "http://172.17.0.1:9000" (Docker Gateway) in .env if the internal name fails.`;
            } else if (error.$metadata?.httpStatusCode === 403) {
                errorMsg = 'Permission Denied (403)';
                advice = 'Check your ACCESS_KEY and SECRET_KEY.';
            }

            return {
                success: false,
                message: errorMsg,
                details: {
                    endpoint: this.configService.get('storage.endpoint'),
                    bucket: this.bucket,
                    advice: advice,
                    originalError: error.name || error.code
                }
            };
        }
    }
}

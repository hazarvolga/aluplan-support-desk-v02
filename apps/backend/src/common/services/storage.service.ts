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

@Injectable()
export class StorageService implements OnModuleInit {
    private readonly logger = new Logger(StorageService.name);
    private s3Client: S3Client | null = null;
    private readonly bucket: string;
    private readonly storageType: 'S3' | 'LOCAL';
    private readonly localPath: string;

    constructor(private readonly configService: ConfigService) {
        const storageConfig = this.configService.get('storage');
        this.storageType = storageConfig.type || 'LOCAL';
        this.bucket = storageConfig.bucket;
        this.localPath = storageConfig.localPath || './uploads';

        if (this.storageType === 'S3') {
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
        const key = `${folder}/${Date.now()}-${file.originalname}`;

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
            return getSignedUrl(this.s3Client as any, command as any, { expiresIn: 3600 });
        } else {
            // Serve via backend URL
            const baseUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
            const apiBase = `${baseUrl.replace(':3000', ':3001')}/api/v1`;
            return `${apiBase}/storage/${key}`;
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
}

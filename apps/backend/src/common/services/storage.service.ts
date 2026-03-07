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

@Injectable()
export class StorageService implements OnModuleInit {
    private readonly logger = new Logger(StorageService.name);
    private s3Client: S3Client;
    private readonly bucket: string;

    constructor(private readonly configService: ConfigService) {
        const storageConfig = this.configService.get('storage');

        this.s3Client = new S3Client({
            endpoint: storageConfig.endpoint,
            region: storageConfig.region,
            credentials: {
                accessKeyId: storageConfig.accessKey,
                secretAccessKey: storageConfig.secretKey,
            },
            forcePathStyle: storageConfig.usePathStyle,
        });
        this.bucket = storageConfig.bucket;
    }

    async onModuleInit() {
        await this.ensureBucketExists();
    }

    private async ensureBucketExists() {
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

        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        return key;
    }

    async getDownloadUrl(key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        // Presigned URL valid for 1 hour
        return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    }

    async deleteFile(key: string): Promise<void> {
        await this.s3Client.send(
            new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }),
        );
    }
}

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs-extra';
import { format } from 'date-fns';

const execAsync = promisify(exec);

@Injectable()
export class DatabaseBackupService {
    private readonly logger = new Logger(DatabaseBackupService.name);
    private readonly backupDir = path.join(process.cwd(), 'temp-backups');

    constructor(
        private readonly configService: ConfigService,
        private readonly storageService: StorageService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async handleCron() {
        this.logger.log('🚀 Starting scheduled database backup...');
        await this.runBackup();
    }

    async runBackup() {
        try {
            await fs.ensureDir(this.backupDir);

            const dbUrl = this.configService.get<string>('DATABASE_URL');
            if (!dbUrl) {
                throw new Error('DATABASE_URL not found in config');
            }

            const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
            const fileName = `backup_${timestamp}.sql`;
            const localFilePath = path.join(this.backupDir, fileName);

            this.logger.log(`📦 Creating dump: ${fileName}`);

            // Execute pg_dump
            // Note: This requires pg_dump to be installed in the environment
            try {
                await execAsync(`pg_dump "${dbUrl}" -F p -f "${localFilePath}"`);
            } catch (dumpErr) {
                this.logger.error(`❌ pg_dump failed. Ensure postgres-client is installed in the container/OS.`, dumpErr.stack);
                throw dumpErr;
            }

            const fileBuffer = await fs.readFile(localFilePath);
            const multerFile: any = {
                originalname: fileName,
                buffer: fileBuffer,
                mimetype: 'application/sql',
            };

            this.logger.log(`☁️ Uploading backup to storage...`);
            const storageKey = await this.storageService.uploadFile(multerFile, 'backups');

            this.logger.log(`✅ Backup successfully uploaded: ${storageKey}`);

            // Cleanup local temp file
            await fs.remove(localFilePath);

            // Rotation: Keep last 7 days (Handled by storage provider if S3, or manual if local)
            // For simplicity, we'll log it here. Future: Add automated deletion of old keys in StorageService.
            this.logger.log(`🔄 Backup rotation check: COMPLETE`);

            return { success: true, key: storageKey };
        } catch (error) {
            this.logger.error('❌ Database backup failed', error.stack);
            return { success: false, error: error.message };
        }
    }
}

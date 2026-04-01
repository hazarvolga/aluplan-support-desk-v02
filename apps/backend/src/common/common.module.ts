import { Global, Module } from '@nestjs/common';
import { ErrorLoggerService } from './services/error-logger.service';
import { StorageService } from './services/storage.service';
import { StorageController } from './controllers/storage.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PiiMaskingService } from './services/pii-masking.service';
import { DatabaseBackupService } from './services/database-backup.service';

@Global()
@Module({
    imports: [PrismaModule],
    providers: [ErrorLoggerService, StorageService, PiiMaskingService, DatabaseBackupService],
    controllers: [StorageController],
    exports: [ErrorLoggerService, StorageService, PiiMaskingService, DatabaseBackupService],
})
export class CommonModule { }

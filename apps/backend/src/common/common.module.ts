import { Global, Module } from '@nestjs/common';
import { ErrorLoggerService } from './services/error-logger.service';
import { StorageService } from './services/storage.service';
import { StorageController } from './controllers/storage.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
    imports: [PrismaModule],
    providers: [ErrorLoggerService, StorageService],
    controllers: [StorageController],
    exports: [ErrorLoggerService, StorageService],
})
export class CommonModule { }

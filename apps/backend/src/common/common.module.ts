import { Global, Module } from '@nestjs/common';
import { ErrorLoggerService } from './services/error-logger.service';
import { StorageService } from './services/storage.service';
import { StorageController } from './controllers/storage.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PiiMaskingService } from './services/pii-masking.service';
import { DatabaseBackupService } from './services/database-backup.service';
import { DocumentParserService } from './services/document-parser.service';
import { TicketOwnerGuard } from './guards/ticket-owner.guard';
import { TeamScopeGuard } from './guards/team-scope.guard';
import { AlertingService } from './services/alerting.service';
import { TicketAccessService } from './services/ticket-access.service';

@Global()
@Module({
    imports: [PrismaModule],
    providers: [
        ErrorLoggerService,
        StorageService,
        PiiMaskingService,
        DatabaseBackupService,
        DocumentParserService,
        TicketOwnerGuard,
        TeamScopeGuard,
        AlertingService,
        TicketAccessService,
    ],
    controllers: [StorageController],
    exports: [
        ErrorLoggerService,
        StorageService,
        PiiMaskingService,
        DatabaseBackupService,
        DocumentParserService,
        TicketOwnerGuard,
        TeamScopeGuard,
        AlertingService,
        TicketAccessService,
    ],
})
export class CommonModule { }

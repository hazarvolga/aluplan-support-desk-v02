import { Module, Global } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { AuditService } from './audit.service';
import { EmailModule } from '../email/email.module';
import { SlaCronService } from './sla.cron';
import { SlaProcessor } from './sla.processor';
import { BullModule } from '@nestjs/bullmq';

// Let's import NotificationsModule which exports NotificationsGateway
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
    imports: [
        EmailModule,
        NotificationsModule,
        PrismaModule,
        BullModule.registerQueue({
            name: 'sla-processing',
            defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 50, removeOnFail: false },
        }),
    ],
    providers: [AutomationService, AuditService, SlaCronService, SlaProcessor],
    exports: [AuditService],
})
export class AutomationModule { }

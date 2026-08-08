import { Module } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementLogReconciliationService } from './announcement-log-reconciliation.service';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [EmailModule, NotificationsModule],
    controllers: [AnnouncementsController],
    providers: [AnnouncementsService, AnnouncementLogReconciliationService],
    exports: [AnnouncementsService],
})
export class AnnouncementsModule { }

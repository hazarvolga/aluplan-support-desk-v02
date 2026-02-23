import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { SlaService } from './sla.service';
import { SlaCronService } from './sla-cron.service';
import { BusinessHoursService } from './business-hours.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AiModule } from '../ai/ai.module';

@Module({
    imports: [JwtModule.register({}), AiModule, NotificationsModule], // for NotificationsGateway JWT verify
    controllers: [TicketsController],
    providers: [TicketsService, SlaService, SlaCronService, BusinessHoursService],
    exports: [TicketsService, SlaService, BusinessHoursService],
})
export class TicketsModule { }

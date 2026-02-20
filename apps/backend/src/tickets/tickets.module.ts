import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { SlaService } from './sla.service';
import { SlaCronService } from './sla-cron.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { AiModule } from '../ai/ai.module';

@Module({
    imports: [JwtModule.register({}), AiModule], // for NotificationsGateway JWT verify
    controllers: [TicketsController],
    providers: [TicketsService, SlaService, SlaCronService, NotificationsGateway],
    exports: [TicketsService, SlaService],
})
export class TicketsModule { }

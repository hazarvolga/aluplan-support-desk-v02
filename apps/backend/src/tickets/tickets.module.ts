import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { SlaService } from './sla.service';
import { PiiMaskingService } from './pii-masking.service';
import { RuleEngineService } from './rule-engine.service';
import { AutoAssignmentService } from './auto-assignment.service';
import { BusinessHoursService } from './business-hours.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AiModule } from '../ai/ai.module';

@Module({
    imports: [JwtModule.register({}), AiModule, NotificationsModule],
    controllers: [TicketsController],
    providers: [TicketsService, SlaService, PiiMaskingService, RuleEngineService, AutoAssignmentService, BusinessHoursService],
    exports: [TicketsService, SlaService],
})
export class TicketsModule { }

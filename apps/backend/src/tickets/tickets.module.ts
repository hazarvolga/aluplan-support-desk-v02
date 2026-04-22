import { Module, forwardRef } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { SlaService } from './sla.service';
import { RuleEngineService } from './rule-engine.service';
import { AutoAssignmentService } from './auto-assignment.service';
import { BusinessHoursService } from './business-hours.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AiModule } from '../ai/ai.module';
import { SlaController } from './sla.controller';

@Module({
    imports: [forwardRef(() => AiModule), forwardRef(() => NotificationsModule)],
    controllers: [TicketsController, SlaController],
    providers: [TicketsService, SlaService, RuleEngineService, AutoAssignmentService, BusinessHoursService],
    exports: [TicketsService, SlaService],
})
export class TicketsModule { }

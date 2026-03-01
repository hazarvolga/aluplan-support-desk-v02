import { Module, Global } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { AuditService } from './audit.service';
import { EmailModule } from '../email/email.module';
import { SlaCronService } from './sla.cron';

@Global()
@Module({
    imports: [EmailModule],
    providers: [AutomationService, AuditService, SlaCronService],
    exports: [AuditService],
})
export class AutomationModule { }

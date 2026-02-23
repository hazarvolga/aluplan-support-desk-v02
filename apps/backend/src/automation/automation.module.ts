import { Module, Global } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { AuditService } from './audit.service';

@Global()
@Module({
    providers: [AutomationService, AuditService],
    exports: [AuditService],
})
export class AutomationModule { }

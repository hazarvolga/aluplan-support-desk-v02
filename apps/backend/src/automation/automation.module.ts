import { Module, Global } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { AuditService } from './audit.service';
import { EmailModule } from '../email/email.module';

@Global()
@Module({
    imports: [EmailModule],
    providers: [AutomationService, AuditService],
    exports: [AuditService],
})
export class AutomationModule { }

import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ResendProvider } from './resend.provider';
import { SmtpProvider } from './smtp.provider';
import { EmailInboundService } from './email-inbound.service';
import { SettingsModule } from '../settings/settings.module';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
    imports: [SettingsModule, TicketsModule],
    providers: [EmailService, ResendProvider, SmtpProvider, EmailInboundService],
    exports: [EmailService],
})
export class EmailModule { }

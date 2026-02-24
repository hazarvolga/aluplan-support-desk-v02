import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailService } from './email.service';
import { EmailProcessor } from './queues/email.processor';
import { ResendProvider } from './resend.provider';
import { SmtpProvider } from './smtp.provider';
import { GmailProvider } from './gmail.provider';
import { EmailInboundService } from './email-inbound.service';
import { SettingsModule } from '../settings/settings.module';
import { TicketsModule } from '../tickets/tickets.module';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailController } from './email.controller';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'email',
        }),
        SettingsModule,
        TicketsModule,
        PrismaModule
    ],
    controllers: [EmailController],
    providers: [
        EmailService,
        EmailProcessor,
        ResendProvider,
        SmtpProvider,
        GmailProvider,
        EmailInboundService
    ],
    exports: [EmailService, GmailProvider],
})
export class EmailModule { }

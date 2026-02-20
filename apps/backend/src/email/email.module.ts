import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ResendProvider } from './resend.provider';
import { SmtpProvider } from './smtp.provider';

@Module({
    providers: [EmailService, ResendProvider, SmtpProvider],
    exports: [EmailService],
})
export class EmailModule { }

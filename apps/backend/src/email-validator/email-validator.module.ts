import { Module } from '@nestjs/common';
import { EmailValidatorService } from './email-validator.service';
import { SyntaxValidator } from './validators/syntax.validator';
import { DnsValidator } from './validators/dns.validator';
import { SmtpValidator } from './validators/smtp.validator';
import { EmailValidatorController } from './email-validator.controller';

@Module({
    controllers: [EmailValidatorController],
    providers: [
        EmailValidatorService,
        SyntaxValidator,
        DnsValidator,
        SmtpValidator
    ],
    exports: [EmailValidatorService]
})
export class EmailValidatorModule { }

import { Injectable, Logger } from '@nestjs/common';
import { SyntaxValidator } from './validators/syntax.validator';
import { DnsValidator } from './validators/dns.validator';
import { SmtpValidator } from './validators/smtp.validator';
import { EmailValidationResult, ValidationStatus } from './types/validation-result.type';

@Injectable()
export class EmailValidatorService {
    private readonly logger = new Logger(EmailValidatorService.name);

    constructor(
        private readonly syntax: SyntaxValidator,
        private readonly dns: DnsValidator,
        private readonly smtp: SmtpValidator,
    ) { }

    async validate(email: string): Promise<EmailValidationResult> {
        this.logger.log(`Starting validation for: ${email}`);

        const result: EmailValidationResult = {
            email,
            status: ValidationStatus.UNKNOWN,
            score: 0,
            syntax: { isValid: false },
            dns: { isValid: false },
            smtp: { isValid: false }
        };

        // 1. Syntax Check
        const syntaxResult = this.syntax.validate(email);
        result.syntax = syntaxResult;
        if (!syntaxResult.isValid) {
            result.status = ValidationStatus.INVALID;
            result.score = 0;
            return result;
        }
        result.score += 20;

        // 2. DNS Check
        const domain = this.syntax.extractDomain(email);
        if (!domain) {
            result.status = ValidationStatus.INVALID;
            return result;
        }

        const dnsResult = await this.dns.validate(domain);
        result.dns = {
            ...dnsResult,
            isDisposable: this.dns.isDisposable(domain)
        };

        if (!dnsResult.isValid) {
            result.status = ValidationStatus.INVALID;
            result.score = 10; // Some points for valid syntax but domain is dead
            return result;
        }
        result.score += 30;

        // 3. Risk Assessment (Disposable/Role-based)
        if (result.dns.isDisposable) {
            result.score -= 40;
        }
        if (this.syntax.isRoleBased(email)) {
            result.score -= 10;
        }

        // 4. SMTP Handshake (Only if DNS is valid)
        // We try the first MX record for now
        const mxHost = dnsResult.mxRecords[0];
        const smtpResult = await this.smtp.validate(email, mxHost);
        result.smtp = smtpResult;

        if (smtpResult.isValid) {
            result.score += 50;
        }

        // 5. Final Status
        if (result.score >= 70) {
            result.status = ValidationStatus.VALID;
        } else if (result.score >= 40) {
            result.status = ValidationStatus.RISKY;
        } else {
            result.status = ValidationStatus.INVALID;
        }

        // Clip score
        result.score = Math.max(0, Math.min(100, result.score));

        return result;
    }

    async validateBulk(emails: string[]): Promise<EmailValidationResult[]> {
        this.logger.log(`Starting bulk validation for ${emails.length} addresses`);
        const results = await Promise.all(
            emails.map(email => this.validate(email).catch(err => ({
                email,
                status: ValidationStatus.INVALID,
                score: 0,
                syntax: { isValid: false },
                dns: { isValid: false },
                smtp: { isValid: false, error: err.message }
            })))
        );
        return results;
    }
}

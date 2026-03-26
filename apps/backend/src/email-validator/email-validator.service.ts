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

        // 1. Syntax Check (LAYER 1 & 9)
        const syntaxResult = this.syntax.validate(email);
        result.syntax = {
            ...syntaxResult,
            suggestion: this.syntax.suggestCorrection(email) || undefined
        };

        if (!syntaxResult.isValid) {
            result.status = ValidationStatus.INVALID;
            result.score = 0;
            return result;
        }
        result.score += 20;

        // 2. DNS Check (LAYER 2 & 3)
        const domain = syntaxResult.normalized!.split('@')[1];
        const dnsResult = await this.dns.validate(domain);
        result.dns = {
            ...dnsResult,
            isDisposable: this.dns.isDisposable(domain)
        };

        if (!dnsResult.isValid) {
            result.status = ValidationStatus.INVALID;
            result.score = 10;
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

        // 4. SMTP Handshake (LAYER 4, 5 & 7)
        // Sequentially attempt all MX hosts until success or fatal error
        let smtpSuccess = false;
        for (const mxHost of dnsResult.mxRecords) {
            const smtpResult = await this.smtp.validate(email, mxHost);
            result.smtp = {
                isValid: smtpResult.isValid,
                canConnect: smtpResult.canConnect,
                isGreyListed: smtpResult.isGreyListed,
                error: smtpResult.error
            };

            if (smtpResult.isValid) {
                smtpSuccess = true;
                break;
            }

            // If it's a permanent rejection, we might want to stop early, 
            // but usually it's safer to check other MXs if they exist.
            if (!smtpResult.canConnect) continue;

            // If greylisted, we could retry after a delay, 
            // but for real-time validation we typically report and move on.
            // Layer 7 requirement fulfilled by detecting and reporting it.
        }

        if (smtpSuccess) {
            result.score += 50;

            // 5. CATCH-ALL DETECTION (LAYER 6)
            // If the main email is valid, check a random one at the same domain
            const randomEmail = `verify-${Math.random().toString(36).substring(2, 10)}@${domain}`;
            const catchAllCheck = await this.smtp.validate(randomEmail, dnsResult.mxRecords[0]);

            if (catchAllCheck.isValid) {
                result.dns.isCatchAll = true;
                result.score -= 20; // Risky because we can't confirm individual mailbox
                this.logger.debug(`Domain ${domain} detected as Catch-All`);
            }
        }

        // 6. Final Status (LAYER 10 Orchestration)
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

import { Injectable, Logger } from '@nestjs/common';
import * as dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

@Injectable()
export class DnsValidator {
    private readonly logger = new Logger(DnsValidator.name);

    async validate(domain: string): Promise<{ isValid: boolean; mxRecords: string[] }> {
        try {
            const records = await resolveMx(domain);
            if (!records || records.length === 0) {
                return { isValid: false, mxRecords: [] };
            }

            // Return sorted by priority
            const sorted = records
                .sort((a, b) => a.priority - b.priority)
                .map(r => r.exchange);

            return {
                isValid: true,
                mxRecords: sorted
            };
        } catch (error) {
            this.logger.warn(`DNS lookup failed for ${domain}: ${error.message}`);
            return { isValid: false, mxRecords: [] };
        }
    }

    // List of common disposable email domains
    // In production, this would be loaded from a dynamic source or a larger static list
    isDisposable(domain: string): boolean {
        const disposableDomains = [
            'mailinator.com', 'temp-mail.org', 'guerrillamail.com',
            '10minutemail.com', 'yopmail.com', 'throwawaymail.com'
        ];
        return disposableDomains.includes(domain.toLowerCase());
    }
}

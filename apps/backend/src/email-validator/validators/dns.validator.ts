import { Injectable, Logger } from '@nestjs/common';
import * as dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);
const resolveA = promisify(dns.resolve); // defaults to A

@Injectable()
export class DnsValidator {
    private readonly logger = new Logger(DnsValidator.name);

    async validate(domain: string): Promise<{ isValid: boolean; mxRecords: string[]; fallbackToA?: boolean }> {
        try {
            // 1. Check MX Records
            let records: dns.MxRecord[] = [];
            try {
                records = await resolveMx(domain);
            } catch (e) {
                this.logger.debug(`No MX records for ${domain}`);
            }

            if (records && records.length > 0) {
                // Return sorted by priority
                const sorted = records
                    .sort((a, b) => a.priority - b.priority)
                    .map(r => r.exchange);

                return {
                    isValid: true,
                    mxRecords: sorted
                };
            }

            // 2. Fallback to A record (RFC 5321 support)
            try {
                const aRecords = await resolveA(domain);
                if (aRecords && aRecords.length > 0) {
                    this.logger.log(`Domain ${domain} has no MX, but A record found. Falling back.`);
                    return {
                        isValid: true,
                        mxRecords: [domain], // Use domain itself as fallback host
                        fallbackToA: true
                    };
                }
            } catch (e) {
                this.logger.debug(`No A records for ${domain}`);
            }

            return { isValid: false, mxRecords: [] };
        } catch (error) {
            this.logger.warn(`DNS lookup failed for ${domain}: ${error.message}`);
            return { isValid: false, mxRecords: [] };
        }
    }

    // LAYER 3 - Disposable Email Detection (Expanded)
    isDisposable(domain: string): boolean {
        // High-level common providers. In production, use external API or 50k+ entry list.
        const disposableDomains = [
            'mailinator.com', 'temp-mail.org', 'guerrillamail.com', 'sharklasers.com',
            '10minutemail.com', 'yopmail.com', 'throwawaymail.com', 'dispostable.com',
            'getairmail.com', 'maildrop.cc', 'mailnull.com', 'mohmal.com', 'mytrashmail.com',
            'guerrillamailblock.com', 'pokemail.net', 'spamgourmet.com', 'trashmail.net'
        ];

        const d = domain.toLowerCase();
        return disposableDomains.some(entry => d === entry || d.endsWith('.' + entry));
    }
}

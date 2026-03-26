import { Injectable } from '@nestjs/common';
import { domainToASCII } from 'url';

@Injectable()
export class SyntaxValidator {
    // RFC 5322 compliant regex (simplified but strict on structure)
    private readonly emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    validate(email: string): { isValid: boolean; normalized?: string; error?: string } {
        if (!email) return { isValid: false, error: 'Email is required' };

        // 1. Basic Normalization & Unicode Support (Layer 9)
        let normalized = email.trim().toLowerCase();

        // Check structure before IDN conversion to avoid corruption
        const atCount = (normalized.match(/@/g) || []).length;
        if (atCount !== 1) {
            return { isValid: false, error: 'Invalid structure: must have exactly one @ sign' };
        }

        // Handle Internationalized Domain Names (IDN)
        const [localPart, domain] = normalized.split('@');
        try {
            const punyDomain = domainToASCII(domain);
            normalized = `${localPart}@${punyDomain}`;
        } catch (e) {
            // Keep as is if punycode conversion fails
        }

        // 2. Length Checks (RFC 5321)
        if (normalized.length > 254) {
            return { isValid: false, error: 'Total length exceeds 254 characters' };
        }

        const parts = normalized.split('@');
        if (parts.length !== 2) {
            return { isValid: false, error: 'Invalid structure: missing or multiple @ signs' };
        }

        if (localPart.length > 64) {
            return { isValid: false, error: 'Local part exceeds 64 characters' };
        }

        // 3. Structural Constraints
        if (localPart.startsWith('.') || localPart.endsWith('.')) {
            return { isValid: false, error: 'Local part cannot start or end with a dot' };
        }

        if (localPart.includes('..')) {
            return { isValid: false, error: 'Local part cannot contains consecutive dots' };
        }

        // 4. Regex Validation for character set and domain rules
        const isValid = this.emailRegex.test(normalized);

        return {
            isValid,
            normalized: isValid ? normalized : undefined,
            error: isValid ? undefined : 'Invalid syntax characters'
        };
    }

    extractDomain(email: string): string | null {
        const result = this.validate(email);
        if (!result.isValid || !result.normalized) return null;
        return result.normalized.split('@')[1];
    }

    isRoleBased(email: string): boolean {
        const roles = [
            'info', 'admin', 'sales', 'support', 'contact', 'billing',
            'noreply', 'jobs', 'office', 'webmaster', 'marketing',
            'help', 'service', 'team', 'account', 'invoice', 'hr'
        ];
        const parts = email.toLowerCase().split('@');
        if (parts.length < 1) return false;

        const localPart = parts[0];
        return roles.some(role => localPart === role || localPart.startsWith(role + '.'));
    }

    // LAYER 8 — TYPO & RECOMMENDATION ENGINE
    suggestCorrection(email: string): string | null {
        const parts = email.toLowerCase().split('@');
        if (parts.length !== 2) return null;

        const [local, domain] = parts;

        const commonTypos: Record<string, string> = {
            'gamil.com': 'gmail.com',
            'gmial.com': 'gmail.com',
            'gmal.com': 'gmail.com',
            'gnail.com': 'gmail.com',
            'hotmial.com': 'hotmail.com',
            'hotamail.com': 'hotmail.com',
            'yaho.com': 'yahoo.com',
            'macc.com': 'mac.com',
            'outook.com': 'outlook.com',
            'outlook.cm': 'outlook.com',
            'gmail.cm': 'gmail.com',
            'comcast.net': 'comcast.net',
            'verizon.net': 'verizon.net',
        };

        if (commonTypos[domain]) {
            return `${local}@${commonTypos[domain]}`;
        }

        // TLD Typos
        if (domain.endsWith('.cm')) return `${local}@${domain.replace('.cm', '.com')}`;
        if (domain.endsWith('.con')) return `${local}@${domain.replace('.con', '.com')}`;
        if (domain.endsWith('.ney')) return `${local}@${domain.replace('.ney', '.net')}`;

        return null;
    }
}

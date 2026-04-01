import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PiiMaskingService {
    private readonly logger = new Logger(PiiMaskingService.name);

    // Regex for basic 16-digit credit cards (with optional dashes or spaces)
    private readonly creditCardRegex = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
    // Regex for 11 digit numbers (TCKN approximation)
    private readonly tcknRegex = /\b[1-9]\d{10}\b/g;
    // Basic phone number regex
    private readonly phoneRegex = /\+?90\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{2}[-.\s]?\d{2}\b/g;
    // Basic email regex
    private readonly emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    maskSensitiveData(text: string): string {
        if (!text) return text;

        let masked = text;

        // Mask Credit Cards (keep last 4 visible)
        masked = masked.replace(this.creditCardRegex, (_match) => {
            const last4 = _match.slice(-4);
            return `[KREDİ KARTI GİZLENDİ: ****-****-****-${last4}]`;
        });

        // Mask TCKN (Keep first 2 and last 2 visible)
        masked = masked.replace(this.tcknRegex, (_match) => {
            const first2 = _match.substring(0, 2);
            const last2 = _match.substring(_match.length - 2);
            return `[TCKN GİZLENDİ: ${first2}*******${last2}]`;
        });

        // Mask Phone Numbers
        masked = masked.replace(this.phoneRegex, () => {
            return `[TELEFON GİZLENDİ]`;
        });

        // Mask Emails
        masked = masked.replace(this.emailRegex, (_match) => {
            const [local, domain] = _match.split('@');
            return `[E-POSTA GİZLENDİ: ${local.charAt(0)}***@${domain}]`;
        });

        return masked;
    }
}

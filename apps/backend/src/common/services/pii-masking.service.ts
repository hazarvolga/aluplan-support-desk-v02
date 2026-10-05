import { Injectable } from '@nestjs/common';

const CREDIT_CARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
const TCKN_REGEX = /\b[1-9]\d{10}\b/g;
const PHONE_REGEX = /\+?90\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{2}[-.\s]?\d{2}\b/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export const maskSensitiveData = (text: string): string => {
    if (!text) return text;
    return text
        .replace(CREDIT_CARD_REGEX, match => `[KREDİ KARTI GİZLENDİ: ****-****-****-${match.slice(-4)}]`)
        .replace(TCKN_REGEX, match => `[TCKN GİZLENDİ: ${match.substring(0, 2)}*******${match.slice(-2)}]`)
        .replace(PHONE_REGEX, '[TELEFON GİZLENDİ]')
        .replace(EMAIL_REGEX, match => {
            const [local, domain] = match.split('@');
            return `[E-POSTA GİZLENDİ: ${local.charAt(0)}***@${domain}]`;
        });
};

@Injectable()
export class PiiMaskingService {
    maskSensitiveData(text: string): string {
        return maskSensitiveData(text);
    }
}

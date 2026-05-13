import { PiiMaskingService } from './pii-masking.service';

describe('PiiMaskingService', () => {
    let service: PiiMaskingService;

    beforeEach(() => {
        service = new PiiMaskingService();
    });

    describe('maskSensitiveData', () => {
        // ─── Passthrough ──────────────────────────────────────────────
        it('returns empty string unchanged', () => {
            expect(service.maskSensitiveData('')).toBe('');
        });

        it('returns falsy value unchanged', () => {
            expect(service.maskSensitiveData(null as unknown as string)).toBe(null);
        });

        it('returns plain text without PII unchanged', () => {
            const text = 'Merhaba, nasıl yardımcı olabilirim?';
            expect(service.maskSensitiveData(text)).toBe(text);
        });

        // ─── Credit Card ─────────────────────────────────────────────
        it('masks a 16-digit credit card and preserves last 4 digits', () => {
            const result = service.maskSensitiveData('Kartım: 4532 1234 5678 9012');
            expect(result).toContain('****-****-****-9012');
            expect(result).not.toContain('4532');
        });

        it('masks a credit card without spaces', () => {
            const result = service.maskSensitiveData('Kart: 4111111111111111');
            expect(result).toContain('****-****-****-1111');
        });

        it('masks a credit card with dashes', () => {
            const result = service.maskSensitiveData('4111-1111-1111-1234');
            expect(result).toContain('****-****-****-1234');
        });

        // ─── TCKN ─────────────────────────────────────────────────────
        it('masks an 11-digit TCKN and preserves first 2 and last 2 digits', () => {
            const result = service.maskSensitiveData('TC: 12345678901');
            expect(result).toContain('[TCKN GİZLENDİ: 12*******01]');
            expect(result).not.toContain('12345678901');
        });

        it('does not mask a 10-digit number (not TCKN)', () => {
            const result = service.maskSensitiveData('Numara: 1234567890');
            expect(result).toBe('Numara: 1234567890');
        });

        // ─── Phone Number ─────────────────────────────────────────────
        it('masks a Turkish phone number with country code', () => {
            const result = service.maskSensitiveData('Tel: +90 532 123 45 67');
            expect(result).toContain('[TELEFON GİZLENDİ]');
            expect(result).not.toContain('532');
        });

        it('masks a Turkish phone number without spaces', () => {
            const result = service.maskSensitiveData('+905321234567');
            expect(result).toContain('[TELEFON GİZLENDİ]');
        });

        // ─── Email ────────────────────────────────────────────────────
        it('masks an email address and keeps the first character of local part', () => {
            const result = service.maskSensitiveData('E-posta: john.doe@example.com');
            expect(result).toContain('[E-POSTA GİZLENDİ: j***@example.com]');
            expect(result).not.toContain('john.doe');
        });

        it('masks email in a longer sentence', () => {
            const result = service.maskSensitiveData('Lütfen destek@firma.com adresine yazın.');
            expect(result).not.toContain('destek@firma.com');
            expect(result).toContain('d***@firma.com');
        });

        // ─── Multiple PII types ───────────────────────────────────────
        it('masks multiple PII types in the same string', () => {
            const text = 'Kart: 4111111111111111, e-posta: user@test.com, TC: 12345678901';
            const result = service.maskSensitiveData(text);
            expect(result).not.toContain('4111111111111111');
            expect(result).not.toContain('user@test.com');
            expect(result).not.toContain('12345678901');
            expect(result).toContain('****-****-****-1111');
            expect(result).toContain('u***@test.com');
            expect(result).toContain('[TCKN GİZLENDİ:');
        });
    });
});

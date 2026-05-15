import { describe, expect, it } from 'vitest';
import { markdownToHtml } from './markdown-to-html';
import { ContentSanitizer } from './content-sanitizer';

describe('markdownToHtml', () => {
    it('returns an empty string for empty inputs', () => {
        expect(markdownToHtml('')).toBe('');
        expect(markdownToHtml(null)).toBe('');
        expect(markdownToHtml(undefined)).toBe('');
    });

    it('converts AI draft markdown into sanitized rich HTML', () => {
        const markdown = [
            '## 📌 Sorun Yorumu',
            'Bu bir **lisans ödünç alma** işlemidir.',
            '',
            '## 🛠️ Çözüm Adımları',
            '- Allmenu açın',
            '- License settings ekranına girin',
            '',
            '### Doğrulama',
            '1. Lisans görünüyor mu?',
            '2. Allplan açılıyor mu?',
        ].join('\n');

        expect(markdownToHtml(markdown)).toBe(
            '<h2>📌 Sorun Yorumu</h2><p>Bu bir <strong>lisans ödünç alma</strong> işlemidir.</p><h2>🛠️ Çözüm Adımları</h2><ul><li>Allmenu açın</li><li>License settings ekranına girin</li></ul><h3>Doğrulama</h3><ol><li>Lisans görünüyor mu?</li><li>Allplan açılıyor mu?</li></ol>',
        );
    });

    it('produces sanitizer-idempotent output', () => {
        const html = markdownToHtml('## Title\n<script>alert(1)</script>\n\n**safe**');

        expect(ContentSanitizer.sanitize(html)).toBe(html);
        expect(html).not.toContain('<script>');
    });
});


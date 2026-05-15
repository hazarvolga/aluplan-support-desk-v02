import { describe, expect, it } from 'vitest';
import { ContentSanitizer } from './content-sanitizer';

describe('ContentSanitizer', () => {
    it('returns an empty string for empty inputs', () => {
        expect(ContentSanitizer.sanitize('')).toBe('');
        expect(ContentSanitizer.sanitize(null)).toBe('');
        expect(ContentSanitizer.sanitize(undefined)).toBe('');
    });

    it('keeps allowed rich text tags and removes dangerous tags and attributes', () => {
        const html = '<p onclick="alert(1)"><strong>Hello</strong><script>alert(1)</script><em>world</em></p>';

        expect(ContentSanitizer.sanitize(html)).toBe('<p><strong>Hello</strong><em>world</em></p>');
    });

    it('removes javascript hrefs and adds rel for target links', () => {
        const html = '<a href="javascript:alert(1)" target="_blank">bad</a><a href="https://example.com" target="_blank">ok</a>';

        expect(ContentSanitizer.sanitize(html)).toBe('<a target="_blank" rel="noopener noreferrer">bad</a><a href="https://example.com" target="_blank" rel="noopener noreferrer">ok</a>');
    });

    it('detects effectively empty editor output', () => {
        expect(ContentSanitizer.isEffectivelyEmpty('<p></p>')).toBe(true);
        expect(ContentSanitizer.isEffectivelyEmpty('<p><br></p>')).toBe(true);
        expect(ContentSanitizer.isEffectivelyEmpty('<p>Merhaba</p>')).toBe(false);
    });
});


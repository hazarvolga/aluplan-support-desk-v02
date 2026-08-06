import { canonicalizeKnowledgeSourceUrl } from './knowledge-source-url';

describe('canonicalizeKnowledgeSourceUrl', () => {
    it.each([
        [' HTTPS://Example.COM:443/docs#install ', 'https://example.com/docs'],
        ['https://example.com/docs/', 'https://example.com/docs'],
        ['https://example.com/?utm_source=newsletter&id=42&fbclid=ignored', 'https://example.com/?id=42'],
        ['https://example.com/docs?b=2&a=1', 'https://example.com/docs?a=1&b=2'],
    ])('canonicalizes %s', (input, expected) => {
        expect(canonicalizeKnowledgeSourceUrl(input)).toBe(expected);
    });

    it('preserves meaningful protocol, path and query distinctions', () => {
        expect(canonicalizeKnowledgeSourceUrl('http://example.com/docs?id=1'))
            .not.toBe(canonicalizeKnowledgeSourceUrl('https://example.com/docs?id=1'));
        expect(canonicalizeKnowledgeSourceUrl('https://example.com/Docs?id=1'))
            .not.toBe(canonicalizeKnowledgeSourceUrl('https://example.com/docs?id=1'));
        expect(canonicalizeKnowledgeSourceUrl('https://example.com/docs?id=1'))
            .not.toBe(canonicalizeKnowledgeSourceUrl('https://example.com/docs?id=2'));
    });

    it('is idempotent', () => {
        const once = canonicalizeKnowledgeSourceUrl('https://EXAMPLE.com/docs/?b=2&utm_medium=email&a=1#part');
        expect(canonicalizeKnowledgeSourceUrl(once)).toBe(once);
    });

    it.each([
        'ftp://example.com/file',
        'https://user:secret@example.com/private',
        'not a url',
    ])('rejects unsafe or unsupported URL %s', (input) => {
        expect(() => canonicalizeKnowledgeSourceUrl(input)).toThrow('INVALID_KNOWLEDGE_SOURCE_URL');
    });
});

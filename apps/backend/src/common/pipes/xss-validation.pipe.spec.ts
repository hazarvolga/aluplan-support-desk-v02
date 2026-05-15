import { XssValidationPipe } from './xss-validation.pipe';

describe('XssValidationPipe', () => {
    const pipe = new XssValidationPipe();
    const metadata = { type: 'body' as const, metatype: undefined, data: undefined };

    it('strips all HTML from regular string fields', () => {
        const result = pipe.transform({ subject: '<strong>Hello</strong><script>alert(1)</script>' }, metadata);

        expect(result).toEqual({ subject: 'Hello' });
    });

    it('keeps only allowed rich text tags for HTML ticket messages', () => {
        const result = pipe.transform({
            contentFormat: 'HTML',
            message: '<p onclick="alert(1)">Hello <strong>team</strong><script>alert(1)</script></p>',
        }, metadata);

        expect(result).toEqual({
            contentFormat: 'HTML',
            message: '<p>Hello <strong>team</strong></p>',
        });
    });

    it('removes javascript hrefs from rich text links', () => {
        const result = pipe.transform({
            contentFormat: 'HTML',
            message: '<a href="javascript:alert(1)" target="_blank">bad</a>',
        }, metadata);

        expect(result.message).toBe('<a target="_blank" rel="noopener noreferrer">bad</a>');
    });
});


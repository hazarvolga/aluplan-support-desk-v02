import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RichTextRenderer } from './rich-text-renderer';

describe('RichTextRenderer', () => {
    it('renders nothing for empty content', () => {
        const { container } = render(<RichTextRenderer content="" />);

        expect(container).toBeEmptyDOMElement();
    });

    it('wraps plain text safely', () => {
        render(<RichTextRenderer content="Plain message" />);

        expect(screen.getByText('Plain message').tagName).toBe('P');
    });

    it('renders sanitized rich HTML', () => {
        render(<RichTextRenderer content={'<p>Hello <strong>team</strong><script>alert(1)</script></p>'} />);

        expect(screen.getByText('team').tagName).toBe('STRONG');
        expect(document.querySelector('script')).toBeNull();
    });
});


import { act, render, screen } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { RichTextRenderer } from './rich-text-renderer';
import { AiAnswerContent } from '@/components/ai/ai-answer-content';

describe('RichTextRenderer', () => {
    const renderOnServer = (content: string | null | undefined) => {
        vi.stubGlobal('window', undefined);
        try {
            return renderToString(<RichTextRenderer content={content} />);
        } finally {
            vi.unstubAllGlobals();
        }
    };

    it('omits hostile content until browser sanitization is available', () => {
        const content = '<p onclick="alert(1)">Merhaba <strong>ekip</strong><script>alert(1)</script><img src=x onerror="alert(1)"><a href="javascript:alert(1)">link</a></p>';
        const container = document.createElement('div');
        container.innerHTML = renderOnServer(content);

        expect(container).toBeEmptyDOMElement();
        expect(container.querySelector('script, img, a, strong, [onclick], [onerror]')).toBeNull();
    });

    it('hydrates AI markdown despite sanitization being unavailable on the server', async () => {
        const content = '**Merhaba** <script>alert(1)</script>';
        const container = document.createElement('div');
        vi.stubGlobal('window', undefined);
        try {
            container.innerHTML = renderToString(<AiAnswerContent content={content} />);
        } finally {
            vi.unstubAllGlobals();
        }
        expect(container).toBeEmptyDOMElement();
        document.body.append(container);
        const onRecoverableError = vi.fn();
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        let root: Root | undefined;
        try {
            await act(async () => {
                root = hydrateRoot(container, <AiAnswerContent content={content} />, { onRecoverableError });
            });
            expect(onRecoverableError).not.toHaveBeenCalled();
            expect(consoleError).not.toHaveBeenCalled();
            expect(container.querySelector('strong')?.textContent).toBe('Merhaba');
            expect(container.querySelector('script')).toBeNull();
        } finally {
            if (root) await act(async () => root?.unmount());
            consoleError.mockRestore();
            container.remove();
        }
    });

    it.each(['', null, undefined])('renders empty server input %s as nothing', (content) => {
        expect(renderOnServer(content)).toBe('');
    });

    it.each([
        'Legacy: Türkçe emoji 👋 <unknown>literal</unknown>',
        '<p onclick="alert(1)">Merhaba <strong>ekip</strong><script>alert(1)</script><a href="javascript:alert(1)" target="_blank">link</a></p>',
        '',
    ])('hydrates without mismatches and preserves safe content: %s', async (content) => {
        const container = document.createElement('div');
        container.innerHTML = renderOnServer(content);
        document.body.append(container);
        const onRecoverableError = vi.fn();
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        let root: Root | undefined;

        try {
            await act(async () => {
                root = hydrateRoot(container, <RichTextRenderer content={content} />, { onRecoverableError });
            });

            expect(onRecoverableError).not.toHaveBeenCalled();
            expect(consoleError).not.toHaveBeenCalled();
            expect(container.querySelector('script, [onclick], [onerror], [href^="javascript:"]')).toBeNull();
            if (content.startsWith('<p')) {
                expect(container.querySelector('strong')?.textContent).toBe('ekip');
                expect(container.querySelector('a')?.getAttribute('rel')).toBe('noopener noreferrer');
            } else if (content) {
                expect(container.textContent).toBe('Legacy: Türkçe emoji 👋 literal');
            } else {
                expect(container).toBeEmptyDOMElement();
            }
        } finally {
            if (root) await act(async () => root?.unmount());
            consoleError.mockRestore();
            container.remove();
        }
    });

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

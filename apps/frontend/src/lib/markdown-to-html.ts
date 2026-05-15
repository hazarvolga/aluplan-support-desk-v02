import { ContentSanitizer } from './content-sanitizer';

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const inlineMarkdown = (value: string) => {
    return escapeHtml(value)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
};

export function markdownToHtml(markdown: string | null | undefined): string {
    if (!markdown) return '';

    const lines = markdown.replace(/\r\n/g, '\n').split('\n');
    const blocks: string[] = [];
    let paragraph: string[] = [];
    let list: { type: 'ul' | 'ol'; items: string[] } | null = null;

    const flushParagraph = () => {
        if (paragraph.length === 0) return;
        blocks.push(`<p>${paragraph.map(inlineMarkdown).join('<br>')}</p>`);
        paragraph = [];
    };

    const flushList = () => {
        if (!list) return;
        blocks.push(`<${list.type}>${list.items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</${list.type}>`);
        list = null;
    };

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            flushParagraph();
            flushList();
            continue;
        }

        const h3 = trimmed.match(/^###\s+(.+)$/);
        if (h3) {
            flushParagraph();
            flushList();
            blocks.push(`<h3>${inlineMarkdown(h3[1])}</h3>`);
            continue;
        }

        const h2 = trimmed.match(/^##\s+(.+)$/);
        if (h2) {
            flushParagraph();
            flushList();
            blocks.push(`<h2>${inlineMarkdown(h2[1])}</h2>`);
            continue;
        }

        const unordered = trimmed.match(/^[-*]\s+(.+)$/);
        if (unordered) {
            flushParagraph();
            if (!list || list.type !== 'ul') {
                flushList();
                list = { type: 'ul', items: [] };
            }
            list.items.push(unordered[1]);
            continue;
        }

        const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
        if (ordered) {
            flushParagraph();
            if (!list || list.type !== 'ol') {
                flushList();
                list = { type: 'ol', items: [] };
            }
            list.items.push(ordered[1]);
            continue;
        }

        flushList();
        paragraph.push(trimmed);
    }

    flushParagraph();
    flushList();

    return ContentSanitizer.sanitize(blocks.join(''));
}


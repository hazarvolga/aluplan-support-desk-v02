const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'a', 'blockquote', 'code', 'pre'];
const EMPTY_PATTERN = /^(<p>(<br\s*\/?>)?<\/p>|<br\s*\/?>|\s)*$/i;

const escapeAttribute = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

const stripDangerousBlocks = (input: string) =>
    input
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<(script|iframe|object|embed|form|input)\b[\s\S]*?<\/\1>/gi, '')
        .replace(/<(script|iframe|object|embed|form|input)\b[^>]*\/?>/gi, '');

export const stripHtml = (input: string): string => {
    return stripDangerousBlocks(input).replace(/<[^>]*>/g, '');
};

export const sanitizeRichTextHtml = (input: string | null | undefined): string => {
    if (!input) return '';

    return stripDangerousBlocks(input).replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (raw, tagName: string, attrs: string) => {
        const tag = tagName.toLowerCase();
        if (!ALLOWED_TAGS.includes(tag)) return '';

        if (raw.startsWith('</')) {
            return tag === 'br' ? '' : `</${tag}>`;
        }

        if (tag !== 'a') {
            return tag === 'br' ? '<br>' : `<${tag}>`;
        }

        const hrefMatch = attrs.match(/\shref\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/i);
        const targetMatch = attrs.match(/\starget\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/i);
        const href = hrefMatch?.[2] ?? hrefMatch?.[3] ?? hrefMatch?.[4] ?? '';
        const target = targetMatch?.[2] ?? targetMatch?.[3] ?? targetMatch?.[4] ?? '';
        const safeAttrs: string[] = [];

        if (href && !href.trim().toLowerCase().startsWith('javascript:')) {
            safeAttrs.push(`href="${escapeAttribute(href)}"`);
        }

        if (target) {
            safeAttrs.push(`target="${escapeAttribute(target)}"`);
            safeAttrs.push('rel="noopener noreferrer"');
        }

        return safeAttrs.length ? `<a ${safeAttrs.join(' ')}>` : '<a>';
    });
};

export const isRichTextEffectivelyEmpty = (input: string | null | undefined): boolean => {
    const clean = sanitizeRichTextHtml(input).replace(/&nbsp;/g, ' ').trim();
    if (!clean) return true;
    if (EMPTY_PATTERN.test(clean)) return true;

    const textOnly = clean
        .replace(/<br\s*\/?>/gi, '')
        .replace(/<\/?(p|strong|em|ul|ol|li|h2|h3|blockquote|code|pre|a)(\s[^>]*)?>/gi, '')
        .replace(/&nbsp;/g, ' ')
        .trim();

    return textOnly.length === 0;
};

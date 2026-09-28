import DOMPurify from 'dompurify';

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'a', 'blockquote', 'code', 'pre'];
const ALLOWED_ATTR = ['href', 'target', 'rel'];
const HTML_TAG_PATTERN = /<(p|br|strong|em|ul|ol|li|h2|h3|a|blockquote|code|pre)\b/i;
const EMPTY_PATTERN = /^(<p>(<br\s*\/?>)?<\/p>|<br\s*\/?>|\s)*$/i;

let hookRegistered = false;

const ensureHooks = () => {
    if (hookRegistered) return;
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        if (node.nodeName !== 'A') return;

        const href = node.getAttribute('href');
        if (href && href.trim().toLowerCase().startsWith('javascript:')) {
            node.removeAttribute('href');
        }

        if (node.getAttribute('target')) {
            node.setAttribute('rel', 'noopener noreferrer');
        }
    });
    hookRegistered = true;
};

const sanitize = (input: string | null | undefined): string => {
    if (!input) return '';
    // HTML is only safe to return after the browser sanitizer has processed it.
    if (typeof window === 'undefined') return '';

    ensureHooks();
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
        FORBID_ATTR: ['style'],
    });
};

const isEffectivelyEmpty = (html: string | null | undefined): boolean => {
    const clean = sanitize(html).replace(/&nbsp;/g, ' ').trim();
    if (!clean) return true;
    if (EMPTY_PATTERN.test(clean)) return true;

    const textOnly = clean
        .replace(/<br\s*\/?>/gi, '')
        .replace(/<\/?(p|strong|em|ul|ol|li|h2|h3|blockquote|code|pre|a)(\s[^>]*)?>/gi, '')
        .replace(/&nbsp;/g, ' ')
        .trim();

    return textOnly.length === 0;
};

const containsAllowedHtml = (content: string | null | undefined): boolean => {
    return Boolean(content && HTML_TAG_PATTERN.test(content));
};

export const ContentSanitizer = {
    sanitize,
    isEffectivelyEmpty,
    containsAllowedHtml,
};

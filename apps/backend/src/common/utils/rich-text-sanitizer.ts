import * as cheerio from 'cheerio';

const ALLOWED_TAGS = new Set(['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'a', 'blockquote', 'code', 'pre']);
const DANGEROUS_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'select', 'textarea', 'meta', 'link']);
const EMPTY_PATTERN = /^(<p>(<br\s*\/?>)?<\/p>|<br\s*\/?>|\s)*$/i;

export const stripHtml = (input: string | null | undefined): string => {
    if (!input) return '';
    const $ = cheerio.load(input, null, false);
    // Remove all script and other dangerous blocks completely along with their text contents
    $('script, style, iframe, object, embed, form, input, button, select, textarea, meta, link').remove();
    return $.text() || '';
};

export const sanitizeRichTextHtml = (input: string | null | undefined): string => {
    if (!input) return '';

    const $ = cheerio.load(input, null, false);

    // We traverse all elements to strip/whitelist tags and attributes
    $('*').each((_, elemNode) => {
        const elem = elemNode as any;
        if (!elem || !elem.tagName) {
            return;
        }
        const tagName = elem.tagName.toLowerCase();

        if (DANGEROUS_TAGS.has(tagName)) {
            $(elem).remove();
            return;
        }

        if (!ALLOWED_TAGS.has(tagName)) {
            // Replace the element tag wrapper with its children/contents to preserve rich text contents
            $(elem).replaceWith($(elem).contents());
            return;
        }

        // Clean attributes for allowed tags
        const attribs = elem.attribs || {};
        const keys = Object.keys(attribs);
        for (const key of keys) {
            const attrName = key.toLowerCase();

            if (attrName === 'href' && tagName === 'a') {
                const val = (attribs[key] || '').trim().toLowerCase();
                if (val.startsWith('javascript:') || val.startsWith('data:') || val.startsWith('vbscript:')) {
                    $(elem).removeAttr(key);
                }
            } else if (attrName === 'target' && tagName === 'a') {
                const targetVal = attribs[key];
                if (targetVal === '_blank') {
                    $(elem).attr('rel', 'noopener noreferrer');
                }
            } else if (attrName === 'rel' && tagName === 'a') {
                // Keep allowed rel attribute
            } else {
                // Strip all other unsafe attributes (events, class, style, id, etc.)
                $(elem).removeAttr(key);
            }
        }
    });

    return $.html() || '';
};

export const isRichTextEffectivelyEmpty = (input: string | null | undefined): boolean => {
    const clean = sanitizeRichTextHtml(input).replace(/&nbsp;/g, ' ').trim();
    if (!clean) return true;
    if (EMPTY_PATTERN.test(clean)) return true;

    const textOnly = stripHtml(clean).replace(/&nbsp;/g, ' ').trim();
    return textOnly.length === 0;
};

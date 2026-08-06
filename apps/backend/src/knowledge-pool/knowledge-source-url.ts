const TRACKING_PARAMETER_PATTERNS = [
    /^utm_/i,
    /^fbclid$/i,
    /^gclid$/i,
    /^mc_/i,
];

export const INVALID_KNOWLEDGE_SOURCE_URL = 'INVALID_KNOWLEDGE_SOURCE_URL';

export function canonicalizeKnowledgeSourceUrl(value: string): string {
    try {
        const url = new URL(value.trim());

        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
            throw new Error(INVALID_KNOWLEDGE_SOURCE_URL);
        }

        url.hash = '';
        for (const key of [...url.searchParams.keys()]) {
            if (TRACKING_PARAMETER_PATTERNS.some((pattern) => pattern.test(key))) {
                url.searchParams.delete(key);
            }
        }
        url.searchParams.sort();

        if (url.pathname.length > 1) {
            url.pathname = url.pathname.replace(/\/+$/, '');
        }

        return url.toString();
    } catch (error) {
        if (error instanceof Error && error.message === INVALID_KNOWLEDGE_SOURCE_URL) {
            throw error;
        }
        throw new Error(INVALID_KNOWLEDGE_SOURCE_URL);
    }
}

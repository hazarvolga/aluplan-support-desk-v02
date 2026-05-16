export interface PublicUrlOptions {
    apiBaseUrl?: string | null;
    frontendUrl?: string | null;
    nodeEnv?: string;
    warn?: (message: string) => void;
}

function trimTrailingSlash(value: string): string {
    return value.endsWith('/') ? value.slice(0, -1) : value;
}

function ensureLeadingSlash(value: string): string {
    return value.startsWith('/') ? value : `/${value}`;
}

export function joinPublicUrl(baseUrl: string | null | undefined, path: string): string {
    if (!baseUrl) return path;

    const cleanPath = ensureLeadingSlash(path);
    const cleanBase = trimTrailingSlash(baseUrl);

    try {
        const parsedBase = new URL(cleanBase);
        const basePath = trimTrailingSlash(parsedBase.pathname);

        if (basePath && cleanPath.startsWith(`${basePath}/`)) {
            return `${parsedBase.origin}${cleanPath}`;
        }

        return `${cleanBase}${cleanPath}`;
    } catch {
        return `${cleanBase}${cleanPath}`;
    }
}

export function isUnsafePublicEmailUrl(value: string): boolean {
    try {
        const parsed = new URL(value);
        return parsed.protocol !== 'https:' || ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
    } catch {
        return true;
    }
}

export function normalizeEmailLogoUrl(rawUrl: string | null | undefined, options: PublicUrlOptions = {}): string {
    const value = rawUrl?.trim();
    if (!value) return '';

    const apiBaseUrl = options.apiBaseUrl || (options.nodeEnv === 'production' ? 'https://api.allplan.net.tr/api/v1' : 'http://localhost:4000/api/v1');
    const frontendUrl = options.frontendUrl || 'https://help.aluplan.com';

    let normalized = value;
    if (!/^https?:\/\//i.test(value)) {
        const path = ensureLeadingSlash(value);
        const isApiAsset = path.startsWith('/api/') || path.startsWith('/branding/assets');
        normalized = joinPublicUrl(isApiAsset ? apiBaseUrl : frontendUrl, path);
    }

    if (options.nodeEnv === 'production' && isUnsafePublicEmailUrl(normalized)) {
        options.warn?.(`[EMAIL-BRANDING] Logo URL is not email-safe in production: ${normalized}`);
    }

    return normalized;
}

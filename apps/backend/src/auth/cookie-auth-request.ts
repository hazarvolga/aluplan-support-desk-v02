export function isTrustedCookieAuthRequest(
    origin: string | undefined,
    requestedWith: string | undefined,
    allowedOrigins: readonly string[],
): boolean {
    return requestedWith === 'XMLHttpRequest'
        && typeof origin === 'string'
        && allowedOrigins.includes(origin);
}

export function isCookieAuthRequestAllowed(
    hasAuthCookie: boolean,
    origin: string | undefined,
    requestedWith: string | undefined,
    allowedOrigins: readonly string[],
): boolean {
    return !hasAuthCookie
        || isTrustedCookieAuthRequest(origin, requestedWith, allowedOrigins);
}

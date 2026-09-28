export function extractAccessTokenFromSetCookie(setCookie: string | undefined | null): string {
    const token = setCookie?.match(/(?:^|[,;]\s*)alu_at=([^;,]+)/)?.[1];
    if (!token) {
        throw new Error('Login response did not set the alu_at HttpOnly cookie');
    }
    return decodeURIComponent(token);
}

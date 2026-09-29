import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_VERSION = 'v1';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const signatureFor = (ticketId: string, expiresAt: number, secret: string): Buffer =>
    createHmac('sha256', secret)
        .update(`${TOKEN_VERSION}.${ticketId}.${expiresAt}`)
        .digest();

export const generateCsatFeedbackToken = (ticketId: string, expiresAt: number, secret: string): string => {
    if (!UUID_PATTERN.test(ticketId) || !Number.isSafeInteger(expiresAt) || !secret) {
        throw new Error('Invalid CSAT feedback token input');
    }

    const signature = signatureFor(ticketId, expiresAt, secret).toString('base64url');
    return `${TOKEN_VERSION}.${ticketId}.${expiresAt}.${signature}`;
};

export const verifyCsatFeedbackToken = (
    token: string,
    secret: string,
    now = Math.floor(Date.now() / 1000),
): string | null => {
    if (!secret || !Number.isSafeInteger(now)) return null;

    const [version, ticketId, rawExpiry, rawSignature, ...rest] = token.split('.');
    if (rest.length || version !== TOKEN_VERSION || !UUID_PATTERN.test(ticketId ?? '') || !/^\d+$/.test(rawExpiry ?? '')) {
        return null;
    }

    const expiresAt = Number(rawExpiry);
    if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return null;

    const expected = signatureFor(ticketId, expiresAt, secret);
    let supplied: Buffer;
    try {
        supplied = Buffer.from(rawSignature, 'base64url');
    } catch {
        return null;
    }

    return supplied.length === expected.length && timingSafeEqual(supplied, expected) ? ticketId : null;
};

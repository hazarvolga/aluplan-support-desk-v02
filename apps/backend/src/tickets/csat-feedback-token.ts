import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_VERSION = 'v1';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const signatureFor = (ticketId: string, expiresAt: number, secret: string, resolutionEpoch?: number): Buffer =>
    createHmac('sha256', secret)
        .update(resolutionEpoch === undefined ? `${TOKEN_VERSION}.${ticketId}.${expiresAt}` : `v2.${ticketId}.${expiresAt}.${resolutionEpoch}`)
        .digest();

export const generateCsatFeedbackToken = (ticketId: string, expiresAt: number, secret: string, resolutionEpoch?: number): string => {
    if (!UUID_PATTERN.test(ticketId) || !Number.isSafeInteger(expiresAt) || !secret
        || (resolutionEpoch !== undefined && (!Number.isSafeInteger(resolutionEpoch) || resolutionEpoch < 0))) {
        throw new Error('Invalid CSAT feedback token input');
    }

    const signature = signatureFor(ticketId, expiresAt, secret, resolutionEpoch).toString('base64url');
    return resolutionEpoch === undefined ? `${TOKEN_VERSION}.${ticketId}.${expiresAt}.${signature}`
        : `v2.${ticketId}.${expiresAt}.${resolutionEpoch}.${signature}`;
};

export const verifyCsatFeedbackScope = (
    token: string,
    secret: string,
    now = Math.floor(Date.now() / 1000),
): { ticketId: string; resolutionEpoch?: number } | null => {
    if (!secret || !Number.isSafeInteger(now)) return null;

    const parts = token.split('.');
    const [version, ticketId, rawExpiry] = parts;
    const resolutionEpoch = version === 'v2' ? Number(parts[3]) : undefined;
    const rawSignature = parts[version === 'v2' ? 4 : 3];
    if (parts.length !== (version === 'v2' ? 5 : 4) || !['v1', 'v2'].includes(version)
        || (version === 'v2' && (!/^\d+$/.test(parts[3] ?? '') || !Number.isSafeInteger(resolutionEpoch)))
        || !UUID_PATTERN.test(ticketId ?? '') || !/^\d+$/.test(rawExpiry ?? '')) {
        return null;
    }

    const expiresAt = Number(rawExpiry);
    if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return null;

    const expected = signatureFor(ticketId, expiresAt, secret, resolutionEpoch);
    let supplied: Buffer;
    try {
        supplied = Buffer.from(rawSignature, 'base64url');
    } catch {
        return null;
    }

    return supplied.length === expected.length && timingSafeEqual(supplied, expected) ? { ticketId, resolutionEpoch } : null;
};

export const verifyCsatFeedbackToken = (token: string, secret: string, now = Math.floor(Date.now() / 1000)): string | null =>
    verifyCsatFeedbackScope(token, secret, now)?.ticketId ?? null;

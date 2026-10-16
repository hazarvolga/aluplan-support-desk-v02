import { jwtVerify } from 'jose/jwt/verify';

const SESSION_MARKER_ISSUER = 'aluplan-support';
const SESSION_MARKER_AUDIENCE = 'aluplan:session-marker';

export const verifySessionMarker = async (
    token: string | undefined,
    secret: string | undefined,
): Promise<boolean> => {
    if (!token || !secret || secret.length < 32) return false;

    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
            algorithms: ['HS256'],
            issuer: SESSION_MARKER_ISSUER,
            audience: SESSION_MARKER_AUDIENCE,
        });
        return payload.purpose === 'session-marker';
    } catch {
        return false;
    }
};

export const SESSION_MARKER_JWT = {
    issuer: SESSION_MARKER_ISSUER,
    audience: SESSION_MARKER_AUDIENCE,
} as const;

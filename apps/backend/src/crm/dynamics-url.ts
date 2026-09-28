const DYNAMICS_HOST_SUFFIX = '.dynamics.com';

function parseTrustedDynamicsUrl(rawUrl: string): URL {
    let parsed: URL;
    try {
        parsed = new URL(rawUrl);
    } catch {
        throw new Error('Invalid Dynamics 365 URL');
    }

    const hostname = parsed.hostname.toLowerCase();
    if (
        parsed.protocol !== 'https:'
        || parsed.username
        || parsed.password
        || (parsed.port && parsed.port !== '443')
        || !hostname.endsWith(DYNAMICS_HOST_SUFFIX)
        || hostname === DYNAMICS_HOST_SUFFIX.slice(1)
    ) {
        throw new Error('Untrusted Dynamics 365 URL');
    }

    return parsed;
}

export function normalizeDynamicsInstanceUrl(rawUrl: string): string {
    const parsed = parseTrustedDynamicsUrl(rawUrl);
    if ((parsed.pathname && parsed.pathname !== '/') || parsed.search || parsed.hash) {
        throw new Error('Dynamics 365 instance URL must contain only the trusted origin');
    }
    return parsed.origin;
}

export function assertSameDynamicsOrigin(candidateUrl: string, instanceOrigin: string): string {
    const candidate = parseTrustedDynamicsUrl(candidateUrl);
    const trustedOrigin = normalizeDynamicsInstanceUrl(instanceOrigin);
    if (candidate.origin !== trustedOrigin) {
        throw new Error('Dynamics 365 continuation URL changed origin');
    }
    return candidate.toString();
}

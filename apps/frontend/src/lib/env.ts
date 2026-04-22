/**
 * Frontend Environment Variable Validation (GAP-19)
 *
 * Validates required environment variables at build time.
 * Import this file in layout.tsx or instrumentation.ts to ensure
 * the application fails fast with clear error messages.
 */

function getRequiredEnvVar(name: string, fallback?: string): string {
    const value = process.env[name] ?? fallback;
    if (!value) {
        throw new Error(
            `[ENV] Missing required environment variable: ${name}. ` +
            `Please set it in .env.local or your deployment environment.`
        );
    }
    return value;
}

function getOptionalEnvVar(name: string, fallback: string = ''): string {
    return process.env[name] ?? fallback;
}

/** Validated environment configuration */
export const env = {
    /** Backend API base URL */
    apiUrl: getRequiredEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:4000/api/v1'),

    /** WebSocket endpoint URL (derived from API URL if not set) */
    wsUrl: getOptionalEnvVar('NEXT_PUBLIC_WS_URL'),

    /** Sentry DSN for error tracking (optional in development) */
    sentryDsn: getOptionalEnvVar('NEXT_PUBLIC_SENTRY_DSN'),

    /** Current environment */
    nodeEnv: getOptionalEnvVar('NODE_ENV', 'development'),

    /** Is production environment */
    isProduction: process.env.NODE_ENV === 'production',
} as const;

export type Env = typeof env;

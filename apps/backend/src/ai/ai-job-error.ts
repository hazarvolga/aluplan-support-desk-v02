export const SAFE_AI_QUERY_FAILURE = Object.freeze({
    code: 'AI_QUERY_FAILED' as const,
    message: 'AI query processing failed' as const,
});

export type SafeAiQueryJobError = Error & {
    readonly code: typeof SAFE_AI_QUERY_FAILURE.code;
};

export function createSafeAiQueryFailure(): typeof SAFE_AI_QUERY_FAILURE {
    return { ...SAFE_AI_QUERY_FAILURE };
}

export function createSafeAiQueryJobError(): SafeAiQueryJobError {
    const error = new Error(SAFE_AI_QUERY_FAILURE.message) as SafeAiQueryJobError;
    Object.defineProperties(error, {
        name: {
            configurable: false,
            enumerable: false,
            value: 'AiQueryJobError',
            writable: false,
        },
        code: {
            configurable: false,
            enumerable: true,
            value: SAFE_AI_QUERY_FAILURE.code,
            writable: false,
        },
    });
    return error;
}

export function getSafeThrownType(value: unknown): string {
    if (value === null) {
        return 'null';
    }

    try {
        if (value instanceof TypeError) {
            return 'TypeError';
        }
        if (value instanceof RangeError) {
            return 'RangeError';
        }
        if (value instanceof Error) {
            return 'Error';
        }
    } catch {
        return 'unknown';
    }

    return typeof value;
}

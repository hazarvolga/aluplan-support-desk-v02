import {
    createSafeAiQueryFailure,
    createSafeAiQueryJobError,
    getSafeThrownType,
    SAFE_AI_QUERY_FAILURE,
} from './ai-job-error';

describe('AI queue error sanitization', () => {
    it('creates a fresh stable failure payload', () => {
        const first = createSafeAiQueryFailure();
        const second = createSafeAiQueryFailure();

        expect(first).toEqual(SAFE_AI_QUERY_FAILURE);
        expect(first).not.toBe(second);
    });

    it('creates a fresh Error that contains only the stable queue failure contract', () => {
        const first = createSafeAiQueryJobError();
        const second = createSafeAiQueryJobError();

        expect(first).toBeInstanceOf(Error);
        expect(first).not.toBe(second);
        expect(first).toMatchObject({
            name: 'AiQueryJobError',
            code: SAFE_AI_QUERY_FAILURE.code,
            message: SAFE_AI_QUERY_FAILURE.message,
        });
        expect(first).not.toHaveProperty('cause');
        expect(first.stack).toContain(SAFE_AI_QUERY_FAILURE.message);
    });

    it.each([
        [new TypeError('private'), 'TypeError'],
        [new RangeError('private'), 'RangeError'],
        [new Error('private'), 'Error'],
        ['private', 'string'],
        [null, 'null'],
        [{ name: 'Bearer private-token' }, 'object'],
    ])('classifies thrown values without reading mutable name fields', (value, expected) => {
        expect(getSafeThrownType(value)).toBe(expected);
    });

    it('ignores a malicious Error name', () => {
        const error = new Error('provider failed');
        error.name = 'Bearer private-token';

        expect(getSafeThrownType(error)).toBe('Error');
    });
});

import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './settings-types';

describe('getErrorMessage', () => {
    it('returns the message from Error instances', () => {
        expect(getErrorMessage(new Error('request failed'))).toBe('request failed');
    });

    it('uses a safe fallback for non-Error values', () => {
        expect(getErrorMessage({ message: 'untrusted shape' })).toBe('Unknown error');
    });
});

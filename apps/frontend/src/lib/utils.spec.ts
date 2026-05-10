import { cn } from './utils';

describe('utils', () => {
    describe('cn', () => {
        it('merges class names', () => {
            const result = cn('foo', 'bar');
            expect(result).toBe('foo bar');
        });

        it('handles conditional classes', () => {
            const result = cn('foo', false && 'bar', true && 'baz');
            expect(result).toBe('foo baz');
        });

        it('handles undefined and null', () => {
            const result = cn('foo', undefined, null, 'bar');
            expect(result).toBe('foo bar');
        });

        it('handles arrays', () => {
            const result = cn(['foo', 'bar']);
            expect(result).toBe('foo bar');
        });

        it('handles objects with truthy values', () => {
            const result = cn({ foo: true, bar: false, baz: true });
            expect(result).toContain('foo');
            expect(result).toContain('baz');
            expect(result).not.toContain('bar');
        });
    });
});
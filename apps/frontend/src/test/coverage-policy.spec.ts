import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('frontend coverage policy', () => {
    it('counts every production TypeScript source file and only excludes non-production sources', () => {
        const configSource = readFileSync(resolve(process.cwd(), 'vitest.config.ts'), 'utf8');
        const coverageBlock = configSource.match(/coverage:\s*\{([\s\S]*?)thresholds:/)?.[1] ?? '';
        const includeBlock = coverageBlock.match(/include:\s*\[([^\]]*)\]/)?.[1] ?? '';
        const excludeBlock = coverageBlock.match(/exclude:\s*\[([^\]]*)\]/)?.[1] ?? '';
        const values = (source: string) => Array.from(source.matchAll(/'([^']+)'/g), (match) => match[1]);

        expect(values(includeBlock)).toEqual(['src/**/*.{ts,tsx}']);
        expect(values(excludeBlock)).toEqual([
            'src/**/*.{test,spec}.{ts,tsx}',
            'src/**/*.d.ts',
            'src/test/**',
        ]);
    });
});

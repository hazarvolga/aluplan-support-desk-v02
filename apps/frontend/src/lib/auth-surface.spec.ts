import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) => fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('frontend authentication surface', () => {
    it('does not expose MFA controls or API contracts before backend MFA exists', () => {
        const apiSource = readSource('src/lib/api.ts');
        const profileSource = readSource('src/app/[locale]/(dashboard)/profile/page.tsx');

        expect(apiSource).not.toContain('/auth/mfa/');
        expect(profileSource).not.toContain('api.auth.mfa');
        expect(profileSource).not.toContain('QRCodeSVG');
        expect(profileSource).not.toContain('mfaEnabled');
    });
});

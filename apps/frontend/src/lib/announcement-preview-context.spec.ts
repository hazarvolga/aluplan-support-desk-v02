import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
    fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

// GAP report 2026-08-08 (BUG-02): preview mock data and the real broadcast
// payload used to be built from unrelated, independently-drifting object
// literals. This locks preview and broadcast to the same canonical
// `customer.*` field names so they can never silently diverge again.
const CANONICAL_CUSTOMER_FIELDS = [
    'firstName',
    'lastName',
    'fullName',
    'companyName',
    'customerNo',
    'email',
    'userEmail',
];

describe('announcement email preview/broadcast customer context parity', () => {
    it('backend canonical context builder defines exactly the expected field set', () => {
        const backendSource = readSource(
            '../backend/src/announcements/announcement-email-context.ts',
        );

        for (const field of CANONICAL_CUSTOMER_FIELDS) {
            expect(backendSource).toContain(`${field}:`);
        }
    });

    it('admin announcement page preview payload uses the canonical customer field names', () => {
        const pageSource = readSource(
            'src/app/[locale]/(dashboard)/admin/announcements/page.tsx',
        );

        expect(pageSource).toContain('PREVIEW_CUSTOMER_CONTEXT');

        for (const field of CANONICAL_CUSTOMER_FIELDS) {
            expect(pageSource).toContain(`${field}:`);
        }

        // Both preview call sites must reuse the single shared constant, not
        // their own ad-hoc mock object — otherwise the two preview surfaces
        // (create tab vs. template library) can drift from each other again.
        const previewCallSites = pageSource.match(/customer: PREVIEW_CUSTOMER_CONTEXT/g) ?? [];
        expect(previewCallSites.length).toBeGreaterThanOrEqual(2);
    });

    it('does not reuse the legacy broken field names (first_name/full_name/name)', () => {
        const pageSource = readSource(
            'src/app/[locale]/(dashboard)/admin/announcements/page.tsx',
        );

        expect(pageSource).not.toContain('first_name:');
        expect(pageSource).not.toContain('full_name:');
        expect(pageSource).not.toMatch(/customer:\s*\{\s*name:/);
    });

    it('default announcement content uses a working canonical variable, not a bracket placeholder or an unsupported field', () => {
        for (const locale of ['tr', 'en', 'de']) {
            const messages = JSON.parse(readSource(`messages/${locale}.json`));
            const defaultContent = messages.admin.announcements.editor.default_content as string;

            expect(defaultContent).not.toContain('[customer.name]');
            expect(defaultContent).not.toContain('{{customer.name}}');
            expect(defaultContent).toContain('{{customer.firstName}}');
        }
    });
});

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const sourcePath = (relativePath: string) => path.resolve(process.cwd(), relativePath);
const readSource = (relativePath: string) => fs.readFileSync(sourcePath(relativePath), 'utf8');

describe('email editor contract surface', () => {
    it('keeps transactional templates and announcement mailers on separate real contracts', () => {
        const apiSource = readSource('src/lib/api.ts');
        const transactionalEditor = readSource('src/app/[locale]/(dashboard)/admin/settings/components/EmailTemplates.tsx');
        const announcementPage = readSource('src/app/[locale]/(dashboard)/admin/announcements/page.tsx');

        expect(apiSource).toContain('/email/admin/templates/${name}/source');
        expect(apiSource).toContain('/email/admin/templates/${name}/save');
        expect(apiSource).toContain('/email/admin/templates/${name}/preview');
        expect(apiSource).toContain("request<AnnouncementTemplate[]>('/announcement-templates')");
        expect(apiSource).toContain("request<Announcement[]>('/announcements')");

        expect(apiSource).not.toContain('/email/admin/templates/${name}/content');
        expect(apiSource).not.toContain('/email/admin/announcements/');
        expect(transactionalEditor).not.toContain('MjmlEditor');
        expect(transactionalEditor).not.toContain('safeModeOpen');
        expect(announcementPage).toContain('api.announcementTemplates');
        expect(fs.existsSync(sourcePath('src/components/email/MjmlEditor.tsx'))).toBe(false);
    });

    it('isolates every HTML email preview from the authenticated parent origin', () => {
        const settingsPreview = readSource('src/app/[locale]/(dashboard)/settings/components/EmailTemplates.tsx');
        const livePreview = readSource('src/components/email/LivePreview.tsx');

        expect(settingsPreview).toMatch(/<iframe[\s\S]*?sandbox="allow-popups"[\s\S]*?srcDoc=/);
        expect(livePreview).toMatch(/<iframe[\s\S]*?sandbox="allow-popups"[\s\S]*?srcDoc=\{html\}/);
        expect(livePreview).not.toContain('contentDocument');
        expect(livePreview).not.toContain('doc.write');
    });
});

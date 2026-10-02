import { classifyDatasetFile } from './dataset-classifier';

describe('classifyDatasetFile', () => {
    it('classifies Turkish license PDFs as Turkish license support content', () => {
        const result = classifyDatasetFile('/repo/dataset/tr/license-activation/SSS_Allplan Lisansının Kayıtlandırma İşlemi.pdf');

        expect(result).toEqual(expect.objectContaining({
            language: 'tr',
            category: 'License & Activation',
            categorySlug: 'license-activation',
            sourceClass: 'support',
            canonicalSource: 'pdf',
        }));
    });

    it('classifies English real-time scanner FAQs as performance and hardware content', () => {
        const result = classifyDatasetFile('/repo/dataset/en/performance-hardware/faq-technical-FAQ-EN-Real-time-scanner-blocks-Allplan-data.pdf');

        expect(result).toEqual(expect.objectContaining({
            language: 'en',
            category: 'Performance & Hardware',
            categorySlug: 'performance-hardware',
            sourceClass: 'support',
        }));
    });

    it('classifies German graphics driver FAQs as performance and hardware content', () => {
        const result = classifyDatasetFile('/repo/dataset/de/performance-hardware/FAQ_DE_Grafikkartentreiber_aktualisieren.pdf');

        expect(result).toEqual(expect.objectContaining({
            language: 'de',
            category: 'Performance & Hardware',
            categorySlug: 'performance-hardware',
            sourceClass: 'support',
        }));
    });

    it('keeps marketing and case-study PDFs in the review backlog', () => {
        const result = classifyDatasetFile('/repo/.archive/rag-incoming/pdf/Allplan_Precast_Case_Study_Karpatium_Rezidence_en.pdf');

        expect(result).toEqual(expect.objectContaining({
            language: 'en',
            category: 'Review Backlog',
            categorySlug: 'review-backlog',
            sourceClass: 'review',
        }));
    });

    it('keeps step-by-step tutorial PDFs out of the support-first ready set', () => {
        const result = classifyDatasetFile('/repo/.archive/rag-incoming/pdf/Allplan_2020_SbS_UrbanPlanning-cqifulo2d2d.pdf');

        expect(result).toEqual(expect.objectContaining({
            category: 'Manuals & Tutorials',
            categorySlug: 'manuals-tutorials',
            sourceClass: 'manual',
        }));
    });

    it('uses the explicit dataset path category before filename keywords', () => {
        const result = classifyDatasetFile('/repo/dataset/en/export-import-ifc-dwg/FAQ_EN_License_server_example_with_export_word.pdf');

        expect(result).toEqual(expect.objectContaining({
            language: 'en',
            category: 'Export Import & IFC DWG',
            categorySlug: 'export-import-ifc-dwg',
        }));
    });

    it('marks UI uploads with a dedicated import batch', () => {
        const result = classifyDatasetFile('knowledge-pool/FAQ_TR_Lisansı_yeni_bir_bilgisayara_veya_baska_bir_bilgisayara_aktarma.pdf');

        expect(result).toEqual(expect.objectContaining({
            language: 'tr',
            category: 'License & Activation',
            importBatch: 'ui-upload',
            canonicalSource: 'pdf',
        }));
    });

    it.each([
        ['01-legacy-2015-ve-oncesi.md', 'legacy_pre_2016', '<=2015'],
        ['03-2024-allplan-id-cloud.md', 'cloud_2024', '2024-2024-2'],
        ['04-2025-connect-2.md', 'connect_2025', '2025'],
        ['05-2026-connect-2-management.md', 'connect_2026', '2026+'],
    ])(
        'classifies category-folderless UI upload %s with license version metadata',
        (fileName, versionFamily, versionRange) => {
            const result = classifyDatasetFile(`knowledge-pool/550e8400-e29b-41d4-a716-446655440000/${fileName}`);

            expect(result).toEqual(expect.objectContaining({
                category: 'License & Activation',
                categorySlug: 'license-activation',
                importBatch: 'ui-upload',
                versionFamily,
                licenseEra: versionFamily,
                versionRange,
                requiresHumanReview: true,
            }));
        },
    );

    it('detects German support questions without explicit locale markers', () => {
        const result = classifyDatasetFile('Was tun wenn der Echtzeit-Scanner Allplan-Daten blockiert.pdf');

        expect(result).toEqual(expect.objectContaining({
            language: 'de',
            category: 'Performance & Hardware',
        }));
    });

    it.each([
        ['01-legacy-2015-ve-oncesi.md', 'legacy_pre_2016', '<=2015'],
        ['02-2016-2023-codemeter-product-key.md', 'codemeter_2016_2023', '2016-2023'],
        ['03-2024-allplan-id-cloud.md', 'cloud_2024', '2024-2024-2'],
        ['04-2025-connect-2.md', 'connect_2025', '2025'],
        ['05-2026-connect-2-management.md', 'connect_2026', '2026+'],
    ])('classifies approved licensing guide %s by version family', (fileName, versionFamily, versionRange) => {
        const result = classifyDatasetFile(`/repo/dataset/tr/license-activation/${fileName}`);

        expect(result).toEqual(expect.objectContaining({
            categorySlug: 'license-activation',
            sourceClass: 'support',
            versionFamily,
            licenseEra: versionFamily,
            versionRange,
            requiresHumanReview: true,
        }));
    });

    it('preserves explicit license-server category while adding the CodeMeter era metadata', () => {
        const result = classifyDatasetFile('/repo/dataset/en/license-server-codemeter/02-2016-2023-codemeter-product-key.md');

        expect(result).toEqual(expect.objectContaining({
            categorySlug: 'license-server-codemeter',
            versionFamily: 'codemeter_2016_2023',
            versionRange: '2016-2023',
        }));
    });

    it('does not classify from dates in the absolute worktree path', () => {
        const result = classifyDatasetFile('/Users/hazarvolgaekiz/dev/studio/aluplan-support-desk-v02/aluplan-stabilization-20260928/dataset/tr/license-activation/01-legacy-2015-ve-oncesi.md');

        expect(result).toEqual(expect.objectContaining({
            versionFamily: 'legacy_pre_2016',
            licenseEra: 'legacy_pre_2016',
            versionRange: '<=2015',
        }));
    });
});

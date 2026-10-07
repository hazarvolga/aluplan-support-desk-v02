import { classifyDatasetFile, isDatasetCategorySlug } from './dataset-classifier';

describe('classifyDatasetFile', () => {
    it.each(['toString', 'constructor', '__proto__'])(
        'rejects inherited object property %s as a category slug',
        (value) => {
            expect(isDatasetCategorySlug(value)).toBe(false);
        },
    );

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
        ['03-2024-allplan-id-cloud.md', 'cloud_2024_2_plus', '>=2024-2-0'],
        ['04-2025-connect-2.md', 'cloud_2024_2_plus', '>=2024-2-0'],
        ['05-2026-connect-2-management.md', 'cloud_2024_2_plus', '>=2024-2-0'],
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

    it.each([
        '06-offline-odunc-alma-ve-iade.md',
        '07-hotinfo-var-yok-teshis-akisi.md',
    ])('classifies supplemental licensing guide %s as license support', (fileName) => {
        const result = classifyDatasetFile(`knowledge-pool/550e8400-e29b-41d4-a716-446655440000/${fileName}`);

        expect(result).toEqual(expect.objectContaining({
            category: 'License & Activation',
            categorySlug: 'license-activation',
            importBatch: 'ui-upload',
            requiresHumanReview: true,
        }));
    });

    it('detects German support questions without explicit locale markers', () => {
        const result = classifyDatasetFile('Was tun wenn der Echtzeit-Scanner Allplan-Daten blockiert.pdf');

        expect(result).toEqual(expect.objectContaining({
            language: 'de',
            category: 'Performance & Hardware',
        }));
    });

    it.each([
        ['01-legacy-2015-ve-oncesi.md', 'legacy_pre_2016', '<=2015'],
        ['02-2016-2023-codemeter-product-key.md', 'codemeter_2016_2024_1_10', '2016-2024-1-10'],
        ['03-2024-allplan-id-cloud.md', 'cloud_2024_2_plus', '>=2024-2-0'],
        ['04-2025-connect-2.md', 'cloud_2024_2_plus', '>=2024-2-0'],
        ['05-2026-connect-2-management.md', 'cloud_2024_2_plus', '>=2024-2-0'],
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
            versionFamily: 'codemeter_2016_2024_1_10',
            versionRange: '2016-2024-1-10',
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

    it('does not let a dated import batch override the release in the file name', () => {
        const result = classifyDatasetFile('/repo/dataset/batch-2026-09-28/en/license-activation/Allplan-2023-WIBU-activation.md');

        expect(result).toEqual(expect.objectContaining({
            versionFamily: 'codemeter_2016_2024_1_10',
            versionRange: '2016-2024-1-10',
        }));
    });

    describe('revised ALLPLAN licensing release boundaries', () => {
        it.each([
            ['Allplan-2016-WIBU-single-user-activation.md', 'single user'],
            ['Allplan-2024-1-10-WIBU-single-user-activation.md', 'single user'],
        ])(
            'keeps %s in the CodeMeter era and preserves the %s procedure',
            (fileName, licenseMethod) => {
                const result = classifyDatasetFile(`/repo/dataset/en/license-activation/${fileName}`);

                expect(result).toEqual(expect.objectContaining({
                    versionFamily: 'codemeter_2016_2024_1_10',
                    licenseEra: 'codemeter_2016_2024_1_10',
                    versionRange: '2016-2024-1-10',
                    requiresHumanReview: true,
                }));
                expect(result.licenseMethods).toEqual(expect.arrayContaining(['CodeMeter', licenseMethod]));
                expect(result.licenseMethods).not.toContain('ALLPLAN Connect 2.0');
            },
        );

        it('keeps the 2024-1-10 license-server procedure in the CodeMeter era', () => {
            const result = classifyDatasetFile(
                '/repo/dataset/en/license-server-codemeter/Allplan-2024-1-10-WIBU-license-server.md',
            );

            expect(result).toEqual(expect.objectContaining({
                categorySlug: 'license-server-codemeter',
                versionFamily: 'codemeter_2016_2024_1_10',
                licenseEra: 'codemeter_2016_2024_1_10',
                versionRange: '2016-2024-1-10',
            }));
            expect(result.licenseMethods).toEqual(expect.arrayContaining(['CodeMeter', 'license server']));
            expect(result.scenarios).toEqual(expect.arrayContaining(['server setup']));
        });

        it.each([
            'Allplan-2024-2-0-ALLPLAN-ID-cloud-licensing.md',
            'Allplan-2027-ALLPLAN-ID-cloud-licensing.md',
        ])('classifies %s in the cloud era beginning at 2024-2-0', (fileName) => {
            const result = classifyDatasetFile(`/repo/dataset/en/license-activation/${fileName}`);

            expect(result).toEqual(expect.objectContaining({
                versionFamily: 'cloud_2024_2_plus',
                licenseEra: 'cloud_2024_2_plus',
                versionRange: '>=2024-2-0',
                requiresHumanReview: true,
            }));
            expect(result.licenseMethods).toEqual(expect.arrayContaining(['ALLPLAN ID', 'cloud licensing']));
        });

        it.each([
            'Allplan-2025-Connect-user-organization-seat-management.md',
            'Allplan-2026-Connect-2-user-group-seat-reservation-management.md',
            'Allplan-2027-Connect-2-user-organization-seat-management.md',
        ])('treats %s as cloud-license administration rather than a separate license technology', (fileName) => {
            const result = classifyDatasetFile(`knowledge-pool/licensing/${fileName}`);

            expect(result).toEqual(expect.objectContaining({
                categorySlug: 'license-activation',
                versionFamily: 'cloud_2024_2_plus',
                licenseEra: 'cloud_2024_2_plus',
                versionRange: '>=2024-2-0',
            }));
            expect(result.licenseMethods).toEqual(expect.arrayContaining([
                'ALLPLAN ID',
                'cloud licensing',
                'Connect administration',
            ]));
            expect(result.scenarios).toEqual(expect.arrayContaining([
                'organization invitation',
                'seat assignment',
            ]));
        });
    });
});

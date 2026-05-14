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
});

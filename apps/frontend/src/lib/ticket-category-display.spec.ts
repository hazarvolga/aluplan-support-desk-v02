import { describe, expect, it } from 'vitest';
import { getTicketSupportCategoryNames } from './ticket-category-display';

const labels = {
    licensing: 'Lisans ve Aktivasyon',
    technical_support: 'Teknik Destek',
};

describe('ticket support category display', () => {
    it('localizes legacy licensing keys and does not expose AI suggestions', () => {
        expect(getTicketSupportCategoryNames({
            department: { name: 'TICKETS.CATEGORY.LICENSING' },
            suggestedCategories: ['SCIA ENGINEERING'],
        }, labels)).toEqual(['Lisans ve Aktivasyon']);
    });

    it('shows only persisted support categories', () => {
        expect(getTicketSupportCategoryNames({
            tags: ['licensing'],
            department: { name: 'Teknik Destek' },
            suggestedCategories: ['modelleme', 'çökme'],
        }, labels)).toEqual(['Lisans ve Aktivasyon', 'Teknik Destek']);
    });

    it('uses the stable department slug when the stored name is legacy', () => {
        expect(getTicketSupportCategoryNames({
            department: { name: 'SCIA ENGINEERING', slug: 'technical_support' },
        }, labels)).toEqual(['Teknik Destek']);
    });

    it('falls back to the readable department name for an unknown slug', () => {
        expect(getTicketSupportCategoryNames({
            department: { name: 'Özel Destek', slug: 'custom-support' },
        }, labels)).toEqual(['Özel Destek']);
    });
});

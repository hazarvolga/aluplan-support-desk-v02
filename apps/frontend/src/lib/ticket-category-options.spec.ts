import { describe, expect, it } from 'vitest';
import { buildTicketCategoryOptions, getTicketCategoryCreateFields, LICENSING_CATEGORY_VALUE } from './ticket-category-options';

const departments = [
    { id: 'billing-id', slug: 'billing-payments', name: 'Billing & Payments' },
    { id: 'technical-id', slug: 'technical-support', name: 'Technical Support' },
];

describe('buildTicketCategoryOptions', () => {
    it('shows licensing as a distinct choice routed to the existing billing department', () => {
        const options = buildTicketCategoryOptions(departments);

        expect(options.map(option => option.value)).toEqual([
            'billing-id',
            LICENSING_CATEGORY_VALUE,
            'technical-id',
        ]);
        expect(options[1]).toMatchObject({
            value: LICENSING_CATEGORY_VALUE,
            departmentId: 'billing-id',
            isLicensing: true,
        });
        expect(options[0]).toMatchObject({ departmentId: 'billing-id', isLicensing: false });
        expect(getTicketCategoryCreateFields(options[1])).toEqual({
            departmentId: 'billing-id',
            tags: ['licensing'],
        });
        expect(getTicketCategoryCreateFields(options[0])).toEqual({ departmentId: 'billing-id' });
    });

    it('does not offer a broken licensing route when billing is absent', () => {
        const options = buildTicketCategoryOptions(departments.slice(1));

        expect(options.map(option => option.value)).toEqual(['technical-id']);
    });
});

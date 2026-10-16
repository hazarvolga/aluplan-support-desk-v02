import { describe, expect, it } from 'vitest';
import {
    buildTicketCategoryOptions,
    getTicketCategoryCreateFields,
    isHotinfoRequiredForTicket,
    LICENSING_CATEGORY_VALUE,
} from './ticket-category-options';

const departments = [
    { id: 'billing-id', slug: 'billing-payments', name: 'Billing & Payments' },
    { id: 'technical-id', slug: 'technical-support', name: 'Technical Support' },
    { id: 'general-id', slug: 'general-applications', name: 'General Applications' },
    { id: 'security-id', slug: 'security-compliance', name: 'Security & Compliance' },
    { id: 'sales-id', slug: 'sales', name: 'Sales' },
];

describe('buildTicketCategoryOptions', () => {
    it('shows only technical support and licensing while routing licensing to billing internally', () => {
        const options = buildTicketCategoryOptions(departments);

        expect(options.map(option => option.value)).toEqual([
            'technical-id',
            LICENSING_CATEGORY_VALUE,
        ]);
        expect(options[0]).toMatchObject({
            value: 'technical-id',
            departmentId: 'technical-id',
            isLicensing: false,
        });
        expect(options[1]).toMatchObject({ departmentId: 'billing-id', isLicensing: true });
        expect(getTicketCategoryCreateFields(options[1])).toEqual({
            departmentId: 'billing-id',
            tags: ['licensing'],
        });
        expect(getTicketCategoryCreateFields(options[0])).toEqual({ departmentId: 'technical-id' });
    });

    it('does not offer a broken licensing route when billing is absent', () => {
        const options = buildTicketCategoryOptions(departments.filter(department => department.slug !== 'billing-payments'));

        expect(options.map(option => option.value)).toEqual(['technical-id']);
    });
});

describe('isHotinfoRequiredForTicket', () => {
    const technicalOption = buildTicketCategoryOptions(departments).find(option => option.value === 'technical-id');
    const licensingOption = buildTicketCategoryOptions(departments).find(option => option.value === LICENSING_CATEGORY_VALUE);

    it('requires Hotinfo only for ALLPLAN technical support tickets', () => {
        expect(isHotinfoRequiredForTicket('ALLPLAN', technicalOption)).toBe(true);
        expect(isHotinfoRequiredForTicket(' allplan ', technicalOption)).toBe(true);
    });

    it('keeps Hotinfo optional for licensing, other categories, and other products', () => {
        expect(isHotinfoRequiredForTicket('ALLPLAN', licensingOption)).toBe(false);
        expect(isHotinfoRequiredForTicket('SCIA', technicalOption)).toBe(false);
        expect(isHotinfoRequiredForTicket(undefined, technicalOption)).toBe(false);
    });
});

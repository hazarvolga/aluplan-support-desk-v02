import { describe, expect, it } from 'vitest';
import { isTicketDetailsReady } from './ticket-intake-visibility';

describe('isTicketDetailsReady', () => {
    it('allows the ticket form to continue after category and product selection without requiring Hotinfo', () => {
        expect(isTicketDetailsReady('billing-payments', 'allplan')).toBe(true);
    });

    it.each([
        ['', 'allplan'],
        ['billing-payments', ''],
    ])('waits for both routing selections', (departmentId, productId) => {
        expect(isTicketDetailsReady(departmentId, productId)).toBe(false);
    });
});

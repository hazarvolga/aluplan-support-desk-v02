import { describe, expect, it } from 'vitest';
import tr from '../../messages/tr.json';
import en from '../../messages/en.json';
import de from '../../messages/de.json';

describe('ticket detail license-support labels', () => {
    it('uses the approved label in every customer locale', () => {
        expect(tr.tickets.detail.category_licensing).toBe('Lisans Desteği');
        expect(en.tickets.detail.category_licensing).toBe('License Support');
        expect(de.tickets.detail.category_licensing).toBe('Lizenzsupport');
    });
});

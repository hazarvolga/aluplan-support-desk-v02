import { sanitizeHotinfoContext } from './hotinfo-context';

describe('sanitizeHotinfoContext', () => {
    it('keeps bounded diagnostic fields and removes arbitrary keys', () => {
        expect(sanitizeHotinfoContext({
            allplanVersion: '  Allplan 2024-2-0\n  ',
            installedModules: Array.from({ length: 30 }, (_, index) => `Module ${index}`),
            secret: 'must not persist',
        })).toEqual({
            allplanVersion: 'Allplan 2024-2-0',
            installedModules: Array.from({ length: 20 }, (_, index) => `Module ${index}`),
        });
    });
});

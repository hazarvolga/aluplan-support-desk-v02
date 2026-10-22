import { describe, expect, it } from 'vitest';
import { displayAttachmentFilename } from './attachment-filename';

describe('displayAttachmentFilename', () => {
    it.each(['ÇığÖŞÜ.pdf', 'GÜRCİSTANBAK.ZİP', 'öğrenci-şantiye.png'])('repairs a legacy Latin-1 byte-decoded filename %s', original => {
        const stored = Array.from(new TextEncoder().encode(original), byte => String.fromCharCode(byte)).join('');
        expect(displayAttachmentFilename(stored)).toBe(original);
    });
    it.each([
        ['EKRAN GÃ¶RÃ¼NTÃ¼SÃ¼.PNG', 'EKRAN GöRüNTüSü.PNG'],
        ['GÃ¼RCİSTANBAK.ZİP', 'GüRCİSTANBAK.ZİP'],
        ['Ä°ÅŸlem-Ä±ÅŸÄ±k-ÄŸÃ¶rsel.pdf', 'İşlem-ışık-ğörsel.pdf'],
    ])('repairs a legacy mojibake filename without changing its Unicode remainder', (stored, expected) => {
        expect(displayAttachmentFilename(stored)).toBe(expected);
    });

    it.each(['GÖRÜNTÜ.PNG', 'gürcistanbak.zip', 'report-2026.pdf', 'Ã-legacy.txt'])('preserves an already valid filename %s', (name) => {
        expect(displayAttachmentFilename(name)).toBe(name);
    });
});

import { normalizeUploadFilename } from './attachment-filename';

describe('normalizeUploadFilename', () => {
    it.each(['ÇığÖŞÜ.pdf', 'GÜRCİSTANBAK.ZİP', 'öğrenci-şantiye.png'])('repairs the actual Busboy Latin-1 byte decoding of %s', original => {
        const busboyName = Buffer.from(original, 'utf8').toString('latin1');
        expect(normalizeUploadFilename(busboyName)).toBe(original);
    });
    it.each([
        ['EKRAN GÃ¶RÃ¼NTÃ¼SÃ¼.PNG', 'EKRAN GöRüNTüSü.PNG'],
        ['GÃ¼RCİSTANBAK.ZİP', 'GüRCİSTANBAK.ZİP'],
        ['Ä°ÅŸlem-Ä±ÅŸÄ±k-ÄŸÃ¶rsel.pdf', 'İşlem-ışık-ğörsel.pdf'],
    ])('normalizes Turkish multipart filename %s', (received, expected) => {
        expect(normalizeUploadFilename(received)).toBe(expected);
    });

    it.each(['GÖRÜNTÜ.PNG', 'gürcistanbak.zip', 'report-2026.pdf', 'Ã-legacy.txt'])('preserves already decoded filename %s', name => {
        expect(normalizeUploadFilename(name)).toBe(name);
    });
});

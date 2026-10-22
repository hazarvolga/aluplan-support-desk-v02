// Busboy/Multer defaults to Latin-1 filename parameters. Older records can
// also contain Windows-1252-decoded UTF-8. Repair complete Turkish sequences
// in either encoding without altering already-correct or mixed Unicode text.
const legacyTurkishSequences = new Map<string, string>();
const windows1252 = new TextDecoder('windows-1252');
for (const character of 'ÇçĞğİıÖöŞşÜü') {
    const bytes = new TextEncoder().encode(character);
    legacyTurkishSequences.set(String.fromCharCode(...bytes), character);
    legacyTurkishSequences.set(windows1252.decode(bytes), character);
}

const legacySequencePattern = new RegExp([...legacyTurkishSequences.keys()].join('|'), 'g');

export function normalizeUploadFilename(name: string): string {
    return name.replace(legacySequencePattern, sequence => legacyTurkishSequences.get(sequence) ?? sequence);
}

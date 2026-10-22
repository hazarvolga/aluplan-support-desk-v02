// Older uploads may contain UTF-8 Turkish characters decoded as Latin-1 or
// Windows-1252. Repair only complete sequences, including mixed Unicode names.
const legacyTurkishSequences = new Map<string, string>();
const windows1252 = new TextDecoder('windows-1252');
for (const character of 'ÇçĞğİıÖöŞşÜü') {
    const bytes = new TextEncoder().encode(character);
    legacyTurkishSequences.set(String.fromCharCode(...bytes), character);
    legacyTurkishSequences.set(windows1252.decode(bytes), character);
}

const legacySequencePattern = new RegExp([...legacyTurkishSequences.keys()].join('|'), 'g');

export function displayAttachmentFilename(name: string | null | undefined): string {
    return name?.replace(legacySequencePattern, sequence => legacyTurkishSequences.get(sequence) ?? sequence) ?? '';
}

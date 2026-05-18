const NO_KNOWLEDGE_PATTERNS = [
    /mevcut bilgi kayna[gğ][iı]nda yer alm[ıi]yor/i,
    /bilgi kayna[gğ][iı]mda yeterli d[oö]k[uü]man bulunmuyor/i,
    /yeterli d[oö]k[uü]man bulunmuyor/i,
    /destek talebi olu[sş]tur/i,
    /no specific knowledge/i,
    /not enough information/i,
    /does not contain specific technical information/i,
];

export const isNoKnowledgeAnswer = (answer: string | null | undefined): boolean => {
    if (!answer) return false;
    return NO_KNOWLEDGE_PATTERNS.some(pattern => pattern.test(answer));
};

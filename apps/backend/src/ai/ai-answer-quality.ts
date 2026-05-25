const NO_KNOWLEDGE_PATTERNS = [
    /mevcut bilgi kayna[gğ][iı]nda yer alm[ıi]yor/i,
    /bilgi kayna[gğ][iı]mda yeterli d[oö]k[uü]man bulunmuyor/i,
    /yeterli d[oö]k[uü]man bulunmuyor/i,
    /bilgi kayna[gğ][iı]nda yeterince g[uü]venilir/i,
    /yeterince g[uü]venilir ve do[gğ]rudan e[sş]le[sş]en i[cç]erik bulunamad[ıi]/i,
    /no specific knowledge/i,
    /not enough information/i,
    /does not contain specific technical information/i,
    /knowledge base does not contain enough reliable information/i,
    /does not contain enough reliable information for this exact question/i,
    /not enough reliable and directly matching content/i,
    /this topic is not covered in the current knowledge base/i,
    /keine ausreichend verl[aä]sslichen informationen/i,
    /nicht gen[uü]gend zuverl[aä]ssige informationen/i,
    /keine ausreichend zuverl[aä]ssigen informationen/i,
];

export const isNoKnowledgeAnswer = (answer: string | null | undefined): boolean => {
    if (!answer) return false;
    return NO_KNOWLEDGE_PATTERNS.some(pattern => pattern.test(answer));
};

export type AnswerLanguage = 'tr' | 'en' | 'de';

const LANGUAGE_MARKERS: Record<AnswerLanguage, string[]> = {
    tr: [
        've', 'bir', 'icin', 'için', 'olarak', 'kullanici', 'kullanıcı', 'sorun', 'cozum', 'çözüm',
        'adim', 'adım', 'kontrol', 'edin', 'oldugundan', 'olduğundan', 'talep', 'gerekir', 'olasi',
        'olası', 'dogrulama', 'doğrulama', 'lisansiniz', 'lisansınız', 'sisteminiz',
    ],
    en: [
        'the', 'and', 'to', 'for', 'with', 'you', 'your', 'check', 'install', 'ensure', 'steps',
        'issue', 'summary', 'solution', 'verification', 'probable', 'cause', 'because', 'when',
        'after', 'before', 'should',
    ],
    de: [
        'der', 'die', 'das', 'und', 'fur', 'für', 'nicht', 'mit', 'sie', 'ihre', 'prufen', 'prüfen',
        'schritte', 'losung', 'lösung', 'ursache', 'wahrscheinlichste', 'uberprufung', 'überprüfung',
        'wenn', 'nach', 'vor',
    ],
};

const normalizeLanguageProbe = (value: string): string => value
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+.*$/gm, ' ')
    .replace(/[`*_>\-[\]().,:;!?/\\]+/g, ' ')
    .replace(/[ıİ]/g, 'i')
    .replace(/[şŞ]/g, 's')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[çÇ]/g, 'c')
    .replace(/\s+/g, ' ')
    .trim();

const scoreLanguage = (answer: string, language: AnswerLanguage): number => {
    const normalized = normalizeLanguageProbe(answer);
    const tokens = new Set(normalized.match(/[a-zäöüß]+/gi) ?? []);
    let score = LANGUAGE_MARKERS[language].reduce((total, marker) => (
        tokens.has(normalizeLanguageProbe(marker)) ? total + 1 : total
    ), 0);

    if (language === 'tr' && /[çğıİşÇĞŞ]/.test(answer)) score += 4;
    if (language === 'de' && /[äÄß]/.test(answer)) score += 4;

    return score;
};

export const detectDominantAnswerLanguage = (answer: string | null | undefined): AnswerLanguage | null => {
    if (!answer || answer.trim().length < 60) return null;

    const scores = (['tr', 'en', 'de'] as AnswerLanguage[])
        .map(language => ({ language, score: scoreLanguage(answer, language) }))
        .sort((a, b) => b.score - a.score);

    const [best, second] = scores;
    if (!best || best.score < 4) return null;
    if (second && best.score < second.score + 2) return null;

    return best.language;
};

export const hasAnswerLanguageLeak = (
    answer: string | null | undefined,
    expectedLanguage: AnswerLanguage,
): boolean => {
    if (!answer) return false;
    const normalized = normalizeLanguageProbe(answer);
    const trimmed = answer.trim();

    if (expectedLanguage === 'en' && /^(merhaba|hallo)\b/i.test(trimmed)) return true;
    if (expectedLanguage === 'tr' && /^(hello|hallo)\b/i.test(trimmed)) return true;
    if (expectedLanguage === 'de' && /^(hello|merhaba)\b/i.test(trimmed)) return true;

    if (
        expectedLanguage !== 'tr' &&
        /[çğıİşÇĞŞ]/.test(answer) &&
        /\b(kullanici|sorun|cozum|adim|kontrol|edin|dogrulayin|lisans|soruyor|gerekir|olasi)\b/.test(normalized)
    ) {
        return true;
    }

    const detected = detectDominantAnswerLanguage(answer);
    return !!detected && detected !== expectedLanguage;
};

export type AllplanLicenseEra =
    | 'legacy_pre_2016'
    | 'codemeter_2016_2024_1_10'
    | 'cloud_2024_2_plus'
    | 'unknown';

export interface AllplanLicenseReleaseClassification {
    era: AllplanLicenseEra;
    versionRange: '<=2015' | '2016-2024-1-10' | '>=2024-2-0' | 'unknown';
    year: number | null;
    release: number | null;
    patch: number | null;
    requiresExactVersionConfirmation: boolean;
}

const VERSION_PATTERN = /(^|[^\d])(?:allplan\s*)?(20\d{2}|19\d{2})(?:\s*[-._]\s*(\d{1,2}))?(?:\s*[-._]\s*(\d{1,3}))?(?!\d)/gi;

type ParsedRelease = { year: number; release: number | null; patch: number | null };

const unknownRelease = (): AllplanLicenseReleaseClassification => ({
    era: 'unknown',
    versionRange: 'unknown',
    year: null,
    release: null,
    patch: null,
    requiresExactVersionConfirmation: true,
});

const classifyParsedRelease = ({ year, release, patch }: ParsedRelease): AllplanLicenseReleaseClassification => {
    if (year <= 2015) {
        return { era: 'legacy_pre_2016', versionRange: '<=2015', year, release, patch, requiresExactVersionConfirmation: false };
    }
    if (year <= 2023) {
        return { era: 'codemeter_2016_2024_1_10', versionRange: '2016-2024-1-10', year, release, patch, requiresExactVersionConfirmation: false };
    }
    if (year >= 2025) {
        return { era: 'cloud_2024_2_plus', versionRange: '>=2024-2-0', year, release, patch, requiresExactVersionConfirmation: false };
    }
    if (release === null) {
        return { era: 'unknown', versionRange: 'unknown', year, release, patch, requiresExactVersionConfirmation: true };
    }
    if (release >= 2) {
        return { era: 'cloud_2024_2_plus', versionRange: '>=2024-2-0', year, release, patch, requiresExactVersionConfirmation: false };
    }
    if (release === 0 || (release === 1 && (patch === null || patch <= 10))) {
        return {
            era: 'codemeter_2016_2024_1_10', versionRange: '2016-2024-1-10', year, release, patch,
            requiresExactVersionConfirmation: release === 1 && patch === null,
        };
    }
    return { era: 'unknown', versionRange: 'unknown', year, release, patch, requiresExactVersionConfirmation: true };
};

/**
 * Maps an ALLPLAN release to the licensing technology confirmed by ALLPLAN:
 * - <= 2015: legacy local licensing
 * - 2016 through 2024-1-10: WIBU/CodeMeter
 * - 2024-2-0 and later: ALLPLAN ID cloud licensing
 *
 * A bare "2024" is deliberately ambiguous. It must never silently select a
 * potentially destructive activation/return procedure.
 */
export const classifyAllplanLicenseRelease = (
    value: string | null | undefined,
): AllplanLicenseReleaseClassification => {
    const rawValue = String(value ?? '');
    const confirmedVersion = rawValue.match(/\[CONFIRMED ALLPLAN VERSION\]\s*([^\n]+)/i)?.[1];
    const matches = Array.from((confirmedVersion ?? rawValue).matchAll(VERSION_PATTERN));
    if (matches.length === 0) return unknownRelease();

    const candidates = matches.map((match): ParsedRelease => ({
        year: Number(match[2]),
        release: match[3] === undefined ? null : Number(match[3]),
        patch: match[4] === undefined ? null : Number(match[4]),
    }));
    const classified = candidates.map(classifyParsedRelease);
    const confirmedEras = new Set(classified.filter(item => item.era !== 'unknown').map(item => item.era));
    if (confirmedEras.size > 1) return unknownRelease();

    return classified
        .sort((left, right) => {
            const specificity = (item: AllplanLicenseReleaseClassification) => item.patch !== null ? 2 : item.release !== null ? 1 : 0;
            return specificity(right) - specificity(left);
        })
        .find(item => item.era !== 'unknown') ?? classified[0] ?? unknownRelease();
};

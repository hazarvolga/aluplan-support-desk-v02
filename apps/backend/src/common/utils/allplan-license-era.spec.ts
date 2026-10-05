import { classifyAllplanLicenseRelease } from './allplan-license-era';

describe('classifyAllplanLicenseRelease', () => {
    it.each([
        ['Allplan 2015', 'legacy_pre_2016', '<=2015'],
        ['Allplan 2016', 'codemeter_2016_2024_1_10', '2016-2024-1-10'],
        ['Allplan 2024-1-10 Unicode 64-bit', 'codemeter_2016_2024_1_10', '2016-2024-1-10'],
        ['Allplan 2024.2.0', 'cloud_2024_2_plus', '>=2024-2-0'],
        ['Allplan 2027', 'cloud_2024_2_plus', '>=2024-2-0'],
    ])('maps %s to the approved licensing era', (value, era, versionRange) => {
        expect(classifyAllplanLicenseRelease(value)).toEqual(expect.objectContaining({ era, versionRange }));
    });

    it.each(['Allplan 2024', 'Allplan 2024-1-11', '', 'not a version']) (
        'keeps unsafe or incomplete release %s ambiguous',
        (value) => {
            expect(classifyAllplanLicenseRelease(value)).toEqual(expect.objectContaining({
                era: 'unknown',
                requiresExactVersionConfirmation: true,
            }));
        },
    );

    it('keeps the 2024-1 family in WIBU while requesting the missing patch', () => {
        expect(classifyAllplanLicenseRelease('Allplan 2024-1')).toEqual(expect.objectContaining({
            era: 'codemeter_2016_2024_1_10',
            requiresExactVersionConfirmation: true,
        }));
    });

    it('prefers an exact Hotinfo build over a coarse release signal', () => {
        expect(classifyAllplanLicenseRelease('Allplan 2024 2024-2-0')).toEqual(expect.objectContaining({
            era: 'cloud_2024_2_plus',
            patch: 0,
        }));
        expect(classifyAllplanLicenseRelease('Allplan 2024-1 2024-1-10')).toEqual(expect.objectContaining({
            era: 'codemeter_2016_2024_1_10',
            patch: 10,
            requiresExactVersionConfirmation: false,
        }));
    });

    it('fails closed when exact signals disagree across licensing eras', () => {
        expect(classifyAllplanLicenseRelease('Allplan 2023 build 2024-2-0')).toEqual(expect.objectContaining({
            era: 'unknown',
            requiresExactVersionConfirmation: true,
        }));
    });

    it('prioritizes an explicitly confirmed intake version over historical versions in the description', () => {
        expect(classifyAllplanLicenseRelease(
            '[CONFIRMED ALLPLAN VERSION]\n2024-2-0\n2023 sürümünden yükseltme yaptım',
        ).era).toBe('cloud_2024_2_plus');
    });
});

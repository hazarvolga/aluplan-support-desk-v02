export type AllplanReleaseFamily = 'LEGACY_PRE_2016' | 'CODEMETER_2016_2024_1_10' | 'TRANSITION_2024' | 'CLOUD_2024_2_PLUS' | 'UNKNOWN';
export type Allplan2024ReleaseBand = 'UP_TO_2024_1_10' | 'FROM_2024_2_0' | 'UNKNOWN';

export type AllplanLicensingIntakeValues = {
    allplanVersion?: string;
    allplan2024ReleaseBand?: Allplan2024ReleaseBand;
    licenseTopology?: 'SINGLE_USER' | 'LICENSE_SERVER' | 'UNKNOWN';
    licenseIssueType?: 'ACTIVATION' | 'TRANSFER' | 'LOGIN' | 'INVITATION' | 'SEAT' | 'OFFLINE' | 'OTHER';
    licenseUserRole?: 'END_USER' | 'LICENSE_ADMIN' | 'UNKNOWN';
    allplanIdStatus?: 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN';
    organizationInviteStatus?: 'ACCEPTED' | 'MISSING' | 'UNKNOWN';
    licenseGroupStatus?: 'ASSIGNED' | 'MISSING' | 'UNKNOWN';
};

type Translate = (key: string) => string;

export type AllplanLicensingDiagnosisField =
    | 'allplanVersion'
    | 'allplan2024ReleaseBand'
    | 'licenseTopology'
    | 'licenseIssueType'
    | 'licenseUserRole'
    | 'allplanIdStatus'
    | 'organizationInviteStatus'
    | 'licenseGroupStatus';

export const ALLPLAN_LICENSING_RESOURCES = {
    CODEMETER_SINGLE: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=11873',
    CODEMETER_SERVER: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=12270',
    CLOUD_FIRST_STEPS: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=8620&source=howto',
    CLOUD_VIDEO: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=7173&source=howto',
} as const;

export const extractAllplanVersion = (value?: string): string => {
    const input = (value ?? '').replace(/\s+/g, ' ').trim().slice(0, 128);
    const match = /^(?:allplan\s+)?(20\d{2})(?:[-.]([0-9]+)(?:[-.]([0-9]+))?)?(?:\s+.*)?$/i.exec(input);
    if (!match) return '';
    return [match[1], match[2], match[3]].filter(part => part !== undefined).join('-');
};

export const classifyAllplanRelease = (
    value?: string,
    allplan2024ReleaseBand?: Allplan2024ReleaseBand,
): AllplanReleaseFamily => {
    const version = extractAllplanVersion(value);
    if (!version) return 'UNKNOWN';
    const match = /^(20\d{2})(?:[-.]([0-9]+)(?:[-.]([0-9]+))?)?$/.exec(version);
    if (!match) return 'UNKNOWN';

    const year = Number(match[1]);
    const minor = match[2] === undefined ? undefined : Number(match[2]);
    const patch = match[3] === undefined ? 0 : Number(match[3]);
    if (year <= 2015) return 'LEGACY_PRE_2016';
    if (year >= 2025) return 'CLOUD_2024_2_PLUS';
    if (year >= 2016 && year <= 2023) return 'CODEMETER_2016_2024_1_10';
    if (year === 2024 && minor === undefined) {
        if (allplan2024ReleaseBand === 'UP_TO_2024_1_10') return 'CODEMETER_2016_2024_1_10';
        if (allplan2024ReleaseBand === 'FROM_2024_2_0') return 'CLOUD_2024_2_PLUS';
        return 'TRANSITION_2024';
    }
    if (year !== 2024 || minor === undefined || match[3] === undefined) return 'UNKNOWN';
    if (minor < 1 || (minor === 1 && patch <= 10)) return 'CODEMETER_2016_2024_1_10';
    if (minor >= 2) return 'CLOUD_2024_2_PLUS';
    return 'UNKNOWN';
};

export const getAllowedAllplanLicenseIssueTypes = (family: AllplanReleaseFamily): NonNullable<AllplanLicensingIntakeValues['licenseIssueType']>[] => {
    if (family === 'LEGACY_PRE_2016' || family === 'CODEMETER_2016_2024_1_10') {
        return ['ACTIVATION', 'TRANSFER', 'OFFLINE', 'OTHER'];
    }
    if (family === 'CLOUD_2024_2_PLUS') {
        return ['ACTIVATION', 'LOGIN', 'INVITATION', 'SEAT', 'OFFLINE', 'OTHER'];
    }
    return [];
};

export const getOfficialAllplanLicensingResources = (values: AllplanLicensingIntakeValues) => {
    const family = classifyAllplanRelease(values.allplanVersion, values.allplan2024ReleaseBand);
    if (family === 'CODEMETER_2016_2024_1_10' && values.licenseIssueType === 'ACTIVATION' && values.licenseTopology === 'SINGLE_USER') {
        return [{ id: 'CODEMETER_SINGLE', url: ALLPLAN_LICENSING_RESOURCES.CODEMETER_SINGLE }];
    }
    if (family === 'CODEMETER_2016_2024_1_10' && values.licenseIssueType === 'ACTIVATION' && values.licenseTopology === 'LICENSE_SERVER') {
        return [{ id: 'CODEMETER_SERVER', url: ALLPLAN_LICENSING_RESOURCES.CODEMETER_SERVER }];
    }
    if (family === 'CLOUD_2024_2_PLUS') {
        return [
            { id: 'CLOUD_FIRST_STEPS', url: ALLPLAN_LICENSING_RESOURCES.CLOUD_FIRST_STEPS },
            { id: 'CLOUD_VIDEO', url: ALLPLAN_LICENSING_RESOURCES.CLOUD_VIDEO, supplementary: true },
        ];
    }
    return [];
};

export const getMissingAllplanLicensingDiagnosisFields = (
    values: AllplanLicensingIntakeValues,
    options: { isApplicable?: boolean; hasConfirmedHotinfo: boolean; confirmedHotinfoVersion?: string },
): AllplanLicensingDiagnosisField[] => {
    if (options.isApplicable === false) return [];
    const effectiveVersion = extractAllplanVersion(values.allplanVersion)
        || (options.hasConfirmedHotinfo ? extractAllplanVersion(options.confirmedHotinfoVersion) : '');
    const family = classifyAllplanRelease(effectiveVersion, values.allplan2024ReleaseBand);
    const allowedIssueTypes = getAllowedAllplanLicenseIssueTypes(family);
    const missing: AllplanLicensingDiagnosisField[] = [];

    if (family === 'UNKNOWN') return ['allplanVersion'];
    if (family === 'TRANSITION_2024') return ['allplan2024ReleaseBand'];
    if (family === 'LEGACY_PRE_2016' || family === 'CODEMETER_2016_2024_1_10') {
        if (!values.licenseTopology || values.licenseTopology === 'UNKNOWN') missing.push('licenseTopology');
        if (!values.licenseIssueType || !allowedIssueTypes.includes(values.licenseIssueType)) missing.push('licenseIssueType');
    }
    if (family === 'CLOUD_2024_2_PLUS') {
        if (!values.licenseIssueType || !allowedIssueTypes.includes(values.licenseIssueType)) missing.push('licenseIssueType');
        if (!values.allplanIdStatus || values.allplanIdStatus === 'UNKNOWN') missing.push('allplanIdStatus');
        if (!values.organizationInviteStatus || values.organizationInviteStatus === 'UNKNOWN') missing.push('organizationInviteStatus');
        if (!values.licenseGroupStatus || values.licenseGroupStatus === 'UNKNOWN') missing.push('licenseGroupStatus');
        if (!values.licenseUserRole || values.licenseUserRole === 'UNKNOWN') missing.push('licenseUserRole');
    }
    return Array.from(new Set(missing));
};

export const buildAllplanLicensingDescription = (description: string, values: AllplanLicensingIntakeValues, translate: Translate): string => {
    const family = classifyAllplanRelease(values.allplanVersion, values.allplan2024ReleaseBand);
    const lines = [
        `[${translate('licensing_intake.context_title')}]`,
        `${translate('licensing_intake.release_family_label')}: ${translate(`licensing_intake.release_family.${family}`)}`,
        `${translate('licensing_intake.version_label')}: ${extractAllplanVersion(values.allplanVersion) || translate('licensing_intake.unknown')}`,
        `${translate('licensing_intake.issue_label')}: ${translate(`licensing_intake.issue.${values.licenseIssueType || 'OTHER'}`)}`,
    ];
    if (extractAllplanVersion(values.allplanVersion) === '2024') {
        lines.push(`${translate('licensing_intake.release_band_label')}: ${translate(`licensing_intake.release_band.${values.allplan2024ReleaseBand || 'UNKNOWN'}`)}`);
    }
    if (family === 'LEGACY_PRE_2016' || family === 'CODEMETER_2016_2024_1_10') {
        lines.push(`${translate('licensing_intake.topology_label')}: ${translate(`licensing_intake.topology.${values.licenseTopology || 'UNKNOWN'}`)}`);
    }
    if (family === 'CLOUD_2024_2_PLUS') {
        lines.push(
            `${translate('licensing_intake.user_role_label')}: ${translate(`licensing_intake.user_role.${values.licenseUserRole || 'UNKNOWN'}`)}`,
            `${translate('licensing_intake.allplan_id_label')}: ${translate(`licensing_intake.allplan_id.${values.allplanIdStatus || 'UNKNOWN'}`)}`,
            `${translate('licensing_intake.invite_label')}: ${translate(`licensing_intake.invite.${values.organizationInviteStatus || 'UNKNOWN'}`)}`,
            `${translate('licensing_intake.group_label')}: ${translate(`licensing_intake.group.${values.licenseGroupStatus || 'UNKNOWN'}`)}`,
        );
    }
    return `${description.trim()}\n\n${lines.join('\n')}`;
};

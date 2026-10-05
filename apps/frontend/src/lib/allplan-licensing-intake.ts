export type AllplanLicensingIntakeValues = {
    allplanVersion?: string;
    licenseTopology?: 'SINGLE_USER' | 'LICENSE_SERVER' | 'UNKNOWN';
    licenseIssueType?: 'ACTIVATION' | 'TRANSFER' | 'LOGIN' | 'INVITATION' | 'SEAT' | 'OFFLINE' | 'OTHER';
    allplanIdStatus?: 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN' | 'NOT_APPLICABLE';
    organizationInviteStatus?: 'ACCEPTED' | 'MISSING' | 'UNKNOWN' | 'NOT_APPLICABLE';
    seatStatus?: 'ASSIGNED' | 'MISSING' | 'UNKNOWN' | 'NOT_APPLICABLE';
};

type Translate = (key: string) => string;

const normalizeVersion = (value?: string): string => (value ?? '')
    .replace(/[^A-Za-z0-9._()+/\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 64);

export const buildAllplanLicensingDescription = (
    description: string,
    values: AllplanLicensingIntakeValues,
    translate: Translate,
): string => {
    const licensingContext = [
        `[${translate('licensing_intake.context_title')}]`,
        `${translate('licensing_intake.version_label')}: ${normalizeVersion(values.allplanVersion) || translate('licensing_intake.unknown')}`,
        `${translate('licensing_intake.topology_label')}: ${translate(`licensing_intake.topology.${values.licenseTopology || 'UNKNOWN'}`)}`,
        `${translate('licensing_intake.issue_label')}: ${translate(`licensing_intake.issue.${values.licenseIssueType || 'OTHER'}`)}`,
        `${translate('licensing_intake.allplan_id_label')}: ${translate(`licensing_intake.allplan_id.${values.allplanIdStatus || 'UNKNOWN'}`)}`,
        `${translate('licensing_intake.invite_label')}: ${translate(`licensing_intake.invite.${values.organizationInviteStatus || 'UNKNOWN'}`)}`,
        `${translate('licensing_intake.seat_label')}: ${translate(`licensing_intake.seat.${values.seatStatus || 'UNKNOWN'}`)}`,
    ].join('\n');

    return `${description.trim()}\n\n${licensingContext}`;
};

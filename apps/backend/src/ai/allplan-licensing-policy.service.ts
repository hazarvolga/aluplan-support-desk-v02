import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AllplanLicensingIntake = {
    categoryKey: 'licensing';
    allplanVersion: string;
    licenseTopology?: 'SINGLE_USER' | 'LICENSE_SERVER' | 'UNKNOWN';
    licenseIssueType?: 'ACTIVATION' | 'TRANSFER' | 'LOGIN' | 'INVITATION' | 'SEAT' | 'OFFLINE' | 'OTHER';
    licenseUserRole?: 'END_USER' | 'LICENSE_ADMIN' | 'UNKNOWN';
    allplanIdStatus?: 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN';
    organizationInviteStatus?: 'ACCEPTED' | 'MISSING' | 'UNKNOWN';
    licenseGroupStatus?: 'ASSIGNED' | 'MISSING' | 'UNKNOWN';
};

export type ValidatedAllplanLicensingContext = { allplanVersion: string; promptContext: string };

type ReleaseFamily = 'LEGACY' | 'CODEMETER' | 'CLOUD' | 'UNKNOWN';
type LicenseIssueType = NonNullable<AllplanLicensingIntake['licenseIssueType']>;

const ALLOWED_ISSUES: Record<Exclude<ReleaseFamily, 'UNKNOWN'>, readonly LicenseIssueType[]> = {
    LEGACY: ['ACTIVATION', 'TRANSFER', 'OFFLINE', 'OTHER'],
    CODEMETER: ['ACTIVATION', 'TRANSFER', 'OFFLINE', 'OTHER'],
    CLOUD: ['ACTIVATION', 'LOGIN', 'INVITATION', 'SEAT', 'OFFLINE', 'OTHER'],
};

export const canonicalizeAllplanRelease = (raw?: string): string | undefined => {
    if (!raw) return undefined;
    const input = raw.replace(/\s+/g, ' ').trim().slice(0, 128);
    const match = /^(?:allplan\s+)?(20\d{2})(?:[-.]([0-9]+)(?:[-.]([0-9]+))?)?(?:\s+.*)?$/i.exec(input);
    if (!match) return undefined;
    return [match[1], match[2], match[3]].filter(part => part !== undefined).join('-');
};

const classifyStrictRelease = (raw: string): ReleaseFamily => {
    const version = canonicalizeAllplanRelease(raw);
    if (!version) return 'UNKNOWN';
    const match = /^(20\d{2})(?:-([0-9]+)(?:-([0-9]+))?)?$/.exec(version);
    if (!match) return 'UNKNOWN';
    const year = Number(match[1]);
    const minor = match[2] === undefined ? undefined : Number(match[2]);
    const patch = match[3] === undefined ? 0 : Number(match[3]);
    if (year <= 2015) return 'LEGACY';
    if (year >= 2025) return 'CLOUD';
    if (year >= 2016 && year <= 2023) return 'CODEMETER';
    if (year !== 2024 || minor === undefined || match[3] === undefined) return 'UNKNOWN';
    if (minor < 1 || (minor === 1 && patch <= 10)) return 'CODEMETER';
    if (minor >= 2) return 'CLOUD';
    return 'UNKNOWN';
};

@Injectable()
export class AllplanLicensingPolicyService {
    constructor(private readonly prisma: PrismaService) {}

    async validate(
        workflowKey?: 'GENERIC' | 'ALLPLAN_LICENSING',
        productId?: string,
        intake?: AllplanLicensingIntake,
    ): Promise<ValidatedAllplanLicensingContext | undefined> {
        if (workflowKey !== 'ALLPLAN_LICENSING') {
            if (intake) throw new BadRequestException('Licensing intake requires the ALLPLAN licensing workflow.');
            return undefined;
        }
        if (!intake) throw new BadRequestException('ALLPLAN licensing intake is required for this workflow.');
        if (!productId) throw new BadRequestException('ALLPLAN licensing diagnosis requires a product.');

        const product = await this.prisma.product.findFirst({
            where: { id: productId, isActive: true, deletedAt: null },
            select: { name: true },
        });
        if (product?.name.trim().toUpperCase() !== 'ALLPLAN') {
            throw new BadRequestException('The ALLPLAN licensing workflow is only available for the ALLPLAN product.');
        }

        const family = classifyStrictRelease(intake.allplanVersion);
        if (family === 'UNKNOWN') {
            throw new BadRequestException({ message: 'Exact ALLPLAN release/build is required.', missingFields: ['allplanVersion'] });
        }

        const missingFields: string[] = [];
        if (!intake.licenseIssueType || !ALLOWED_ISSUES[family].includes(intake.licenseIssueType)) missingFields.push('licenseIssueType');
        if ((family === 'LEGACY' || family === 'CODEMETER')
            && (!intake.licenseTopology || intake.licenseTopology === 'UNKNOWN')) {
            missingFields.push('licenseTopology');
        }
        if (family === 'CLOUD') {
            if (!intake.allplanIdStatus || intake.allplanIdStatus === 'UNKNOWN') missingFields.push('allplanIdStatus');
            if (!intake.organizationInviteStatus || intake.organizationInviteStatus === 'UNKNOWN') missingFields.push('organizationInviteStatus');
            if (!intake.licenseGroupStatus || intake.licenseGroupStatus === 'UNKNOWN') missingFields.push('licenseGroupStatus');
            if (!intake.licenseUserRole || intake.licenseUserRole === 'UNKNOWN') missingFields.push('licenseUserRole');
        }
        if (missingFields.length > 0) {
            throw new BadRequestException({ message: 'ALLPLAN licensing intake is incomplete.', missingFields });
        }

        const allplanVersion = canonicalizeAllplanRelease(intake.allplanVersion)!;
        const promptContext = [
            '[VALIDATED ALLPLAN LICENSING INTAKE - use this data when routing the answer]',
            `Release: ${allplanVersion}`,
            `Release family: ${family}`,
            `Issue: ${intake.licenseIssueType}`,
            family === 'CLOUD' ? `User role: ${intake.licenseUserRole}` : `License topology: ${intake.licenseTopology}`,
            ...(family === 'CLOUD' ? [
                `ALLPLAN ID access: ${intake.allplanIdStatus}`,
                `Organization invitation: ${intake.organizationInviteStatus}`,
                `License group visibility: ${intake.licenseGroupStatus}`,
            ] : []),
        ].join('\n');
        return { allplanVersion, promptContext };
    }
}

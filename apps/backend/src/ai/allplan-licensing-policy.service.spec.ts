import { BadRequestException } from '@nestjs/common';
import { AllplanLicensingPolicyService } from './allplan-licensing-policy.service';

describe('AllplanLicensingPolicyService', () => {
    const prisma = { product: { findFirst: jest.fn() } } as any;
    const service = new AllplanLicensingPolicyService(prisma);

    beforeEach(() => jest.clearAllMocks());

    it('does not apply ALLPLAN rules without a licensing intake', async () => {
        await expect(service.validate(undefined, undefined, undefined)).resolves.toBeUndefined();
        expect(prisma.product.findFirst).not.toHaveBeenCalled();
    });

    it('requires intake when the ALLPLAN licensing workflow is selected', async () => {
        await expect(service.validate('ALLPLAN_LICENSING', undefined, undefined))
            .rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects structured intake outside the ALLPLAN licensing workflow', async () => {
        await expect(service.validate('GENERIC', undefined, {
            categoryKey: 'licensing', allplanVersion: '2026', licenseIssueType: 'LOGIN',
        })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects licensing intake for a non-ALLPLAN product', async () => {
        prisma.product.findFirst.mockResolvedValue({ name: 'SCIA' });
        await expect(service.validate('ALLPLAN_LICENSING', '00000000-0000-4000-8000-000000000001', {
            categoryKey: 'licensing', allplanVersion: '2026', licenseIssueType: 'LOGIN',
            licenseUserRole: 'END_USER', allplanIdStatus: 'AVAILABLE',
            organizationInviteStatus: 'ACCEPTED', licenseGroupStatus: 'ASSIGNED',
        })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('accepts the CodeMeter boundary with topology and issue', async () => {
        prisma.product.findFirst.mockResolvedValue({ name: 'ALLPLAN' });
        await expect(service.validate('ALLPLAN_LICENSING', '00000000-0000-4000-8000-000000000001', {
            categoryKey: 'licensing', allplanVersion: '2024-1-10',
            licenseTopology: 'SINGLE_USER', licenseIssueType: 'ACTIVATION',
        })).resolves.toMatchObject({ allplanVersion: '2024-1-10', promptContext: expect.stringContaining('Release family: CODEMETER') });
    });

    it.each([
        ['UP_TO_2024_1_10', 'CODEMETER'],
        ['FROM_2024_2_0', 'CLOUD'],
    ] as const)('routes a bare 2024 release with the selected %s transition band', async (allplan2024ReleaseBand, expectedFamily) => {
        prisma.product.findFirst.mockResolvedValue({ name: 'ALLPLAN' });
        const common = {
            categoryKey: 'licensing' as const,
            allplanVersion: '2024',
            allplan2024ReleaseBand,
            licenseIssueType: 'ACTIVATION' as const,
        };
        const releaseSpecific = expectedFamily === 'CODEMETER'
            ? { licenseTopology: 'SINGLE_USER' as const }
            : {
                licenseUserRole: 'END_USER' as const,
                allplanIdStatus: 'AVAILABLE' as const,
                organizationInviteStatus: 'ACCEPTED' as const,
                licenseGroupStatus: 'ASSIGNED' as const,
            };

        await expect(service.validate(
            'ALLPLAN_LICENSING',
            '00000000-0000-4000-8000-000000000001',
            { ...common, ...releaseSpecific },
        )).resolves.toMatchObject({
            allplanVersion: '2024',
            promptContext: expect.stringContaining(`Release family: ${expectedFamily}`),
        });
    });

    it('requires the transition band instead of an exact build for a bare 2024 release', async () => {
        prisma.product.findFirst.mockResolvedValue({ name: 'ALLPLAN' });

        await expect(service.validate('ALLPLAN_LICENSING', '00000000-0000-4000-8000-000000000001', {
            categoryKey: 'licensing', allplanVersion: '2024', licenseIssueType: 'ACTIVATION',
        })).rejects.toMatchObject({
            response: expect.objectContaining({ missingFields: ['allplan2024ReleaseBand'] }),
        });
    });

    it('keeps an unknown 2024 transition band fail-closed for AI diagnosis', async () => {
        prisma.product.findFirst.mockResolvedValue({ name: 'ALLPLAN' });

        await expect(service.validate('ALLPLAN_LICENSING', '00000000-0000-4000-8000-000000000001', {
            categoryKey: 'licensing',
            allplanVersion: '2024',
            allplan2024ReleaseBand: 'UNKNOWN',
            licenseIssueType: 'ACTIVATION',
        })).rejects.toMatchObject({
            response: expect.objectContaining({ missingFields: ['allplan2024ReleaseBand'] }),
        });
    });

    it.each(['2024-0-0', '2024-0-5'])('keeps pre-2024-1 release %s in CodeMeter', async (version) => {
        prisma.product.findFirst.mockResolvedValue({ name: 'ALLPLAN' });
        await expect(service.validate('ALLPLAN_LICENSING', '00000000-0000-4000-8000-000000000001', {
            categoryKey: 'licensing', allplanVersion: version,
            licenseTopology: 'LICENSE_SERVER', licenseIssueType: 'ACTIVATION',
        })).resolves.toMatchObject({ allplanVersion: version });
    });

    it('rejects cloud-only issue types for CodeMeter releases', async () => {
        prisma.product.findFirst.mockResolvedValue({ name: 'ALLPLAN' });
        await expect(service.validate('ALLPLAN_LICENSING', '00000000-0000-4000-8000-000000000001', {
            categoryKey: 'licensing', allplanVersion: '2023',
            licenseTopology: 'SINGLE_USER', licenseIssueType: 'INVITATION',
        })).rejects.toMatchObject({
            response: expect.objectContaining({ missingFields: expect.arrayContaining(['licenseIssueType']) }),
        });
    });

    it('accepts and canonicalizes a real Hotinfo release line', async () => {
        prisma.product.findFirst.mockResolvedValue({ name: 'ALLPLAN' });
        await expect(service.validate('ALLPLAN_LICENSING', '00000000-0000-4000-8000-000000000001', {
            categoryKey: 'licensing', allplanVersion: 'Allplan 2026-1-3 Unicode 64-bit',
            licenseIssueType: 'LOGIN', licenseUserRole: 'END_USER',
            allplanIdStatus: 'AVAILABLE', organizationInviteStatus: 'ACCEPTED', licenseGroupStatus: 'ASSIGNED',
        })).resolves.toMatchObject({ allplanVersion: '2026-1-3' });
    });

    it('requires cloud identity and organization answers at 2024-2-0', async () => {
        prisma.product.findFirst.mockResolvedValue({ name: 'ALLPLAN' });
        await expect(service.validate('ALLPLAN_LICENSING', '00000000-0000-4000-8000-000000000001', {
            categoryKey: 'licensing', allplanVersion: '2024-2-0', licenseIssueType: 'LOGIN',
        })).rejects.toMatchObject({ response: expect.objectContaining({ missingFields: expect.arrayContaining(['allplanIdStatus', 'licenseGroupStatus']) }) });
    });

    it.each(['2024-1', '2024-1-11', 'vNext', 'v2026', 'foo2026bar'])('fails closed for ambiguous version %s', async (version) => {
        prisma.product.findFirst.mockResolvedValue({ name: 'ALLPLAN' });
        await expect(service.validate('ALLPLAN_LICENSING', '00000000-0000-4000-8000-000000000001', {
            categoryKey: 'licensing', allplanVersion: version, licenseIssueType: 'ACTIVATION',
        })).rejects.toBeInstanceOf(BadRequestException);
    });
});

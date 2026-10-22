import { BadRequestException } from '@nestjs/common';
import { AllplanLicensingPolicyService, canonicalizeAllplanRelease } from './allplan-licensing-policy.service';

describe('AllplanLicensingPolicyService', () => {
    const prisma = {
        product: {
            findFirst: jest.fn().mockResolvedValue({ name: 'ALLPLAN' }),
        },
    };
    const service = new AllplanLicensingPolicyService(prisma as never);

    beforeEach(() => jest.clearAllMocks());

    it.each(['2024-2', '2024-2-0', '2025', '2026', '2027'])(
        'accepts the same cloud intake for %s',
        async (allplanVersion) => {
            const result = await service.validate('ALLPLAN_LICENSING', 'product-1', {
                categoryKey: 'licensing',
                allplanVersion,
                licenseIssueType: 'LOGIN',
                licenseUserRole: 'LICENSE_ADMIN',
            });

            expect(result?.promptContext).toContain('Release family: CLOUD');
            expect(result?.promptContext).toContain('User role: LICENSE_ADMIN');
            expect(result?.promptContext).not.toMatch(/invitation|group visibility|ALLPLAN ID access/i);
        },
    );

    it('accepts only the agreed cloud issues', async () => {
        for (const licenseIssueType of ['LOGIN', 'SEAT', 'OFFLINE'] as const) {
            await expect(service.validate('ALLPLAN_LICENSING', 'product-1', {
                categoryKey: 'licensing',
                allplanVersion: '2026',
                licenseIssueType,
                licenseUserRole: 'LICENSE_ADMIN',
            })).resolves.toBeDefined();
        }
    });

    it.each(['ACTIVATION', 'INVITATION', 'OTHER'] as const)(
        'rejects deprecated cloud issue %s',
        async (licenseIssueType) => {
            await expect(service.validate('ALLPLAN_LICENSING', 'product-1', {
                categoryKey: 'licensing',
                allplanVersion: '2026',
                licenseIssueType,
                licenseUserRole: 'LICENSE_ADMIN',
            })).rejects.toMatchObject({
                response: expect.objectContaining({ missingFields: expect.arrayContaining(['licenseIssueType']) }),
            });
        },
    );

    it('requires the fixed Connect license-admin role', async () => {
        await expect(service.validate('ALLPLAN_LICENSING', 'product-1', {
            categoryKey: 'licensing',
            allplanVersion: '2026',
            licenseIssueType: 'LOGIN',
            licenseUserRole: 'END_USER',
        })).rejects.toMatchObject({
            response: expect.objectContaining({ missingFields: expect.arrayContaining(['licenseUserRole']) }),
        });
    });

    it('ignores deprecated cloud discriminator fields from old clients', async () => {
        await expect(service.validate('ALLPLAN_LICENSING', 'product-1', {
            categoryKey: 'licensing',
            allplanVersion: '2025',
            licenseIssueType: 'SEAT',
            licenseUserRole: 'LICENSE_ADMIN',
            allplanIdStatus: 'UNKNOWN',
            organizationInviteStatus: 'UNKNOWN',
            licenseGroupStatus: 'UNKNOWN',
        })).resolves.toBeDefined();
    });

    it('keeps 2024 unresolved until the release band is supplied', async () => {
        await expect(service.validate('ALLPLAN_LICENSING', 'product-1', {
            categoryKey: 'licensing',
            allplanVersion: '2024',
            licenseIssueType: 'LOGIN',
            licenseUserRole: 'LICENSE_ADMIN',
        })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('keeps the pre-cloud topology contract and new format/reinstall issue', async () => {
        const result = await service.validate('ALLPLAN_LICENSING', 'product-1', {
            categoryKey: 'licensing',
            allplanVersion: '2023',
            licenseTopology: 'SINGLE_USER',
            licenseIssueType: 'FORMAT_REINSTALL',
        });
        expect(result?.promptContext).toContain('License topology: SINGLE_USER');
    });

    it('canonicalizes safe ALLPLAN release strings', () => {
        expect(canonicalizeAllplanRelease('ALLPLAN 2024-2')).toBe('2024-2');
        expect(canonicalizeAllplanRelease('something 2026')).toBeUndefined();
    });

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
        prisma.product.findFirst.mockResolvedValueOnce({ name: 'SCIA' });
        await expect(service.validate('ALLPLAN_LICENSING', 'product-1', {
            categoryKey: 'licensing', allplanVersion: '2026', licenseIssueType: 'LOGIN',
            licenseUserRole: 'LICENSE_ADMIN',
        })).rejects.toBeInstanceOf(BadRequestException);
    });

    it.each([
        ['UP_TO_2024_1_10', 'CODEMETER', 'ACTIVATION', 'SINGLE_USER'],
        ['FROM_2024_2_0', 'CLOUD', 'LOGIN', undefined],
    ] as const)('routes bare 2024 band %s to %s', async (band, family, issue, topology) => {
        await expect(service.validate('ALLPLAN_LICENSING', 'product-1', {
            categoryKey: 'licensing',
            allplanVersion: '2024',
            allplan2024ReleaseBand: band,
            licenseIssueType: issue,
            ...(topology ? { licenseTopology: topology } : { licenseUserRole: 'LICENSE_ADMIN' as const }),
        })).resolves.toMatchObject({ promptContext: expect.stringContaining(`Release family: ${family}`) });
    });

    it('keeps an unknown 2024 transition band fail-closed', async () => {
        await expect(service.validate('ALLPLAN_LICENSING', 'product-1', {
            categoryKey: 'licensing', allplanVersion: '2024',
            allplan2024ReleaseBand: 'UNKNOWN', licenseIssueType: 'ACTIVATION',
        })).rejects.toMatchObject({
            response: expect.objectContaining({ missingFields: ['allplan2024ReleaseBand'] }),
        });
    });

    it.each(['2024-1', '2024-1-11', 'vNext', 'v2026', 'foo2026bar'])(
        'fails closed for ambiguous version %s',
        async version => {
            await expect(service.validate('ALLPLAN_LICENSING', 'product-1', {
                categoryKey: 'licensing', allplanVersion: version, licenseIssueType: 'ACTIVATION',
            })).rejects.toBeInstanceOf(BadRequestException);
        },
    );

    it('rejects cloud-only issue types for CodeMeter releases', async () => {
        await expect(service.validate('ALLPLAN_LICENSING', 'product-1', {
            categoryKey: 'licensing', allplanVersion: '2023',
            licenseTopology: 'SINGLE_USER', licenseIssueType: 'LOGIN',
        })).rejects.toMatchObject({
            response: expect.objectContaining({ missingFields: expect.arrayContaining(['licenseIssueType']) }),
        });
    });
});

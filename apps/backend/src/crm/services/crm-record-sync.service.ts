import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type EntityType = 'account' | 'contact';
type SyncSource = 'FULL_IMPORT' | 'DELTA_SYNC' | 'WEBHOOK';

interface SyncOptions {
    connectionId?: string;
    source?: SyncSource;
    recordChanges?: boolean;
}

interface ChangeCandidate {
    fieldName: string;
    oldValue: unknown;
    newValue: unknown;
}

@Injectable()
export class CrmRecordSyncService {
    private readonly logger = new Logger(CrmRecordSyncService.name);

    constructor(private readonly prisma: PrismaService) { }

    async upsertAccountFromDynamics(data: any, config?: any, options: SyncOptions = {}) {
        const mappings = (config?.syncSettings?.accountMapping || {}) as Record<string, string>;

        const externalId = this.resolveField(data, 'externalAccountId', mappings, 'accountid');
        if (!externalId) {
            this.logger.warn('CRM account sync skipped because external account id is missing');
            return null;
        }

        const next = {
            name: this.resolveField(data, 'name', mappings, 'name') || 'Unknown',
            website: this.resolveField(data, 'website', mappings, 'websiteurl'),
            address: this.resolveField(data, 'address', mappings, 'address1_composite'),
            industry: this.asNullableString(
                this.resolveField(data, 'industry', mappings, 'industrycode@OData.Community.Display.V1.FormattedValue')
                || data.industrycode_display,
            ),
            account_number: this.resolveField(data, 'accountNumber', mappings, 'accountnumber'),
            crmVerified: true,
        };

        const existing = await this.prisma.crmAccount.findUnique({
            where: { externalAccountId: externalId },
        });

        const account = await this.prisma.crmAccount.upsert({
            where: { externalAccountId: externalId },
            update: next,
            create: {
                ...next,
                externalAccountId: externalId,
            },
        });

        await this.prisma.customerProfile.updateMany({
            where: { accountId: account.id },
            data: {
                companyName: next.name,
                industry: next.industry,
            },
        });

        await this.recordChanges('account', externalId, account.id, existing, next, options);
        return account;
    }

    async upsertContactFromDynamics(data: any, config?: any, options: SyncOptions = {}) {
        const mappings = (config?.syncSettings?.contactMapping || {}) as Record<string, string>;
        const contactId = this.resolveField(data, 'externalContactId', mappings, 'contactid') || data.contactid;
        if (!contactId) {
            this.logger.warn('CRM contact sync skipped because external contact id is missing');
            return null;
        }

        let email = this.resolveField(data, 'email', mappings, 'emailaddress1') || data.emailaddress1;
        let isPlaceholderEmail = false;

        if (!email) {
            email = `no-email-${contactId}@internal.aluplan`;
            isPlaceholderEmail = true;
        }

        const adminEmails = (process.env.ADMIN_BYPASS_EMAILS || '')
            .split(',')
            .map(e => e.trim().toLowerCase())
            .filter(Boolean);

        if (adminEmails.includes(String(email).toLowerCase())) {
            this.logger.warn(`CRM contact sync skipped for protected admin email: ${email}`);
            return null;
        }

        const parentExternalAccountId = data.parentcustomerid_account?.accountid || data._parentcustomerid_value || null;

        return this.prisma.$transaction(async (tx) => {
            let customerRole = await tx.role.findFirst({
                where: { name: { equals: 'CUSTOMER', mode: 'insensitive' } },
            });

            if (!customerRole) {
                customerRole = await tx.role.create({
                    data: { name: 'CUSTOMER', isSystem: true, description: 'Default role for CRM-synced customers' },
                });
            }

            let user = await tx.user.findUnique({ where: { email } });
            if (!user) {
                user = await tx.user.create({
                    data: {
                        email,
                        fullName: `${data.firstname || ''} ${data.lastname || ''}`.trim() || 'CRM Contact',
                        status: isPlaceholderEmail ? 'INACTIVE' : 'ACTIVE',
                        passwordHash: 'CRM_SYNCED',
                        roleId: customerRole.id,
                    },
                });
            } else {
                const currentRole = user.roleId
                    ? await tx.role.findUnique({ where: { id: user.roleId } })
                    : null;
                const isAlreadyCustomer = currentRole?.name.toUpperCase() === 'CUSTOMER';

                if ((isAlreadyCustomer || !currentRole) && user.roleId !== customerRole.id) {
                    user = await tx.user.update({
                        where: { id: user.id },
                        data: { roleId: customerRole.id },
                    });
                }

                if (!isPlaceholderEmail && user.status === 'INACTIVE' && user.passwordHash === 'CRM_SYNCED') {
                    user = await tx.user.update({
                        where: { id: user.id },
                        data: { status: 'ACTIVE' },
                    });
                }
            }

            let linkedAccountId: string | null = null;
            let accountInfo: any = null;
            if (parentExternalAccountId) {
                accountInfo = await tx.crmAccount.findUnique({
                    where: { externalAccountId: parentExternalAccountId },
                });
                linkedAccountId = accountInfo?.id ?? null;
            }

            const firstName = this.resolveField(data, 'fullName', mappings, 'firstname') || data.firstname || '-';
            const lastName = this.resolveField(data, 'lastName', mappings, 'lastname') || data.lastname || '-';
            const jobTitle = this.resolveField(data, 'jobTitle', mappings, 'jobtitle') || data.jobtitle || null;
            const phoneNumber = this.resolveField(data, 'phoneNumber', mappings, 'telephone1') || data.telephone1 || null;
            const contractStatus = this.resolveField(data, 'contractStatus', mappings, 'new_musteridurumu@OData.Community.Display.V1.FormattedValue')
                || data.new_musteridurumu_display
                || null;
            const subscriptionModel = this.resolveField(data, 'subscriptionModel', mappings, 'new_AbonelikModeli') || null;
            const industryFromAccount = this.asNullableString(accountInfo?.industry
                || data.parentcustomerid_account?.['industrycode@OData.Community.Display.V1.FormattedValue']
                || null);
            const companyName = this.resolveField(data, 'companyName', mappings, 'parentcustomerid_account.name')
                || data.parentcustomerid_account?.name
                || accountInfo?.name
                || 'Unknown';
            const mappedNo = this.resolveField(data, 'customerNo', mappings, 'new_customerid');
            const accountNum = accountInfo?.account_number || data.parentcustomerid_account?.accountnumber || data.accountnumber;
            const customerNo = mappedNo && mappedNo !== '-'
                ? mappedNo
                : accountNum
                    ? `${accountNum}-${String(contactId).substring(0, 5)}`
                    : `DYN-${String(contactId).substring(0, 10)}`;

            const existingProfile = await tx.customerProfile.findUnique({
                where: { userId: user.id },
            });

            const profileData = {
                firstName,
                lastName,
                jobTitle,
                phoneNumber,
                companyName,
                accountId: linkedAccountId,
                externalContactId: contactId,
                customerNo,
                contractStatus,
                subscriptionModel,
                industry: industryFromAccount,
                crmVerified: true,
            };

            const profile = existingProfile
                ? await tx.customerProfile.update({
                    where: { id: existingProfile.id },
                    data: profileData,
                })
                : await tx.customerProfile.create({
                    data: {
                        ...profileData,
                        userId: user.id,
                    },
                });

            await this.recordChanges('contact', contactId, profile.id, existingProfile, profileData, options, tx);
            return profile;
        });
    }

    async reconcileLinkedCustomerProfileSnapshots(): Promise<number> {
        const accounts = await this.prisma.crmAccount.findMany({
            select: {
                id: true,
                name: true,
                industry: true,
                customers: {
                    select: {
                        id: true,
                        companyName: true,
                        industry: true,
                    },
                },
            },
        });

        let updatedCount = 0;
        for (const account of accounts) {
            const staleProfileIds = account.customers
                .filter(profile => profile.companyName !== account.name || profile.industry !== account.industry)
                .map(profile => profile.id);

            if (staleProfileIds.length === 0) continue;

            const result = await this.prisma.customerProfile.updateMany({
                where: { id: { in: staleProfileIds } },
                data: {
                    companyName: account.name,
                    industry: account.industry,
                },
            });
            updatedCount += result.count;
        }

        return updatedCount;
    }

    private async recordChanges(
        entityType: EntityType,
        entityId: string,
        localRecordId: string,
        existing: any,
        next: Record<string, unknown>,
        options: SyncOptions,
        tx?: any,
    ) {
        if (!options.recordChanges || !existing) return;

        const changes: ChangeCandidate[] = Object.entries(next)
            .filter(([fieldName]) => fieldName !== 'crmVerified')
            .map(([fieldName, newValue]) => ({
                fieldName,
                oldValue: existing[fieldName],
                newValue,
            }))
            .filter(change => this.stringifyValue(change.oldValue) !== this.stringifyValue(change.newValue));

        if (changes.length === 0) return;

        const client = tx ?? this.prisma;
        await client.crmChangeLog.createMany({
            data: changes.map(change => ({
                connectionId: options.connectionId ?? null,
                entityType,
                entityId,
                localRecordId,
                fieldName: change.fieldName,
                oldValue: this.stringifyValue(change.oldValue),
                newValue: this.stringifyValue(change.newValue),
                source: options.source ?? 'DELTA_SYNC',
                status: 'SUCCESS',
            })),
        });
    }

    private stringifyValue(value: unknown): string | null {
        if (value === undefined || value === null) return null;
        if (value instanceof Date) return value.toISOString();
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }

    private asNullableString(value: unknown): string | null {
        if (value === undefined || value === null || value === '') return null;
        return String(value);
    }

    private resolveField(data: any, systemKey: string, mappings: Record<string, string>, defaultKey: string): any {
        const rawKey = mappings[systemKey] || defaultKey;
        const crmKey = rawKey.toLowerCase();

        const dataLower: Record<string, any> = {};
        for (const k of Object.keys(data || {})) {
            dataLower[k.toLowerCase()] = data[k];
        }

        if (crmKey.includes('@odata')) {
            const val = dataLower[crmKey];
            if (val !== undefined && val !== null && val !== '') return val;
            const baseKey = crmKey.split('@')[0];
            return dataLower[baseKey] ?? null;
        }

        const formattedKey = `${crmKey}@odata.community.display.v1.formattedvalue`;
        if (dataLower[formattedKey] !== undefined && dataLower[formattedKey] !== null && dataLower[formattedKey] !== '') {
            return dataLower[formattedKey];
        }

        if (crmKey.includes('.')) {
            const parts = crmKey.split('.');
            let val = data;
            for (const part of parts) {
                val = val?.[part];
            }
            return val;
        }

        return dataLower[crmKey] ?? null;
    }
}

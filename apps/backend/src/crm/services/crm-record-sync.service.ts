import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { normalizeEmailAddress } from '../../common/utils/email-normalization.util';

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

    constructor(private readonly prisma: PrismaService) {}

    resolveExternalIdFromDynamics(data: any, config: any, entityType: EntityType): string | null {
        const isAccount = entityType === 'account';
        const mappings = (isAccount ? config?.syncSettings?.accountMapping : config?.syncSettings?.contactMapping) || {};
        const value = isAccount
            ? this.resolveField(data, 'externalAccountId', mappings, 'accountid')
            : this.resolveField(data, 'externalContactId', mappings, 'contactid') || data.contactid;
        return value === undefined || value === null || String(value).trim() === '' ? null : String(value);
    }

    async upsertAccountFromDynamics(data: any, config?: any, options: SyncOptions = {}) {
        const mappings = (config?.syncSettings?.accountMapping || {}) as Record<string, string>;

        const externalId = this.resolveExternalIdFromDynamics(data, config, 'account');
        if (!externalId) {
            this.logger.warn('CRM account sync skipped because external account id is missing');
            return null;
        }

        const next = {
            name: this.limitString(this.resolveField(data, 'name', mappings, 'name') || 'Unknown', 255),
            website: this.asNullableString(this.resolveField(data, 'website', mappings, 'websiteurl'), 255),
            address: this.asNullableString(this.resolveField(data, 'address', mappings, 'address1_composite')),
            serviceAddress: this.asNullableString(
                this.resolveFirstField(data, 'serviceAddress', mappings, ['address1_composite', 'address1_line1', 'address1_name']),
            ),
            industry: this.asNullableString(
                this.resolveField(data, 'industry', mappings, 'industrycode@OData.Community.Display.V1.FormattedValue') || data.industrycode_display,
                255,
            ),
            account_number: this.asNullableString(this.resolveField(data, 'accountNumber', mappings, 'accountnumber'), 255),
            clientIdFrilo: this.asNullableString(
                this.resolveFirstField(data, 'clientIdFrilo', mappings, [
                    'new_clientidfrilo',
                    'new_clientid_frilo',
                    'new_friloclientid',
                    'new_frilo_clientid',
                    'new_friloid',
                ]),
                255,
            ),
            phone: this.asNullableString(this.resolveFirstField(data, 'phone', mappings, ['telephone1', 'telephone2', 'telephone3']), 50),
            fax: this.asNullableString(this.resolveFirstField(data, 'fax', mappings, ['fax']), 50),
            licenseManagerName: this.asNullableString(
                this.resolveFirstField(data, 'licenseManagerName', mappings, [
                    'new_lisansyoneticisiisimsoyisim',
                    'new_lisans_yoneticisi_isim_soyisim',
                    'new_licensemanagername',
                    'new_license_manager_name',
                ]),
                255,
            ),
            rawCrmPayload: data,
            crmVerified: true,
            deletedAt: null,
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
        const contactId = this.resolveExternalIdFromDynamics(data, config, 'contact');
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
        email = normalizeEmailAddress(email);

        const adminEmails = (process.env.ADMIN_BYPASS_EMAILS || '')
            .split(',')
            .map((e) => e.trim().toLowerCase())
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
                    data: {
                        name: 'CUSTOMER',
                        isSystem: true,
                        description: 'Default role for CRM-synced customers',
                    },
                });
            }

            const existingProfileByContactId = await tx.customerProfile.findUnique({
                where: { externalContactId: contactId },
                include: { user: true },
            });

            let user = existingProfileByContactId?.user ?? (await tx.user.findFirst({
                where: { email: { equals: email, mode: 'insensitive' } },
            }));
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
                const currentRole = user.roleId ? await tx.role.findUnique({ where: { id: user.roleId } }) : null;
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

                if (!isPlaceholderEmail && user.email !== email) {
                    const emailOwner = await tx.user.findFirst({
                        where: { email: { equals: email, mode: 'insensitive' } },
                    });
                    if (!emailOwner || emailOwner.id === user.id) {
                        user = await tx.user.update({
                            where: { id: user.id },
                            data: { email },
                        });
                    } else {
                        this.logger.warn(`CRM contact email update skipped because ${email} already belongs to another user`);
                    }
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

            const firstName = this.limitString(this.resolveField(data, 'fullName', mappings, 'firstname') || data.firstname || '-', 100);
            const lastName = this.limitString(this.resolveField(data, 'lastName', mappings, 'lastname') || data.lastname || '-', 100);
            const jobTitle = this.asNullableString(this.resolveField(data, 'jobTitle', mappings, 'jobtitle') || data.jobtitle, 255);
            const phoneNumber = this.asNullableString(this.resolveFirstField(data, 'phoneNumber', mappings, ['telephone1', 'telephone2', 'telephone3']), 50);
            const fax = this.asNullableString(this.resolveFirstField(data, 'fax', mappings, ['fax']), 50);
            const mobilePhone = this.asNullableString(this.resolveFirstField(data, 'mobilePhone', mappings, ['mobilephone']), 50);
            const address = this.asNullableString(this.resolveFirstField(data, 'address', mappings, ['address1_composite', 'address1_line1', 'address1_name']));
            const primaryTimeZone = this.asNullableString(
                this.resolveFirstField(data, 'primaryTimeZone', mappings, ['timezoneruleversionnumber', 'utcconversiontimezonecode']),
                100,
            );
            const preferredContactMethod = this.asNullableString(
                this.resolveFirstField(data, 'preferredContactMethod', mappings, ['preferredcontactmethodcode']),
                100,
            );
            const contractStatus = this.asNullableString(
                this.resolveField(data, 'contractStatus', mappings, 'new_musteridurumu@OData.Community.Display.V1.FormattedValue') ||
                    data.new_musteridurumu_display ||
                    null,
                100,
            );
            const subscriptionModel = this.asNullableString(this.resolveField(data, 'subscriptionModel', mappings, 'new_AbonelikModeli'), 100);
            const industryFromAccount = this.asNullableString(
                accountInfo?.industry || data.parentcustomerid_account?.['industrycode@OData.Community.Display.V1.FormattedValue'] || null,
                255,
            );
            const companyName = this.limitString(
                this.resolveField(data, 'companyName', mappings, 'parentcustomerid_account.name') ||
                    data.parentcustomerid_account?.name ||
                    accountInfo?.name ||
                    'Unknown',
                255,
            );
            const mappedNo = this.resolveField(data, 'customerNo', mappings, 'new_customerid');
            const accountNum = accountInfo?.account_number || data.parentcustomerid_account?.accountnumber || data.accountnumber;
            const customerNo = this.limitString(
                mappedNo && mappedNo !== '-'
                    ? mappedNo
                    : accountNum
                      ? `${accountNum}-${String(contactId).substring(0, 5)}`
                      : `DYN-${String(contactId).substring(0, 10)}`,
                50,
            );

            const existingProfile =
                existingProfileByContactId ??
                (await tx.customerProfile.findUnique({
                    where: { userId: user.id },
                }));

            const profileData = {
                firstName,
                lastName,
                jobTitle,
                phoneNumber,
                fax,
                mobilePhone,
                address,
                primaryTimeZone,
                preferredContactMethod,
                companyName,
                accountId: linkedAccountId,
                externalContactId: contactId,
                customerNo,
                contractStatus,
                subscriptionModel,
                industry: industryFromAccount,
                rawCrmPayload: data,
                crmVerified: true,
                deletedAt: null,
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

    async markAccountDeletedOrInactive(data: any, options: SyncOptions = {}) {
        const externalId = this.resolveDeletedEntityId(data, 'account');
        if (!externalId) {
            this.logger.warn('CRM account delete skipped because external account id is missing');
            return null;
        }

        const existing = await this.prisma.crmAccount.findUnique({
            where: { externalAccountId: externalId },
        });
        if (!existing) return null;

        const deletedAt = new Date();
        const account = await this.prisma.crmAccount.update({
            where: { id: existing.id },
            data: {
                deletedAt,
                crmVerified: false,
            },
        });

        await this.recordDeletionChanges('account', externalId, existing.id, existing, deletedAt, options);
        return account;
    }

    async markContactDeletedOrInactive(data: any, options: SyncOptions = {}) {
        const externalId = this.resolveDeletedEntityId(data, 'contact');
        if (!externalId) {
            this.logger.warn('CRM contact delete skipped because external contact id is missing');
            return null;
        }

        const profile = await this.prisma.customerProfile.findUnique({
            where: { externalContactId: externalId },
            include: { user: true },
        });
        if (!profile) return null;

        const deletedAt = new Date();
        await this.prisma.$transaction(async (tx) => {
            await tx.customerProfile.update({
                where: { id: profile.id },
                data: {
                    deletedAt,
                    crmVerified: false,
                },
            });

            if (this.shouldInactivateCrmSyncedUser(profile.user)) {
                await tx.user.update({
                    where: { id: profile.user.id },
                    data: { status: 'INACTIVE' },
                });
            }

            await this.recordDeletionChanges('contact', externalId, profile.id, profile, deletedAt, options, tx);
        });

        return { id: profile.id, deletedAt, crmVerified: false };
    }

    async reconcileMissingAccountsFromFullImport(activeExternalIds: Array<string | null | undefined>, options: SyncOptions = {}): Promise<number> {
        const activeIds = this.uniqueExternalIds(activeExternalIds);
        if (activeIds.length === 0) {
            this.logger.warn('CRM full-import account reconciliation skipped because active id list is empty');
            return 0;
        }

        const missingAccounts = await this.prisma.crmAccount.findMany({
            where: {
                externalAccountId: { not: null, notIn: activeIds },
                deletedAt: null,
            },
            select: {
                id: true,
                externalAccountId: true,
                crmVerified: true,
                deletedAt: true,
            },
        });

        if (missingAccounts.length === 0) return 0;

        const deletedAt = new Date();
        await this.prisma.crmAccount.updateMany({
            where: { id: { in: missingAccounts.map((account) => account.id) } },
            data: {
                deletedAt,
                crmVerified: false,
            },
        });

        if (options.recordChanges) {
            await this.prisma.crmChangeLog.createMany({
                data: missingAccounts.flatMap((account) =>
                    this.buildDeletionChangeRows('account', account.externalAccountId ?? account.id, account.id, account, deletedAt, options),
                ),
            });
        }

        return missingAccounts.length;
    }

    async reconcileMissingContactsFromFullImport(activeExternalIds: Array<string | null | undefined>, options: SyncOptions = {}): Promise<number> {
        const activeIds = this.uniqueExternalIds(activeExternalIds);
        if (activeIds.length === 0) {
            this.logger.warn('CRM full-import contact reconciliation skipped because active id list is empty');
            return 0;
        }

        const missingProfiles = await this.prisma.customerProfile.findMany({
            where: {
                externalContactId: { not: null, notIn: activeIds },
                deletedAt: null,
            },
            include: { user: true },
        });

        if (missingProfiles.length === 0) return 0;

        const deletedAt = new Date();
        await this.prisma.$transaction(async (tx) => {
            for (const profile of missingProfiles) {
                await tx.customerProfile.update({
                    where: { id: profile.id },
                    data: {
                        deletedAt,
                        crmVerified: false,
                    },
                });

                if (this.shouldInactivateCrmSyncedUser(profile.user)) {
                    await tx.user.update({
                        where: { id: profile.user.id },
                        data: { status: 'INACTIVE' },
                    });
                }
            }

            if (options.recordChanges) {
                await tx.crmChangeLog.createMany({
                    data: missingProfiles.flatMap((profile) =>
                        this.buildDeletionChangeRows('contact', profile.externalContactId ?? profile.id, profile.id, profile, deletedAt, options),
                    ),
                });
            }
        });

        return missingProfiles.length;
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
                .filter((profile) => profile.companyName !== account.name || profile.industry !== account.industry)
                .map((profile) => profile.id);

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
            .filter((change) => this.stringifyValue(change.oldValue) !== this.stringifyValue(change.newValue));

        if (changes.length === 0) return;

        const client = tx ?? this.prisma;
        await client.crmChangeLog.createMany({
            data: changes.map((change) => ({
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

    private async recordDeletionChanges(
        entityType: EntityType,
        entityId: string,
        localRecordId: string,
        existing: any,
        deletedAt: Date,
        options: SyncOptions,
        tx?: any,
    ) {
        if (!options.recordChanges) return;

        const rows = this.buildDeletionChangeRows(entityType, entityId, localRecordId, existing, deletedAt, options);
        if (rows.length === 0) return;

        const client = tx ?? this.prisma;
        await client.crmChangeLog.createMany({ data: rows });
    }

    private buildDeletionChangeRows(
        entityType: EntityType,
        entityId: string,
        localRecordId: string,
        existing: any,
        deletedAt: Date,
        options: SyncOptions,
    ) {
        const rows = [
            {
                connectionId: options.connectionId ?? null,
                entityType,
                entityId,
                localRecordId,
                fieldName: 'deletedAt',
                oldValue: this.stringifyValue(existing?.deletedAt),
                newValue: deletedAt.toISOString(),
                source: options.source ?? 'DELTA_SYNC',
                status: 'SUCCESS',
            },
        ];

        if (existing?.crmVerified !== false) {
            rows.push({
                connectionId: options.connectionId ?? null,
                entityType,
                entityId,
                localRecordId,
                fieldName: 'crmVerified',
                oldValue: this.stringifyValue(existing?.crmVerified),
                newValue: 'false',
                source: options.source ?? 'DELTA_SYNC',
                status: 'SUCCESS',
            });
        }

        return rows;
    }

    private resolveDeletedEntityId(data: any, entityType: EntityType): string | null {
        const primaryKey = entityType === 'account' ? 'accountid' : 'contactid';
        const externalKey = entityType === 'account' ? 'externalAccountId' : 'externalContactId';
        return this.asNullableString(data?.id || data?.[primaryKey] || data?.externalId || data?.[externalKey], 255);
    }

    private shouldInactivateCrmSyncedUser(user: any): boolean {
        if (!user || user.passwordHash !== 'CRM_SYNCED') return false;

        const adminEmails = (process.env.ADMIN_BYPASS_EMAILS || '')
            .split(',')
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean);

        return !adminEmails.includes(String(user.email || '').toLowerCase());
    }

    private uniqueExternalIds(values: Array<string | null | undefined>): string[] {
        return [...new Set(values.map((value) => this.asNullableString(value, 255)).filter((value): value is string => Boolean(value)))];
    }

    private stringifyValue(value: unknown): string | null {
        if (value === undefined || value === null) return null;
        if (value instanceof Date) return value.toISOString();
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }

    private limitString(value: unknown, maxLength: number): string {
        return String(value ?? '').slice(0, maxLength);
    }

    private asNullableString(value: unknown, maxLength?: number): string | null {
        if (value === undefined || value === null || value === '') return null;
        const stringValue = String(value);
        return maxLength ? stringValue.slice(0, maxLength) : stringValue;
    }

    private resolveField(data: any, systemKey: string, mappings: Record<string, string>, defaultKey: string): any {
        const rawKey = this.resolveMappedCrmKey(systemKey, mappings) || defaultKey;
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

    private resolveFirstField(data: any, systemKey: string, mappings: Record<string, string>, candidateKeys: string[]): any {
        const mapped = this.resolveMappedCrmKey(systemKey, mappings);
        if (mapped) {
            return this.resolveField(data, systemKey, mappings, mapped);
        }

        for (const candidate of candidateKeys) {
            const value = this.resolveField(data, systemKey, {}, candidate);
            if (value !== undefined && value !== null && value !== '') return value;
        }

        return null;
    }

    private resolveMappedCrmKey(systemKey: string, mappings: Record<string, string>): string | undefined {
        if (!mappings) return undefined;

        const direct = mappings[systemKey];
        if (direct) return direct;

        const normalizedSystemKey = this.normalizeMappingKey(systemKey);
        const matchingKey = Object.keys(mappings).find((key) => this.normalizeMappingKey(key) === normalizedSystemKey);
        return matchingKey ? mappings[matchingKey] : undefined;
    }

    private normalizeMappingKey(key: string): string {
        return String(key || '')
            .replace(/[^a-z0-9]/gi, '')
            .toLowerCase();
    }
}

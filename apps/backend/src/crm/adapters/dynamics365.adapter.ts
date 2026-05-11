import { Injectable, Logger } from '@nestjs/common';
import { CrmProvider, SyncStatus } from '@aluplan/database';
import { ICrmAdapter, SyncResult } from './crm-adapter.interface';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class Dynamics365Adapter implements ICrmAdapter {
    private readonly logger = new Logger(Dynamics365Adapter.name);
    provider = CrmProvider.DYNAMICS_365;

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) { }

    /**
     * Patch system integrity (Ghost user check)
     * In some environments, the primary admin user might be missing from DB
     * even if seeds were run. This ensures the admin specified in env exists.
     */
    async onModuleInit() {
        if (process.env.NODE_ENV === 'provision') return;

        try {
            const adminEmail = this.config.get<string>('ADMIN_EMAIL') || 'admin@example.com';
            const mainUser = await this.prisma.user.findUnique({
                where: { email: adminEmail }
            });

            if (mainUser) {
                const adminRole = await this.prisma.role.findFirst({
                    where: { name: 'ADMIN' }
                });

                if (adminRole && mainUser.roleId !== adminRole.id) {
                    await this.prisma.user.update({
                        where: { id: mainUser.id },
                        data: { roleId: adminRole.id }
                    });
                    this.logger.log(`🛡️ System Integrity: Role for ${adminEmail} updated to ADMIN.`);
                }
            }
        } catch (e: any) {
            this.logger.warn(`System integrity check failed: ${e.message}`);
        }
    }

    async verifyConnection(config: any): Promise<boolean> {
        try {
            const token = await this.getAccessToken(config);
            return !!token;
        } catch (error) {
            const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            this.logger.error(`Dynamics 365 connection verification failed: ${errorDetails}`);
            return false;
        }
    }

    async syncAccounts(config: any, onProgress?: (stats: { success: number; error: number; total: number }) => void): Promise<SyncResult> {
        try {
            const token = await this.getAccessToken(config);
            // Removed $select to ensure custom mapped fields are returned and to prevent 400 errors if a field doesn't exist
            const baseUrl = `${config.instanceUrl}/api/data/v9.2/accounts`;
            this.logger.debug(`Fetching accounts from: ${baseUrl}`);

            const headers = {
                Authorization: `Bearer ${token}`,
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                Accept: 'application/json',
                'Prefer': 'odata.include-annotations="*"',
            };

            // Pagination: follow @odata.nextLink until exhausted
            const accounts: any[] = [];
            let nextUrl: string | null = baseUrl;
            while (nextUrl) {
                const response: { status: number; data: any } = await axios.get(nextUrl, {
                    headers,
                    timeout: 30000 // 30s timeout
                });
                this.logger.debug(`Accounts page status: ${response.status}, count: ${response.data.value?.length}`);
                accounts.push(...(response.data.value ?? []));
                nextUrl = response.data['@odata.nextLink'] ?? null;
            }

            this.logger.debug(`Total accounts fetched: ${accounts.length}`);
            let successCount = 0;
            let errorCount = 0;
            const failedRecords: Array<{ externalId: string; entityType: string; errorMessage: string; errorCode?: string }> = [];

            for (const account of accounts) {
                try {
                    const mappings = (config.syncSettings?.accountMapping || {}) as Record<string, string>;

                    const name = this.resolveField(account, 'name', mappings, 'name');
                    const industry = this.resolveField(account, 'industry', mappings, 'industrycode@OData.Community.Display.V1.FormattedValue');
                    const website = this.resolveField(account, 'website', mappings, 'websiteurl');
                    const address = this.resolveField(account, 'address', mappings, 'address1_composite');
                    const externalId = this.resolveField(account, 'externalAccountId', mappings, 'accountid');
                    const accountNumber = this.resolveField(account, 'accountNumber', mappings, 'accountnumber');

                    await this.prisma.crmAccount.upsert({
                        where: { externalAccountId: externalId },
                        update: {
                            name,
                            website,
                            address,
                            industry,
                            account_number: accountNumber,
                            crmVerified: true,
                        },
                        create: {
                            name,
                            externalAccountId: externalId,
                            website,
                            address,
                            industry,
                            account_number: accountNumber,
                            crmVerified: true,
                        },
                    });

                    successCount++;
                } catch (err) {
                    this.logger.error(`Failed to sync account ${account.name}`, err.stack);
                    failedRecords.push({
                        externalId: account.accountid,
                        entityType: 'account',
                        errorMessage: err.message,
                    });
                    errorCount++;
                } finally {
                    if (onProgress) {
                        onProgress({ success: successCount, error: errorCount, total: accounts.length });
                    }
                }
            }

            return {
                status: SyncStatus.SUCCESS,
                totalRecords: accounts.length,
                successCount,
                errorCount,
                failedRecords,
            };
        } catch (error) {
            const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            this.logger.error(`Dynamics 365 account sync failed: ${errorDetails}`, error.stack);
            return {
                status: SyncStatus.ERROR,
                totalRecords: 0,
                successCount: 0,
                errorCount: 0,
                errorMessage: `Account Sync Error: ${errorDetails}`,
            };
        }
    }

    async syncContacts(config: any, onProgress?: (stats: { success: number; error: number; total: number }) => void): Promise<SyncResult> {
        try {
            const token = await this.getAccessToken(config);

            // Build URL without $select to ensure all custom mapped fields are returned safely, 
            // otherwise Dataverse throws a 400 error if a requested field doesn't exist.
            const baseUrl = `${config.instanceUrl}/api/data/v9.2/contacts?$expand=parentcustomerid_account($select=accountid,name,industrycode,accountnumber)`;
            this.logger.debug(`Fetching contacts from: ${baseUrl}`);

            const headers = {
                Authorization: `Bearer ${token}`,
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                Accept: 'application/json',
                'Prefer': 'odata.include-annotations="*"',
            };

            // Pagination: follow @odata.nextLink until exhausted
            const contacts: any[] = [];
            let nextUrl: string | null = baseUrl;
            while (nextUrl) {
                const response: { status: number; data: any } = await axios.get(nextUrl, {
                    headers,
                    timeout: 30000 // 30s timeout
                });
                this.logger.debug(`Contacts page status: ${response.status}, count: ${response.data.value?.length}`);
                contacts.push(...(response.data.value ?? []));
                nextUrl = response.data['@odata.nextLink'] ?? null;
            }

            this.logger.debug(`Total contacts fetched: ${contacts.length}`);
            let successCount = 0;
            let errorCount = 0;
            const skippedRecords: Array<{ externalId: string; reason: string }> = [];
            const skippedLinks: Array<{ contactExternalId: string; missingAccountExternalId: string }> = [];
            const failedRecords: Array<{ externalId: string; entityType: string; errorMessage: string; errorCode?: string }> = [];

            // Pre-fetch or create CUSTOMER role
            let customerRole = await this.prisma.role.findFirst({
                where: { name: { equals: 'CUSTOMER', mode: 'insensitive' } }
            });

            if (!customerRole) {
                this.logger.warn("CUSTOMER role not found, creating it systemwide");
                customerRole = await this.prisma.role.create({
                    data: { name: 'CUSTOMER', isSystem: true, description: 'Default role for CRM-synced customers' }
                });
            }
            this.logger.debug(`Using CUSTOMER role ID: ${customerRole.id}`);

            for (const contact of contacts) {
                let email = contact.emailaddress1;
                let isPlaceholderEmail = false;

                if (!email) {
                    // Placeholder Strategy: generate a deterministic internal email for visibility
                    email = `no-email-${contact.contactid}@internal.aluplan`;
                    isPlaceholderEmail = true;
                    this.logger.debug(`Contact ${contact.contactid} missing email, using placeholder: ${email}`);
                }

                try {
                    await this.prisma.$transaction(async (tx) => {
                        // 1. Find or create User
                        let user = await tx.user.findUnique({
                            where: { email: email },
                        });

                        if (!user) {
                            this.logger.debug(`Creating new user for email: ${email}`);

                            user = await tx.user.create({
                                data: {
                                    email: email,
                                    fullName: `${contact.firstname || ''} ${contact.lastname || ''}`.trim() || 'CRM Contact',
                                    status: isPlaceholderEmail ? 'INACTIVE' : 'ACTIVE',
                                    passwordHash: 'CRM_SYNCED',
                                    roleId: customerRole?.id,
                                },
                                include: { role: true }
                            });
                            this.logger.debug(`Created user ID: ${user.id} with role: ${customerRole?.name}`);
                        } else {
                            // BROADEN PROTECTION: Don't demote any user who is NOT currently a CUSTOMER
                            const currentRole = await tx.role.findUnique({ where: { id: user.roleId || '' } });
                            const isAlreadyCustomer = currentRole?.name.toUpperCase() === 'CUSTOMER';

                            if (!isAlreadyCustomer && currentRole) {
                                this.logger.debug(`Preserving protected role "${currentRole.name}" for user: ${user.email}`);
                            } else if (customerRole && user.roleId !== customerRole.id) {
                                user = await tx.user.update({
                                    where: { id: user.id },
                                    data: { roleId: customerRole.id },
                                    include: { role: true }
                                });
                                this.logger.debug(`Updated existing user ID: ${user.id} to CUSTOMER role`);
                            }

                            // Update status if it was placeholder but now has email (unlikely but safe)
                            if (!isPlaceholderEmail && user.status === 'INACTIVE' && user.passwordHash === 'CRM_SYNCED') {
                                await tx.user.update({ where: { id: user.id }, data: { status: 'ACTIVE' } });
                            }
                        }

                        // 2. Find Linked Account if any
                        let linkedAccountId: string | undefined = undefined;
                        let accountInfo: any = null;

                        if (contact.parentcustomerid_account?.accountid) {
                            accountInfo = await tx.crmAccount.findUnique({
                                where: { externalAccountId: contact.parentcustomerid_account.accountid },
                            });
                            linkedAccountId = accountInfo?.id;

                            if (!linkedAccountId) {
                                this.logger.warn(`Contact ${contact.contactid}: parent account ${contact.parentcustomerid_account.accountid} not found in DB, saving with accountId=null`);
                                skippedLinks.push({
                                    contactExternalId: contact.contactid,
                                    missingAccountExternalId: contact.parentcustomerid_account.accountid,
                                });
                            }
                        }

                        const mappings = (config.syncSettings?.contactMapping || {}) as Record<string, string>;

                        // Resolving names: if fullName is mapped specifically, use it. 
                        // Otherwise try to find firstname/lastname maps OR use defaults.
                        const firstName = this.resolveField(contact, 'fullName', mappings, 'firstname') || '-';
                        const lastName = this.resolveField(contact, 'lastName', mappings, 'lastname') || '-';
                        const jobTitle = this.resolveField(contact, 'jobTitle', mappings, 'jobtitle');
                        const phoneNumber = this.resolveField(contact, 'phoneNumber', mappings, 'telephone1');
                        const contactId = this.resolveField(contact, 'externalContactId', mappings, 'contactid');
                        const contractStatus = this.resolveField(contact, 'contractStatus', mappings, 'new_musteridurumu@OData.Community.Display.V1.FormattedValue');
                        const subscriptionModel = this.resolveField(contact, 'subscriptionModel', mappings, 'new_AbonelikModeli');

                        // industry: account expand'dan gelir, contact'ta bu veri yok
                        const industryFromAccount = accountInfo?.industry
                            || (contact.parentcustomerid_account
                                ? contact.parentcustomerid_account['industrycode@OData.Community.Display.V1.FormattedValue']
                                : null);

                        // companyName: mapping'den veya expand'dan gelen account adı
                        const companyName = this.resolveField(contact, 'companyName', mappings, 'parentcustomerid_account.name')
                            || contact.parentcustomerid_account?.name
                            || accountInfo?.name
                            || 'Unknown';

                        // customerNo: 
                        // 1. CRM Mapping'den gelen özel bir değer varsa onu kullanalım (en yüksek öncelikli)
                        // 2. Eğer o yoksa hesap numarasını (Account Number) baz alalım ama çakışmayı önlemek için contact fragment ekleyelim
                        // 3. O da yoksa contactId'den türetelim.
                        const mappedNo = this.resolveField(contact, 'customerNo', mappings, 'new_customerid');
                        let accountNum = accountInfo?.account_number
                            || contact.parentcustomerid_account?.accountnumber;

                        let clientNo: string;
                        if (mappedNo && mappedNo !== '-') {
                            clientNo = mappedNo;
                        } else if (accountNum) {
                            // Birden fazla çalışan aynı hesap numarasına sahip olabileceği için benzersizlik için ek takı kullanıyoruz
                            clientNo = `${accountNum}-${contactId.substring(0, 5)}`;
                        } else {
                            clientNo = `DYN-${contactId.substring(0, 10)}`;
                        }

                        this.logger.debug(`Generated unique customerNo: ${clientNo} for contact: ${email} (Account: ${accountNum || 'N/A'})`);

                        // 3. Sync CustomerProfile manually to bypass Prisma upsert ghost column bug
                        const existingProfile = await tx.customerProfile.findUnique({
                            where: { userId: user.id }
                        });

                        const profileData = {
                            firstName,
                            lastName,
                            jobTitle,
                            phoneNumber,
                            companyName,
                            externalContactId: contactId,
                            customerNo: clientNo,
                            contractStatus,
                            subscriptionModel: subscriptionModel || null,
                            industry: industryFromAccount || null,
                            crmVerified: true,
                        };

                        if (existingProfile) {
                            await tx.customerProfile.update({
                                where: { id: existingProfile.id },
                                data: {
                                    ...profileData,
                                    accountId: linkedAccountId || null,
                                }
                            });
                        } else {
                            await tx.customerProfile.create({
                                data: {
                                    ...profileData,
                                    user: { connect: { id: user.id } },
                                    ...(linkedAccountId ? { account: { connect: { id: linkedAccountId } } } : {}),
                                }
                            });
                        }
                    });
                    successCount++;
                } catch (err) {
                    this.logger.error(`Failed to sync contact ${contact.emailaddress1}`, err.stack);
                    failedRecords.push({
                        externalId: contact.contactid,
                        entityType: 'contact',
                        errorMessage: err.message,
                    });
                    errorCount++;
                } finally {
                    if (onProgress) {
                        onProgress({ success: successCount, error: errorCount, total: contacts.length });
                    }
                }
            }

            return {
                status: SyncStatus.SUCCESS,
                totalRecords: contacts.length,
                successCount,
                errorCount,
                skippedRecords,
                skippedLinks,
                failedRecords,
            };
        } catch (error) {
            this.logger.error('Dynamics 365 contact sync failed', error.stack);
            return {
                status: SyncStatus.ERROR,
                totalRecords: 0,
                successCount: 0,
                errorCount: 0,
                errorMessage: error.message,
            };
        }
    }

    async getDiscoveryData(config: any): Promise<any> {
        const connIdStr = `[Discovery:${config.id?.substring(0, 8) || 'unknown'}]`;
        try {
            console.log(`${connIdStr} Starting discovery...`);

            let token: string;
            try {
                token = await this.getAccessToken(config);
                console.log(`${connIdStr} Token acquired ✅`);
            } catch (tokenErr) {
                if (tokenErr.message.includes('Missing required Dynamics 365 credentials')) {
                    console.log(`${connIdStr} CRM credentials not fully configured yet. Returning empty discovery data.`);
                    return { account: [], contact: [] };
                }
                const details = tokenErr.response?.data ? JSON.stringify(tokenErr.response.data) : tokenErr.message;
                console.error(`${connIdStr} [PHASE:TOKEN] Auth rejection: ${details}`);
                throw new Error(`Authentication with Microsoft failed: ${tokenErr.message}`);
            }

            const instanceUrl = config.instanceUrl.replace(/\/+$/, '');

            // 1. Fetch Metadata (Labels) with individual logging
            console.log(`${connIdStr} Fetching account metadata...`);
            let accountFields = [];
            try {
                accountFields = await this.fetchEntityMetadata(instanceUrl, token, 'account');
            } catch (metaErr) {
                console.warn(`${connIdStr} [PHASE:ACCOUNT_META] Failed, skipping labels: ${metaErr.message}`);
            }

            console.log(`${connIdStr} Fetching contact metadata...`);
            let contactFields = [];
            try {
                contactFields = await this.fetchEntityMetadata(instanceUrl, token, 'contact');
            } catch (metaErr) {
                console.warn(`${connIdStr} [PHASE:CONTACT_META] Failed, skipping labels: ${metaErr.message}`);
            }

            // 2. Fetch Sample Records with individual logging
            console.log(`${connIdStr} Fetching account sample record...`);
            let accountSample = null;
            try {
                accountSample = await this.fetchSampleRecord(instanceUrl, token, 'accounts');
            } catch (sampErr) {
                console.warn(`${connIdStr} [PHASE:ACCOUNT_SAMPLE] Failed, no samples: ${sampErr.message}`);
            }

            console.log(`${connIdStr} Fetching contact sample record...`);
            let contactSample = null;
            try {
                contactSample = await this.fetchSampleRecord(instanceUrl, token, 'contacts');
            } catch (sampErr) {
                console.warn(`${connIdStr} [PHASE:CONTACT_SAMPLE] Failed, no samples: ${sampErr.message}`);
            }

            // 3. Map Samples to Metadata with fallback for missing metadata
            const mapSampleToFields = (fields: any[], sample: any) => {
                const results: any[] = [];
                const seenLogicalNames = new Set<string>();

                // 1. Process metadata fields
                fields.forEach(f => {
                    const logicalName = f.LogicalName;
                    results.push({
                        logicalName,
                        displayName: f.DisplayName?.UserLocalizedLabel?.Label || logicalName,
                        sampleValue: sample ? sample[logicalName] : null
                    });
                    seenLogicalNames.add(logicalName.toLowerCase());
                });

                // 2. Add extra fields from sample that weren't in metadata
                if (sample) {
                    Object.keys(sample).forEach(key => {
                        // Skip internal OData fields starting with _ or @
                        if (key.startsWith('_') || key.startsWith('@')) return;

                        if (!seenLogicalNames.has(key.toLowerCase())) {
                            results.push({
                                logicalName: key,
                                displayName: key, // fallback to logical name
                                sampleValue: sample[key]
                            });
                            seenLogicalNames.add(key.toLowerCase());
                        }
                    });
                }

                return results;
            };

            console.log(`${connIdStr} Discovery complete ✅ (Fields: A:${accountFields.length}, C:${contactFields.length})`);
            return {
                account: mapSampleToFields(accountFields, accountSample),
                contact: mapSampleToFields(contactFields, contactSample)
            };
        } catch (error) {
            const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            console.error(`${connIdStr} DISCOVERY SYSTEM ERROR: ${errorDetails}`);
            throw error;
        }
    }

    private async fetchEntityMetadata(instanceUrl: string, token: string, entityName: string) {
        // EntityDefinitions endpoint for accurate field label discovery
        const url = `${instanceUrl}/api/data/v9.2/EntityDefinitions(LogicalName='${entityName}')/Attributes?$select=LogicalName,DisplayName&$filter=IsValidForRead eq true and AttributeType ne 'Virtual'`;
        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'OData-MaxVersion': '4.0',
                    'OData-Version': '4.0',
                    Accept: 'application/json',
                    'Prefer': 'odata.include-annotations="*"'
                }
            });
            return response.data.value;
        } catch (error) {
            const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            console.warn(`[PHASE:METADATA_ALT_TRY] ${entityName} alternate fetch failed: ${errorDetails}`);

            // Fallback to minimal names if metadata fails but samples work
            return [];
        }
    }

    private async fetchSampleRecord(instanceUrl: string, token: string, entitySet: string) {
        const url = `${instanceUrl}/api/data/v9.2/${entitySet}?$top=1`;
        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'OData-MaxVersion': '4.0',
                    'OData-Version': '4.0',
                    Accept: 'application/json',
                    'Prefer': 'odata.include-annotations="*"'
                }
            });
            return response.data.value?.[0] || null;
        } catch (error) {
            const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            this.logger.error(`[SAMPLE_ERR] ${entitySet} sample fetch failed: ${errorDetails}`);
            throw error;
        }
    }

    private resolveField(data: any, systemKey: string, mappings: Record<string, string>, defaultKey: string): any {
        const rawKey = mappings[systemKey] || defaultKey;
        // Dynamics 365 OData response keys are always lowercase
        const crmKey = rawKey.toLowerCase();

        // Build a case-insensitive lookup map once per call
        const dataLower: Record<string, any> = {};
        for (const k of Object.keys(data)) {
            dataLower[k.toLowerCase()] = data[k];
        }

        // If the key already contains @OData annotation, look it up directly (case-insensitive)
        if (crmKey.includes('@odata')) {
            const val = dataLower[crmKey];
            if (val !== undefined && val !== null && val !== '') return val;
            // Fallback: strip annotation and return raw value
            const baseKey = crmKey.split('@')[0];
            return dataLower[baseKey] ?? null;
        }

        // FormattedValue önceliği: option set alanları için okunabilir metin tercih edilir
        const formattedKey = `${crmKey}@odata.community.display.v1.formattedvalue`;
        if (dataLower[formattedKey] !== undefined && dataLower[formattedKey] !== null && dataLower[formattedKey] !== '') {
            return dataLower[formattedKey];
        }

        // Dot notation desteği
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

    private async getAccessToken(config: any): Promise<string> {
        const { tenantId, clientId, clientSecret, instanceUrl: rawInstanceUrl } = config;

        // Debug Phase: Secure Parameter Verification
        const mask = (str: string) => str ? `${str.substring(0, 4)}...${str.substring(str.length - 4)}` : 'NULL';
        console.log(`[TOKEN_ACQUISITION] Params: Tenant=${mask(tenantId)} (${tenantId?.length}), ClientID=${mask(clientId)} (${clientId?.length}), Secret=${mask(clientSecret)} (${clientSecret?.length}), Instance=${rawInstanceUrl}`);

        if (!tenantId || !clientId || !clientSecret || !rawInstanceUrl) {
            throw new Error(`Missing required Dynamics 365 credentials: T:${!!tenantId}, C:${!!clientId}, S:${!!clientSecret}, U:${!!rawInstanceUrl}`);
        }

        const instanceUrl = rawInstanceUrl.replace(/\/+$/, '');
        const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('scope', `${instanceUrl}/.default`);
        params.append('client_secret', clientSecret);
        params.append('grant_type', 'client_credentials');

        try {
            const response = await axios.post(tokenUrl, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            return response.data.access_token;
        } catch (error) {
            const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            console.error(`[TOKEN_ACQUISITION_FAILED] URL: ${tokenUrl}, Error: ${errorDetails}`);
            throw error;
        }
    }
}

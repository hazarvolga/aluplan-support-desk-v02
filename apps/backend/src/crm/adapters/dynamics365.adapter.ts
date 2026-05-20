import { Injectable, Logger } from '@nestjs/common';
import { CrmProvider, SyncStatus } from '@aluplan/database';
import { ICrmAdapter, SyncResult } from './crm-adapter.interface';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CrmRecordSyncService } from '../services/crm-record-sync.service';

@Injectable()
export class Dynamics365Adapter implements ICrmAdapter {
    private readonly logger = new Logger(Dynamics365Adapter.name);
    provider = CrmProvider.DYNAMICS_365;

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
        private readonly recordSync: CrmRecordSyncService,
    ) {}


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

    async syncAccounts(config: any, onProgress?: (stats: { success: number; error: number; total: number }) => void | Promise<void>): Promise<SyncResult> {
        try {
            const accounts = await this.fetchAccounts(config);
            this.logger.debug(`Total accounts fetched: ${accounts.length}`);
            let successCount = 0;
            let errorCount = 0;
            const failedRecords: Array<{
                externalId: string;
                entityType: string;
                errorMessage: string;
                errorCode?: string;
            }> = [];

            for (const account of accounts) {
                try {
                    await this.recordSync.upsertAccountFromDynamics(account, config, {
                        connectionId: config.id,
                        source: 'FULL_IMPORT',
                        recordChanges: true,
                    });
                    successCount++;
                } catch (err) {
                    this.logger.error(`Failed to sync account ${account.name || account.accountid}`, err.stack);
                    failedRecords.push({
                        externalId: account.accountid,
                        entityType: 'account',
                        errorMessage: err.message,
                    });
                    errorCount++;
                } finally {
                    if (onProgress) {
                        await onProgress({
                            success: successCount,
                            error: errorCount,
                            total: accounts.length,
                        });
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

    async syncContacts(config: any, onProgress?: (stats: { success: number; error: number; total: number }) => void | Promise<void>): Promise<SyncResult> {
        try {
            const contacts = await this.fetchContacts(config);
            this.logger.debug(`Total contacts fetched: ${contacts.length}`);
            let successCount = 0;
            let errorCount = 0;
            const skippedRecords: Array<{ externalId: string; reason: string }> = [];
            const skippedLinks: Array<{
                contactExternalId: string;
                missingAccountExternalId: string;
            }> = [];
            const failedRecords: Array<{
                externalId: string;
                entityType: string;
                errorMessage: string;
                errorCode?: string;
            }> = [];

            for (const contact of contacts) {
                try {
                    const profile = await this.recordSync.upsertContactFromDynamics(contact, config, {
                        connectionId: config.id,
                        source: 'FULL_IMPORT',
                        recordChanges: true,
                    });

                    if (profile) {
                        successCount++;
                        const parentAccountId = contact.parentcustomerid_account?.accountid || contact._parentcustomerid_value;
                        if (parentAccountId && !profile.accountId) {
                            skippedLinks.push({
                                contactExternalId: contact.contactid,
                                missingAccountExternalId: parentAccountId,
                            });
                        }
                    } else {
                        skippedRecords.push({
                            externalId: contact.contactid,
                            reason: 'Skipped by record sync service (e.g. protected admin email)',
                        });
                    }
                } catch (err) {
                    this.logger.error(`Failed to sync contact ${contact.emailaddress1 || contact.contactid}`, err.stack);
                    failedRecords.push({
                        externalId: contact.contactid,
                        entityType: 'contact',
                        errorMessage: err.message,
                    });
                    errorCount++;
                } finally {
                    if (onProgress) {
                        await onProgress({
                            success: successCount,
                            error: errorCount,
                            total: contacts.length,
                        });
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

    async fetchAccounts(config: any): Promise<any[]> {
        const token = await this.getAccessToken(config);
        const instanceUrl = config.instanceUrl.replace(/\/+$/, '');
        // No $select: custom mapped fields vary by tenant and some Dynamics
        // environments reject missing optional fields.
        return this.fetchPagedRecords(`${instanceUrl}/api/data/v9.2/accounts`, token, 'Accounts');
    }

    async fetchContacts(config: any): Promise<any[]> {
        const token = await this.getAccessToken(config);
        const instanceUrl = config.instanceUrl.replace(/\/+$/, '');
        const url = `${instanceUrl}/api/data/v9.2/contacts?$expand=parentcustomerid_account($select=accountid,name,industrycode,accountnumber)`;
        return this.fetchPagedRecords(url, token, 'Contacts');
    }

    async getDiscoveryData(config: any): Promise<any> {
        const connIdStr = `[Discovery:${config.id?.substring(0, 8) || 'unknown'}]`;
        try {
            this.logger.log(`${connIdStr} Starting discovery...`);

            let token: string;
            try {
                token = await this.getAccessToken(config);
                this.logger.log(`${connIdStr} Token acquired ✅`);
            } catch (tokenErr) {
                if (tokenErr.message.includes('Missing required Dynamics 365 credentials')) {
                    this.logger.log(`${connIdStr} CRM credentials not fully configured yet. Returning empty discovery data.`);
                    return { account: [], contact: [] };
                }
                const details = tokenErr.response?.data ? JSON.stringify(tokenErr.response.data) : tokenErr.message;
                this.logger.error(`${connIdStr} [PHASE:TOKEN] Auth rejection: ${details}`);
                throw new Error(`Authentication with Microsoft failed: ${tokenErr.message}`);
            }

            const instanceUrl = config.instanceUrl.replace(/\/+$/, '');

            // 1. Fetch Metadata (Labels) with individual logging
            this.logger.log(`${connIdStr} Fetching account metadata...`);
            let accountFields = [];
            try {
                accountFields = await this.fetchEntityMetadata(instanceUrl, token, 'account');
            } catch (metaErr) {
                this.logger.warn(`${connIdStr} [PHASE:ACCOUNT_META] Failed, skipping labels: ${metaErr.message}`);
            }

            this.logger.log(`${connIdStr} Fetching contact metadata...`);
            let contactFields = [];
            try {
                contactFields = await this.fetchEntityMetadata(instanceUrl, token, 'contact');
            } catch (metaErr) {
                this.logger.warn(`${connIdStr} [PHASE:CONTACT_META] Failed, skipping labels: ${metaErr.message}`);
            }

            // 2. Fetch Sample Records with individual logging
            this.logger.log(`${connIdStr} Fetching account sample record...`);
            let accountSample = null;
            try {
                accountSample = await this.fetchSampleRecord(instanceUrl, token, 'accounts');
            } catch (sampErr) {
                this.logger.warn(`${connIdStr} [PHASE:ACCOUNT_SAMPLE] Failed, no samples: ${sampErr.message}`);
            }

            this.logger.log(`${connIdStr} Fetching contact sample record...`);
            let contactSample = null;
            try {
                contactSample = await this.fetchSampleRecord(instanceUrl, token, 'contacts');
            } catch (sampErr) {
                this.logger.warn(`${connIdStr} [PHASE:CONTACT_SAMPLE] Failed, no samples: ${sampErr.message}`);
            }

            // 3. Map Samples to Metadata with fallback for missing metadata
            const mapSampleToFields = (fields: any[], sample: any) => {
                const results: any[] = [];
                const seenLogicalNames = new Set<string>();

                // 1. Process metadata fields
                fields.forEach((f) => {
                    const logicalName = f.LogicalName;
                    results.push({
                        logicalName,
                        displayName: f.DisplayName?.UserLocalizedLabel?.Label || logicalName,
                        sampleValue: sample ? sample[logicalName] : null,
                    });
                    seenLogicalNames.add(logicalName.toLowerCase());
                });

                // 2. Add extra fields from sample that weren't in metadata
                if (sample) {
                    Object.keys(sample).forEach((key) => {
                        // Skip internal OData fields starting with _ or @
                        if (key.startsWith('_') || key.startsWith('@')) return;

                        if (!seenLogicalNames.has(key.toLowerCase())) {
                            results.push({
                                logicalName: key,
                                displayName: key, // fallback to logical name
                                sampleValue: sample[key],
                            });
                            seenLogicalNames.add(key.toLowerCase());
                        }
                    });
                }

                return results;
            };

            this.logger.log(`${connIdStr} Discovery complete ✅ (Fields: A:${accountFields.length}, C:${contactFields.length})`);
            return {
                account: mapSampleToFields(accountFields, accountSample),
                contact: mapSampleToFields(contactFields, contactSample),
            };
        } catch (error) {
            const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            this.logger.error(`${connIdStr} DISCOVERY SYSTEM ERROR: ${errorDetails}`);
            throw error;
        }
    }

    async fetchDeltaRecords(config: any, entityType: 'account' | 'contact', deltaLink?: string | null): Promise<{ records: any[]; deltaLink: string | null }> {
        const token = await this.getAccessToken(config);
        const instanceUrl = config.instanceUrl.replace(/\/+$/, '');
        const entitySet = entityType === 'account' ? 'accounts' : 'contacts';
        // Keep delta queries schema-flexible like full import. Some Dynamics tenants
        // reject $select when optional/custom fields are absent or differently cased.
        let nextUrl: string | null = deltaLink || `${instanceUrl}/api/data/v9.2/${entitySet}`;
        let latestDeltaLink: string | null = null;
        const records: any[] = [];

        while (nextUrl) {
            const headers: Record<string, string> = {
                Authorization: `Bearer ${token}`,
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                Accept: 'application/json',
            };
            headers.Prefer = deltaLink ? 'odata.include-annotations="*"' : 'odata.track-changes, odata.include-annotations="*"';

            const response: { data: any } = await axios.get(nextUrl, {
                headers,
                timeout: 30000,
            });

            records.push(...(response.data.value ?? []));
            nextUrl = response.data['@odata.nextLink'] ?? null;
            latestDeltaLink = response.data['@odata.deltaLink'] ?? latestDeltaLink;
        }

        return { records, deltaLink: latestDeltaLink };
    }

    isDeletedDeltaRecord(record: any): boolean {
        return String(record?.['@odata.context'] || '').includes('$deletedEntity') || record?.reason === 'deleted';
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
                    Prefer: 'odata.include-annotations="*"',
                },
            });
            return response.data.value;
        } catch (error) {
            const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            this.logger.warn(`[PHASE:METADATA_ALT_TRY] ${entityName} alternate fetch failed: ${errorDetails}`);

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
                    Prefer: 'odata.include-annotations="*"',
                },
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

    private resolveFirstField(data: any, systemKey: string, mappings: Record<string, string>, candidateKeys: string[]): any {
        const mapped = mappings[systemKey];
        if (mapped) {
            return this.resolveField(data, systemKey, mappings, mapped);
        }

        for (const candidate of candidateKeys) {
            const value = this.resolveField(data, systemKey, {}, candidate);
            if (value !== undefined && value !== null && value !== '') return value;
        }

        return null;
    }

    private async fetchPagedRecords(baseUrl: string, token: string, label: string): Promise<any[]> {
        this.logger.debug(`Fetching ${label.toLowerCase()} from: ${baseUrl}`);

        const headers = {
            Authorization: `Bearer ${token}`,
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            Accept: 'application/json',
            Prefer: 'odata.include-annotations="*"',
        };

        const records: any[] = [];
        let nextUrl: string | null = baseUrl;
        while (nextUrl) {
            const response: { status: number; data: any } = await axios.get(nextUrl, {
                headers,
                timeout: 30000,
            });
            this.logger.debug(`${label} page status: ${response.status}, count: ${response.data.value?.length}`);
            records.push(...(response.data.value ?? []));
            nextUrl = response.data['@odata.nextLink'] ?? null;
        }

        return records;
    }

    private limitString(value: unknown, maxLength: number): string {
        return String(value ?? '').slice(0, maxLength);
    }

    private asNullableString(value: unknown, maxLength?: number): string | null {
        if (value === undefined || value === null || value === '') return null;
        const stringValue = String(value);
        return maxLength ? stringValue.slice(0, maxLength) : stringValue;
    }

    private async getAccessToken(config: any): Promise<string> {
        const { tenantId, clientId, clientSecret, instanceUrl: rawInstanceUrl } = config;

        // Debug Phase: Secure Parameter Verification
        const mask = (str: string) => (str ? (str.length < 8 ? '****' : `${str.substring(0, 4)}...${str.substring(str.length - 4)}`) : 'NULL');
        this.logger.log(
            `[TOKEN_ACQUISITION] Params: Tenant=${mask(tenantId)} (${tenantId?.length}), ClientID=${mask(clientId)} (${clientId?.length}), Secret=${mask(clientSecret)} (${clientSecret?.length}), Instance=${rawInstanceUrl}`,
        );

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
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            return response.data.access_token;
        } catch (error) {
            const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            this.logger.error(`[TOKEN_ACQUISITION_FAILED] URL: ${tokenUrl}, Error: ${errorDetails}`);
            throw error;
        }
    }
}

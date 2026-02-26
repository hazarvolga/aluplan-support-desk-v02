import { Injectable, Logger } from '@nestjs/common';
import { CrmProvider, SyncStatus } from '@prisma/client';
import { ICrmAdapter, SyncResult } from './crm-adapter.interface';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class Dynamics365Adapter implements ICrmAdapter {
    private readonly logger = new Logger(Dynamics365Adapter.name);
    provider = CrmProvider.DYNAMICS_365;

    constructor(private prisma: PrismaService) { }

    async verifyConnection(config: any): Promise<boolean> {
        try {
            const token = await this.getAccessToken(config);
            return !!token;
        } catch (error) {
            this.logger.error('Dynamics 365 connection verification failed', error.stack);
            return false;
        }
    }

    async syncAccounts(config: any): Promise<SyncResult> {
        try {
            const token = await this.getAccessToken(config);
            const resourceUrl = `${config.instanceUrl}/api/data/v9.2/accounts?$select=accountid,name,industrycode,websiteurl,address1_composite,accountnumber`;
            this.logger.debug(`Fetching accounts from: ${resourceUrl}`);

            const response = await axios.get(resourceUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'OData-MaxVersion': '4.0',
                    'OData-Version': '4.0',
                    Accept: 'application/json',
                    'Prefer': 'odata.include-annotations="*"'
                },
            });

            this.logger.debug(`Accounts API response status: ${response.status}`);
            const accounts = response.data.value;
            this.logger.debug(`Found ${accounts.length} accounts`);
            let successCount = 0;
            let errorCount = 0;

            for (const account of accounts) {
                try {
                    const industryFormatted = account['industrycode@OData.Community.Display.V1.FormattedValue'];

                    await this.prisma.crmAccount.upsert({
                        where: { externalAccountId: account.accountid },
                        update: {
                            name: account.name,
                            website: account.websiteurl,
                            address: account.address1_composite,
                            industry: industryFormatted,
                            crmVerified: true,
                        },
                        create: {
                            name: account.name,
                            externalAccountId: account.accountid,
                            website: account.websiteurl,
                            address: account.address1_composite,
                            industry: industryFormatted,
                            crmVerified: true,
                        },
                    });

                    // Store new_ClientID in a way contacts can access it if needed, 
                    // or just rely on the Account -> Contact relation.
                    // For now we map it to customerNo during contact sync.

                    successCount++;
                } catch (err) {
                    this.logger.error(`Failed to sync account ${account.name}`, err.stack);
                    errorCount++;
                }
            }

            return {
                status: SyncStatus.SUCCESS,
                totalRecords: accounts.length,
                successCount,
                errorCount,
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

    async syncContacts(config: any): Promise<SyncResult> {
        try {
            const token = await this.getAccessToken(config);
            const resourceUrl = `${config.instanceUrl}/api/data/v9.2/contacts?$select=contactid,firstname,lastname,emailaddress1,jobtitle,telephone1,new_musteridurumu,new_abonelikmodeli&$expand=parentcustomerid_account($select=accountid,name,industrycode,accountnumber)`;
            this.logger.debug(`Fetching contacts from: ${resourceUrl}`);

            const response = await axios.get(resourceUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'OData-MaxVersion': '4.0',
                    'OData-Version': '4.0',
                    Accept: 'application/json',
                    'Prefer': 'odata.include-annotations="*"'
                },
            });

            this.logger.debug(`Contacts API response status: ${response.status}`);
            const contacts = response.data.value;
            this.logger.debug(`Found ${contacts.length} contacts`);
            let successCount = 0;
            let errorCount = 0;

            for (const contact of contacts) {
                if (!contact.emailaddress1) continue;

                try {
                    await this.prisma.$transaction(async (tx) => {
                        // 1. Find or create User
                        let user = await tx.user.findUnique({
                            where: { email: contact.emailaddress1 },
                        });

                        if (!user) {
                            this.logger.debug(`Creating new user for email: ${contact.emailaddress1}`);
                            user = await tx.user.create({
                                data: {
                                    email: contact.emailaddress1,
                                    fullName: `${contact.firstname || ''} ${contact.lastname || ''}`.trim() || 'CRM Contact',
                                    role: 'VIEWER',
                                    status: 'ACTIVE',
                                    passwordHash: 'CRM_SYNCED',
                                },
                            });
                            this.logger.debug(`Created user ID: ${user.id}`);
                        } else {
                            this.logger.debug(`Found existing user ID: ${user.id} for email: ${contact.emailaddress1}`);
                        }

                        // 2. Find Linked Account if any
                        let linkedAccountId: string | undefined = undefined;
                        let accountInfo: any = null;

                        if (contact.parentcustomerid_account?.accountid) {
                            accountInfo = await tx.crmAccount.findUnique({
                                where: { externalAccountId: contact.parentcustomerid_account.accountid },
                            });
                            linkedAccountId = accountInfo?.id;
                        }

                        const statusFormatted = contact['new_musteridurumu@OData.Community.Display.V1.FormattedValue'];
                        const subscriptionFormatted = contact['new_abonelikmodeli@OData.Community.Display.V1.FormattedValue'];
                        const clientNo = contact.parentcustomerid_account?.accountnumber || `DYN-${contact.contactid.substring(0, 8)}`;
                        const industryFromAccount = contact.parentcustomerid_account ?
                            contact.parentcustomerid_account['industrycode@OData.Community.Display.V1.FormattedValue'] : null;

                        // 3. Upsert CustomerProfile
                        await tx.customerProfile.upsert({
                            where: { userId: user.id },
                            update: {
                                firstName: contact.firstname,
                                lastName: contact.lastname,
                                jobTitle: contact.jobtitle,
                                phoneNumber: contact.telephone1,
                                companyName: contact.parentcustomerid_account?.name || 'Unknown',
                                accountId: linkedAccountId,
                                externalContactId: contact.contactid,
                                customerNo: clientNo,
                                contractStatus: statusFormatted,
                                subscriptionModel: subscriptionFormatted,
                                industry: industryFromAccount || accountInfo?.industry,
                                crmVerified: true,
                            },
                            create: {
                                userId: user.id,
                                firstName: contact.firstname,
                                lastName: contact.lastname,
                                customerNo: clientNo,
                                jobTitle: contact.jobtitle,
                                phoneNumber: contact.telephone1,
                                companyName: contact.parentcustomerid_account?.name || 'Unknown',
                                accountId: linkedAccountId,
                                externalContactId: contact.contactid,
                                contractStatus: statusFormatted,
                                subscriptionModel: subscriptionFormatted,
                                industry: industryFromAccount || accountInfo?.industry,
                                crmVerified: true,
                            },
                        });
                    });
                    successCount++;
                } catch (err) {
                    this.logger.error(`Failed to sync contact ${contact.emailaddress1}`, err.stack);
                    errorCount++;
                }
            }

            return {
                status: SyncStatus.SUCCESS,
                totalRecords: contacts.length,
                successCount,
                errorCount,
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

    private async getAccessToken(config: any): Promise<string> {
        let { tenantId, clientId, clientSecret, instanceUrl } = config;

        // Normalize instanceUrl: remove trailing slash
        instanceUrl = instanceUrl.replace(/\/+$/, '');

        const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('scope', `${instanceUrl}/.default`);
        params.append('client_secret', clientSecret);
        params.append('grant_type', 'client_credentials');

        const response = await axios.post(tokenUrl, params);
        return response.data.access_token;
    }
}

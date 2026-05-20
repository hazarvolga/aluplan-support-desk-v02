import { CrmProvider, SyncStatus } from '@aluplan/database';

export interface CrmAccount {
    externalId: string;
    name: string;
    industry?: string;
    website?: string;
    address?: string;
}

export interface CrmContact {
    externalId: string;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle?: string;
    phone?: string;
    companyName?: string;
}

export interface SyncResult {
    status: SyncStatus;
    totalRecords: number;
    successCount: number;
    errorCount: number;
    errorMessage?: string;
    details?: any;
    skippedRecords?: Array<{ externalId: string; reason: string }>;
    skippedLinks?: Array<{ contactExternalId: string; missingAccountExternalId: string }>;
    failedRecords?: Array<{ externalId: string; entityType: string; errorMessage: string; errorCode?: string }>;
}

export interface CrmFieldMetadata {
    logicalName: string;
    displayName: string;
    sampleValue: any;
}

export interface DiscoveryData {
    account: CrmFieldMetadata[];
    contact: CrmFieldMetadata[];
}

export interface ICrmAdapter {
    provider: CrmProvider;

    /**
     * Verifies the connection credentials with the CRM provider
     */
    verifyConnection(config: any): Promise<boolean>;

    /**
     * Syncs accounts from CRM to Support Desk
     */
    syncAccounts(config: any, onProgress?: (stats: { success: number; error: number; total: number }) => void | Promise<void>): Promise<SyncResult>;

    /**
     * Syncs contacts from CRM to Support Desk
     */
    syncContacts(config: any, onProgress?: (stats: { success: number; error: number; total: number }) => void | Promise<void>): Promise<SyncResult>;

    /**
     * Fetches metadata and sample records for discovery
     */
    getDiscoveryData(config: any): Promise<DiscoveryData>;
}

export enum ValidationStatus {
    VALID = 'VALID',
    INVALID = 'INVALID',
    RISKY = 'RISKY',
    UNKNOWN = 'UNKNOWN'
}

export interface EmailValidationResult {
    email: string;
    status: ValidationStatus;
    score: number; // 0-100
    syntax: {
        isValid: boolean;
        normalized?: string;
        suggestion?: string;
        error?: string;
    };
    dns: {
        isValid: boolean;
        mxRecords?: string[];
        isDisposable?: boolean;
        isCatchAll?: boolean;
    };
    smtp: {
        isValid: boolean;
        canConnect?: boolean;
        hasInbox?: boolean;
        isGreyListed?: boolean;
        error?: string;
    };
    metadata?: {
        provider?: string;
        roles?: string[]; // e.g. ['admin', 'info']
    };
}

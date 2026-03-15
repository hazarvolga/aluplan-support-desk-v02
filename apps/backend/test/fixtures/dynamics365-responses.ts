/**
 * Dynamics 365 OData API — Gerçek response fixture'ları
 *
 * Bu dosya, Dynamics 365 API'sinin gerçek response formatını simüle eder.
 * Integration testlerinde axios mock'u bu fixture'ları döner.
 *
 * Kaynak: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/query-data-web-api
 */

// ─── Token Response ───────────────────────────────────────────────────────────

export const MOCK_TOKEN_RESPONSE = {
    token_type: 'Bearer',
    expires_in: 3599,
    access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.mock-token-payload.mock-signature',
    scope: 'https://org.crm4.dynamics.com/.default',
};

export const MOCK_TOKEN_ERROR_RESPONSE = {
    error: 'invalid_client',
    error_description: 'AADSTS7000215: Invalid client secret provided.',
    error_codes: [7000215],
    timestamp: '2026-03-15 10:00:00Z',
    trace_id: 'trace-id-123',
    correlation_id: 'corr-id-456',
};

// ─── Account Fixtures ─────────────────────────────────────────────────────────

/**
 * Gerçek Dynamics 365 account response formatı.
 * OData annotations (@OData.Community.Display.V1.FormattedValue) dahil.
 */
export function buildD365Account(overrides: Record<string, any> = {}) {
    return {
        '@odata.etag': 'W/"12345678"',
        accountid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Aluplan GmbH',
        accountnumber: 'C300001',
        websiteurl: 'https://aluplan.com',
        address1_composite: 'Musterstraße 1\n10115 Berlin\nGermany',
        industrycode: 6, // Manufacturing = 6 in D365
        'industrycode@OData.Community.Display.V1.FormattedValue': 'Manufacturing',
        ...overrides,
    };
}

export function buildD365AccountPage1(nextLink: string) {
    return {
        '@odata.context': 'https://org.crm4.dynamics.com/api/data/v9.2/$metadata#accounts',
        '@odata.nextLink': nextLink,
        value: [
            buildD365Account({ accountid: 'acc-page1-001', name: 'Page1 Corp A', accountnumber: 'C300001' }),
            buildD365Account({ accountid: 'acc-page1-002', name: 'Page1 Corp B', accountnumber: 'C300002' }),
        ],
    };
}

export function buildD365AccountPage2() {
    return {
        '@odata.context': 'https://org.crm4.dynamics.com/api/data/v9.2/$metadata#accounts',
        value: [
            buildD365Account({ accountid: 'acc-page2-001', name: 'Page2 Corp C', accountnumber: 'C300003' }),
        ],
    };
}

export function buildD365AccountsResponse(accounts?: any[]) {
    return {
        '@odata.context': 'https://org.crm4.dynamics.com/api/data/v9.2/$metadata#accounts',
        value: accounts ?? [buildD365Account()],
    };
}

// ─── Contact Fixtures ─────────────────────────────────────────────────────────

/**
 * Gerçek Dynamics 365 contact response formatı.
 * parentcustomerid_account expand dahil.
 */
export function buildD365Contact(overrides: Record<string, any> = {}) {
    return {
        '@odata.etag': 'W/"87654321"',
        contactid: 'c1d2e3f4-a5b6-7890-cdef-123456789abc',
        firstname: 'Ali',
        lastname: 'Yılmaz',
        emailaddress1: 'ali.yilmaz@aluplan.com',
        jobtitle: 'Mühendis',
        telephone1: '+49 30 12345678',
        new_musteridurumu: 1, // raw integer
        'new_musteridurumu@OData.Community.Display.V1.FormattedValue': 'Aktif',
        parentcustomerid_account: {
            '@odata.etag': 'W/"12345678"',
            accountid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            name: 'Aluplan GmbH',
            industrycode: 6,
            'industrycode@OData.Community.Display.V1.FormattedValue': 'Manufacturing',
            accountnumber: 'C300001',
        },
        ...overrides,
    };
}

export function buildD365ContactsResponse(contacts?: any[]) {
    return {
        '@odata.context': 'https://org.crm4.dynamics.com/api/data/v9.2/$metadata#contacts',
        value: contacts ?? [buildD365Contact()],
    };
}

export function buildD365ContactPage1(nextLink: string) {
    return {
        '@odata.context': 'https://org.crm4.dynamics.com/api/data/v9.2/$metadata#contacts',
        '@odata.nextLink': nextLink,
        value: [
            buildD365Contact({ contactid: 'con-p1-001', emailaddress1: 'p1a@test.com', firstname: 'P1A' }),
            buildD365Contact({ contactid: 'con-p1-002', emailaddress1: 'p1b@test.com', firstname: 'P1B' }),
        ],
    };
}

export function buildD365ContactPage2() {
    return {
        '@odata.context': 'https://org.crm4.dynamics.com/api/data/v9.2/$metadata#contacts',
        value: [
            buildD365Contact({ contactid: 'con-p2-001', emailaddress1: 'p2a@test.com', firstname: 'P2A' }),
        ],
    };
}

// ─── Metadata Fixtures ────────────────────────────────────────────────────────

/**
 * EntityDefinitions/Attributes endpoint response.
 * Gerçek D365 metadata formatı.
 */
export const MOCK_ACCOUNT_METADATA = {
    '@odata.context': 'https://org.crm4.dynamics.com/api/data/v9.2/$metadata#EntityDefinitions',
    value: [
        {
            LogicalName: 'accountid',
            AttributeType: 'Uniqueidentifier',
            DisplayName: {
                UserLocalizedLabel: { Label: 'Account', LanguageCode: 1033 },
            },
        },
        {
            LogicalName: 'name',
            AttributeType: 'String',
            DisplayName: {
                UserLocalizedLabel: { Label: 'Account Name', LanguageCode: 1033 },
            },
        },
        {
            LogicalName: 'accountnumber',
            AttributeType: 'String',
            DisplayName: {
                UserLocalizedLabel: { Label: 'Account Number', LanguageCode: 1033 },
            },
        },
        {
            LogicalName: 'industrycode',
            AttributeType: 'Picklist',
            DisplayName: {
                UserLocalizedLabel: { Label: 'Industry', LanguageCode: 1033 },
            },
        },
        {
            LogicalName: 'websiteurl',
            AttributeType: 'String',
            DisplayName: {
                UserLocalizedLabel: { Label: 'Website', LanguageCode: 1033 },
            },
        },
        {
            LogicalName: 'address1_composite',
            AttributeType: 'Memo',
            DisplayName: {
                UserLocalizedLabel: { Label: 'Address 1', LanguageCode: 1033 },
            },
        },
        // Field with missing DisplayName — fallback to LogicalName
        {
            LogicalName: 'new_customfield',
            AttributeType: 'String',
            DisplayName: null,
        },
    ],
};

export const MOCK_CONTACT_METADATA = {
    '@odata.context': 'https://org.crm4.dynamics.com/api/data/v9.2/$metadata#EntityDefinitions',
    value: [
        {
            LogicalName: 'contactid',
            AttributeType: 'Uniqueidentifier',
            DisplayName: {
                UserLocalizedLabel: { Label: 'Contact', LanguageCode: 1033 },
            },
        },
        {
            LogicalName: 'firstname',
            AttributeType: 'String',
            DisplayName: {
                UserLocalizedLabel: { Label: 'First Name', LanguageCode: 1033 },
            },
        },
        {
            LogicalName: 'lastname',
            AttributeType: 'String',
            DisplayName: {
                UserLocalizedLabel: { Label: 'Last Name', LanguageCode: 1033 },
            },
        },
        {
            LogicalName: 'emailaddress1',
            AttributeType: 'String',
            DisplayName: {
                UserLocalizedLabel: { Label: 'Email', LanguageCode: 1033 },
            },
        },
        {
            LogicalName: 'new_musteridurumu',
            AttributeType: 'Picklist',
            DisplayName: {
                UserLocalizedLabel: { Label: 'Müşteri Durumu', LanguageCode: 1055 },
            },
        },
    ],
};

// ─── Error Responses ──────────────────────────────────────────────────────────

export const MOCK_D365_AUTH_ERROR = {
    error: {
        code: '0x80040220',
        message: 'SecLib::AccessCheckEx failed. Returned hr = -2147187616, ObjectID: ...',
        innererror: {
            message: 'SecLib::AccessCheckEx failed.',
            type: 'Microsoft.Crm.CrmException',
            stacktrace: '...',
        },
    },
};

export const MOCK_D365_RATE_LIMIT_HEADERS = {
    'Retry-After': '60',
    'x-ms-ratelimit-burst-remaining-xrm-requests': '0',
    'x-ms-ratelimit-time-remaining-xrm-requests': '60000',
};

// ─── Webhook Payloads ─────────────────────────────────────────────────────────

export const MOCK_WEBHOOK_ACCOUNT_PAYLOAD = {
    entity: 'account',
    data: {
        accountid: 'webhook-acc-001',
        name: 'Webhook Test GmbH',
        accountnumber: 'C399999',
        websiteurl: 'https://webhook-test.com',
        address1_composite: 'Test Street 1, Berlin',
        industrycode: 6,
        'industrycode@OData.Community.Display.V1.FormattedValue': 'Technology',
    },
};

export const MOCK_WEBHOOK_CONTACT_PAYLOAD = {
    entity: 'contact',
    data: {
        contactid: 'webhook-con-001',
        emailaddress1: 'webhook-contact@aluplan.com',
        firstname: 'Webhook',
        lastname: 'Contact',
        jobtitle: 'Tester',
        telephone1: '+49 30 99999999',
        new_musteridurumu: 1,
        'new_musteridurumu@OData.Community.Display.V1.FormattedValue': 'Aktif',
        parentcustomerid_account: {
            accountid: 'webhook-acc-001',
            name: 'Webhook Test GmbH',
        },
    },
};

export const MOCK_WEBHOOK_CONTACT_NO_EMAIL = {
    entity: 'contact',
    data: {
        contactid: 'webhook-con-no-email',
        firstname: 'No',
        lastname: 'Email',
        emailaddress1: null,
    },
};

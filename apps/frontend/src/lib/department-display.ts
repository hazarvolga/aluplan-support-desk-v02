type DepartmentLike = {
    name?: string | null;
    slug?: string | null;
};

type DepartmentLabels = Record<string, string>;

const DEPARTMENT_ALIASES: Record<string, string> = {
    'technical-support': 'technical_support',
    'technical_support': 'technical_support',
    'technical support': 'technical_support',
    'teknik destek': 'technical_support',
    'technischer support': 'technical_support',

    'billing-payments': 'billing_payments',
    'billing_payments': 'billing_payments',
    'billing & payments': 'billing_payments',
    'billing and payments': 'billing_payments',
    'fatura ve odemeler': 'billing_payments',
    'fatura ve ödemeler': 'billing_payments',
    'abrechnung und zahlungen': 'billing_payments',

    'sales-pre-sales': 'sales_pre_sales',
    'sales_pre_sales': 'sales_pre_sales',
    'sales & pre-sales': 'sales_pre_sales',
    'sales and pre-sales': 'sales_pre_sales',
    'satis ve on satis': 'sales_pre_sales',
    'satış ve ön satış': 'sales_pre_sales',
    'vertrieb und pre-sales': 'sales_pre_sales',

    'general-support': 'general_support',
    'general_support': 'general_support',
    'general support': 'general_support',
    'genel destek': 'general_support',
    'allgemeiner support': 'general_support',

    'licensing': 'licensing',
    'license': 'licensing',
    'license-support': 'licensing',
    'license support': 'licensing',
    'lisanslama': 'licensing',
    'lizenzierung': 'licensing',

    'customer-success': 'customer_success',
    'customer_success': 'customer_success',
    'customer success': 'customer_success',
    'musteri basarisi': 'customer_success',
    'müşteri başarısı': 'customer_success',
    'kundenerfolg': 'customer_success',

    'general-inquiries': 'general_inquiries',
    'general_inquiries': 'general_inquiries',
    'general inquiries': 'general_inquiries',
    'general inquiry': 'general_inquiries',
    'genel basvurular': 'general_inquiries',
    'genel başvurular': 'general_inquiries',
    'genel sorular': 'general_inquiries',
    'allgemeine anfragen': 'general_inquiries',

    'security-compliance': 'security_compliance',
    'security_compliance': 'security_compliance',
    'security and compliance': 'security_compliance',
    'security compliance': 'security_compliance',
    'guvenlik ve uyumluluk': 'security_compliance',
    'güvenlik ve uyumluluk': 'security_compliance',
    'sicherheit und compliance': 'security_compliance',
};

const normalizeDepartmentKey = (value?: string | null) => {
    if (!value) return null;

    return value
        .trim()
        .toLocaleLowerCase('tr-TR')
        .replace(/ı/g, 'i')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/&/g, ' and ')
        .replace(/\s+/g, ' ')
        .replace(/[^\p{Letter}\p{Number}\s_-]/gu, '')
        .trim();
};

const getDepartmentTranslationKey = (department?: DepartmentLike | null) => {
    const candidates = [
        normalizeDepartmentKey(department?.slug),
        normalizeDepartmentKey(department?.name),
        normalizeDepartmentKey(department?.slug)?.replace(/-/g, '_'),
        normalizeDepartmentKey(department?.name)?.replace(/-/g, '_'),
    ].filter(Boolean) as string[];

    for (const candidate of candidates) {
        const alias = DEPARTMENT_ALIASES[candidate];
        if (alias) return alias;
    }

    return null;
};

export const getDepartmentDisplayName = (
    department: DepartmentLike | null | undefined,
    labels: DepartmentLabels,
) => {
    const key = getDepartmentTranslationKey(department);
    if (key && labels[key]) return labels[key];

    return department?.name || '';
};

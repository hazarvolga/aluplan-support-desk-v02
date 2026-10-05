export const normalizeTicketCategoryKey = (value: string) =>
    value
        .trim()
        .toLocaleLowerCase('tr-TR')
        .replace(/ı/g, 'i')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[_\s]+/g, '.')
        .replace(/\.+/g, '.')
        .replace(/^\.|\.$/g, '');

export type TicketSupportCategoryLabels = Partial<Record<
    'technical_support' | 'billing_payments' | 'sales_pre_sales' | 'general_support' |
    'licensing' | 'customer_success' | 'general_inquiries' | 'security_compliance',
    string
>>;

const CATEGORY_ALIASES: Record<string, keyof TicketSupportCategoryLabels> = {
    licensing: 'licensing',
    'tickets.category.licensing': 'licensing',
    'tickets.category.technical.support': 'technical_support',
    'tickets.category.billing.payments': 'billing_payments',
    'tickets.category.sales.pre.sales': 'sales_pre_sales',
    'tickets.category.general.support': 'general_support',
    'tickets.category.customer.success': 'customer_success',
    'tickets.category.general.inquiries': 'general_inquiries',
    'tickets.category.security.compliance': 'security_compliance',
    'technical-support': 'technical_support',
    'technical.support': 'technical_support',
    technical_support: 'technical_support',
    'billing-payments': 'billing_payments',
    'billing.payments': 'billing_payments',
    billing_payments: 'billing_payments',
    'sales-pre-sales': 'sales_pre_sales',
    'sales.pre.sales': 'sales_pre_sales',
    sales_pre_sales: 'sales_pre_sales',
    'general-support': 'general_support',
    'general.support': 'general_support',
    general_support: 'general_support',
    'customer-success': 'customer_success',
    'customer.success': 'customer_success',
    customer_success: 'customer_success',
    'general-inquiries': 'general_inquiries',
    'general.inquiries': 'general_inquiries',
    general_inquiries: 'general_inquiries',
    'security-compliance': 'security_compliance',
    'security.compliance': 'security_compliance',
    security_compliance: 'security_compliance',
};

export const getTicketCategoryDisplayName = (value: unknown, labels: TicketSupportCategoryLabels) => {
    if (typeof value !== 'string' || !value.trim()) return '';

    const normalized = normalizeTicketCategoryKey(value);
    const alias = CATEGORY_ALIASES[normalized];
    if (alias && labels[alias]) return labels[alias];

    return value.trim();
};

export const getTicketSupportCategoryNames = (ticket: any, labels: TicketSupportCategoryLabels): string[] => {
    const departmentValue = ticket.department?.slug || ticket.department?.name;
    const normalizedSlug = typeof ticket.department?.slug === 'string'
        ? normalizeTicketCategoryKey(ticket.department.slug)
        : '';
    const slugAlias = normalizedSlug ? CATEGORY_ALIASES[normalizedSlug] : undefined;
    const departmentCategory = slugAlias && labels[slugAlias]
        ? labels[slugAlias]
        : getTicketCategoryDisplayName(ticket.department?.name || departmentValue, labels);
    const categories = [
        ...(ticket.tags?.includes('licensing') && labels.licensing ? [labels.licensing] : []),
        ...(departmentCategory ? [departmentCategory] : []),
    ];

    return Array.from(new Set(categories.filter(Boolean)));
};

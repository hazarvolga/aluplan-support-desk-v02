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

const resolveTicketCategoryAlias = (value: string) => {
    const normalized = normalizeTicketCategoryKey(value);
    const departmentKey = normalized.startsWith('tickets.departments.')
        ? normalized.slice('tickets.departments.'.length)
        : normalized;

    return CATEGORY_ALIASES[departmentKey];
};

export const getTicketCategoryDisplayName = (value: unknown, labels: TicketSupportCategoryLabels) => {
    if (typeof value !== 'string' || !value.trim()) return '';

    const alias = resolveTicketCategoryAlias(value);
    if (alias && labels[alias]) return labels[alias];

    return value.trim();
};

type TicketCategorySource = {
    department?: { slug?: string | null; name?: string | null } | null;
    tags?: string[] | null;
    suggestedCategories?: unknown[] | null;
};

export const getTicketSupportCategoryNames = (ticket: TicketCategorySource, labels: TicketSupportCategoryLabels): string[] => {
    const departmentValue = ticket.department?.slug || ticket.department?.name;
    const slugAlias = ticket.department?.slug
        ? resolveTicketCategoryAlias(ticket.department.slug)
        : undefined;
    const departmentCategory = slugAlias && labels[slugAlias]
        ? labels[slugAlias]
        : getTicketCategoryDisplayName(ticket.department?.name || departmentValue, labels);
    const categories = [
        ...(ticket.tags?.includes('licensing') && labels.licensing ? [labels.licensing] : []),
        // Licensing is a support category, while the department is only the
        // routing destination. Do not expose both as duplicate categories.
        ...(!ticket.tags?.includes('licensing') && departmentCategory ? [departmentCategory] : []),
    ];

    return Array.from(new Set(categories.filter(Boolean)));
};

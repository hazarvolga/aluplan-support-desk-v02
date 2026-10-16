type DepartmentOption = {
    id: string;
    slug?: string | null;
    name?: string | null;
};

export type TicketCategoryOption = {
    value: string;
    departmentId: string;
    department: DepartmentOption;
    isLicensing: boolean;
};

export const LICENSING_CATEGORY_VALUE = 'licensing';
const ALLPLAN_PRODUCT_NAME = 'ALLPLAN';
const TECHNICAL_SUPPORT_DEPARTMENT_SLUG = 'technical-support';

export const buildTicketCategoryOptions = (departments: DepartmentOption[]): TicketCategoryOption[] => {
    const technical = departments.find(department => department.slug === TECHNICAL_SUPPORT_DEPARTMENT_SLUG);
    const licensing = departments.find(department => department.slug === 'billing-payments');

    return [
        ...(technical ? [{
            value: technical.id,
            departmentId: technical.id,
            department: technical,
            isLicensing: false,
        }] : []),
        ...(licensing ? [{
            value: LICENSING_CATEGORY_VALUE,
            departmentId: licensing.id,
            department: licensing,
            isLicensing: true,
        }] : []),
    ];
};

export const getTicketCategoryCreateFields = (option?: TicketCategoryOption) => ({
    departmentId: option?.departmentId,
    ...(option?.isLicensing ? { tags: ['licensing'] } : {}),
});

export const isHotinfoRequiredForTicket = (
    productName: string | null | undefined,
    option?: TicketCategoryOption,
): boolean => productName?.trim().toUpperCase() === ALLPLAN_PRODUCT_NAME
    && option?.department.slug === TECHNICAL_SUPPORT_DEPARTMENT_SLUG;

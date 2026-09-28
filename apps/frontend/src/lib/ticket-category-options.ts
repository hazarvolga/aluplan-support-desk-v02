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

export const buildTicketCategoryOptions = (departments: DepartmentOption[]): TicketCategoryOption[] =>
    departments.flatMap(department => {
        const option: TicketCategoryOption = {
            value: department.id,
            departmentId: department.id,
            department,
            isLicensing: false,
        };

        return department.slug === 'billing-payments'
            ? [option, {
                value: LICENSING_CATEGORY_VALUE,
                departmentId: department.id,
                department,
                isLicensing: true,
            }]
            : [option];
    });

export const getTicketCategoryCreateFields = (option?: TicketCategoryOption) => ({
    departmentId: option?.departmentId,
    ...(option?.isLicensing ? { tags: ['licensing'] } : {}),
});

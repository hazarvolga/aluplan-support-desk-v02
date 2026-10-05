export const isTicketDetailsReady = (departmentId: string, productId: string): boolean =>
    departmentId.trim().length > 0 && productId.trim().length > 0;

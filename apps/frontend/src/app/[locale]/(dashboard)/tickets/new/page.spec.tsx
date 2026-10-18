import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NewTicketPage from './page';

const mocks = vi.hoisted(() => ({
    departmentOptions: vi.fn(),
    productList: vi.fn(),
    authMe: vi.fn(),
    apiPost: vi.fn(),
    aiQuery: vi.fn(),
    ticketCreate: vi.fn(),
    uploadAttachments: vi.fn(),
    toastError: vi.fn(),
    toastInfo: vi.fn(),
    toastSuccess: vi.fn(),
    toastWarning: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
    api: {
        teams: { departmentOptions: mocks.departmentOptions },
        products: { list: mocks.productList },
        auth: { me: mocks.authMe },
        post: mocks.apiPost,
        ai: { query: mocks.aiQuery },
        tickets: { create: mocks.ticketCreate, uploadAttachments: mocks.uploadAttachments },
    },
    isBackendUnavailableError: () => false,
}));

vi.mock('sonner', () => ({
    toast: {
        error: mocks.toastError,
        info: mocks.toastInfo,
        success: mocks.toastSuccess,
        warning: mocks.toastWarning,
    },
}));

describe('NewTicketPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.departmentOptions.mockResolvedValue([
            { id: 'technical', slug: 'technical-support', name: 'Technical Support' },
            { id: 'license', slug: 'license-activation', name: 'License & Activation' },
        ]);
        mocks.productList.mockResolvedValue([
            { id: 'allplan', name: 'ALLPLAN' },
            { id: 'other', name: 'Other Product' },
        ]);
        mocks.authMe.mockResolvedValue({ customerProfile: null });
    });

    it('loads the ticket intake dependencies and renders the first step', async () => {
        render(<NewTicketPage />);

        await waitFor(() => {
            expect(mocks.departmentOptions).toHaveBeenCalledTimes(1);
            expect(mocks.productList).toHaveBeenCalledTimes(1);
        });
        expect(screen.getByText('title')).toBeInTheDocument();
        expect(screen.getByText('sections.basic_info')).toBeInTheDocument();
        expect(screen.getByText('fields.department')).toBeInTheDocument();
    });

    it('keeps the intake shell visible and reports both reference-data failures', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        mocks.departmentOptions.mockRejectedValueOnce(new Error('departments unavailable'));
        mocks.productList.mockRejectedValueOnce(new Error('products unavailable'));

        render(<NewTicketPage />);

        await waitFor(() => {
            expect(mocks.toastError).toHaveBeenCalledWith('toasts.departments_load_error');
            expect(mocks.toastError).toHaveBeenCalledWith('toasts.products_load_error');
        });
        expect(screen.getByText('sections.basic_info')).toBeInTheDocument();
        expect(mocks.ticketCreate).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});

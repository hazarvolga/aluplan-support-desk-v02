import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RegisterPage from './page';

const mocks = vi.hoisted(() => ({
    lookup: vi.fn(),
    resendVerification: vi.fn(),
    forgotPassword: vi.fn(),
    fetch: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
    api: {
        getBaseUrl: () => 'http://api.test/v1',
        auth: {
            lookup: mocks.lookup,
            resendVerification: mocks.resendVerification,
            forgotPassword: mocks.forgotPassword,
        },
    },
}));

const productResponse = {
    ok: true,
    json: vi.fn().mockResolvedValue([
        { id: 'product-1', name: 'Allplan Architecture' },
        { id: 'product-2', name: 'Allplan Engineering' },
    ]),
};

const input = (name: string) => document.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
const form = () => document.querySelector('form')!;

async function enterEmailAndLookup(
    result: { action: string; companyName: string | null; errorMessage?: string },
) {
    mocks.lookup.mockResolvedValueOnce(result);
    fireEvent.change(input('email'), { target: { value: 'user@example.com' } });
    fireEvent.submit(form());
    await waitFor(() => expect(mocks.lookup).toHaveBeenCalledWith('user@example.com'));
}

function fillRegistrationFields(overrides: Record<string, string> = {}) {
    const values = {
        username: 'test-user',
        firstName: 'Test',
        lastName: 'User',
        phone: '+905551112233',
        company: 'Test Company',
        password: 'secure-pass',
        confirmPassword: 'secure-pass',
        ...overrides,
    };
    for (const [name, value] of Object.entries(values)) {
        fireEvent.change(input(name), { target: { value } });
    }
}

describe('RegisterPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.fetch.mockResolvedValue(productResponse);
        mocks.resendVerification.mockResolvedValue(undefined);
        mocks.forgotPassword.mockResolvedValue(undefined);
        vi.stubGlobal('fetch', mocks.fetch);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('loads products, blocks an empty lookup, and advances a matched company with a prefilled value', async () => {
        render(<RegisterPage />);
        await waitFor(() => expect(mocks.fetch).toHaveBeenCalledWith('http://api.test/v1/products'));

        fireEvent.submit(form());
        expect(mocks.lookup).not.toHaveBeenCalled();

        await enterEmailAndLookup({
            action: 'NEW_MATCHED_COMPANY',
            companyName: 'CRM Company',
        });

        expect(screen.getByText('CRM Company')).toBeInTheDocument();
        expect(input('company')).toHaveValue('CRM Company');
        expect(screen.getByText('Allplan Architecture')).toBeInTheDocument();
        expect(input('email')).toBeDisabled();
    });

    it('handles product endpoint non-success and network failure without blocking registration', async () => {
        mocks.fetch.mockResolvedValueOnce({ ok: false, json: vi.fn() });
        const first = render(<RegisterPage />);
        await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(1));
        expect(screen.queryByText('Allplan Architecture')).not.toBeInTheDocument();
        first.unmount();

        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        mocks.fetch.mockRejectedValueOnce(new Error('products unavailable'));
        render(<RegisterPage />);
        await waitFor(() => expect(consoleError).toHaveBeenCalledWith('Failed to load products'));
        expect(screen.getByText('continue_btn')).toBeInTheDocument();
        consoleError.mockRestore();
    });

    it('shows lookup Error and fallback failures while remaining on the email step', async () => {
        render(<RegisterPage />);
        mocks.lookup.mockRejectedValueOnce(new Error('Lookup unavailable'));
        fireEvent.change(input('email'), { target: { value: 'first@example.com' } });
        fireEvent.submit(form());
        expect(await screen.findByText('Lookup unavailable')).toBeInTheDocument();

        mocks.lookup.mockRejectedValueOnce('unknown failure');
        fireEvent.change(input('email'), { target: { value: 'second@example.com' } });
        fireEvent.submit(form());
        expect(await screen.findByText('error_email_lookup')).toBeInTheDocument();
        expect(screen.getByText('continue_btn')).toBeInTheDocument();
    });

    it('supports the claim password-reset flow and resets it for another email', async () => {
        render(<RegisterPage />);
        await enterEmailAndLookup({ action: 'CLAIM', companyName: null });
        expect(screen.getByText('recognized_title')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'reset_btn' }));
        await waitFor(() => expect(mocks.forgotPassword).toHaveBeenCalledWith('user@example.com'));
        expect(screen.getByText('reset_sent_title')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'back_to_login' })).toHaveAttribute('href', '/login');

        fireEvent.click(screen.getByRole('button', { name: 'different_email' }));
        expect(input('email')).not.toBeDisabled();
        expect(screen.getByText('continue_btn')).toBeInTheDocument();
    });

    it('reports claim reset errors using both explicit and fallback messages', async () => {
        render(<RegisterPage />);
        await enterEmailAndLookup({ action: 'CLAIM', companyName: null });
        mocks.forgotPassword.mockRejectedValueOnce(new Error('Reset unavailable'));
        fireEvent.click(screen.getByRole('button', { name: 'reset_btn' }));
        expect(await screen.findByText('Reset unavailable')).toBeInTheDocument();

        mocks.forgotPassword.mockRejectedValueOnce('unknown failure');
        fireEvent.click(screen.getByRole('button', { name: 'reset_btn' }));
        expect(await screen.findByText('error_reset_failed')).toBeInTheDocument();
    });

    it('resends verification for inactive accounts and reports resend failures', async () => {
        render(<RegisterPage />);
        await enterEmailAndLookup({ action: 'INACTIVE', companyName: null });
        expect(screen.getByText('inactive_title')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'inactive_btn' }));
        await waitFor(() => expect(mocks.resendVerification).toHaveBeenCalledWith('user@example.com'));
        expect(screen.getByText('inactive_title')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'different_email' }));
        await enterEmailAndLookup({ action: 'INACTIVE', companyName: null });
        mocks.resendVerification.mockRejectedValueOnce(new Error('Verification unavailable'));
        fireEvent.click(screen.getByRole('button', { name: 'inactive_btn' }));
        expect(await screen.findByText('Verification unavailable')).toBeInTheDocument();
    });

    it('allows deleted accounts to start a fresh registration and CRM-rejected users to retry', async () => {
        render(<RegisterPage />);
        await enterEmailAndLookup({ action: 'DELETED', companyName: null });
        expect(screen.getByText('deleted_title')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'deleted_btn' }));
        expect(input('username')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'back_btn' }));
        await enterEmailAndLookup({ action: 'CRM_REJECTED', companyName: null });
        expect(screen.getByRole('link', { name: 'crm_rejected_sales_btn' })).toHaveAttribute(
            'href',
            'mailto:crm_rejected_sales_email',
        );
        fireEvent.click(screen.getByRole('button', { name: 'crm_rejected_try_different' }));
        expect(input('email')).not.toBeDisabled();
    });

    it('validates password confirmation and Allplan customer number before making a request', async () => {
        render(<RegisterPage />);
        await enterEmailAndLookup({ action: 'NEW', companyName: null });
        fillRegistrationFields({ confirmPassword: 'different-pass' });
        fireEvent.submit(form());
        expect(await screen.findByText('error_password_mismatch')).toBeInTheDocument();
        expect(mocks.fetch).toHaveBeenCalledTimes(1);

        fireEvent.change(input('confirmPassword'), { target: { value: 'secure-pass' } });
        fireEvent.click(input('isAllplanUser'));
        fireEvent.change(input('customerNo'), { target: { value: '123' } });
        fireEvent.submit(form());
        expect(await screen.findByText('error_customer_no')).toBeInTheDocument();
        expect(mocks.fetch).toHaveBeenCalledTimes(1);
    });

    it('submits all fields and selected products, then renders the success state', async () => {
        render(<RegisterPage />);
        await enterEmailAndLookup({ action: 'NEW', companyName: null });
        await waitFor(() => expect(screen.getByText('Allplan Architecture')).toBeInTheDocument());
        fillRegistrationFields();

        fireEvent.click(screen.getByRole('checkbox', { name: 'Allplan Architecture' }));
        fireEvent.click(screen.getByRole('checkbox', { name: 'Allplan Engineering' }));
        fireEvent.click(screen.getByRole('checkbox', { name: 'Allplan Engineering' }));
        mocks.fetch.mockResolvedValueOnce({ ok: true, json: vi.fn() });
        fireEvent.submit(form());

        await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(2));
        expect(mocks.fetch).toHaveBeenLastCalledWith(
            'http://api.test/v1/customers/register',
            expect.objectContaining({ method: 'POST' }),
        );
        const request = mocks.fetch.mock.calls.at(-1)?.[1] as { body: string };
        expect(JSON.parse(request.body)).toEqual(expect.objectContaining({
            username: 'test-user',
            email: 'user@example.com',
            company: 'Test Company',
            usedProducts: ['Allplan Architecture'],
            isAllplanUser: false,
        }));
        expect(await screen.findByText('success_title')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'back_to_login' })).toHaveAttribute('href', '/login');
    });

    it('surfaces API registration messages and the translated fallback for malformed failures', async () => {
        render(<RegisterPage />);
        await enterEmailAndLookup({ action: 'NEW', companyName: null });
        fillRegistrationFields();
        mocks.fetch.mockResolvedValueOnce({
            ok: false,
            json: vi.fn().mockResolvedValue({ message: 'Email already exists' }),
        });
        fireEvent.submit(form());
        expect(await screen.findByText('Email already exists')).toBeInTheDocument();

        mocks.fetch.mockResolvedValueOnce({
            ok: false,
            json: vi.fn().mockResolvedValue({}),
        });
        fireEvent.submit(form());
        expect(await screen.findByText('error_register_failed')).toBeInTheDocument();
    });

    it('uses the generic registration error for non-Error request rejection', async () => {
        render(<RegisterPage />);
        await enterEmailAndLookup({ action: 'NEW', companyName: null });
        fillRegistrationFields();
        mocks.fetch.mockRejectedValueOnce('network failed');
        fireEvent.submit(form());
        expect(await screen.findByText('error_default')).toBeInTheDocument();
    });
});

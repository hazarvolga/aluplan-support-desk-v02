import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfilePage from './page';
import { useAuth } from '@/components/auth/role-guard';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';

vi.mock('@/components/auth/role-guard', () => ({
    useAuth: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
    api: {
        auth: {
            me: vi.fn(),
            logout: vi.fn(),
        },
        users: {
            get: vi.fn(),
            updateProfile: vi.fn(),
        },
        preferences: {
            getEmail: vi.fn(),
            updateEmail: vi.fn(),
        },
    },
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('ProfilePage - SEC-03 Password Change and Profile Behavior', () => {
    const mockRouter = {
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    };

    const mockLogout = vi.fn().mockImplementation(async (target?: string) => {
        mockRouter.push(target || '/login');
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useRouter).mockReturnValue(mockRouter as any);
        vi.mocked(useAuth).mockReturnValue({
            user: { id: 'u1', fullName: 'Ahmet Yilmaz', email: 'ahmet@example.com', role: 'CUSTOMER' } as any,
            logout: mockLogout,
        } as any);

        vi.mocked(api.auth.me).mockResolvedValue({
            id: 'u1',
            fullName: 'Ahmet Yilmaz',
            email: 'ahmet@example.com',
            role: 'CUSTOMER',
            status: 'ACTIVE',
        } as any);

        vi.mocked(api.users.get).mockResolvedValue({
            id: 'u1',
            fullName: 'Ahmet Yilmaz',
            email: 'ahmet@example.com',
            customerProfile: {
                phoneNumber: '05551234567',
                companyName: 'Acme Ins',
                jobTitle: 'Mimar',
                industry: 'Insaat',
                customerNo: 'CUST-00001',
                contractStatus: 'ACTIVE',
                crmVerified: false,
            },
        } as any);

        vi.mocked(api.preferences.getEmail).mockResolvedValue([]);
    });

    it('should REJECT password change if currentPassword is empty', async () => {
        render(<ProfilePage />);

        await waitFor(() => {
            expect(screen.getByDisplayValue('Ahmet Yilmaz')).toBeDefined();
        });

        const newPassInput = screen.getByPlaceholderText('placeholders.new_password');
        const confirmPassInput = screen.getByPlaceholderText('placeholders.confirm_password');
        const saveButton = screen.getByRole('button', { name: 'save_button' });

        fireEvent.change(newPassInput, { target: { value: 'NewSecretPass123' } });
        fireEvent.change(confirmPassInput, { target: { value: 'NewSecretPass123' } });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('toasts.current_password_required');
        });

        expect(api.users.updateProfile).not.toHaveBeenCalled();
        expect(mockLogout).not.toHaveBeenCalled();
    });

    it('should REJECT password change if newPassword is shorter than 8 characters', async () => {
        render(<ProfilePage />);

        await waitFor(() => {
            expect(screen.getByDisplayValue('Ahmet Yilmaz')).toBeDefined();
        });

        const currentPassInput = screen.getByPlaceholderText('placeholders.current_password');
        const newPassInput = screen.getByPlaceholderText('placeholders.new_password');
        const confirmPassInput = screen.getByPlaceholderText('placeholders.confirm_password');
        const saveButton = screen.getByRole('button', { name: 'save_button' });

        fireEvent.change(currentPassInput, { target: { value: 'OldSecretPass123' } });
        fireEvent.change(newPassInput, { target: { value: 'short' } });
        fireEvent.change(confirmPassInput, { target: { value: 'short' } });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('toasts.password_min_length');
        });

        expect(api.users.updateProfile).not.toHaveBeenCalled();
        expect(mockLogout).not.toHaveBeenCalled();
    });

    it('should REJECT password change if passwords do not match', async () => {
        render(<ProfilePage />);

        await waitFor(() => {
            expect(screen.getByDisplayValue('Ahmet Yilmaz')).toBeDefined();
        });

        const currentPassInput = screen.getByPlaceholderText('placeholders.current_password');
        const newPassInput = screen.getByPlaceholderText('placeholders.new_password');
        const confirmPassInput = screen.getByPlaceholderText('placeholders.confirm_password');
        const saveButton = screen.getByRole('button', { name: 'save_button' });

        fireEvent.change(currentPassInput, { target: { value: 'OldSecretPass123' } });
        fireEvent.change(newPassInput, { target: { value: 'NewSecretPass123' } });
        fireEvent.change(confirmPassInput, { target: { value: 'MismatchPass456' } });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('toasts.password_mismatch');
        });

        expect(api.users.updateProfile).not.toHaveBeenCalled();
        expect(mockLogout).not.toHaveBeenCalled();
    });

    it('should successfully update password, invalidate browser session, show toast, and redirect to locale login', async () => {
        vi.mocked(api.users.updateProfile).mockResolvedValue({
            id: 'u1',
            fullName: 'Ahmet Yilmaz',
            passwordChanged: true,
        });

        render(<ProfilePage />);

        await waitFor(() => {
            expect(screen.getByDisplayValue('Ahmet Yilmaz')).toBeDefined();
        });

        const currentPassInput = screen.getByPlaceholderText('placeholders.current_password');
        const newPassInput = screen.getByPlaceholderText('placeholders.new_password');
        const confirmPassInput = screen.getByPlaceholderText('placeholders.confirm_password');
        const saveButton = screen.getByRole('button', { name: 'save_button' });

        fireEvent.change(currentPassInput, { target: { value: 'OldSecretPass123' } });
        fireEvent.change(newPassInput, { target: { value: 'BrandNewSecret2026!' } });
        fireEvent.change(confirmPassInput, { target: { value: 'BrandNewSecret2026!' } });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(api.users.updateProfile).toHaveBeenCalledWith(expect.objectContaining({
                currentPassword: 'OldSecretPass123',
                newPassword: 'BrandNewSecret2026!',
            }));
        });

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('toasts.password_changed_relogin');
            expect(mockLogout).toHaveBeenCalledTimes(1);
            expect(mockLogout).toHaveBeenCalledWith('/tr/login');
            expect(mockRouter.push).toHaveBeenCalledTimes(1);
            expect(mockRouter.push).toHaveBeenCalledWith('/tr/login');
        });
    });

    it('should update normal profile without password change, without logout, and without redirection', async () => {
        vi.mocked(api.users.updateProfile).mockResolvedValue({
            id: 'u1',
            fullName: 'Ahmet Guncel Yilmaz',
            passwordChanged: false,
        });

        render(<ProfilePage />);

        await waitFor(() => {
            expect(screen.getByDisplayValue('Ahmet Yilmaz')).toBeDefined();
        });

        const fullNameInput = screen.getByDisplayValue('Ahmet Yilmaz');
        const saveButton = screen.getByRole('button', { name: 'save_button' });

        fireEvent.change(fullNameInput, { target: { value: 'Ahmet Guncel Yilmaz' } });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(api.users.updateProfile).toHaveBeenCalledWith(expect.objectContaining({
                fullName: 'Ahmet Guncel Yilmaz',
            }));
        });

        // Ensure no password fields sent
        expect(api.users.updateProfile).toHaveBeenCalledWith(expect.not.objectContaining({
            currentPassword: expect.anything(),
            newPassword: expect.anything(),
        }));

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('toasts.profile_updated');
            expect(mockLogout).not.toHaveBeenCalled();
            expect(mockRouter.push).not.toHaveBeenCalled();
        });
    });
});

import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AuthProvider, RoleGuard } from './role-guard';

describe('RoleGuard authorization rendering', () => {
    const push = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(usePathname).mockReturnValue('/tr/review-center');
        vi.mocked(useRouter).mockReturnValue({
            push,
            replace: vi.fn(),
            prefetch: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            refresh: vi.fn(),
        } as never);
    });

    it('never renders protected children for a customer awaiting redirect', async () => {
        vi.spyOn(api.auth, 'me').mockResolvedValue({
            id: 'customer-1',
            role: 'CUSTOMER',
        } as never);

        render(
            <AuthProvider>
                <RoleGuard><div>PROTECTED_SENTINEL</div></RoleGuard>
            </AuthProvider>,
        );

        await waitFor(() => expect(push).toHaveBeenCalledWith('/my-tickets'));
        expect(screen.queryByText('PROTECTED_SENTINEL')).toBeNull();
    });

    it('redirects to locale-aware login on default logout from localized path', async () => {
        vi.spyOn(api.auth, 'me').mockResolvedValue({ id: 'u1', role: 'ADMIN' } as never);
        vi.spyOn(api.auth, 'logout').mockResolvedValue({ success: true } as never);

        const { useAuth } = await import('./role-guard');
        function TestLogout() {
            const { logout } = useAuth();
            return <button onClick={() => logout()}>Logout</button>;
        }

        render(
            <AuthProvider>
                <TestLogout />
            </AuthProvider>,
        );

        screen.getByRole('button', { name: 'Logout' }).click();

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith('/tr/login');
        });
    });

    it('redirects to explicit target when passed to logout', async () => {
        vi.spyOn(api.auth, 'me').mockResolvedValue({ id: 'u1', role: 'ADMIN' } as never);
        vi.spyOn(api.auth, 'logout').mockResolvedValue({ success: true } as never);

        const { useAuth } = await import('./role-guard');
        function TestLogout() {
            const { logout } = useAuth();
            return <button onClick={() => logout('/de/login')}>Logout</button>;
        }

        render(
            <AuthProvider>
                <TestLogout />
            </AuthProvider>,
        );

        screen.getByRole('button', { name: 'Logout' }).click();

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith('/de/login');
        });
    });
});

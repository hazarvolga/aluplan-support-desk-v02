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
});

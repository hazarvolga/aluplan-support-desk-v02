import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ResetPasswordPage from './page';

const mocks = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mocks.push }),
}));

describe('ResetPasswordPage accessibility', () => {
    beforeEach(() => {
        mocks.push.mockReset();
        window.history.replaceState(null, '', '/tr/reset-password#token=test-token');
    });

    it('provides keyboard-accessible names for password visibility controls', async () => {
        const user = userEvent.setup();
        render(<ResetPasswordPage />);

        const newPasswordToggle = await screen.findByRole('button', { name: 'show_new_password' });
        const confirmationToggle = screen.getByRole('button', { name: 'show_confirm_password' });
        expect(newPasswordToggle).not.toHaveAttribute('tabindex', '-1');
        expect(confirmationToggle).not.toHaveAttribute('tabindex', '-1');

        await user.click(newPasswordToggle);
        expect(screen.getByRole('button', { name: 'hide_new_password' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'show_confirm_password' })).toBeInTheDocument();
    });
});

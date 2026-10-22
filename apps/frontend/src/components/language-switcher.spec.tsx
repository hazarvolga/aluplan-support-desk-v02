import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageSwitcher } from './language-switcher';

const mocks = vi.hoisted(() => ({
    replace: vi.fn(),
    updateProfile: vi.fn(),
}));

vi.mock('@/i18n/routing', () => ({
    usePathname: () => '/',
    useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock('@/lib/api', () => ({
    api: {
        users: {
            updateProfile: mocks.updateProfile,
        },
    },
}));

describe('LanguageSwitcher', () => {
    beforeEach(() => {
        mocks.replace.mockReset();
        mocks.updateProfile.mockReset();
    });

    it('changes a public page locale without calling the authenticated profile API', async () => {
        const user = userEvent.setup();
        render(<LanguageSwitcher />);

        await user.click(screen.getByRole('button', { name: 'en' }));

        expect(mocks.replace).toHaveBeenCalledWith('/', { locale: 'en' });
        expect(mocks.updateProfile).not.toHaveBeenCalled();
    });

    it('persists the locale when rendered in an authenticated surface', async () => {
        mocks.updateProfile.mockResolvedValue(undefined);
        const user = userEvent.setup();
        render(<LanguageSwitcher persistToProfile />);

        await user.click(screen.getByRole('button', { name: 'en' }));

        expect(mocks.replace).toHaveBeenCalledWith('/', { locale: 'en' });
        await waitFor(() => {
            expect(mocks.updateProfile).toHaveBeenCalledWith({ language: 'en' });
        });
    });

    it('keeps inactive language controls at full muted-foreground contrast', () => {
        render(<LanguageSwitcher />);

        const inactiveButton = screen.getByRole('button', { name: 'en' });
        expect(inactiveButton).toHaveClass('text-muted-foreground');
        expect(inactiveButton).not.toHaveClass('text-muted-foreground/60');
    });

    it('exposes the active language programmatically', () => {
        render(<LanguageSwitcher />);

        expect(screen.getByRole('button', { name: 'tr' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'en' })).toHaveAttribute('aria-pressed', 'false');
        expect(screen.getByRole('button', { name: 'de' })).toHaveAttribute('aria-pressed', 'false');
    });
});

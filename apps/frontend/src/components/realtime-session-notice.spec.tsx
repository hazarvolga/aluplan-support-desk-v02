import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RealtimeSessionNotice } from './realtime-session-notice';

const state = vi.hoisted(() => ({ ended: false, listener: () => {}, connect: vi.fn() }));
vi.mock('@/lib/socket', () => ({
    isSocketSessionEnded: () => state.ended,
    subscribeSocketSession: (listener: () => void) => { state.listener = listener; return () => {}; },
    getSocket: () => ({ connect: state.connect }),
}));
vi.mock('next-intl', () => ({ useLocale: () => 'tr', useTranslations: () => (key: string) => key }));

describe('RealtimeSessionNotice', () => {
    beforeEach(() => { state.ended = false; state.connect.mockClear(); });
    it('leaves the page untouched while connected', () => {
        const { container } = render(<RealtimeSessionNotice />);
        expect(container.firstChild).toBeNull();
    });
    it('keeps the draft page mounted and offers sign-in in a separate tab with deliberate reconnect', () => {
        render(<><textarea aria-label="draft" defaultValue="Unsent reply" /><RealtimeSessionNotice /></>);
        act(() => { state.ended = true; state.listener(); });
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/tr/login');
        expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
        expect(state.connect).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button'));
        expect(state.connect).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('textbox')).toHaveValue('Unsent reply');
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });
});

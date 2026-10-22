import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Toast, ToastAction, ToastClose, ToastProvider, ToastTitle, ToastViewport } from './toast';

describe('Toast accessibility', () => {
    it('gives the icon-only close control an accessible name', () => {
        render(
            <ToastProvider>
                <Toast open>
                    <ToastTitle>Test notification</ToastTitle>
                    <ToastClose />
                </Toast>
                <ToastViewport />
            </ToastProvider>,
        );

        expect(screen.getByRole('button', { name: /close notification/i })).toBeInTheDocument();
    });

    it('uses an AA-friendly dark destructive surface', () => {
        render(
            <ToastProvider>
                <Toast open variant="destructive" data-testid="destructive-toast" />
                <ToastViewport />
            </ToastProvider>,
        );

        expect(screen.getByTestId('destructive-toast')).toHaveClass('bg-red-950', 'text-red-50');
    });

    it('keeps destructive action hover text on a dark AA-friendly surface', () => {
        render(
            <ToastProvider>
                <Toast open variant="destructive">
                    <ToastAction altText="Retry" data-testid="destructive-action">Retry</ToastAction>
                </Toast>
                <ToastViewport />
            </ToastProvider>,
        );

        expect(screen.getByTestId('destructive-action')).toHaveClass('group-[.destructive]:hover:bg-red-900');
        expect(screen.getByTestId('destructive-action')).not.toHaveClass('group-[.destructive]:hover:bg-destructive');
    });
});

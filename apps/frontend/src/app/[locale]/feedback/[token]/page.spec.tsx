import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PublicFeedbackPage from './page';

const mocks = vi.hoisted(() => ({ getCsatSurvey: vi.fn(), submitCsatFeedback: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: { tickets: mocks } }));

const params = Promise.resolve({ token: 'signed.synthetic.token' });

describe('public email CSAT flow', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        mocks.getCsatSurvey.mockResolvedValue({ ticketNumber: 'SUP-SYNTHETIC' });
        mocks.submitCsatFeedback.mockResolvedValue({ submitted: true });
    });

    it('loads a minimal ticket reference and submits the selected rating with an optional comment', async () => {
        await act(async () => { render(<PublicFeedbackPage params={params} />); });
        expect(await screen.findByText(/SUP-SYNTHETIC/)).toBeInTheDocument();
        expect(mocks.getCsatSurvey).toHaveBeenCalledWith('signed.synthetic.token');
        expect(screen.getByText('status_disclaimer')).toBeInTheDocument();

        const ratingInputs = screen.getAllByRole('radio');
        expect(ratingInputs).toHaveLength(5);
        expect(ratingInputs.every((input) => input.getAttribute('type') === 'radio')).toBe(true);
        fireEvent.click(ratingInputs[4]);
        fireEvent.change(screen.getByLabelText('comment_label'), { target: { value: 'Very helpful' } });
        fireEvent.click(screen.getByRole('button', { name: 'submit' }));

        await waitFor(() => expect(mocks.submitCsatFeedback).toHaveBeenCalledWith('signed.synthetic.token', 5, 'Very helpful'));
        expect(await screen.findByRole('heading', { name: 'success_title' })).toBeInTheDocument();
    });

    it('shows a safe unavailable state when the signed survey link cannot be loaded', async () => {
        mocks.getCsatSurvey.mockRejectedValue(new Error('Ticket identifiers must not leak'));
        await act(async () => { render(<PublicFeedbackPage params={params} />); });
        expect(await screen.findByRole('heading', { name: 'invalid_title' })).toBeInTheDocument();
        expect(screen.queryByText(/Ticket identifiers/)).not.toBeInTheDocument();
        expect(mocks.submitCsatFeedback).not.toHaveBeenCalled();
    });

    it('requires a rating and prevents duplicate submission while pending', async () => {
        let resolveSubmit!: (value: { submitted: boolean }) => void;
        mocks.submitCsatFeedback.mockReturnValue(new Promise(resolve => { resolveSubmit = resolve; }));
        await act(async () => { render(<PublicFeedbackPage params={params} />); });
        await screen.findByText(/SUP-SYNTHETIC/);
        expect(screen.getByRole('button', { name: 'submit' })).toBeDisabled();
        fireEvent.click(screen.getAllByRole('radio')[2]);
        const submit = screen.getByRole('button', { name: 'submit' });
        act(() => { submit.click(); submit.click(); });
        expect(screen.getByRole('button', { name: 'submitting' })).toBeDisabled();
        await act(async () => resolveSubmit({ submitted: true }));
        expect(await screen.findByRole('heading', { name: 'success_title' })).toBeInTheDocument();
        expect(mocks.submitCsatFeedback).toHaveBeenCalledTimes(1);
    });
});

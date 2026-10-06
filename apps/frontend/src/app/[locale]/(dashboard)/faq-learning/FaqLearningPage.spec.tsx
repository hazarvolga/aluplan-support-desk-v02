import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/test/setup';
import FaqLearningPage from './page';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const longAnswer = [
    'İlk paragraf kısa bir problem tanımıdır.',
    'İkinci paragraf kritik kontrolleri ayrıntılı biçimde açıklar.',
    'Son paragraf yöneticinin onaydan önce mutlaka görmesi gereken doğrulama adımıdır.',
].join('\n\n');

describe('FaqLearningPage candidate review', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        server.use(
            http.get(`${API_BASE}/faq`, () => HttpResponse.json({
                data: [{
                    id: 'faq-1',
                    question: 'Uzun yanıt nasıl incelenir?',
                    answer: longAnswer,
                    confidenceScore: 0.9,
                    frequency: 3,
                    tags: ['allplan'],
                    language: 'tr',
                    sourceTypes: ['TICKET'],
                    sources: [{
                        id: 'source-1',
                        sourceType: 'TICKET',
                        ticket: { id: 'ticket-1', ticketNumber: 'SUP-00999' },
                        interaction: null,
                    }],
                }],
            })),
            http.get(`${API_BASE}/ai/health-metrics`, () => HttpResponse.json({
                totalInteractions: 1,
                deflectionRate: 0,
                aiAccuracy: 90,
                confidenceDistribution: [],
            })),
            http.get(`${API_BASE}/ai/sources-stats`, () => HttpResponse.json({
                pillars: { DOCUMENTS: 0, ARTICLES: 0, URLS: 0, TICKETS: 1 },
                totalSources: 1,
                pendingFaqs: 1,
            })),
        );
    });

    it('requires opening the review dialog before approve or dismiss actions are available', async () => {
        const user = userEvent.setup();
        render(<FaqLearningPage />);

        const reviewButton = await screen.findByRole('button', { name: 'review_candidate' });
        expect(screen.queryByRole('button', { name: 'add_to_kb' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'dismiss' })).not.toBeInTheDocument();

        await user.click(reviewButton);

        const dialog = await screen.findByRole('dialog', { name: 'candidate_detail' });
        expect(within(dialog).getByText('İlk paragraf kısa bir problem tanımıdır.')).toBeInTheDocument();
        expect(within(dialog).getByText('Son paragraf yöneticinin onaydan önce mutlaka görmesi gereken doğrulama adımıdır.')).toBeInTheDocument();
        expect(within(dialog).getByText('SUP-00999')).toBeInTheDocument();
        expect(within(dialog).getByRole('button', { name: 'add_to_kb' })).toBeEnabled();
        expect(within(dialog).getByRole('button', { name: 'dismiss' })).toBeEnabled();
    });

    it('keeps the dialog open when approval fails so the candidate can still be reviewed', async () => {
        const user = userEvent.setup();
        let approveRequests = 0;
        server.use(
            http.post(`${API_BASE}/faq/faq-1/approve`, () => {
                approveRequests += 1;
                return HttpResponse.json({ message: 'temporary failure' }, { status: 503 });
            }),
        );
        render(<FaqLearningPage />);

        await user.click(await screen.findByRole('button', { name: 'review_candidate' }));
        const dialog = await screen.findByRole('dialog', { name: 'candidate_detail' });
        await user.click(within(dialog).getByRole('button', { name: 'add_to_kb' }));

        await waitFor(() => expect(approveRequests).toBe(1));
        await waitFor(() => expect(within(dialog).getByRole('button', { name: 'add_to_kb' })).toBeEnabled());
        expect(screen.getByRole('dialog', { name: 'candidate_detail' })).toBeInTheDocument();
        expect(within(dialog).getByText('Son paragraf yöneticinin onaydan önce mutlaka görmesi gereken doğrulama adımıdır.')).toBeInTheDocument();
    });
});

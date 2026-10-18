import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/test/setup';
import { AiSettings } from './AiSettings';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock('sonner', () => ({ toast }));

describe('AiSettings', () => {
    let settingsUrl = '';
    const writes: Array<Record<string, unknown>> = [];

    beforeEach(() => {
        vi.clearAllMocks();
        settingsUrl = '';
        writes.length = 0;
        server.use(
            http.get(`${API_BASE}/ai/health-status`, () => HttpResponse.json({
                status: 'HEALTHY',
                chatProvider: 'openai',
                embedProvider: 'openai',
                providers: {
                    openai: { available: true, message: 'OK' },
                    llmapi: { available: false, message: 'Not configured' },
                },
            })),
            http.get(`${API_BASE}/settings`, ({ request }) => {
                settingsUrl = request.url;
                return HttpResponse.json([
                    { key: 'ai.openai.api_key', value: '********', isSecret: true },
                    { key: 'ai.openai.chat_model', value: 'gpt-4o-mini', isSecret: false },
                    { key: 'ai.specialized.categorization_provider', value: 'ollama', isSecret: false },
                ]);
            }),
            http.post(`${API_BASE}/settings`, async ({ request }) => {
                writes.push(await request.json() as Record<string, unknown>);
                return HttpResponse.json({}, { status: 201 });
            }),
        );
    });

    it('renders the health Record contract without exposing retired or unsupported providers', async () => {
        render(<AiSettings />);

        expect(await screen.findByRole('heading', { name: 'OpenAI' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'LLMAPI' })).toBeInTheDocument();
        expect(screen.queryByText('Ollama')).not.toBeInTheDocument();
        expect(screen.queryByText('Anthropic')).not.toBeInTheDocument();
        expect(screen.queryByText('Vertex')).not.toBeInTheDocument();
        expect(settingsUrl).not.toContain('decrypt=true');
        expect(screen.getAllByRole('combobox')[0]).toHaveValue('global');
    });

    it('does not write a masked credential back when saving provider settings', async () => {
        render(<AiSettings />);

        const openAiCard = (await screen.findByRole('heading', { name: 'OpenAI' })).closest('[class*="rounded-none"]');
        expect(openAiCard).not.toBeNull();
        fireEvent.click(within(openAiCard as HTMLElement).getByRole('button', { name: 'save_btn' }));

        await waitFor(() => expect(writes).toContainEqual({
            key: 'ai.openai.chat_model',
            value: 'gpt-4o-mini',
        }));
        expect(writes.some((write) => write.key === 'ai.openai.api_key')).toBe(false);
    });

    it('trims a newly entered credential and masks it after save so a second save omits it', async () => {
        render(<AiSettings />);

        const getOpenAiCard = () => screen.getByRole('heading', { name: 'OpenAI' }).closest('[class*="rounded-none"]') as HTMLElement;
        await screen.findByRole('heading', { name: 'OpenAI' });
        const credential = getOpenAiCard().querySelector('input[type="password"]') as HTMLInputElement;
        fireEvent.change(credential, { target: { value: '  new-openai-key  ' } });
        fireEvent.click(within(getOpenAiCard()).getByRole('button', { name: 'save_btn' }));

        await waitFor(() => expect(writes).toContainEqual({
            key: 'ai.openai.api_key',
            value: 'new-openai-key',
            isSecret: true,
        }));
        await waitFor(() => expect(getOpenAiCard().querySelector('input[type="password"]')).toHaveValue('********'));

        writes.length = 0;
        fireEvent.click(within(getOpenAiCard()).getByRole('button', { name: 'save_btn' }));
        await waitFor(() => expect(writes).toContainEqual({
            key: 'ai.openai.chat_model',
            value: 'gpt-4o-mini',
        }));
        expect(writes.some((write) => write.key === 'ai.openai.api_key')).toBe(false);
    });

    it('does not overwrite a stored credential with whitespace', async () => {
        render(<AiSettings />);

        const getOpenAiCard = () => screen.getByRole('heading', { name: 'OpenAI' }).closest('[class*="rounded-none"]') as HTMLElement;
        await screen.findByRole('heading', { name: 'OpenAI' });
        const credential = getOpenAiCard().querySelector('input[type="password"]') as HTMLInputElement;
        fireEvent.change(credential, { target: { value: '   ' } });
        fireEvent.click(within(getOpenAiCard()).getByRole('button', { name: 'save_btn' }));

        await waitFor(() => expect(writes).toContainEqual({
            key: 'ai.openai.chat_model',
            value: 'gpt-4o-mini',
        }));
        expect(writes.some((write) => write.key === 'ai.openai.api_key')).toBe(false);
    });
});

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import KnowledgePoolUploadPage from './page';

const mocks = vi.hoisted(() => ({
    upload: vi.fn(),
    uploadMany: vi.fn(),
    toast: vi.fn(),
    push: vi.fn(),
    back: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ api: { pool: { upload: mocks.upload, uploadMany: mocks.uploadMany } } }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push, back: mocks.back }) }));

const file = (name: string, size = 10, type = 'text/plain') => new File(['x'.repeat(size)], name, { type });
const input = () => document.querySelector('#file-upload') as HTMLInputElement;
const submit = () => screen.getByRole('button', { name: /INITIATE_INDEXING_SEQUENCE|STREAMS_SYNCING/ });

describe('KnowledgePoolUploadPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.upload.mockResolvedValue({ id: 'source-1', skipped: false });
        mocks.uploadMany.mockResolvedValue({ uploaded: 2, skipped: 0, failed: 0, results: [] });
    });
    afterEach(() => vi.useRealTimers());

    it('selects a single file, derives its identifier and completes upload telemetry', async () => {
        vi.useFakeTimers();
        render(<KnowledgePoolUploadPage />);
        fireEvent.change(input(), { target: { files: [file('guide.md')] } });
        expect(screen.getByPlaceholderText('Enter dataset name...')).toHaveValue('guide');
        expect(screen.getByText('guide.md')).toBeInTheDocument();
        fireEvent.click(submit());
        await act(async () => { await Promise.resolve(); });
        expect(mocks.upload).toHaveBeenCalledWith('guide', expect.objectContaining({ name: 'guide.md' }));
        expect(screen.getByText('SUCCESS')).toBeInTheDocument();
        expect(screen.getByText(/DATA_TRANSFER_COMPLETE/)).toBeInTheDocument();
        expect(mocks.toast).toHaveBeenCalledWith({ title: 'Başarılı', description: '1 dosya yüklendi ve indeksleme başlatıldı.' });
        await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
        expect(mocks.push).toHaveBeenCalledWith('/knowledge-pool');
    });

    it('requires a custom identifier when the single-file name is cleared', async () => {
        const user = userEvent.setup();
        render(<KnowledgePoolUploadPage />);
        await user.upload(input(), file('manual.pdf', 4, 'application/pdf'));
        await user.clear(screen.getByPlaceholderText('Enter dataset name...'));
        await user.click(submit());
        expect(mocks.upload).not.toHaveBeenCalled();
        expect(mocks.toast).toHaveBeenCalledWith({ title: 'Hata', description: 'Lütfen dosya adını girin.', variant: 'destructive' });
    });

    it('stops after a duplicate single upload without scheduling navigation', async () => {
        mocks.upload.mockResolvedValueOnce({ skipped: true, message: 'Already indexed' });
        const user = userEvent.setup();
        render(<KnowledgePoolUploadPage />);
        await user.upload(input(), file('duplicate.txt'));
        await user.click(submit());
        await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith({ title: 'Atlandı', description: 'Already indexed' }));
        expect(screen.getByText('SUCCESS')).toBeInTheDocument();
        expect(screen.getByText(/DUPLICATE_SKIPPED: DUPLICATE.TXT/)).toBeInTheDocument();
        expect(mocks.push).not.toHaveBeenCalled();
    });

    it('uploads multiple files, reports progress and duplicate filenames', async () => {
        mocks.uploadMany.mockImplementationOnce(async (_files: File[], progress: (completed: number, total: number, file: File) => void) => {
            progress(1, 2, file('one.md'));
            progress(2, 2, file('two.pdf'));
            return { uploaded: 1, skipped: 1, failed: 0, results: [{ fileName: 'two.pdf', skipped: true }] };
        });
        const user = userEvent.setup();
        render(<KnowledgePoolUploadPage />);
        await user.upload(input(), [file('one.md'), file('two.pdf', 4, 'application/pdf')]);
        expect(screen.getByText('2 files selected')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Bulk upload uses original file names')).toBeDisabled();
        await user.click(submit());
        await waitFor(() => expect(mocks.uploadMany).toHaveBeenCalled());
        expect(screen.getByText(/PROCESSED_2\/2: TWO.PDF/)).toBeInTheDocument();
        expect(screen.getByText(/DUPLICATE_SKIPPED: TWO.PDF/)).toBeInTheDocument();
        expect(mocks.toast).toHaveBeenCalledWith({ title: 'Başarılı', description: '1 dosya yüklendi, 1 duplicate atlandı.' });
    });

    it.each([
        [{ uploaded: 1, skipped: 0, failed: 1, results: [] }, 'Kısmi Başarı', 'default', 'SUCCESS'],
        [{ uploaded: 0, skipped: 0, failed: 2, results: [{ skipped: false }] }, 'Hata', 'destructive', 'FAILED'],
        [{ uploaded: 0, skipped: 1, failed: 1, results: [{ skipped: true }] }, 'Kısmi Başarı', 'default', 'SUCCESS'],
    ])('reports partial and failed bulk outcomes %#', async (summary, title, variant, status) => {
        mocks.uploadMany.mockResolvedValueOnce(summary);
        const user = userEvent.setup();
        render(<KnowledgePoolUploadPage />);
        await user.upload(input(), [file('one.md'), file('two.md')]);
        await user.click(submit());
        await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ title, variant })));
        expect(screen.getByText(status)).toBeInTheDocument();
        if (summary.skipped) expect(screen.getByText(/DUPLICATE_SKIPPED: UNKNOWN/)).toBeInTheDocument();
    });

    it('shows a safe upload failure without exposing server details in toast or telemetry', async () => {
        const user = userEvent.setup();
        const providerDetail = 'S3 AccessDenied: bucket=private-documents request=secret-123';
        mocks.upload.mockRejectedValueOnce(new Error(providerDetail));
        const { unmount } = render(<KnowledgePoolUploadPage />);
        await user.click(screen.getByRole('button', { name: /BACK_TO_POOL/ }));
        expect(mocks.back).toHaveBeenCalled();
        await user.upload(input(), file('bad.md'));
        await user.click(submit());
        await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith({ title: 'failure_title', description: 'failure_description', variant: 'destructive' }));
        expect(screen.getByText(/UPLOAD_FAILED/)).toBeInTheDocument();
        expect(screen.queryByText(new RegExp(providerDetail, 'i'))).not.toBeInTheDocument();
        unmount();

        mocks.upload.mockRejectedValueOnce('unknown');
        render(<KnowledgePoolUploadPage />);
        await user.upload(input(), file('bad-again.md'));
        await user.click(submit());
        await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith({ title: 'failure_title', description: 'failure_description', variant: 'destructive' }));
    });
});

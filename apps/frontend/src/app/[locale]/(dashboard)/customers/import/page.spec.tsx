import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ImportCustomersPage from './page';

type CsvOptions = {
    header: boolean;
    skipEmptyLines: boolean;
    delimiter: string;
    complete: (results: { data: Array<Record<string, string | undefined>> }) => void;
    error: (error: Error) => void;
};

const { toast, importCustomers, parseCsv, readerCalls } = vi.hoisted(() => ({
    toast: vi.fn(),
    importCustomers: vi.fn(),
    parseCsv: vi.fn(),
    readerCalls: [] as Array<{ file: Blob; encoding?: string }>,
}));

vi.mock('@/lib/api', () => ({ api: { customers: { import: importCustomers } } }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast }) }));
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, values?: { count?: number }) => values?.count === undefined ? key : `${key}:${values.count}`,
}));
vi.mock('papaparse', () => ({ default: { parse: parseCsv } }));

class ImmediateFileReader {
    result: string | ArrayBuffer | null = null;
    onload: ((event: ProgressEvent<FileReader>) => void) | null = null;

    readAsText(file: Blob, encoding?: string) {
        readerCalls.push({ file, encoding });
        this.result = 'csv contents';
        this.onload?.({ target: this } as unknown as ProgressEvent<FileReader>);
    }
}

const rawRow = (overrides: Record<string, string | undefined> = {}) => ({
    '(Do Not Modify) Contact': ' ext-1 ',
    'Company Name': ' Acme ',
    'Client ID: ALLPLAN (Company Name) (Account)': ' C-42 ',
    'Müşteri Durumu': ' Premium ',
    'Customer Status': ' Fallback Status ',
    'Abonelik Modeli': ' Annual ',
    'Subscription Model': ' Monthly ',
    ' Full Name': ' Ada Lovelace ',
    'Full Name': ' Fallback Name ',
    'First Name': ' Ada ',
    'Middle Name': ' Byron ',
    'Last Name': ' Lovelace ',
    'Job Title': ' Engineer ',
    Email: ' ada@example.com ',
    'Mobile Phone': ' +90 555 ',
    Status: ' Active ',
    ...overrides,
});

const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;
const chooseFile = (file: File | null = new File(['data'], 'customers.csv', { type: 'text/csv' })) => {
    const files = file ? [file] : [];
    fireEvent.change(fileInput(), { target: { files } });
};

const completeParse = (rows: Array<Record<string, string | undefined>>) => {
    const options = parseCsv.mock.calls.at(-1)?.[1] as CsvOptions;
    act(() => options.complete({ data: rows }));
    return options;
};

const failParse = (error: Error) => {
    const options = parseCsv.mock.calls.at(-1)?.[1] as CsvOptions;
    act(() => options.error(error));
};

describe('ImportCustomersPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        readerCalls.length = 0;
        vi.stubGlobal('FileReader', ImmediateFileReader);
        importCustomers.mockResolvedValue({ successCount: 1, errorCount: 0 });
    });

    it('opens the picker and ignores an empty file selection', async () => {
        const user = userEvent.setup();
        render(<ImportCustomersPage />);
        const input = fileInput();
        const click = vi.spyOn(input, 'click');

        await user.click(screen.getByRole('button', { name: 'import.select_btn' }));
        expect(click).toHaveBeenCalledOnce();
        chooseFile(null);
        expect(parseCsv).not.toHaveBeenCalled();
        expect(screen.getByText('import.select_file')).toBeInTheDocument();
    });

    it('maps and trims valid CSV rows, filters incomplete contacts, and shows warnings', () => {
        render(<ImportCustomersPage />);
        chooseFile();
        const options = completeParse([
            rawRow(),
            rawRow({
                '(Do Not Modify) Contact': ' ', 'Company Name': ' ',
                'Client ID: ALLPLAN (Company Name) (Account)': ' ',
                'Müşteri Durumu': ' ', 'Customer Status': ' Trial ',
                'Abonelik Modeli': ' ', 'Subscription Model': ' Monthly ',
                ' Full Name': ' ', 'Full Name': ' Grace Hopper ',
                'Middle Name': ' ', 'Job Title': ' ', 'Mobile Phone': ' ', Status: ' ',
                'First Name': ' Grace ', 'Last Name': ' Hopper ', Email: ' grace@example.com ',
            }),
            rawRow({ Email: '' }),
            rawRow({ 'First Name': '' }),
            rawRow({ 'Last Name': '' }),
        ]);

        expect(options).toMatchObject({ header: true, skipEmptyLines: true, delimiter: ';' });
        expect(readerCalls).toHaveLength(1);
        expect(readerCalls[0].encoding).toBe('iso-8859-9');
        expect(screen.getByText('labels.record_count:2')).toBeInTheDocument();
        expect(screen.getByText('import.attention')).toBeInTheDocument();
        expect(screen.getAllByText('1')).toHaveLength(2);
        expect(toast).not.toHaveBeenCalled();
    });

    it('shows a safe empty-data warning and parser failures', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        render(<ImportCustomersPage />);
        chooseFile();
        completeParse([rawRow({ Email: '' })]);
        expect(toast).toHaveBeenCalledWith({ variant: 'destructive', title: '⚠️ crm.log_empty', description: 'import.analysis_complete' });
        expect(screen.getByText('import.select_file')).toBeInTheDocument();

        chooseFile();
        failParse(new Error('malformed csv'));
        expect(consoleError).toHaveBeenCalledWith(expect.objectContaining({ message: 'malformed csv' }));
        expect(toast).toHaveBeenLastCalledWith({ variant: 'destructive', title: '❌ crm.error', description: 'labels.unknown' });
        consoleError.mockRestore();
    });

    it('cancels a validated import and returns to the file picker', async () => {
        const user = userEvent.setup();
        render(<ImportCustomersPage />);
        chooseFile();
        completeParse([rawRow()]);

        await user.click(screen.getByRole('button', { name: 'import.cancel' }));
        expect(screen.getByText('import.select_file')).toBeInTheDocument();
        expect(importCustomers).not.toHaveBeenCalled();
    });

    it('imports more than one batch, fills unknown companies, accumulates stats, and resets for a new upload', async () => {
        const user = userEvent.setup();
        const rows = Array.from({ length: 201 }, (_, index) => rawRow({
            '(Do Not Modify) Contact': `ext-${index}`,
            Email: `person-${index}@example.com`,
            'Company Name': index === 200 ? '' : `Company ${index}`,
        }));
        importCustomers
            .mockResolvedValueOnce({ successCount: 198, errorCount: 2 })
            .mockResolvedValueOnce({ successCount: undefined, errorCount: undefined });
        render(<ImportCustomersPage />);
        chooseFile();
        completeParse(rows);

        await user.click(screen.getByRole('button', { name: 'import.start_import' }));
        await screen.findByText('import.summary_title');
        expect(importCustomers).toHaveBeenCalledTimes(2);
        expect(importCustomers.mock.calls[0][0]).toHaveLength(200);
        expect(importCustomers.mock.calls[1][0]).toEqual([
            expect.objectContaining({ email: 'person-200@example.com', companyName: 'labels.unknown', status: 'Active' }),
        ]);
        expect(screen.getByText('201')).toBeInTheDocument();
        expect(screen.getByText('198')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'import.go_to_customers' })).toHaveAttribute('href', '/customers');
        await user.click(screen.getByRole('button', { name: 'import.new_upload' }));
        expect(screen.getByText('import.select_file')).toBeInTheDocument();
    });

    it.each([
        [new Error('Backend unavailable'), 'Backend unavailable'],
        ['non-error rejection', 'labels.unknown'],
    ])('recovers from import failure and reports %p safely', async (failure, description) => {
        const user = userEvent.setup();
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        importCustomers.mockRejectedValue(failure);
        render(<ImportCustomersPage />);
        chooseFile();
        completeParse([rawRow({ 'Company Name': '' })]);

        await user.click(screen.getByRole('button', { name: 'import.start_import' }));
        await waitFor(() => expect(toast).toHaveBeenCalledWith({
            variant: 'destructive', title: '❌ import.title', description,
        }));
        expect(screen.getByRole('button', { name: 'import.start_import' })).toBeInTheDocument();
        consoleError.mockRestore();
    });
});

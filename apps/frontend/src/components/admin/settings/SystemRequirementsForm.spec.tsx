import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SystemRequirementsForm } from './SystemRequirementsForm';

const mocks = vi.hoisted(() => ({
    get: vi.fn(),
    upsert: vi.fn(),
    toast: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
    api: {
        settings: {
            get: mocks.get,
            upsert: mocks.upsert,
        },
    },
}));

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({ toast: mocks.toast }),
}));

vi.mock('next-intl', () => ({
    useTranslations: (namespace: string) => (
        key: string,
        values?: Record<string, string>,
    ) => {
        if (key === 'init_list') return `init_list:${values?.lang}`;
        return `${namespace}.${key}`;
    },
}));

const savedRequirements = {
    tr: [{
        title: 'Allplan 2026',
        sections: [{ name: 'Donanım', items: ['16 GB RAM', 'SSD'] }],
    }],
    en: 'invalid',
};

describe('SystemRequirementsForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.get.mockResolvedValue({ value: JSON.stringify(savedRequirements) });
        mocks.upsert.mockResolvedValue({});
    });

    it('loads localized requirements and normalizes invalid locale payloads', async () => {
        render(<SystemRequirementsForm />);

        expect(await screen.findByDisplayValue('Allplan 2026')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Donanım')).toBeInTheDocument();
        expect(screen.getByDisplayValue('16 GB RAM')).toBeInTheDocument();
        expect(screen.getByDisplayValue('SSD')).toBeInTheDocument();
        expect(mocks.get).toHaveBeenCalledWith('SYSTEM_REQUIREMENTS');

        fireEvent.mouseDown(screen.getByRole('tab', { name: /common\.languages\.en/ }));
        expect(await screen.findByText('settings.requirements.no_products')).toBeInTheDocument();
    });

    it('adds, edits, and removes nested requirement data before saving the immutable result', async () => {
        render(<SystemRequirementsForm />);
        await screen.findByDisplayValue('Allplan 2026');

        fireEvent.change(screen.getByDisplayValue('Allplan 2026'), {
            target: { value: 'Allplan 2027' },
        });
        fireEvent.change(screen.getByDisplayValue('Donanım'), {
            target: { value: 'Minimum Donanım' },
        });
        fireEvent.change(screen.getByDisplayValue('16 GB RAM'), {
            target: { value: '32 GB RAM' },
        });

        fireEvent.click(screen.getByRole('button', { name: /settings\.requirements\.add_item/ }));
        const itemInputs = screen.getAllByPlaceholderText('settings.requirements.placeholders.item');
        fireEvent.change(itemInputs.at(-1)!, { target: { value: 'DirectX 12' } });

        fireEvent.click(screen.getByRole('button', { name: /settings\.requirements\.add_section/ }));
        const sectionInputs = screen.getAllByPlaceholderText('settings.requirements.placeholders.section');
        fireEvent.change(sectionInputs.at(-1)!, { target: { value: 'İşletim Sistemi' } });

        fireEvent.click(screen.getByRole('button', { name: /settings\.requirements\.save_btn/ }));

        await waitFor(() => expect(mocks.upsert).toHaveBeenCalledTimes(1));
        const payload = mocks.upsert.mock.calls[0][0] as { key: string; value: string; isSecret: boolean };
        expect(payload.key).toBe('SYSTEM_REQUIREMENTS');
        expect(payload.isSecret).toBe(false);
        expect(JSON.parse(payload.value).tr).toEqual([{
            title: 'Allplan 2027',
            sections: [
                { name: 'Minimum Donanım', items: ['32 GB RAM', 'SSD', 'DirectX 12'] },
                { name: 'İşletim Sistemi', items: [''] },
            ],
        }]);
        expect(mocks.toast).toHaveBeenCalledWith({
            title: 'common.success_title',
            description: 'settings.requirements.toasts.save_success',
        });

        const product = screen.getByDisplayValue('Allplan 2027').closest('.group') as HTMLElement;
        fireEvent.click(within(product).getByTitle('settings.requirements.remove_product'));
        expect(screen.queryByDisplayValue('Allplan 2027')).not.toBeInTheDocument();
    });

    it('initializes an empty locale with translated defaults and supports nested removal', async () => {
        mocks.get.mockResolvedValueOnce(null);
        render(<SystemRequirementsForm />);

        const initialize = await screen.findByRole('button', { name: 'init_list:TR' });
        fireEvent.click(initialize);
        expect(screen.getByDisplayValue('settings.requirements.default_product_title')).toBeInTheDocument();
        expect(screen.getByDisplayValue('settings.requirements.default_section_name')).toBeInTheDocument();
        expect(screen.getByDisplayValue('settings.requirements.default_item_text')).toBeInTheDocument();

        const deleteButtons = screen.getAllByRole('button').filter((button) => (
            button.querySelector('.lucide-trash-2') !== null
        ));
        fireEvent.click(deleteButtons.at(-1)!);
        expect(screen.queryByDisplayValue('settings.requirements.default_item_text')).not.toBeInTheDocument();

        const sectionDelete = screen.getAllByRole('button').find((button) => (
            button.querySelector('.lucide-trash-2') !== null
            && !button.title
        ));
        fireEvent.click(sectionDelete!);
        expect(screen.queryByDisplayValue('settings.requirements.default_section_name')).not.toBeInTheDocument();
    });

    it('keeps rendering after load failures and reports Error save failures', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        mocks.get.mockRejectedValueOnce(new Error('load failed'));
        mocks.upsert.mockRejectedValueOnce(new Error('write failed'));
        render(<SystemRequirementsForm />);

        expect(await screen.findByText('settings.requirements.no_products')).toBeInTheDocument();
        expect(consoleError).toHaveBeenCalledWith(
            'Failed to load system requirements',
            expect.any(Error),
        );

        fireEvent.click(screen.getByRole('button', { name: /settings\.requirements\.save_btn/ }));
        await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith({
            title: 'common.error_title',
            description: 'settings.requirements.toasts.save_error',
            variant: 'destructive',
        }));
        consoleError.mockRestore();
    });

    it('uses the generic error title for non-Error save failures', async () => {
        mocks.get.mockResolvedValueOnce(null);
        mocks.upsert.mockRejectedValueOnce('write failed');
        render(<SystemRequirementsForm />);
        await screen.findByText('settings.requirements.no_products');

        fireEvent.click(screen.getByRole('button', { name: /settings\.requirements\.save_btn/ }));
        await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith({
            title: 'common.error_title',
            description: 'settings.requirements.toasts.save_error',
            variant: 'destructive',
        }));
    });
});

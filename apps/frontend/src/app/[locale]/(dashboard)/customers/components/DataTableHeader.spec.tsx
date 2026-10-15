import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataTableHeader } from './DataTableHeader';

vi.mock('@/components/ui/popover', () => ({
    Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const callbacks = {
    sort: vi.fn(),
    group: vi.fn(),
    filter: vi.fn(),
};

const renderHeader = (props: Partial<React.ComponentProps<typeof DataTableHeader>> = {}) => render(
    <table><thead><tr><DataTableHeader
        columnKey="name"
        label="Name"
        currentSortField="name"
        currentSortOrder="asc"
        onSort={callbacks.sort}
        onGroupBy={callbacks.group}
        isGrouped
        onFilterChange={callbacks.filter}
        currentFilterValue="Ada"
        {...props}
    /></tr></thead></table>,
);

describe('DataTableHeader', () => {
    beforeEach(() => vi.clearAllMocks());

    it('sorts both ways, removes grouping, clears and applies filters', async () => {
        const user = userEvent.setup();
        renderHeader();
        await user.click(screen.getByRole('button', { name: 'sort_az' }));
        expect(callbacks.sort).toHaveBeenCalledWith('name', 'asc');
        await user.click(screen.getByRole('button', { name: 'sort_za' }));
        expect(callbacks.sort).toHaveBeenCalledWith('name', 'desc');

        await user.click(screen.getByRole('button', { name: 'ungroup' }));
        expect(callbacks.group).toHaveBeenCalledWith(null);

        await user.click(screen.getByRole('button', { name: 'clear' }));
        expect(callbacks.filter).toHaveBeenCalledWith('name', '');
        const input = screen.getByPlaceholderText('search_placeholder');
        await user.clear(input);
        await user.type(input, 'Grace{enter}');
        expect(callbacks.filter).toHaveBeenCalledWith('name', 'Grace');
    });

    it('shows inactive descending state and adds grouping without a current filter', async () => {
        const user = userEvent.setup();
        renderHeader({ currentSortField: 'email', currentSortOrder: 'desc', isGrouped: false, currentFilterValue: '', className: 'custom' });
        await user.click(screen.getByRole('button', { name: 'group_by' }));
        expect(callbacks.group).toHaveBeenCalledWith('name');
    });

    it('applies a filter with the action button when grouping is unavailable', async () => {
        renderHeader({ onGroupBy: undefined, isGrouped: false, currentFilterValue: undefined });
        fireEvent.change(screen.getByPlaceholderText('search_placeholder'), { target: { value: 'Alan' } });
        const popover = screen.getByPlaceholderText('search_placeholder').parentElement?.parentElement as HTMLElement;
        fireEvent.click(popover.querySelector('button')!);
        expect(callbacks.filter).toHaveBeenCalledWith('name', 'Alan');
    });
});

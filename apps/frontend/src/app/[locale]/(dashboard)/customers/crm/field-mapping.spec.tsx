import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FieldMapping, type CrmFieldMetadata, type DisplaySetting } from './field-mapping';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

vi.mock('./smart-field-selector', () => ({
    SmartFieldSelector: ({
        fields,
        value,
        onChange,
        placeholder,
    }: {
        fields: CrmFieldMetadata[];
        value: string;
        onChange: (value: string) => void;
        placeholder: string;
    }) => (
        <select
            aria-label={`selector-${placeholder}`}
            value={value}
            onChange={(event) => onChange(event.target.value)}
        >
            <option value="">{placeholder}</option>
            {fields.map((field) => (
                <option key={field.logicalName} value={field.logicalName}>
                    {field.displayName}
                </option>
            ))}
        </select>
    ),
}));

const definitions = [
    { key: 'name', label: 'labels.name', defaultCrmField: 'name', isRequired: true },
    { key: 'email', label: 'labels.email', defaultCrmField: 'emailaddress1' },
];

const discoveryData: CrmFieldMetadata[] = [
    { logicalName: 'name', displayName: 'Account Name' },
    { logicalName: 'new_favorite_color', displayName: 'Favorite Color' },
    { logicalName: 'emailaddress1', displayName: 'Email' },
];

const callbacks = {
    mapping: vi.fn(),
    display: vi.fn(),
    reset: vi.fn(),
    save: vi.fn(),
};

const renderMapping = (overrides: Partial<React.ComponentProps<typeof FieldMapping>> = {}) => render(
    <FieldMapping
        entityType="account"
        definitions={definitions}
        discoveryData={discoveryData}
        currentMapping={{ name: 'new_account_name', custom_note: 'new_note' }}
        displaySettings={[
            { key: 'custom_note', visible: false },
            { key: 'name', visible: true },
            { key: 'email', visible: true },
        ]}
        onMappingChange={callbacks.mapping}
        onDisplayChange={callbacks.display}
        onReset={callbacks.reset}
        onSave={callbacks.save}
        {...overrides}
    />,
);

const buttonForIcon = (container: HTMLElement, iconClass: string, index = 0) => {
    const icons = Array.from(container.querySelectorAll(`.${iconClass}`));
    const button = icons[index]?.closest('button');
    if (!button) throw new Error(`Button for ${iconClass}[${index}] not found`);
    return button;
};

describe('FieldMapping', () => {
    beforeEach(() => vi.clearAllMocks());

    it('orders display settings, marks custom/overridden fields, and uses entity-specific title', () => {
        const { container, rerender } = renderMapping();

        const labels = Array.from(container.querySelectorAll('label')).map((label) => label.textContent);
        expect(labels.slice(0, 3)).toEqual(['custom_note', 'labels.name*', 'labels.email']);
        expect(screen.getByText('sync.mapping.account_title')).toBeInTheDocument();
        expect(screen.getByText('sync.mapping.badge_custom')).toBeInTheDocument();
        expect(screen.getAllByText('sync.mapping.badge_mapped')).toHaveLength(2);
        expect(screen.getByText('sync.mapping.visibility_title')).toBeInTheDocument();

        rerender(
            <FieldMapping
                entityType="contact"
                definitions={definitions}
                discoveryData={discoveryData}
                currentMapping={{}}
                displaySettings={[]}
                onMappingChange={callbacks.mapping}
                onDisplayChange={callbacks.display}
                onReset={callbacks.reset}
                onSave={callbacks.save}
            />,
        );
        expect(screen.getByText('sync.mapping.contact_title')).toBeInTheDocument();
        expect(screen.queryByText('sync.mapping.badge_custom')).not.toBeInTheDocument();
        expect(screen.queryByText('sync.mapping.badge_mapped')).not.toBeInTheDocument();
    });

    it('forwards save/reset and renders the saving state', async () => {
        const user = userEvent.setup();
        const { rerender } = renderMapping();

        await user.click(screen.getByRole('button', { name: 'reset' }));
        await user.click(screen.getByRole('button', { name: 'save' }));
        expect(callbacks.reset).toHaveBeenCalledOnce();
        expect(callbacks.save).toHaveBeenCalledOnce();

        rerender(
            <FieldMapping
                entityType="account"
                definitions={definitions}
                discoveryData={discoveryData}
                currentMapping={{}}
                displaySettings={[]}
                onMappingChange={callbacks.mapping}
                onDisplayChange={callbacks.display}
                onReset={callbacks.reset}
                onSave={callbacks.save}
                saving
            />,
        );
        expect(screen.getByRole('button', { name: 'saving' })).toBeDisabled();
    });

    it('changes a CRM field, toggles visibility, and removes custom fields immutably', () => {
        const { container } = renderMapping();

        const selectors = screen.getAllByRole('combobox');
        fireEvent.change(selectors[1], { target: { value: 'emailaddress1' } });
        expect(callbacks.mapping).toHaveBeenCalledWith('name', 'emailaddress1');

        fireEvent.click(buttonForIcon(container, 'lucide-eye-off'));
        expect(callbacks.display).toHaveBeenCalledWith([
            { key: 'custom_note', visible: true },
            { key: 'name', visible: true },
            { key: 'email', visible: true },
        ] satisfies DisplaySetting[]);

        fireEvent.click(buttonForIcon(container, 'lucide-trash-2'));
        expect(callbacks.mapping).toHaveBeenCalledWith('custom_note', '');
        expect(callbacks.display).toHaveBeenLastCalledWith([
            { key: 'name', visible: true },
            { key: 'email', visible: true },
        ] satisfies DisplaySetting[]);
    });

    it('reorders fields and ignores attempts to move beyond the list boundaries', () => {
        const { container } = renderMapping();

        const firstUp = buttonForIcon(container, 'lucide-chevron-up', 0);
        const lastDown = buttonForIcon(container, 'lucide-chevron-down', 2);
        expect(firstUp).toBeDisabled();
        expect(lastDown).toBeDisabled();
        fireEvent.click(firstUp);
        fireEvent.click(lastDown);
        expect(callbacks.display).not.toHaveBeenCalled();

        fireEvent.click(buttonForIcon(container, 'lucide-chevron-down', 0));
        expect(callbacks.display).toHaveBeenLastCalledWith([
            { key: 'name', visible: true },
            { key: 'custom_note', visible: false },
            { key: 'email', visible: true },
        ] satisfies DisplaySetting[]);

        fireEvent.click(buttonForIcon(container, 'lucide-chevron-up', 2));
        expect(callbacks.display).toHaveBeenLastCalledWith([
            { key: 'custom_note', visible: false },
            { key: 'email', visible: true },
            { key: 'name', visible: true },
        ] satisfies DisplaySetting[]);
    });

    it('derives a safe custom key from CRM metadata and appends the new visible field', async () => {
        const user = userEvent.setup();
        renderMapping();

        await user.click(screen.getByRole('button', { name: 'sync.mapping.add_custom_btn' }));
        const addPanel = screen.getByText('sync.mapping.add_new_column').parentElement?.parentElement?.parentElement as HTMLElement;
        fireEvent.change(within(addPanel).getByRole('combobox'), { target: { value: 'new_favorite_color' } });

        expect(screen.getByPlaceholderText('sync.mapping.display_name_placeholder')).toHaveValue('Favorite Color');
        expect(screen.getByDisplayValue('favorite_color')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'sync.mapping.add_column_btn' }));

        expect(callbacks.mapping).toHaveBeenCalledWith('favorite_color', 'new_favorite_color');
        expect(callbacks.display).toHaveBeenCalledWith([
            { key: 'custom_note', visible: false },
            { key: 'name', visible: true },
            { key: 'email', visible: true },
            { key: 'favorite_color', visible: true },
        ] satisfies DisplaySetting[]);
        expect(screen.queryByText('sync.mapping.add_new_column')).not.toBeInTheDocument();
    });

    it('normalizes manually entered custom keys and rejects duplicates', async () => {
        const user = userEvent.setup();
        const { container } = renderMapping();

        await user.click(screen.getByRole('button', { name: 'sync.mapping.add_custom_btn' }));
        const inputs = screen.getAllByRole('textbox');
        await user.type(inputs[0], 'Manual Label');
        await user.type(inputs[1], 'Manual Key');
        await user.click(screen.getByRole('button', { name: 'sync.mapping.add_column_btn' }));
        expect(callbacks.mapping).toHaveBeenCalledWith('manual_key', '');

        vi.clearAllMocks();
        await user.click(screen.getByRole('button', { name: 'sync.mapping.add_custom_btn' }));
        const duplicateInputs = screen.getAllByRole('textbox');
        await user.type(duplicateInputs[0], 'Duplicate');
        await user.type(duplicateInputs[1], 'name');
        await user.click(screen.getByRole('button', { name: 'sync.mapping.add_column_btn' }));
        expect(callbacks.mapping).not.toHaveBeenCalled();
        expect(screen.getByDisplayValue('Duplicate')).toBeInTheDocument();

        fireEvent.click(buttonForIcon(container, 'lucide-trash-2', 1));
        expect(screen.queryByDisplayValue('Duplicate')).not.toBeInTheDocument();
    });

    it('keeps add disabled until both key and label are present', async () => {
        const user = userEvent.setup();
        renderMapping({ currentMapping: {}, displaySettings: [] });

        await user.click(screen.getByRole('button', { name: 'sync.mapping.add_custom_btn' }));
        const add = screen.getByRole('button', { name: 'sync.mapping.add_column_btn' });
        expect(add).toBeDisabled();
        await user.type(screen.getAllByRole('textbox')[0], 'Only label');
        expect(add).toBeDisabled();
        expect(callbacks.mapping).not.toHaveBeenCalled();
    });
});

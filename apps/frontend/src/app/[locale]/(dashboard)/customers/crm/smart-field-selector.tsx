'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrmFieldMetadata {
    logicalName: string;
    displayName: string;
    sampleValue: any;
}

interface SmartFieldSelectorProps {
    fields: CrmFieldMetadata[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SmartFieldSelector({
    fields,
    value,
    onChange,
    placeholder,
}: SmartFieldSelectorProps) {
    const t = useTranslations('customers');
    const displayPlaceholder = placeholder || t('sync.mapping.select_crm_field');
    const [open, setOpen] = useState(false);

    const selectedField = fields.find((f) => f.logicalName === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-9 bg-white/[0.02] border-white/10 text-[12px] hover:bg-white/[0.05] hover:border-blue-500/50 transition-all font-mono"
                >
                    <div className="flex items-center gap-2 truncate">
                        {selectedField ? (
                            <>
                                <span className="font-sans font-medium text-white/90">{selectedField.displayName}</span>
                                <span className="text-[10px] text-white/40">({selectedField.logicalName})</span>
                            </>
                        ) : (
                            <span className="text-white/40 font-sans italic">{displayPlaceholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-[#0c0c0c] border-white/10 shadow-2xl">
                <Command className="bg-transparent">
                    <CommandInput placeholder={t('sync.mapping.search_crm_fields')} className="h-9 text-[12px]" />
                    <CommandList className="max-h-[300px]">
                        <CommandEmpty>{t('sync.mapping.field_not_found')}</CommandEmpty>
                        <CommandGroup>
                            {fields.map((field) => (
                                <CommandItem
                                    key={field.logicalName}
                                    value={field.logicalName + " " + field.displayName}
                                    onSelect={() => {
                                        onChange(field.logicalName);
                                        setOpen(false);
                                    }}
                                    className="flex flex-col items-start gap-1 py-3 px-4 aria-selected:bg-blue-500/10 cursor-pointer border-b border-white/[0.03] last:border-0"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-bold text-white/90">
                                                {field.displayName}
                                            </span>
                                            <span className="text-[10px] font-mono text-white/40">
                                                {field.logicalName}
                                            </span>
                                        </div>
                                        {value === field.logicalName && (
                                            <Check className="h-4 w-4 text-blue-400" />
                                        )}
                                    </div>

                                    {field.sampleValue !== undefined && field.sampleValue !== null && (
                                        <div className="mt-1 w-full bg-blue-500/5 rounded p-1.5 border border-blue-500/10">
                                            <p className="text-[9px] text-blue-400/70 uppercase tracking-tighter font-bold">{t('sync.mapping.sample_data')}</p>
                                            <p className="text-[11px] text-blue-300 italic truncate drop-shadow-sm">
                                                {typeof field.sampleValue === 'object'
                                                    ? JSON.stringify(field.sampleValue)
                                                    : String(field.sampleValue) || '—'}
                                            </p>
                                        </div>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

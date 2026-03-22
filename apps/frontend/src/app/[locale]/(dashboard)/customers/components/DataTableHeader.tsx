'use client';

import React, { useState } from 'react';
import {
    ArrowUpAZ,
    ArrowDownZA,
    Filter,
    Layers,
    X,
    Check,
    Search,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface DataTableHeaderProps {
    columnKey: string;
    label: string;
    currentSortField: string;
    currentSortOrder: 'asc' | 'desc';
    onSort: (field: string, order: 'asc' | 'desc') => void;
    onGroupBy?: (field: string | null) => void;
    isGrouped?: boolean;
    onFilterChange: (field: string, value: string) => void;
    currentFilterValue?: string;
    className?: string;
}

export function DataTableHeader({
    columnKey,
    label,
    currentSortField,
    currentSortOrder,
    onSort,
    onGroupBy,
    isGrouped,
    onFilterChange,
    currentFilterValue = '',
    className
}: DataTableHeaderProps) {
    const t = useTranslations('customers.table_controls');
    const commonT = useTranslations('common');
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState(currentFilterValue || '');

    const isActive = currentSortField === columnKey;
    const hasFilter = !!currentFilterValue;

    const handleSort = (order: 'asc' | 'desc') => {
        onSort(columnKey, order);
        setIsOpen(false);
    };

    const handleClearFilter = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSearchValue('');
        onFilterChange(columnKey, '');
    };

    const handleApplyFilter = () => {
        onFilterChange(columnKey, searchValue);
        setIsOpen(false);
    };

    return (
        <TableHead className={cn("p-0 border-none h-auto", className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <button className={cn(
                        "w-full flex items-center justify-between px-4 py-4 group transition-colors hover:bg-white/[0.03] outline-none text-left",
                        (isActive || hasFilter || isGrouped) && "bg-blue-500/5"
                    )}>
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest truncate",
                                (isActive || hasFilter || isGrouped) ? "text-blue-400" : "text-muted-foreground"
                            )}>
                                {label}
                            </span>
                            {isActive && (
                                currentSortOrder === 'asc'
                                    ? <ArrowUpAZ className="h-3 w-3 text-blue-400 shrink-0" />
                                    : <ArrowDownZA className="h-3 w-3 text-blue-400 shrink-0" />
                            )}
                            {hasFilter && <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />}
                            {isGrouped && <Layers className="h-3 w-3 text-amber-400 shrink-0" />}
                        </div>
                        <ChevronDown className={cn(
                            "h-3 w-3 text-muted-foreground/30 transition-transform group-hover:text-muted-foreground/60 shrink-0",
                            isOpen && "rotate-180 text-blue-400"
                        )} />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2 bg-slate-950 border-white/10 shadow-2xl rounded-xl backdrop-blur-xl" align="start">
                    <div className="space-y-1">
                        {/* Sort Options */}
                        <div className="px-2 py-1.5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">{commonT('sort', { defaultValue: 'SIRALA' })}</p>
                            <div className="grid gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "justify-start h-8 text-[11px] font-medium gap-2 hover:bg-white/5 hover:text-white",
                                        isActive && currentSortOrder === 'asc' && "bg-blue-500/10 text-blue-400"
                                    )}
                                    onClick={() => handleSort('asc')}
                                >
                                    <ArrowUpAZ className="h-3.5 w-3.5" />
                                    {t('sort_az', { defaultValue: 'A\'dan Z\'ye Sırala' })}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "justify-start h-8 text-[11px] font-medium gap-2 hover:bg-white/5 hover:text-white",
                                        isActive && currentSortOrder === 'desc' && "bg-blue-500/10 text-blue-400"
                                    )}
                                    onClick={() => handleSort('desc')}
                                >
                                    <ArrowDownZA className="h-3.5 w-3.5" />
                                    {t('sort_za', { defaultValue: 'Z\'den A\'ya Sırala' })}
                                </Button>
                            </div>
                        </div>

                        <div className="h-px bg-white/5 mx-2 my-1" />

                        {/* Grouping Options */}
                        {onGroupBy && (
                            <div className="px-2 py-1.5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">{t('group', { defaultValue: 'GRUPLA' })}</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "w-full justify-start h-8 text-[11px] font-medium gap-2 hover:bg-white/5 hover:text-white",
                                        isGrouped && "bg-amber-500/10 text-amber-400"
                                    )}
                                    onClick={() => {
                                        onGroupBy(isGrouped ? null : columnKey);
                                        setIsOpen(false);
                                    }}
                                >
                                    <Layers className="h-3.5 w-3.5" />
                                    {isGrouped ? t('ungroup', { defaultValue: 'Gruplamayı Kaldır' }) : t('group_by', { defaultValue: 'Bu Alana Göre Grupla' })}
                                </Button>
                            </div>
                        )}

                        <div className="h-px bg-white/5 mx-2 my-1" />

                        {/* Filter Options */}
                        <div className="px-2 py-1.5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{commonT('filter', { defaultValue: 'FİLTRELE' })}</p>
                                {hasFilter && (
                                    <button
                                        onClick={handleClearFilter}
                                        className="text-[9px] font-bold text-rose-400 hover:text-rose-300 uppercase underline"
                                    >
                                        {commonT('clear', { defaultValue: 'Temizle' })}
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-1.5">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
                                    <Input
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                                        placeholder={commonT('search_placeholder', { defaultValue: 'Ara...' })}
                                        className="h-8 pl-7 pr-2 text-[11px] bg-white/5 border-white/10 rounded-lg focus:ring-blue-500/20 shadow-inner"
                                    />
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={cn(
                                        "h-8 w-8 shrink-0 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400",
                                        hasFilter && "bg-blue-500/10 text-blue-400"
                                    )}
                                    onClick={handleApplyFilter}
                                >
                                    <Check className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </TableHead>
    );
}

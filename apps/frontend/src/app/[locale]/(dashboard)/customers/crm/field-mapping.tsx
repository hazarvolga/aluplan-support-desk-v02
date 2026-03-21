'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    RotateCcw,
    Save,
    AlertCircle,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    ChevronUp,
    ChevronDown,
    GripVertical,
    Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SmartFieldSelector } from './smart-field-selector';
import { cn } from '@/lib/utils';

interface FieldDefinition {
    key: string;
    label: string;
    defaultCrmField: string;
    isRequired?: boolean;
}

interface MappingItem {
    key: string;
    label: string;
    crmField: string;
    visible: boolean;
    isRequired?: boolean;
    isCustom?: boolean;
}

interface FieldMappingProps {
    entityType: 'account' | 'contact';
    definitions: FieldDefinition[];
    discoveryData: any[];
    currentMapping: Record<string, string>;
    displaySettings: any[];
    onMappingChange: (key: string, value: string) => void;
    onDisplayChange: (settings: any[]) => void;
    onReset: () => void;
    onSave: () => void;
    saving?: boolean;
}

export function FieldMapping({
    entityType,
    definitions,
    discoveryData,
    currentMapping,
    displaySettings,
    onMappingChange,
    onDisplayChange,
    onReset,
    onSave,
    saving = false,
}: FieldMappingProps) {
    const t = useTranslations('customers');
    const commonT = useTranslations('common');

    const [newFieldKey, setNewFieldKey] = useState('');
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newCrmField, setNewCrmField] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // Build the ordered list of items
    const items = useMemo(() => {
        // ... (lines 76-104 remain same)
        const standardKeys = definitions.map(d => d.key);
        const mappedKeys = Object.keys(currentMapping);
        const allKeys = Array.from(new Set([...standardKeys, ...mappedKeys]));

        const result: MappingItem[] = allKeys.map(key => {
            const def = definitions.find(d => d.key === key);
            const savedDisplay = displaySettings.find(s => s.key === key);

            return {
                key,
                label: def ? def.label : key,
                crmField: currentMapping[key] || (def?.defaultCrmField ?? ''),
                visible: savedDisplay ? savedDisplay.visible : true,
                isRequired: def?.isRequired,
                isCustom: !standardKeys.includes(key),
            };
        });

        if (displaySettings && displaySettings.length > 0) {
            const orderMap = new Map(displaySettings.map((s, idx) => [s.key, idx]));
            result.sort((a, b) => {
                const orderA = orderMap.has(a.key) ? orderMap.get(a.key)! : 999;
                const orderB = orderMap.has(b.key) ? orderMap.get(b.key)! : 999;
                return orderA - orderB;
            });
        }

        return result;
    }, [definitions, currentMapping, displaySettings]);

    const handleCrmFieldSelect = (logicalName: string) => {
        setNewCrmField(logicalName);
        const field = discoveryData.find(f => f.logicalName === logicalName);
        if (field) {
            // Clean logical name for system key (remove prefixes like new_)
            const cleanKey = logicalName.replace(/^[a-zA-Z0-9]+_/, '').replace(/\s+/g, '_').toLowerCase();
            setNewFieldKey(cleanKey);
            setNewFieldLabel(field.displayName);
        }
    };

    const handleToggleVisibility = (key: string) => {
        const newSettings = items.map(item =>
            item.key === key ? { ...item, visible: !item.visible } : item
        ).map(({ key, visible }) => ({ key, visible }));
        onDisplayChange(newSettings);
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newItems = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newItems.length) return;

        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];

        const newSettings = newItems.map(({ key, visible }) => ({ key, visible }));
        onDisplayChange(newSettings);
    };

    const handleAddCustomField = () => {
        if (!newFieldKey.trim() || !newFieldLabel.trim()) return;
        const key = newFieldKey.trim().replace(/\s+/g, '_').toLowerCase();

        // Check for duplicates
        if (items.some(i => i.key === key)) {
            // Label or Key already exists
            return;
        }

        // Add to mapping
        onMappingChange(key, newCrmField);

        // Add to display settings at the end
        const newSettings = [...items.map(({ key, visible }) => ({ key, visible })), { key, visible: true }];
        onDisplayChange(newSettings);

        setNewFieldKey('');
        setNewFieldLabel('');
        setNewCrmField('');
        setShowAddForm(false);
    };

    const handleRemoveCustomField = (key: string) => {
        // Remove from mapping
        onMappingChange(key, ''); // Assuming empty string means remove or handled in parent

        // Remove from display settings
        const newSettings = items.filter(i => i.key !== key).map(({ key, visible }) => ({ key, visible }));
        onDisplayChange(newSettings);
    };

    return (
        <Card className="glass-card border-white/5 overflow-hidden">
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">
                            {entityType === 'account' ? t('sync.mapping.account_title') : t('sync.mapping.contact_title')}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            {t('sync.mapping.description')}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                            className="h-8 text-[10px] font-bold uppercase tracking-tight text-white/40 hover:text-white"
                        >
                            <RotateCcw className="h-3 w-3 mr-2" />
                            {commonT('reset')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={onSave}
                            disabled={saving}
                            className="h-8 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-tight hover:bg-blue-500/20"
                        >
                            {saving ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                    {commonT('saving')}
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="h-3 w-3" />
                                    {commonT('save')}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Unified Ordered Fields List */}
                <div className="space-y-3">
                    {items.map((item, index) => {
                        const isFirst = index === 0;
                        const isLast = index === items.length - 1;
                        const def = definitions.find(d => d.key === item.key);

                        return (
                            <div
                                key={item.key}
                                className={cn(
                                    "flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border transition-all duration-200",
                                    item.visible ? "bg-white/[0.03] border-white/5" : "bg-white/[0.01] border-white/[0.02] opacity-60 grayscale-[0.5]"
                                )}
                            >
                                {/* Drag/Sort Controls */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <div className="flex flex-col gap-0.5">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={isFirst}
                                            onClick={() => handleMove(index, 'up')}
                                            className="h-6 w-6 p-0 hover:bg-blue-500/20 hover:text-blue-400 disabled:opacity-10"
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={isLast}
                                            onClick={() => handleMove(index, 'down')}
                                            className="h-6 w-6 p-0 hover:bg-blue-500/20 hover:text-blue-400 disabled:opacity-10"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="p-1 cursor-grab active:cursor-grabbing text-white/10">
                                        <GripVertical className="h-4 w-4" />
                                    </div>
                                </div>

                                {/* Visibility Toggle */}
                                <div className="shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToggleVisibility(item.key)}
                                        className={cn(
                                            "h-9 w-9 p-0 rounded-lg border",
                                            item.visible
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
                                                : "bg-white/5 border-white/10 text-white/20 hover:bg-white/10"
                                        )}
                                    >
                                        {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </Button>
                                </div>

                                {/* Label & Key Info */}
                                <div className="flex-1 min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Label className={cn(
                                            "text-[11px] font-bold uppercase tracking-wider",
                                            item.isCustom ? "text-amber-400" : "text-white/80"
                                        )}>
                                            {item.isCustom ? item.label : t(item.label)}
                                            {item.isRequired && <span className="text-rose-500 ml-1">*</span>}
                                        </Label>
                                        {item.isCustom && <Badge className="h-4 text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20 px-1.5">CUSTOM</Badge>}
                                        {currentMapping[item.key] && currentMapping[item.key] !== def?.defaultCrmField && (
                                            <Badge className="h-4 text-[8px] bg-blue-500/10 text-blue-400 border-blue-500/20 px-1.5">MAPPED</Badge>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-tighter">
                                        System Key: <span className="text-white/40">{item.key}</span>
                                    </p>
                                </div>

                                {/* CRM Field Selector */}
                                <div className="flex-[1.5] min-w-[300px] flex items-center gap-3">
                                    <div className="flex-1">
                                        <SmartFieldSelector
                                            fields={discoveryData}
                                            value={item.crmField}
                                            onChange={(val) => onMappingChange(item.key, val)}
                                            placeholder={def?.defaultCrmField || t('sync.mapping.select_crm_field')}
                                        />
                                    </div>

                                    {item.isCustom && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveCustomField(item.key)}
                                            className="h-8 w-8 p-0 text-white/10 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Add custom field */}
                <div className="border-t border-white/5 pt-4">
                    {showAddForm ? (
                        <div className="space-y-4 p-5 rounded-xl bg-blue-500/5 border border-blue-500/10 shadow-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Plus className="h-3 w-3 text-blue-400" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Yeni Kolon Ekle</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setShowAddForm(false); setNewFieldKey(''); setNewFieldLabel(''); setNewCrmField(''); }}
                                    className="h-6 w-6 p-0 text-white/20 hover:text-white"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-white/40 uppercase tracking-widest font-bold">1. CRM Alanı Seçin</Label>
                                    <SmartFieldSelector
                                        fields={discoveryData}
                                        value={newCrmField}
                                        onChange={handleCrmFieldSelect}
                                        placeholder="CRM'den alan seç..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-white/40 uppercase tracking-widest font-bold">2. Görünen İsim</Label>
                                    <Input
                                        value={newFieldLabel}
                                        onChange={(e) => setNewFieldLabel(e.target.value)}
                                        placeholder="Örn: Segment"
                                        className="h-9 text-xs bg-white/5 border-white/10 rounded-lg"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-white/40 uppercase tracking-widest font-bold">3. Sistem Anahtarı</Label>
                                    <Input
                                        value={newFieldKey}
                                        onChange={(e) => setNewFieldKey(e.target.value)}
                                        placeholder="Örn: segment"
                                        className="h-9 text-xs bg-white/5 border-white/10 rounded-lg font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <Button
                                    size="sm"
                                    onClick={handleAddCustomField}
                                    disabled={!newFieldKey.trim() || !newFieldLabel.trim()}
                                    className="h-9 px-6 text-[10px] font-black uppercase tracking-widest bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20"
                                >
                                    Kolonu Listeye Ekle
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAddForm(true)}
                            className="h-10 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-blue-400 hover:bg-blue-500/5 border border-dashed border-white/10 hover:border-blue-500/20 w-full rounded-xl transition-all"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Yeni Özel Alan / Kolon Ekle
                        </Button>
                    )}
                </div>
            </div>

            <div className="bg-amber-500/5 border-t border-white/5 p-4 flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                    <Info className="h-3 w-3 text-amber-500" />
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-amber-500/90 uppercase tracking-widest">Görünürlük ve Sıralama</p>
                    <p className="text-[10px] text-amber-500/60 leading-relaxed max-w-2xl">
                        Burada yaptığınız sıralama ve görünürlük ayarları, Müşteriler ve Hesaplar tablolarını otomatik olarak güncelleyecektir.
                        Göz ikonuna tıklayarak istemediğiniz kolonları gizleyebilir, okları kullanarak sıralamayı değiştirebilirsiniz.
                    </p>
                </div>
            </div>
        </Card>
    );
}

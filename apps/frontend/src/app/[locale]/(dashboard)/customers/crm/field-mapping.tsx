'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw, Save, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SmartFieldSelector } from './smart-field-selector';

interface FieldDefinition {
    key: string;
    label: string;
    defaultCrmField: string;
    isRequired?: boolean;
}

interface CustomField {
    key: string;
    label: string;
    crmField: string;
}

interface FieldMappingProps {
    entityType: 'account' | 'contact';
    definitions: FieldDefinition[];
    discoveryData: any[];
    currentMapping: Record<string, string>;
    onMappingChange: (key: string, value: string) => void;
    onReset: () => void;
    onSave: () => void;
    saving?: boolean;
}

export function FieldMapping({
    entityType,
    definitions,
    discoveryData,
    currentMapping,
    onMappingChange,
    onReset,
    onSave,
    saving = false,
}: FieldMappingProps) {
    const t = useTranslations('customers');
    const commonT = useTranslations('common');

    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [newFieldKey, setNewFieldKey] = useState('');
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    const handleAddCustomField = () => {
        if (!newFieldKey.trim() || !newFieldLabel.trim()) return;
        const key = newFieldKey.trim().replace(/\s+/g, '_').toLowerCase();
        if (definitions.some(d => d.key === key) || customFields.some(f => f.key === key)) return;

        const newField: CustomField = { key, label: newFieldLabel.trim(), crmField: '' };
        setCustomFields(prev => [...prev, newField]);
        setNewFieldKey('');
        setNewFieldLabel('');
        setShowAddForm(false);
    };

    const handleRemoveCustomField = (key: string) => {
        setCustomFields(prev => prev.filter(f => f.key !== key));
        // Remove from mapping too
        onMappingChange(key, '');
    };

    const handleCustomFieldCrmChange = (key: string, value: string) => {
        setCustomFields(prev => prev.map(f => f.key === key ? { ...f, crmField: value } : f));
        onMappingChange(key, value);
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

                {/* Standard fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {definitions.map((field) => (
                        <div key={field.key} className="space-y-2 group">
                            <div className="flex items-center justify-between">
                                <Label className="text-[11px] font-bold text-muted-foreground group-hover:text-white transition-colors">
                                    {t(field.label)}
                                    {field.isRequired && <span className="text-rose-500 ml-1">*</span>}
                                </Label>
                                {currentMapping[field.key] !== field.defaultCrmField && currentMapping[field.key] !== undefined && (
                                    <Badge variant="outline" className="h-4 text-[8px] border-blue-500/30 text-blue-400 bg-blue-500/5 px-1.5">
                                        MODIFIED
                                    </Badge>
                                )}
                            </div>
                            <div className="relative">
                                <SmartFieldSelector
                                    fields={discoveryData}
                                    value={currentMapping[field.key] || field.defaultCrmField}
                                    onChange={(val) => onMappingChange(field.key, val)}
                                    placeholder={field.defaultCrmField}
                                />
                            </div>
                            <p className="text-[9px] text-white/20 italic pl-1">
                                Default: <span className="font-mono">{field.defaultCrmField}</span>
                            </p>
                        </div>
                    ))}
                </div>

                {/* Custom fields */}
                {customFields.length > 0 && (
                    <div className="border-t border-white/5 pt-6 space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                            {t('sync.mapping.custom_fields')}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {customFields.map((field) => (
                                <div key={field.key} className="space-y-2 group">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[11px] font-bold text-amber-400/80">
                                            {field.label}
                                            <span className="ml-2 font-mono text-[9px] text-white/20">({field.key})</span>
                                        </Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveCustomField(field.key)}
                                            className="h-5 w-5 p-0 text-white/20 hover:text-rose-400"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <SmartFieldSelector
                                        fields={discoveryData}
                                        value={currentMapping[field.key] || ''}
                                        onChange={(val) => handleCustomFieldCrmChange(field.key, val)}
                                        placeholder={t('sync.mapping.select_crm_field')}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add custom field */}
                <div className="border-t border-white/5 pt-4">
                    {showAddForm ? (
                        <div className="space-y-3 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                {t('sync.mapping.add_field')}
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-white/40">{t('sync.mapping.field_label')}</Label>
                                    <Input
                                        value={newFieldLabel}
                                        onChange={(e) => setNewFieldLabel(e.target.value)}
                                        placeholder="e.g. Segment"
                                        className="h-8 text-xs bg-white/5 border-white/10"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-white/40">{t('sync.mapping.field_key')}</Label>
                                    <Input
                                        value={newFieldKey}
                                        onChange={(e) => setNewFieldKey(e.target.value)}
                                        placeholder="e.g. segment"
                                        className="h-8 text-xs bg-white/5 border-white/10 font-mono"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setShowAddForm(false); setNewFieldKey(''); setNewFieldLabel(''); }}
                                    className="h-7 text-[10px] text-white/40"
                                >
                                    {commonT('cancel')}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleAddCustomField}
                                    disabled={!newFieldKey.trim() || !newFieldLabel.trim()}
                                    className="h-7 text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                >
                                    {t('sync.mapping.add_field')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAddForm(true)}
                            className="h-8 text-[10px] font-bold uppercase tracking-tight text-white/30 hover:text-white border border-dashed border-white/10 hover:border-white/20 w-full"
                        >
                            <Plus className="h-3 w-3 mr-2" />
                            {t('sync.mapping.add_field')}
                        </Button>
                    )}
                </div>
            </div>

            <div className="bg-white/[0.02] border-t border-white/5 p-4 flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                </div>
                <p className="text-[10px] text-amber-500/70 leading-relaxed">
                    {t('sync.mapping.warning')}
                </p>
            </div>
        </Card>
    );
}

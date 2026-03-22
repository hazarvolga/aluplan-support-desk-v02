'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Globe, Monitor, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';

interface Section {
    name: string;
    items: string[];
}

interface Requirement {
    title: string;
    sections: Section[];
}

type LocalizedRequirements = Record<string, Requirement[]>;

export function SystemRequirementsForm() {
    const t = useTranslations('settings.requirements');
    const tc = useTranslations('common');
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<LocalizedRequirements>({
        en: [],
        tr: [],
        de: []
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await api.settings.get('SYSTEM_REQUIREMENTS');
            if (res && res.value) {
                const parsed = JSON.parse(res.value);
                // Ensure structure exists
                if (!parsed.en) parsed.en = [];
                if (!parsed.tr) parsed.tr = [];
                if (!parsed.de) parsed.de = [];
                setData(parsed);
            }
        } catch (error) {
            console.error('Failed to load system requirements', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.settings.upsert({
                key: 'SYSTEM_REQUIREMENTS',
                value: JSON.stringify(data),
                isSecret: false
            });
            toast({ title: tc('success_title'), description: t('toasts.save_success') });
        } catch (error: any) {
            toast({ title: tc('error_title'), description: t('toasts.save_error', { message: error.message }), variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const addProduct = (locale: string) => {
        setData(prev => ({
            ...prev,
            [locale]: [...(prev[locale] || []), { title: t('default_product_title'), sections: [{ name: t('default_section_name'), items: [t('default_item_text')] }] }]
        }));
    };

    const removeProduct = (locale: string, idx: number) => {
        setData(prev => {
            const next = { ...prev };
            next[locale] = [...next[locale]];
            next[locale].splice(idx, 1);
            return next;
        });
    };

    const updateProductTitle = (locale: string, idx: number, title: string) => {
        setData(prev => {
            const next = { ...prev };
            next[locale] = [...next[locale]];
            next[locale][idx] = { ...next[locale][idx], title };
            return next;
        });
    };

    const addSection = (locale: string, pIdx: number) => {
        setData(prev => {
            const next = { ...prev };
            next[locale] = [...next[locale]];
            next[locale][pIdx] = {
                ...next[locale][pIdx],
                sections: [...next[locale][pIdx].sections, { name: t('default_new_section'), items: [''] }]
            };
            return next;
        });
    };

    const removeSection = (locale: string, pIdx: number, sIdx: number) => {
        setData(prev => {
            const next = { ...prev };
            next[locale] = [...next[locale]];
            next[locale][pIdx] = { ...next[locale][pIdx], sections: [...next[locale][pIdx].sections] };
            next[locale][pIdx].sections.splice(sIdx, 1);
            return next;
        });
    };

    const updateSectionName = (locale: string, pIdx: number, sIdx: number, name: string) => {
        setData(prev => {
            const next = { ...prev };
            next[locale] = [...next[locale]];
            next[locale][pIdx] = { ...next[locale][pIdx], sections: [...next[locale][pIdx].sections] };
            next[locale][pIdx].sections[sIdx] = { ...next[locale][pIdx].sections[sIdx], name };
            return next;
        });
    };

    const addItem = (locale: string, pIdx: number, sIdx: number) => {
        setData(prev => {
            const next = { ...prev };
            next[locale] = [...next[locale]];
            next[locale][pIdx] = { ...next[locale][pIdx], sections: [...next[locale][pIdx].sections] };
            next[locale][pIdx].sections[sIdx] = {
                ...next[locale][pIdx].sections[sIdx],
                items: [...next[locale][pIdx].sections[sIdx].items, '']
            };
            return next;
        });
    };

    const updateItem = (locale: string, pIdx: number, sIdx: number, iIdx: number, val: string) => {
        setData(prev => {
            const next = { ...prev };
            next[locale] = [...next[locale]];
            next[locale][pIdx] = { ...next[locale][pIdx], sections: [...next[locale][pIdx].sections] };
            next[locale][pIdx].sections[sIdx] = {
                ...next[locale][pIdx].sections[sIdx],
                items: [...next[locale][pIdx].sections[sIdx].items]
            };
            next[locale][pIdx].sections[sIdx].items[iIdx] = val;
            return next;
        });
    };

    const removeItem = (locale: string, pIdx: number, sIdx: number, iIdx: number) => {
        setData(prev => {
            const next = { ...prev };
            next[locale] = [...next[locale]];
            next[locale][pIdx] = { ...next[locale][pIdx], sections: [...next[locale][pIdx].sections] };
            next[locale][pIdx].sections[sIdx] = {
                ...next[locale][pIdx].sections[sIdx],
                items: [...next[locale][pIdx].sections[sIdx].items]
            };
            next[locale][pIdx].sections[sIdx].items.splice(iIdx, 1);
            return next;
        });
    };

    if (loading) return <div className="flex justify-center p-12 bg-slate-900/20 rounded-xl border border-white/5"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <Card className="border-2 border-white/5 bg-slate-900/50 shadow-2xl backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Monitor className="w-5 h-5 text-primary" />
                        </div>
                        {t('title')}
                    </CardTitle>
                    <CardDescription className="text-slate-400">{t('description')}</CardDescription>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2 px-6 h-11 font-bold shadow-lg shadow-primary/20">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t('save_btn')}
                </Button>
            </CardHeader>
            <CardContent className="pt-8">
                <Tabs defaultValue="tr" className="w-full">
                    <TabsList className="bg-slate-950/50 border border-white/5 p-1 h-12">
                        <TabsTrigger value="tr" className="gap-2 px-6 data-[state=active]:bg-white/10"><Globe className="w-4 h-4" /> {tc('languages.tr')}</TabsTrigger>
                        <TabsTrigger value="en" className="gap-2 px-6 data-[state=active]:bg-white/10"><Globe className="w-4 h-4" /> {tc('languages.en')}</TabsTrigger>
                        <TabsTrigger value="de" className="gap-2 px-6 data-[state=active]:bg-white/10"><Globe className="w-4 h-4" /> {tc('languages.de')}</TabsTrigger>
                    </TabsList>

                    {['tr', 'en', 'de'].map((lang) => (
                        <TabsContent key={lang} value={lang} className="space-y-8 mt-8 animate-in fade-in slide-in-from-top-2 duration-300">
                            {(data[lang] || []).length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                                    <p className="text-slate-500 mb-4 italic">{t('no_products')}</p>
                                    <Button onClick={() => addProduct(lang)} variant="secondary" size="sm">
                                        {t('init_list', { lang: lang.toUpperCase() })}
                                    </Button>
                                </div>
                            )}

                            {(data[lang] || []).map((prod, pIdx) => (
                                <div key={pIdx} className="p-6 border border-white/10 rounded-2xl bg-white/[0.03] space-y-6 relative group hover:border-white/20 transition-colors shadow-xl">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-4 right-4 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all"
                                        onClick={() => removeProduct(lang, pIdx)}
                                        title={t('remove_product')}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>

                                    <div className="space-y-2 max-w-md">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">{t('product_title_label')}</Label>
                                        <Input
                                            value={prod.title}
                                            onChange={(e) => updateProductTitle(lang, pIdx, e.target.value)}
                                            className="font-bold text-xl bg-slate-950/50 border-white/10 h-12 focus:ring-primary/50"
                                            placeholder={t('placeholders.product')}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-white/5">
                                        {prod.sections.map((section, sIdx) => (
                                            <div key={sIdx} className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/5 relative group/section">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover/section:opacity-100 transition-opacity"
                                                    onClick={() => removeSection(lang, pIdx, sIdx)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>

                                                <div className="space-y-2 max-w-sm">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('section_header_label')}</Label>
                                                    <Input
                                                        value={section.name}
                                                        onChange={(e) => updateSectionName(lang, pIdx, sIdx, e.target.value)}
                                                        className="h-10 text-sm font-medium bg-slate-950/30 border-white/5 focus:border-white/20"
                                                        placeholder={t('placeholders.section')}
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('requirement_items_label')}</Label>
                                                    <div className="space-y-2">
                                                        {section.items.map((item, iIdx) => (
                                                            <div key={iIdx} className="flex gap-2 group/item">
                                                                <Input
                                                                    value={item}
                                                                    onChange={(e) => updateItem(lang, pIdx, sIdx, iIdx, e.target.value)}
                                                                    className="h-10 text-sm bg-slate-950/50 border-white/10 focus:ring-0"
                                                                    placeholder={t('placeholders.item')}
                                                                />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeItem(lang, pIdx, sIdx, iIdx)}
                                                                    className="shrink-0 text-slate-600 hover:text-rose-500 rounded-lg"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addItem(lang, pIdx, sIdx)}
                                                        className="w-full border-dashed border-white/10 hover:bg-white/5 hover:border-white/20 text-slate-400 h-9 transition-all"
                                                    >
                                                        <Plus className="w-3 h-3 mr-2" /> {t('add_item')}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => addSection(lang, pIdx)}
                                            className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-medium h-11 border border-white/5"
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> {t('add_section')}
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <Button
                                onClick={() => addProduct(lang)}
                                variant="outline"
                                className="w-full py-12 border-dashed border-2 border-white/5 hover:border-primary/50 hover:bg-primary/5 text-slate-400 hover:text-primary transition-all rounded-2xl group"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                    <span className="font-bold uppercase tracking-widest text-xs">{t('add_new_spec')}</span>
                                </div>
                            </Button>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}

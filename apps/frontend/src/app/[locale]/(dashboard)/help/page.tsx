'use client';

export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Ticket, Bot, BookOpen, User, Settings,
    MessageSquareQuote, Database, Layers, Mail,
    Zap, Clock, ListChecks, HelpCircle, ArrowRight,
    Users
} from 'lucide-react';
import { useAuth } from '@/components/auth/role-guard';
import { useTranslations } from 'next-intl';

export default function SystemGuidePage() {
    const t = useTranslations('help');
    const { user } = useAuth();
    const isStaff = (user?.roles || []).some((r: string) => ['admin', 'agent'].includes(r.toLowerCase())) || ['ADMIN', 'AGENT'].includes((user as any)?.role);

    const [activeTab, setActiveTab] = useState(isStaff ? 'admin' : 'customer');

    useEffect(() => {
        if (isStaff) {
            setActiveTab('admin');
        } else {
            setActiveTab('customer');
        }
    }, [isStaff]);
    return (
        <div className="max-w-6xl mx-auto space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-3 pb-6 border-b border-white/10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-2">
                    <HelpCircle className="h-4 w-4" />
                    {t('badge')}
                </div>
                <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground text-lg max-w-3xl">
                    {t('description')}
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-white/5 border border-white/10 p-1">
                    <TabsTrigger value="customer" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-bold uppercase tracking-widest px-6">
                        {t('tabs.customer')}
                    </TabsTrigger>
                    {isStaff && (
                        <TabsTrigger value="admin" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-bold uppercase tracking-widest px-6">
                            {t('tabs.admin')}
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* =========================================
                    MÜŞTERİ KILAVUZU
                ========================================= */}
                <TabsContent value="customer" className="space-y-8 mt-6">

                    {/* 1. Sisteme Giriş ve Genel Bakış */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm">1</span>
                            {t('customer.section1.title')}
                        </h2>
                        <Card className="bg-gradient-to-br from-slate-900/50 to-transparent border-white/5">
                            <CardContent className="pt-6 space-y-4">
                                <p className="text-slate-300" dangerouslySetInnerHTML={{ __html: t('customer.section1.desc') }} />
                                <ul className="space-y-2 text-sm text-slate-400">
                                    <li className="flex gap-2 items-start"><ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" /> {t('customer.section1.item1')}</li>
                                    <li className="flex gap-2 items-start"><ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" /> {t('customer.section1.item2')}</li>
                                    <li className="flex gap-2 items-start"><ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" /> {t('customer.section1.item3')}</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </section>

                    {/* 2. Yapay Zeka Asistanı Kullanımı */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm">2</span>
                            {t('customer.section2.title')}
                        </h2>
                        <Card className="bg-gradient-to-br from-emerald-900/20 to-transparent border-white/5">
                            <CardContent className="pt-6 space-y-4">
                                <p className="text-slate-300" dangerouslySetInnerHTML={{ __html: t('customer.section2.desc') }} />
                                <ol className="space-y-4 text-sm text-slate-400 list-decimal pl-5">
                                    <li className="pl-2">
                                        <span dangerouslySetInnerHTML={{
                                            __html: t('customer.section2.item1', {
                                                icon: `<span class="inline-block align-middle text-primary mx-1"><svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="2" x="2" y="9"/><rect width="8" height="2" x="14" y="9"/><rect width="20" height="8" x="2" y="13" rx="2"/><path d="M12 9V2"/><path d="M5 15v1"/><path d="M19 15v1"/></svg></span>`
                                            })
                                        }} />
                                    </li>
                                    <li className="pl-2" dangerouslySetInnerHTML={{ __html: t('customer.section2.item2') }} />
                                    <li className="pl-2">{t('customer.section2.item3')}</li>
                                </ol>
                                <div className="bg-white/5 p-4 rounded-lg flex gap-3 mt-4 items-start">
                                    <Zap className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-300">
                                        <strong>{t('customer.section2.tip_label')}</strong> {t('customer.section2.tip_desc')}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* 3. Destek Talebi (Bilet) Açma */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm">3</span>
                            {t('customer.section3.title')}
                        </h2>
                        <Card className="bg-gradient-to-br from-blue-900/20 to-transparent border-white/5">
                            <CardContent className="pt-6 space-y-4">
                                <p className="text-slate-300" dangerouslySetInnerHTML={{ __html: t('customer.section3.desc') }} />

                                <div className="space-y-4 border-l-2 border-slate-700 pl-4 ml-2">
                                    <div>
                                        <h4 className="font-bold text-white mb-1">{t('customer.section3.step1_title')}</h4>
                                        <p className="text-sm text-slate-400">{t('customer.section3.step1_desc')}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">{t('customer.section3.step2_title')}</h4>
                                        <p className="text-sm text-slate-400">{t('customer.section3.step2_desc')}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">{t('customer.section3.step3_title')}</h4>
                                        <p className="text-sm text-slate-400">{t('customer.section3.step3_desc')}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </TabsContent>


                {/* =========================================
                    ADMİN & AGENT KILAVUZU
                ========================================= */}
                {isStaff && (
                    <TabsContent value="admin" className="space-y-8 mt-6">

                        {/* 1. Bilet Yönetimi */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20 text-blue-500 text-sm">1</span>
                                {t('admin.section1.title')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-slate-900/50 border-white/5">
                                    <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><ListChecks className="text-blue-400 h-5 w-5" /> {t('admin.section1.card1_title')}</CardTitle></CardHeader>
                                    <CardContent className="text-sm text-slate-300 space-y-2">
                                        <p dangerouslySetInnerHTML={{ __html: t('admin.section1.card1_desc') }} />
                                        <ul className="list-disc pl-5 space-y-1 text-slate-400">
                                            <li><strong className="text-slate-200">{t('admin.section1.card1_item1_label')}</strong> {t('admin.section1.card1_item1_desc')}</li>
                                            <li><strong className="text-slate-200">{t('admin.section1.card1_item2_label')}</strong> <code dangerouslySetInnerHTML={{ __html: t('admin.section1.card1_item2_desc') }} /></li>
                                            <li><strong className="text-slate-200">{t('admin.section1.card1_item3_label')}</strong> {t('admin.section1.card1_item3_desc')}</li>
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-900/50 border-white/5">
                                    <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Bot className="text-emerald-400 h-5 w-5" /> {t('admin.section1.card2_title')}</CardTitle></CardHeader>
                                    <CardContent className="text-sm text-slate-300 space-y-2">
                                        <p dangerouslySetInnerHTML={{ __html: t('admin.section1.card2_item1') }} />
                                        <p className="text-slate-400">
                                            {t('admin.section1.card2_item2')}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        {/* 2. Yapay Zeka / Bilgi Havuzu */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20 text-blue-500 text-sm">2</span>
                                {t('admin.section2.title')}
                            </h2>
                            <Card className="bg-slate-900/50 border-white/5">
                                <CardContent className="pt-6 space-y-6">

                                    <div className="space-y-2">
                                        <h3 className="font-bold flex items-center gap-2 text-white">
                                            <Database className="h-4 w-4 text-emerald-400" />
                                            {t('admin.section2.item1_title')}
                                        </h3>
                                        <p className="text-sm text-slate-400">{t('admin.section2.item1_desc')}</p>
                                        <ul className="text-sm text-slate-300 space-y-2 pl-4 border-l-2 border-emerald-500/30">
                                            <li><strong dangerouslySetInnerHTML={{ __html: t('admin.section2.item1_way1_label') }} /> <span dangerouslySetInnerHTML={{ __html: t('admin.section2.item1_way1_desc') }} /></li>
                                            <li><strong dangerouslySetInnerHTML={{ __html: t('admin.section2.item1_way2_label') }} /> {t('admin.section2.item1_way2_desc')}</li>
                                            <li><strong dangerouslySetInnerHTML={{ __html: t('admin.section2.item1_way3_label') }} /> {t('admin.section2.item1_way3_desc')}</li>
                                        </ul>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="font-bold flex items-center gap-2 text-white">
                                            <MessageSquareQuote className="h-4 w-4 text-amber-400" />
                                            {t('admin.section2.item2_title')}
                                        </h3>
                                        <p className="text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: t('admin.section2.item2_desc') }} />
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* 3. CRM & Ürün (Taxonomy) */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20 text-blue-500 text-sm">3</span>
                                {t('admin.section3.title')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-slate-900/50 border-white/5 p-4 space-y-2">
                                    <Layers className="h-6 w-6 text-purple-400 mb-2" />
                                    <h3 className="font-bold text-white">{t('admin.section3.card1_title')}</h3>
                                    <p className="text-sm text-slate-400">
                                        <span dangerouslySetInnerHTML={{ __html: t('admin.section3.card1_desc1') }} /><br /><br />
                                        <em dangerouslySetInnerHTML={{ __html: t('admin.section3.card1_rule_label') }} /> <span dangerouslySetInnerHTML={{ __html: t('admin.section3.card1_rule_desc') }} />
                                    </p>
                                </Card>
                                <Card className="bg-slate-900/50 border-white/5 p-4 space-y-2">
                                    <Users className="h-6 w-6 text-blue-400 mb-2" />
                                    <h3 className="font-bold text-white">{t('admin.section3.card2_title')}</h3>
                                    <p className="text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: t('admin.section3.card2_desc') }} />
                                </Card>
                            </div>
                        </section>

                    </TabsContent>
                )}

            </Tabs>
        </div>
    );
}

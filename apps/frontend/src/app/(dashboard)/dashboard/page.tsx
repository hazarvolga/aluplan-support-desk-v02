'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/auth/role-guard';
import {
    Ticket, BookOpen, Bot, MessageSquareQuote,
    TrendingUp, AlertCircle, CheckCircle2, Clock, PlusCircle, Search
} from 'lucide-react';
import Link from 'next/link';

function StatCard({ icon: Icon, label, value, color }: {
    icon: React.ElementType; label: string; value: string | number; color: string;
}) {
    return (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center shrink-0 shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [aiStatus, setAiStatus] = useState<{ available: boolean; model: string } | null>(null);
    const [stats, setStats] = useState<any>({ tickets: 0, articles: 0 });

    useEffect(() => {
        api.ai.status().then(setAiStatus).catch(() => null);
        // In a real app, fetch real stats here
    }, []);

    const userRoles = (user?.roles || []).map((r: string) => r.toLowerCase());
    const isCustomer = userRoles.includes('customer');

    if (isCustomer) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Hizmet Merkezi</h1>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">Hoş geldiniz, {user?.fullName}. Size nasıl yardımcı olabiliriz?</p>
                    </div>
                    <Link
                        href="/tickets/new"
                        className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <PlusCircle className="h-5 w-5" />
                        Yeni Destek Talebi
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={Ticket} label="Aktif Taleplerim" value="0" color="bg-blue-500" />
                    <StatCard icon={CheckCircle2} label="Çözülen Talepler" value="0" color="bg-emerald-500" />
                    <StatCard icon={Clock} label="Ortalama Yanıt Süresi" value="—" color="bg-amber-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Search KB section */}
                    <div className="bg-gradient-to-br from-brand-500/10 to-brand-600/5 rounded-3xl p-8 border border-brand-500/10 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Çözümü Kendiniz Bulun</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-sm">Bilgi bankamızdaki yüzlerce makale arasında arama yaparak hızlıca yanıt alabilirsiniz.</p>
                            <Link href="/knowledge-base" className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-sm hover:gap-3 transition-all">
                                Bilgi Bankasına Git <Search className="h-4 w-4" />
                            </Link>
                        </div>
                        <BookOpen className="absolute -bottom-4 -right-4 h-32 w-32 text-brand-500/10 group-hover:rotate-12 transition-transform duration-500" />
                    </div>

                    {/* AI Assistant section */}
                    <div className="bg-gradient-to-br from-violet-500/10 to-indigo-600/5 rounded-3xl p-8 border border-violet-500/10 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Yapay Zeka Yardımı</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-sm">Sorularınızı sormak ve anında teknik destek almak için AI asistanımızı kullanın.</p>
                            <Link href="/ai" className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold text-sm hover:gap-3 transition-all">
                                AI Asistanı Başlat <Bot className="h-4 w-4" />
                            </Link>
                        </div>
                        <Bot className="absolute -bottom-4 -right-4 h-32 w-32 text-violet-500/10 group-hover:-rotate-12 transition-transform duration-500" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Komuta Merkezi</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">Aluplan Destek — Genel Operasyonel Durum</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard icon={Ticket} label="Açık Talepler" value="—" color="bg-brand-500" />
                <StatCard icon={BookOpen} label="Yayındaki Makaleler" value="—" color="bg-emerald-500" />
                <StatCard icon={MessageSquareQuote} label="Bekleyen FAQ" value="—" color="bg-amber-500" />
                <StatCard icon={Bot} label="AI Sorguları (7g)" value="—" color="bg-violet-500" />
            </div>

            {/* AI Status banner */}
            <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-colors ${aiStatus?.available
                ? 'border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10'
                : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10'
                }`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${aiStatus?.available ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                    {aiStatus?.available ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                        <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    )}
                </div>
                <div className="flex-1">
                    <p className={`text-sm font-semibold ${aiStatus?.available ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300'}`}>
                        AI Sinaps Durumu — {aiStatus?.available ? `Aktif (${aiStatus.model})` : 'Yapılandırma Bekliyor'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {aiStatus?.available
                            ? 'Otomatik yanıt ve kategori öneri motoru tam kapasite çalışıyor.'
                            : 'AI modeli şu an çevrimdışı. Sistem klasik arama algoritmalarına geçiş yaptı.'}
                    </p>
                </div>
            </div>

            {/* Quick nav */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { href: '/tickets', icon: Ticket, label: 'Talepleri Yönet', desc: 'SLA kuyruğunu ve ekip atamalarını kontrol et', color: 'text-brand-500' },
                    { href: '/knowledge-base', icon: BookOpen, label: 'Editoryal Panel', desc: 'İçerik üretimini ve revizyonları yönet', color: 'text-emerald-500' },
                    { href: '/ai', icon: Bot, label: 'Nöral Test', desc: 'AI yanıt kalitesini ve skorları analiz et', color: 'text-violet-500' },
                ].map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-brand-500/20 dark:hover:border-brand-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5"
                    >
                        <item.icon className={`h-7 w-7 mb-4 transition-transform group-hover:-rotate-6 ${item.color}`} />
                        <p className="font-bold text-slate-900 dark:text-white text-base">{item.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{item.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

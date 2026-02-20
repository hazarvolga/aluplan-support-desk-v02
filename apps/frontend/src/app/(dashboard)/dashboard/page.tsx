'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    Ticket, BookOpen, Bot, MessageSquareQuote,
    TrendingUp, AlertCircle, CheckCircle2, Clock,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }: {
    icon: React.ElementType; label: string; value: string | number; color: string;
}) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
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
    const [aiStatus, setAiStatus] = useState<{ available: boolean; model: string } | null>(null);

    useEffect(() => {
        api.ai.status().then(setAiStatus).catch(() => null);
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">Aluplan Destek — Operasyonel Merkez</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard icon={Ticket} label="Açık Talepler" value="—" color="bg-brand-500" />
                <StatCard icon={BookOpen} label="Yayındaki Makaleler" value="—" color="bg-emerald-500" />
                <StatCard icon={MessageSquareQuote} label="Bekleyen FAQ" value="—" color="bg-amber-500" />
                <StatCard icon={Bot} label="AI Sorguları (7g)" value="—" color="bg-violet-500" />
            </div>

            {/* AI Status banner */}
            <div className={`flex items-center gap-4 p-4 rounded-2xl border ${aiStatus?.available
                    ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20'
                    : 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20'
                }`}>
                {aiStatus?.available ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <div>
                    <p className={`text-sm font-semibold ${aiStatus?.available ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300'}`}>
                        Ollama AI — {aiStatus?.available ? `Aktif (${aiStatus.model})` : 'Kullanılamıyor'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {aiStatus?.available
                            ? 'Semantik arama ve otomatik yanıt sistemi çalışıyor.'
                            : 'AI servis yapılandırılmamış. Klasik anahtar kelime araması devrede.'}
                    </p>
                </div>
            </div>

            {/* Quick nav */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { href: '/tickets', icon: Ticket, label: 'Talepleri Yönet', desc: 'Açık talepleri görüntüle ve yanıtla' },
                    { href: '/knowledge-base', icon: BookOpen, label: 'Bilgi Bankası', desc: 'Makale yönetimi ve onay akışı' },
                    { href: '/ai', icon: Bot, label: 'AI Asistan Dene', desc: 'Semantik arama ve güven bant testi' },
                ].map((item) => (
                    <a
                        key={item.href}
                        href={item.href}
                        className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                    >
                        <item.icon className="h-6 w-6 text-brand-500 mb-3" />
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                    </a>
                ))}
            </div>
        </div>
    );
}

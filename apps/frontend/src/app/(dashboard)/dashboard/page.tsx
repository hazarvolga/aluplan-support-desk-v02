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
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statusRes, statsRes] = await Promise.all([
                    api.ai.status(),
                    (api.tickets as any).getSlaStats()
                ]);
                setAiStatus(statusRes);
                setStats(statsRes);
            } catch (err) {
                console.error('Dashboard load failed', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const userRoles = (user?.roles || []).map((r: string) => r.toLowerCase());
    const isCustomer = userRoles.includes('customer');

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (isCustomer) {
        // ... (Keep existing customer dashboard logic, but can be polished further if needed)
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
                    <StatCard icon={Ticket} label="Aktif Taleplerim" value={stats?.total || 0} color="bg-blue-500" />
                    <StatCard icon={CheckCircle2} label="Çözülen Talepler" value="0" color="bg-emerald-500" />
                    <StatCard icon={Clock} label="Ortalama Yanıt Süresi" value="—" color="bg-amber-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <TrendingUp className="h-8 w-8 text-brand-500" />
                        Komuta Merkezi
                    </h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm font-mono uppercase tracking-widest">Aluplan Operational Command — v2.0</p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-500">SON GÜNCELLEME</p>
                    <p className="text-sm font-mono dark:text-slate-300">{new Date().toLocaleTimeString()}</p>
                </div>
            </div>

            {/* Core Operational Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard icon={Ticket} label="Aktif Talepler" value={stats?.total || 0} color="bg-brand-500" />
                <StatCard icon={AlertCircle} label="SLA İhlalleri" value={stats?.breached || 0} color="bg-rose-500" />
                <StatCard icon={CheckCircle2} label="Çözülen (Bugün)" value="0" color="bg-emerald-500" />
                <StatCard icon={Bot} label="AI Başarı Oranı" value="94%" color="bg-violet-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Priority Breakdown */}
                <div className="lg:col-span-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-6 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-brand-500" />
                        Öncelik Dağılımı (Kritiklik)
                    </h3>
                    <div className="space-y-5">
                        {['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map(p => {
                            const count = stats?.byPriority?.find((bp: any) => bp.priority === p)?._count || 0;
                            const total = stats?.total || 1;
                            const percent = Math.round((count / total) * 100);
                            const barColor = p === 'URGENT' ? 'bg-rose-500' : p === 'HIGH' ? 'bg-orange-500' : p === 'MEDIUM' ? 'bg-brand-500' : 'bg-slate-400';

                            return (
                                <div key={p} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-500 dark:text-slate-400">{p}</span>
                                        <span className="dark:text-slate-200">{count} Talep ({percent}%)</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${barColor} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* AI & System Health */}
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-4">Sistem Durumu</h3>
                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${aiStatus?.available ? 'bg-green-500/5 border-green-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                            <div className={`h-2 w-2 rounded-full animate-pulse ${aiStatus?.available ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-rose-500'}`}></div>
                            <span className="text-xs font-bold dark:text-slate-300">AI Sinaps: {aiStatus?.available ? 'AKTİF' : 'ÇEVRİMDIŞI'}</span>
                        </div>
                    </div>

                    <div className="mt-auto space-y-3">
                        <p className="text-[10px] font-bold text-slate-500 tracking-tighter uppercase">Hızlı Navigasyon</p>
                        <div className="grid grid-cols-1 gap-2">
                            <Link href="/tickets?status=NEW" className="flex items-center justify-between p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 hover:bg-brand-500/10 border border-transparent hover:border-brand-500/20 transition-all group">
                                <span className="text-xs font-semibold dark:text-slate-200">Kuyruğu Yönet</span>
                                <PlusCircle className="h-4 w-4 text-brand-500 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/ai" className="flex items-center justify-between p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 hover:bg-violet-500/10 border border-transparent hover:border-violet-500/20 transition-all group">
                                <span className="text-xs font-semibold dark:text-slate-200">Nöral Analiz</span>
                                <Bot className="h-4 w-4 text-violet-500 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

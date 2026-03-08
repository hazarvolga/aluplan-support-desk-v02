'use client';

export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/auth/role-guard';
import {
    Ticket, BookOpen, Bot, TrendingUp, AlertCircle, CheckCircle2, Clock, PlusCircle, Search, Activity
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { WireframeBorder } from '@/components/ui/wireframe-border';
import { useTranslations } from 'next-intl';

function StatCard({ icon: Icon, label, value, indicatorColor }: {
    icon: React.ElementType; label: string; value: string | number; indicatorColor: string;
}) {
    const t = useTranslations('dashboard.stats');
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="group relative px-6 py-8 rounded-2xl glass-card transition-all duration-500 overflow-hidden"
        >
            <div className={`absolute top-0 left-0 right-0 h-1 ${indicatorColor} opacity-20 group-hover:opacity-100 transition-opacity`} />
            <div className="flex justify-between items-start mb-6">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-muted-foreground group-hover:text-primary transition-all duration-300">
                    <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase opacity-60">{label}</span>
            </div>
            <div className="space-y-1">
                <p className="text-4xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">{value}</p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                    <TrendingUp className="w-3 h-3" />
                    <span>{t('status_stable')}</span>
                </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
    );
}

export default function DashboardPage() {
    const t = useTranslations('dashboard');
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
    const isCustomer = userRoles.includes('customer') || userRoles.includes('viewer');

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Activity className="h-6 w-6 animate-pulse text-muted-foreground" />
            </div>
        );
    }

    if (isCustomer) {
        return (
            <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex justify-between items-end border-b border-border/40 pb-4">
                    <div>
                        <h1 className="text-[18px] font-bold tracking-tight uppercase flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            {t('user_portal')}
                        </h1>
                        <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-widest leading-tight">
                            {t('user_identity', { name: user?.fullName || '', level: t('access_level_standard') })}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={Ticket} label={t('stats.active_tickets')} value={stats?.total || 0} indicatorColor="bg-blue-500" />
                    <StatCard icon={CheckCircle2} label={t('stats.resolved_tickets')} value="0" indicatorColor="bg-emerald-500" />
                    <StatCard icon={Clock} label={t('stats.avg_response')} value="N/A" indicatorColor="bg-amber-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="border border-border/40 bg-muted/5 p-6 relative overflow-hidden group flex flex-col justify-between h-48">
                        <div className="relative z-10">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Search className="h-4 w-4 text-primary" />
                                {t('knowledge_base.title')}
                            </h3>
                            <p className="text-muted-foreground text-xs font-mono leading-relaxed mb-6 max-w-[80%]">
                                {t('knowledge_base.description')}
                            </p>
                        </div>
                        <Link href="/knowledge-base" className="relative z-10 inline-flex items-center justify-between bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors w-fit">
                            {t('knowledge_base.cta')}
                        </Link>
                        <BookOpen className="absolute -bottom-4 -right-4 h-32 w-32 text-primary/5 group-hover:text-primary/10 transition-colors" />
                    </div>

                    <div className="border border-border/40 bg-muted/5 p-6 relative overflow-hidden group flex flex-col justify-between h-48">
                        <div className="relative z-10">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Bot className="h-4 w-4 text-violet-500" />
                                {t('ai_diagnostic.title')}
                            </h3>
                            <p className="text-muted-foreground text-xs font-mono leading-relaxed mb-6 max-w-[80%]">
                                {t('ai_diagnostic.description')}
                            </p>
                        </div>
                        <Link href="/ai" className="relative z-10 inline-flex items-center justify-between bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors w-fit">
                            {t('ai_diagnostic.cta')}
                        </Link>
                        <Bot className="absolute -bottom-4 -right-4 h-32 w-32 text-violet-500/5 group-hover:text-violet-500/10 transition-colors" />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Link
                        href="/tickets/new"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 text-[10px] font-bold uppercase tracking-widest shadow-sm"
                    >
                        <PlusCircle className="h-4 w-4" />
                        {t('actions.create_ticket')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 relative"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                        </div>
                        {t('title')}
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1 ml-11 font-medium uppercase tracking-[0.1em]">
                        {t('telemetry_version')}
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 rounded-full text-xs text-emerald-500 font-medium">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {t('system_active')}
                    </div>
                </div>
            </div>

            {/* Core Operational Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Ticket} label={t('stats.active_tickets')} value={stats?.total || 0} indicatorColor="bg-blue-500" />
                <StatCard icon={AlertCircle} label={t('stats.sla_violations')} value={stats?.breached || 0} indicatorColor="bg-rose-500" />
                <StatCard icon={CheckCircle2} label={t('stats.daily_resolved')} value="0" indicatorColor="bg-emerald-500" />
                <StatCard icon={Bot} label={t('stats.ai_confidence')} value="94%" indicatorColor="bg-violet-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Priority Breakdown */}
                <WireframeBorder className="lg:col-span-2 border-border/40 bg-transparent">
                    <div className="py-2.5 px-4 bg-muted/5 border-b border-border/20 flex items-center gap-2">
                        <Activity className="h-3 w-3 text-primary" />
                        <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-muted-foreground font-mono">
                            {t('sections.priority_distribution')}
                        </span>
                    </div>
                    <div className="p-4 space-y-5 flex flex-col justify-center min-h-[160px]">
                        {['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map(p => {
                            const count = stats?.byPriority?.find((bp: any) => bp.priority === p)?._count || 0;
                            const total = stats?.total || 1;
                            const percent = Math.round((count / total) * 100);
                            const barColor = p === 'URGENT' ? 'bg-rose-500' : p === 'HIGH' ? 'bg-orange-500' : p === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-500';

                            return (
                                <div key={p} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                                        <span className="text-muted-foreground w-16 font-mono">
                                            {t(`priorities.${p}`)}
                                        </span>
                                        <div className="flex-1 mx-4 h-[2px] bg-muted/10 relative overflow-hidden">
                                            <div className={`absolute top-0 left-0 h-full ${barColor}`} style={{ width: `${percent}%` }}></div>
                                        </div>
                                        <span className="text-foreground w-16 text-right font-mono text-xs">{count} <span className="text-muted-foreground/30 text-[10px] ml-1">[{percent}%]</span></span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </WireframeBorder>

                {/* AI & System Health */}
                <div className="flex flex-col gap-4">
                    <WireframeBorder className="border-border/40 bg-transparent flex-1">
                        <div className="py-2.5 px-4 bg-muted/5 border-b border-border/20">
                            <div className="text-[10px] uppercase font-bold tracking-[0.1em] text-muted-foreground font-mono">
                                {t('sections.system_telemetry')}
                            </div>
                        </div>
                        <div className="p-4 flex flex-col justify-center">
                            <div className={`p-4 border ${aiStatus?.available ? 'bg-emerald-500/5 border-emerald-900/30' : 'bg-rose-500/5 border-rose-900/30'} flex flex-col items-center justify-center gap-2 h-full min-h-[80px]`}>
                                <div className="flex items-center gap-3">
                                    <div className={`h-2 w-2 rounded-full animate-pulse ${aiStatus?.available ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}></div>
                                    <span className={`text-[11px] font-bold font-mono tracking-widest ${aiStatus?.available ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        AI_NODE: {aiStatus?.available ? 'ONLINE' : 'OFFLINE'}
                                    </span>
                                </div>
                                {aiStatus?.model && (
                                    <span className="text-[9px] text-muted-foreground font-mono opacity-50 block uppercase tracking-tighter">M:{aiStatus.model}</span>
                                )}
                            </div>
                        </div>
                    </WireframeBorder>

                    <WireframeBorder className="border-border/40 bg-transparent">
                        <div className="py-2.5 px-4 bg-muted/5 border-b border-border/20">
                            <div className="text-[10px] uppercase font-bold tracking-[0.1em] text-muted-foreground font-mono">
                                {t('sections.quick_access')}
                            </div>
                        </div>
                        <div className="p-4 grid gap-2">
                            <Link href="/tickets?status=NEW" className="flex items-center justify-between p-3 border border-border/40 bg-muted/5 hover:bg-primary/5 hover:border-primary/30 transition-colors group">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-foreground font-mono">{t('actions.manage_queue')}</span>
                                <PlusCircle className="h-3 w-3 text-primary group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/ai" className="flex items-center justify-between p-3 border border-border/40 bg-muted/5 hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-colors group">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-foreground font-mono">{t('actions.neural_analysis')}</span>
                                <Bot className="h-3 w-3 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </WireframeBorder>
                </div>
            </div>
        </motion.div>
    );
}



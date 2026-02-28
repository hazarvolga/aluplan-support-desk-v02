'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    BookOpen,
    Plus,
    CheckCircle2,
    Clock,
    XCircle,
    Search,
    BarChart3,
    ArrowRight,
    FileText,
    TrendingUp,
    Eye,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/components/auth/role-guard';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'TASLAK', color: 'bg-slate-500/10 text-slate-400 border-white/5' },
    REVIEW: { label: 'İNCELEMEDE', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    PUBLISHED: { label: 'AKTİF', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    ARCHIVED: { label: 'ARŞİVLENDİ', color: 'bg-slate-500/5 text-slate-500/50 border-white/5' },
};

export default function KnowledgeBasePage() {
    const { user } = useAuth();
    const [articles, setArticles] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('PUBLISHED');

    const isStaff = user?.roles?.some(r => ['admin', 'agent'].includes(r.toLowerCase())) ?? false;

    const load = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = { status: statusFilter };
            if (search) params.search = search;
            const res = await api.kb.list(params);
            setArticles(res.data ?? []);
            setTotal(res.total ?? 0);
        } catch { /* handled */ }
        setLoading(false);
    };

    useEffect(() => { load(); }, [statusFilter]);

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); load(); };

    const handleReview = async (id: string, approved: boolean) => {
        await api.kb.review(id, approved);
        load();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 relative min-h-screen pb-24"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        Bilgi Bankası
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 ml-14 font-medium opacity-70">
                        Kurumsal hafıza, çözüm makaleleri ve dokümantasyon merkezi
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isStaff && (
                        <>
                            <Button
                                asChild
                                variant="outline"
                                className="h-9 border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10"
                            >
                                <Link href="/knowledge-base/analytics">
                                    <BarChart3 className="h-4 w-4 text-primary mr-2" /> ANALİTİK
                                </Link>
                            </Button>
                            <Button
                                asChild
                                className="h-9 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:brightness-110 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            >
                                <Link href="/knowledge-base/new">
                                    <Plus className="h-4 w-4 mr-2" /> MAKALE OLUŞTUR
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Quick Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Toplam Makale</span>
                        <span className="text-lg font-bold text-white font-mono">{total.toString().padStart(3, '0')}</span>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4 border-emerald-500/10">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Yayınlananlar</span>
                        <span className="text-lg font-bold text-white font-mono">{articles.filter(a => a.status === 'PUBLISHED').length.toString().padStart(3, '0')}</span>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4 border-amber-500/10">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Görüntülenme</span>
                        <span className="text-lg font-bold text-white font-mono">1.2K</span>
                    </div>
                </div>
            </div>

            {/* Filters & Control Console */}
            <div className="flex flex-col md:flex-row items-center gap-4 pb-6 border-b border-white/5">
                <form onSubmit={handleSearch} className="relative flex-1 w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="MAKALE ARA..."
                        className="w-full pl-10 pr-4 h-10 bg-white/5 border border-white/10 rounded-xl text-[11px] font-bold uppercase tracking-tight text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </form>

                <div className="flex items-center gap-1.5 self-start md:self-auto p-1 bg-white/5 rounded-xl border border-white/10">
                    {isStaff && Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <button
                            key={k}
                            onClick={() => setStatusFilter(k)}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${statusFilter === k
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Articles Inventory */}
            <Card className="glass-card overflow-hidden border-white/5">
                {loading ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">Veri Katmanları Yükleniyor</p>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="p-20 text-center opacity-30">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">MAKALE BULUNAMADI</h3>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        <AnimatePresence mode="popLayout">
                            {articles.map((a, idx) => {
                                const s = STATUS_LABELS[a.status] ?? STATUS_LABELS.DRAFT;
                                return (
                                    <motion.div
                                        key={a.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-white/[0.02] transition-all relative overflow-hidden"
                                    >
                                        <div className="flex-1 min-w-0 z-10">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <Badge className={`px-2 py-0 h-5 border font-bold text-[8px] tracking-widest ${s.color}`}>
                                                    {s.label}
                                                </Badge>
                                                <div className="flex gap-2">
                                                    {a.tags?.slice(0, 3).map((t: string) => (
                                                        <span key={t} className="text-[9px] font-mono text-primary/40 uppercase tracking-tighter">
                                                            #{t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <Link
                                                href={`/knowledge-base/${a.id}`}
                                                className="group-hover:text-primary transition-all inline-block max-w-full"
                                            >
                                                <h3 className="font-bold text-white text-[16px] leading-tight tracking-tight group-hover:translate-x-1 transition-transform">
                                                    {a.title}
                                                </h3>
                                            </Link>
                                            <div className="flex items-center gap-6 mt-3 text-[10px] font-mono uppercase text-muted-foreground/50">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-4 w-4 rounded-full bg-white/5 flex items-center justify-center">
                                                        <Search className="h-2.5 w-2.5" />
                                                    </div>
                                                    <span>YAZAR: {a.creator?.fullName?.split(' ')[0] || 'SİSTEM'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3 w-3" />
                                                    <span>GÜNCELLEME: {new Date(a.updatedAt).toLocaleDateString('tr-TR')}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Eye className="h-3 w-3" />
                                                    <span>124 İZLENME</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mt-4 md:mt-0 z-10 self-end md:self-auto">
                                            {isStaff && a.status === 'REVIEW' && (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        onClick={() => handleReview(a.id, true)}
                                                        className="h-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 text-[9px] font-bold"
                                                    >
                                                        ONAYLA
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleReview(a.id, false)}
                                                        className="h-8 bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 text-[9px] font-bold"
                                                    >
                                                        REDDET
                                                    </Button>
                                                </div>
                                            )}
                                            <Button
                                                asChild
                                                variant="ghost"
                                                className="h-10 w-10 p-0 rounded-full hover:bg-primary/10 hover:text-primary border border-white/5"
                                            >
                                                <Link href={`/knowledge-base/${a.id}`}>
                                                    <ArrowRight className="h-5 w-5" />
                                                </Link>
                                            </Button>
                                        </div>

                                        {/* Hover Detail Glow */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </Card>
        </motion.div>
    );
}

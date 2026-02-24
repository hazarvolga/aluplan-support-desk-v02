'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { BookOpen, Plus, CheckCircle2, Clock, XCircle, Search, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/role-guard';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'DRAFT', color: 'border-border text-muted-foreground bg-muted/5' },
    REVIEW: { label: 'UNDER_REVIEW', color: 'border-orange-900/50 text-orange-400 bg-orange-400/5' },
    PUBLISHED: { label: 'ACTIVE', color: 'border-emerald-900/50 text-emerald-400 bg-emerald-400/5' },
    ARCHIVED: { label: 'ARCHIVED', color: 'border-border/40 text-muted-foreground/40 bg-muted/5' },
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
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                    <h1 className="text-[18px] font-bold text-foreground uppercase tracking-tight">KNOWLEDGE_BASE_CENTRAL</h1>
                    <p className="mt-1 text-muted-foreground text-[10px] font-mono uppercase tracking-widest leading-none">OBJECT_COUNT: {total} UNITS</p>
                </div>
                <div className="flex items-center gap-2">
                    {isStaff && (
                        <>
                            <Link
                                href="/knowledge-base/analytics"
                                className="flex items-center gap-2 px-3 py-1.5 border border-border bg-muted/20 text-muted-foreground hover:text-foreground transition-none text-[10px] uppercase font-bold tracking-widest"
                            >
                                <BarChart3 className="h-3 w-3 text-primary" /> ANALYTICS
                            </Link>
                            <Link
                                href="/knowledge-base/new"
                                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground transition-none text-[10px] uppercase font-bold tracking-widest"
                            >
                                <Plus className="h-3 w-3" /> CREATE_ARTICLE
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-border/20">
                <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="SCAN_RECORDS..."
                        className="w-full pl-9 pr-4 py-1.5 border border-border/60 bg-black/20 text-[11px] uppercase tracking-tight text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-8"
                    />
                </form>
                {isStaff && Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <button
                        key={k}
                        onClick={() => setStatusFilter(k)}
                        className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-none h-8 ${statusFilter === k ? 'bg-primary text-primary-foreground' : 'bg-muted/10 border border-border/60 text-muted-foreground hover:border-primary/60 hover:text-foreground'
                            }`}
                    >
                        {v.label}
                    </button>
                ))}
            </div>

            {/* Articles */}
            {loading ? (
                <div className="p-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                </div>
            ) : articles.length === 0 ? (
                <div className="border border-border/40 bg-muted/5 p-12 flex flex-col items-center justify-center text-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground/30 mb-4" />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">KAYIT_BULUNAMADI</h3>
                    <p className="text-[10px] font-mono text-muted-foreground/60 mt-2 uppercase tracking-tighter">Query returned zero matching results in the database.</p>
                </div>
            ) : (
                <div className="divide-y divide-border/20 border-t border-b border-border/40">
                    {articles.map((a) => {
                        const s = STATUS_LABELS[a.status] ?? STATUS_LABELS.DRAFT;
                        return (
                            <div
                                key={a.id}
                                className="group flex items-center justify-between bg-muted/5 px-4 py-3 hover:bg-muted/10 transition-none"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5 mb-1 text-[9px] font-mono uppercase tracking-tighter">
                                        <Badge className={`px-1.5 py-0 h-4 border ${s.color}`}>
                                            {s.label}
                                        </Badge>
                                        <div className="flex gap-2">
                                            {a.tags?.map((t: string) => (
                                                <span key={t} className="text-muted-foreground/40">#{t.toUpperCase()}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <Link href={`/knowledge-base/${a.id}`} className="group-hover:text-primary transition-none">
                                        <p className="font-bold text-foreground text-[14px] leading-tight tracking-tight truncate">{a.title.toUpperCase()}</p>
                                    </Link>
                                    <div className="flex items-center gap-4 mt-1 text-[9px] font-mono uppercase text-muted-foreground/60">
                                        <span>OFFICER: {a.creator?.fullName || 'SYSTEM'}</span>
                                        <span>LAST_SYNC: {new Date(a.updatedAt).toISOString().split('T')[0]}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 ml-4">
                                    {isStaff && a.status === 'REVIEW' && (
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleReview(a.id, true)}
                                                className="px-2 py-1 border border-emerald-900/50 bg-emerald-500/5 text-emerald-500 text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-500/10 transition-none"
                                            >
                                                VERIFY
                                            </button>
                                            <button
                                                onClick={() => handleReview(a.id, false)}
                                                className="px-2 py-1 border border-red-900/50 bg-red-500/5 text-red-500 text-[9px] font-bold uppercase tracking-widest hover:bg-red-500/10 transition-none"
                                            >
                                                REJECT
                                            </button>
                                        </div>
                                    )}
                                    <Link href={`/knowledge-base/${a.id}`} className="p-2 text-muted-foreground hover:text-foreground">
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
